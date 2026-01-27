import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaCircle, FaTrash, FaArrowLeft, FaUsers } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router";
import useChatStore from "../../store/useChatStore";
import useAuth from "../../hooks/useAuth";
import ConversationInfoModal from "./ConversationInfoModal";
import ConversationLoader from "../loader/ConversationLoader";
import AiSpellCheckModal from "../ai-common/AiSpellCheckModal";
import { aiApi } from "../../lib/aiApi";

const ChatInterface = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [messageText, setMessageText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [corrections, setCorrections] = useState([]);
    const [fullCorrectedText, setFullCorrectedText] = useState("");
    const [isCheckingSpelling, setIsCheckingSpelling] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const checkSpelling = async () => {
        if (!messageText.trim()) return;
        setIsCheckingSpelling(true);
        try {
            const data = await aiApi.spellCorrect({ text: messageText, strategy: 'llm' });
            if (data?.corrections && data.corrections.length > 0) {
                setCorrections(data.corrections);
                setFullCorrectedText(data.correctedText || "");
            } else {
                setCorrections([]);
                setFullCorrectedText("");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCheckingSpelling(false);
        }
    };

    const applyAllCorrections = () => {
        if (fullCorrectedText) {
            setMessageText(fullCorrectedText);
        } else {
            let newText = messageText;
            corrections.forEach(c => {
                newText = newText.replace(c.original, c.corrected);
            });
            setMessageText(newText);
        }
        setCorrections([]);
        setFullCorrectedText("");
    };

    const ignoreCorrections = () => {
        setCorrections([]);
        setFullCorrectedText("");
    };

    const {
        selectedConversation,
        messages,
        sendMessage: sendMessageToStore,
        deleteMessage,
        markAsRead,
        joinConversation,
        leaveConversation,
        sendSocketMessage,
        emitTyping,
        emitStopTyping,
        typingUsers,
        onlineUsers,
        isLoading
    } = useChatStore();

    const otherUser = selectedConversation?.otherUser;
    const isOnline = otherUser && onlineUsers.includes(otherUser.uid);
    const isGroup = selectedConversation?.isGroup;
    const chatName = isGroup ? selectedConversation.groupName : otherUser?.name;
    const chatPhoto = isGroup ? null : otherUser?.photoURL;

    useEffect(() => {
        if (selectedConversation?._id) {
            joinConversation(selectedConversation._id);
            markAsRead(selectedConversation._id);
            return () => {
                leaveConversation(selectedConversation._id);
            };
        }
    }, [selectedConversation?._id, joinConversation, leaveConversation, markAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (messages.length > 0 && selectedConversation) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender !== user?.uid && !lastMessage.isRead) {
                markAsRead(selectedConversation._id);
            }
        }
    }, [messages, selectedConversation, user?.uid, markAsRead]);

    const handleTyping = () => {
        if (!selectedConversation) return;
        if (!isTyping) {
            setIsTyping(true);
            emitTyping(selectedConversation._id);
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            emitStopTyping(selectedConversation._id);
        }, 1000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversation) return;

        try {
            const newMessage = await sendMessageToStore(
                selectedConversation._id,
                messageText
            );
            sendSocketMessage(selectedConversation._id, newMessage);
            setMessageText("");
            setIsTyping(false);
            emitStopTyping(selectedConversation._id);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return "Today";
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
        return d.toLocaleDateString();
    };

    if (isLoading) {
        return <ConversationLoader />;
    }

    if (!selectedConversation) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-xl font-semibold mb-2">No conversation selected</p>
                    <p className="text-base-content/60">
                        Select a conversation from the sidebar to start chatting
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="flex-none z-20 border-b border-gray-100 dark:border-slate-900 px-3 py-2 bg-transparent backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/home/messages")}
                        className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <FaArrowLeft />
                    </button>

                    <div className="avatar placeholder relative group">
                        <div className="w-8 h-8 rounded-full ring ring-offset-1 ring-violet-50 ring-offset-base-100 transition-all duration-300 group-hover:scale-105 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            {isGroup ? (
                                <FaUsers className="text-violet-500 text-xl" />
                            ) : otherUser?.photoURL ? (
                                <img src={otherUser.photoURL} alt={otherUser.name} className="object-cover w-full h-full rounded-full" />
                            ) : (
                                <span className="text-lg font-bold bg-linear-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center w-full h-full rounded-full">
                                    {otherUser?.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        {!isGroup && (
                            typingUsers[otherUser?.uid] ? (
                                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-fuchsia-500 border-2 border-white dark:border-slate-900"></span>
                                </span>
                            ) : isOnline && (
                                <FaCircle className="absolute -bottom-1 -right-1 w-3 h-3 text-emerald-500 shadow-sm border-2 border-white dark:border-slate-900 rounded-full" />
                            )
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{chatName}</h3>
                        <div className="flex items-center gap-2 text-xs">
                            {!isGroup && (
                                typingUsers[otherUser?.uid] ? (
                                    <span className="text-fuchsia-600 dark:text-fuchsia-400 font-medium animate-pulse">Typing...</span>
                                ) : (
                                    <span className={`${isOnline ? 'text-emerald-500 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                )
                            )}
                            {isGroup && (
                                <span className="text-slate-500 dark:text-slate-400">
                                    {selectedConversation.participants?.length || 0} members
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConversationInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                conversation={selectedConversation}
            />

            <div className="bg-gray-50 dark:bg-slate-900 m-1 rounded-lg relative z-10 flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                        <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                            <FaPaperPlane className="text-3xl text-violet-400 dark:text-violet-300 -rotate-12 translate-x-1" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Start the conversation!</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Say hello to {chatName}</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messages.map((message, index) => {
                            const isOwnMessage = message.sender === user?.uid;
                            const showDate =
                                index === 0 ||
                                formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                            const prevMessage = messages[index - 1];
                            const nextMessage = messages[index + 1];
                            const isFirstInGroup = !prevMessage || prevMessage.sender !== message.sender || showDate;
                            const isLastInGroup = !nextMessage || nextMessage.sender !== message.sender ||
                                (nextMessage && formatDate(nextMessage.createdAt) !== formatDate(message.createdAt));

                            return (
                                <div key={message._id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="text-[10px] font-semibold bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                                                {formatDate(message.createdAt)}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                                        {!isOwnMessage && (
                                            <div className="w-7 mr-2 flex-shrink-0 flex items-end">
                                                {isLastInGroup && (
                                                    <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                                        {isGroup ? (
                                                            message.senderDetails?.photoURL ?
                                                                <img src={message.senderDetails.photoURL} alt="" className="w-full h-full object-cover" /> :
                                                                <div className="bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center h-full w-full font-bold text-xs">{(message.senderDetails?.name || "?").charAt(0)}</div>
                                                        ) : (
                                                            otherUser?.photoURL ?
                                                                <img src={otherUser.photoURL} alt="" className="w-full h-full object-cover" /> :
                                                                <div className="bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center h-full w-full font-bold text-xs">{otherUser?.name?.charAt(0)}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className={`max-w-[70%] group relative flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                                            {isGroup && !isOwnMessage && isFirstInGroup && (
                                                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-1 mb-0.5">
                                                    {message.senderDetails?.name || "Unknown"}
                                                </p>
                                            )}

                                            <div
                                                className={`
                                                    relative px-3 py-2 text-sm leading-relaxed
                                                    ${isOwnMessage
                                                        ? "bg-violet-600 text-white"
                                                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                                                    }
                                                    ${isOwnMessage
                                                        ? isFirstInGroup && isLastInGroup
                                                            ? "rounded-2xl"
                                                            : isFirstInGroup
                                                                ? "rounded-2xl rounded-br-md"
                                                                : isLastInGroup
                                                                    ? "rounded-2xl rounded-tr-md"
                                                                    : "rounded-2xl rounded-r-md"
                                                        : isFirstInGroup && isLastInGroup
                                                            ? "rounded-2xl"
                                                            : isFirstInGroup
                                                                ? "rounded-2xl rounded-bl-md"
                                                                : isLastInGroup
                                                                    ? "rounded-2xl rounded-tl-md"
                                                                    : "rounded-2xl rounded-l-md"
                                                    }
                                                `}
                                            >
                                                {message.text && <p>{message.text}</p>}
                                                {message.attachment && (
                                                    <img src={message.attachment} alt="attachment" className="mt-2 rounded-lg max-w-full" />
                                                )}

                                                {isOwnMessage && (
                                                    <button
                                                        onClick={() => deleteMessage(message._id)}
                                                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        title="Delete message"
                                                    >
                                                        <FaTrash className="text-[10px]" />
                                                    </button>
                                                )}
                                            </div>

                                            {isLastInGroup && (
                                                <div className={`flex items-center gap-1 mt-0.5 ${isOwnMessage ? "justify-end mr-1" : "ml-1"}`}>
                                                    <span className="text-[10px] text-slate-400">{formatTime(message.createdAt)}</span>
                                                    {isOwnMessage && (
                                                        <span className={`text-[10px] ${message.isRead ? "text-violet-500 font-medium" : "text-slate-400"}`}>
                                                            {message.isRead ? "Read" : "Sent"}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex-none z-20 p-2 bg-white/60 dark:bg-slate-950 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 relative">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
                    <AiSpellCheckModal
                        isOpen={corrections.length > 0}
                        onClose={ignoreCorrections}
                        originalText={messageText}
                        correctedText={fullCorrectedText}
                        corrections={corrections}
                        onApply={applyAllCorrections}
                        isLoading={isCheckingSpelling}
                    />

                    <div className="flex gap-2 items-center bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 pr-1.5 border border-transparent focus-within:border-violet-500/30 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all shadow-sm">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => {
                                setMessageText(e.target.value);
                                handleTyping();
                                if (corrections.length > 0) {
                                    setCorrections([]);
                                    setFullCorrectedText("");
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium"
                        />

                        {messageText.length > 1 && (
                            <button
                                type="button"
                                onClick={checkSpelling}
                                disabled={isCheckingSpelling}
                                className={`group relative overflow-hidden rounded-full p-2 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${isCheckingSpelling ? "ring-2 ring-violet-500/50" : ""}`}
                                title="Check Spelling"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                {isCheckingSpelling ? (
                                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <HiSparkles className="text-lg text-violet-500 drop-shadow-[0_0_2px_rgba(139,92,246,0.2)] group-hover:rotate-12 transition-transform" />
                                )}
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={!messageText.trim()}
                            className={`
                                btn btn-circle btn-sm border-none shadow-md transition-all duration-300
                                ${messageText.trim()
                                    ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white hover:scale-105 active:scale-95 shadow-violet-500/30"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"}
                            `}
                        >
                            <FaPaperPlane className={`text-xs ${messageText.trim() ? "translate-x-0.5" : ""}`} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
