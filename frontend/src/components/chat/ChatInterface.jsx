import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaCircle, FaTrash, FaArrowLeft, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router";
import useChatStore from "../../store/useChatStore";
import useAuth from "../../hooks/useAuth";
import ConversationInfoModal from "./ConversationInfoModal";

const ChatInterface = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    /* ... existing state ... */
    const [messageText, setMessageText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

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

    // Join conversation room when selected
    useEffect(() => {
        if (selectedConversation?._id) {
            joinConversation(selectedConversation._id);
            markAsRead(selectedConversation._id);

            return () => {
                leaveConversation(selectedConversation._id);
            };
        }
    }, [selectedConversation?._id, joinConversation, leaveConversation, markAsRead]);

    // Scroll to bottom and mark as read on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

        // If the last message is from other user and not read, mark as read
        if (messages.length > 0 && selectedConversation) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender !== user?.uid && !lastMessage.isRead) {
                markAsRead(selectedConversation._id);
            }
        }
    }, [messages, selectedConversation, user?.uid, markAsRead]);

    // Handle typing
    const handleTyping = () => {
        if (!selectedConversation) return;

        if (!isTyping) {
            setIsTyping(true);
            emitTyping(selectedConversation._id);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
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

            // Send via Socket.IO for real-time delivery
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
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                    <span className="loading loading-spinner loading-lg text-violet-500"></span>
                    <p className="text-sm text-slate-500">Loading conversation...</p>
                </div>
            </div>
        );
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
            <div className="flex-none z-20 border-b border-gray-100 dark:border-slate-900 p-1.5 bg-transparent backdrop-blur-md">
                <div className="flex items-center gap-4">
                    {/* Back Button for Mobile */}
                    <button
                        onClick={() => navigate("/home/messages")}
                        className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <FaArrowLeft />
                    </button>

                    <div
                        className="avatar placeholder relative group"
                    >

                        <div className="w-10 h-10 rounded-full ring ring-offset-2 ring-violet-500 ring-offset-base-100 transition-all duration-300 group-hover:scale-105 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            {isGroup ? (
                                <FaUsers className="text-violet-500 text-xl" />
                            ) : otherUser?.photoURL ? (
                                <img src={otherUser.photoURL} alt={otherUser.name} className="object-cover w-full h-full rounded-full" />
                            ) : (
                                <span className="text-lg font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center w-full h-full rounded-full">
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
                    <div>
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{chatName}</h3>
                        <div className="flex items-center gap-2 text-xs">
                            {/* Typing/Status for 1-1 */}
                            {!isGroup && (
                                typingUsers[otherUser?.uid] ? (
                                    <span className="text-fuchsia-600 dark:text-fuchsia-400 font-medium animate-pulse">Typing...</span>
                                ) : (
                                    <span className={`${isOnline ? 'text-emerald-500 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                )
                            )}
                            {/* Group details could go here */}
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

            {/* Messages List */}
            <div className="bg-gray-100 dark:bg-slate-900 m-1 rounded-lg relative z-10 flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
                    messages.map((message, index) => {
                        const isOwnMessage = message.sender === user?.uid;
                        const showDate =
                            index === 0 ||
                            formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                        return (
                            <div key={message._id}>
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="text-[10px] font-semibold bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                                            {formatDate(message.createdAt)}
                                        </span>
                                    </div>
                                )}

                                <div className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}>
                                    <div className="chat-image avatar">
                                        <div className="w-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
                                            {isOwnMessage ? (
                                                user?.photoURL ? <img src={user.photoURL} alt="You" /> : <div className="bg-slate-200 text-slate-600 flex items-center justify-center h-full w-full font-bold text-xs">You</div>
                                            ) : (
                                                /* Logic for other user: if group, use message sender details, else use otherUser */
                                                isGroup ? (
                                                    message.senderDetails?.photoURL ?
                                                        <img src={message.senderDetails.photoURL} alt={message.senderDetails.name} /> :
                                                        <div className="bg-violet-200 text-violet-700 flex items-center justify-center h-full w-full font-bold text-xs">{(message.senderDetails?.name || "?").charAt(0)}</div>
                                                ) : (
                                                    otherUser?.photoURL ? <img src={otherUser.photoURL} alt={otherUser.name} /> : <div className="bg-violet-200 text-violet-700 flex items-center justify-center h-full w-full font-bold text-xs">{otherUser?.name?.charAt(0)}</div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="chat-header text-[10px] opacity-70 mb-1 ml-1 flex gap-2">
                                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                                            {isOwnMessage ? "You" : (isGroup ? (message.senderDetails?.name || "Unknown") : otherUser?.name)}
                                        </span>
                                        <time className="text-[10px] opacity-50">{formatTime(message.createdAt)}</time>
                                    </div>
                                    <div className={`chat-bubble min-h-0 text-sm shadow-md backdrop-blur-sm group relative pr-8 ${isOwnMessage
                                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                                        }`}
                                    >
                                        {message.text && <p className="leading-relaxed">{message.text}</p>}
                                        {message.attachment && (
                                            <img src={message.attachment} alt="attachment" className="mt-2 rounded-lg max-w-xs border border-white/20" />
                                        )}

                                        {isOwnMessage && (
                                            <button
                                                onClick={() => deleteMessage(message._id)}
                                                className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white"
                                                title="Delete message"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="chat-footer opacity-50 text-[10px] mt-0.5 flex gap-1 items-center">
                                        {isOwnMessage && (
                                            <span>
                                                {message.isRead ? (
                                                    <span className="text-fuchsia-500 font-bold">Read</span>
                                                ) : (
                                                    "Delivered"
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex-none z-20 p-1.5 bg-white/60 dark:bg-slate-950 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
                    <div className="flex gap-2 items-center bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 pr-1.5 border border-transparent focus-within:border-violet-500/30 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all shadow-sm">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => {
                                setMessageText(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium"
                        />
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
