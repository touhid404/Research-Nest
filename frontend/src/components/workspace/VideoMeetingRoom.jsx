import { useState, useEffect, useRef } from "react";
import {
    IoMicOutline,
    IoMicOffOutline,
    IoVideocamOutline,
    IoVideocamOffOutline,
    IoCallOutline,
    IoChatbubbleOutline,
    IoPeopleOutline,
    IoSendOutline,
    IoCloseOutline,
    IoStopCircleOutline,
} from "react-icons/io5";
import useAuth from "../../hooks/useAuth";
import useWorkspaceStore from "../../store/useWorkspaceStore";
import ConfirmModal from "../common/ConfirmModal";
import toast from "react-hot-toast";

const VideoMeetingRoom = ({ meeting, workspace, onLeave }) => {
    const { user, socket } = useAuth();
    const { updateMeeting } = useWorkspaceStore();
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [leaveConfirm, setLeaveConfirm] = useState(false);
    const [endMeetingConfirm, setEndMeetingConfirm] = useState(false);
    const [isEnding, setIsEnding] = useState(false);

    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const chatEndRef = useRef(null);

    const isOwner = meeting?.scheduledBy === user?.uid;

    // Scroll to bottom of chat when new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Initialize media stream
    useEffect(() => {
        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                localStreamRef.current = stream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        };

        initializeMedia();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Socket events for meeting
    useEffect(() => {
        if (!socket || !meeting) return;

        // Join meeting room
        socket.emit("meeting:join", {
            meetingId: meeting._id,
            userName: user?.displayName || user?.name || user?.email,
            photoURL: user?.photoURL,
        });

        // Handle new user joined
        socket.on("meeting:user-joined", ({ odatId, userName, photoURL, socketId }) => {
            setParticipants((prev) => {
                if (prev.some((p) => p.socketId === socketId)) return prev;
                return [...prev, { odatId, userName, photoURL, socketId, audioEnabled: true, videoEnabled: true }];
            });
        });

        // Handle existing participants when joining
        socket.on("meeting:participants", (existingParticipants) => {
            setParticipants(existingParticipants.filter(p => p.socketId !== socket.id));
        });

        // Handle user left
        socket.on("meeting:user-left", ({ socketId }) => {
            setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
        });

        // Handle media toggle
        socket.on("meeting:user-media-toggle", ({ socketId, audioEnabled, videoEnabled }) => {
            setParticipants((prev) =>
                prev.map((p) =>
                    p.socketId === socketId ? { ...p, audioEnabled, videoEnabled } : p
                )
            );
        });

        // Handle chat messages
        socket.on("meeting:chat-message", (message) => {
            setChatMessages((prev) => [...prev, message]);
        });

        // Handle meeting ended by owner
        socket.on("meeting:ended", () => {
            toast.error("Meeting has been ended by the host");
            handleLeave();
        });

        return () => {
            socket.emit("meeting:leave", { meetingId: meeting._id });
            socket.off("meeting:user-joined");
            socket.off("meeting:participants");
            socket.off("meeting:user-left");
            socket.off("meeting:user-media-toggle");
            socket.off("meeting:chat-message");
            socket.off("meeting:ended");
        };
    }, [socket, meeting, user]);

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);

                socket?.emit("meeting:toggle-media", {
                    meetingId: meeting._id,
                    audioEnabled: audioTrack.enabled,
                    videoEnabled: isVideoEnabled,
                });
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);

                socket?.emit("meeting:toggle-media", {
                    meetingId: meeting._id,
                    audioEnabled: isAudioEnabled,
                    videoEnabled: videoTrack.enabled,
                });
            }
        }
    };

    const handleLeave = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        onLeave();
    };

    const handleEndMeeting = async () => {
        setIsEnding(true);
        try {
            // Update meeting status to completed
            await updateMeeting(meeting._id, { status: "completed" });
            // Notify all participants
            socket?.emit("meeting:end", { meetingId: meeting._id });
            toast.success("Meeting ended for all participants");
            handleLeave();
        } catch (error) {
            toast.error("Failed to end meeting");
            setIsEnding(false);
        }
    };

    const sendChatMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !socket) return;

        const message = {
            id: Date.now(),
            odatId: user?.uid,
            sender: user?.displayName || user?.name || user?.email,
            photoURL: user?.photoURL,
            text: messageInput.trim(),
            timestamp: new Date().toISOString(),
        };

        socket.emit("meeting:chat-message", {
            meetingId: meeting._id,
            message,
        });

        setChatMessages((prev) => [...prev, message]);
        setMessageInput("");
    };

    return (
        <div className="h-full flex flex-col bg-slate-100 dark:bg-gray-950">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <IoVideocamOutline className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">{meeting.title}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{workspace?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-500/20 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">LIVE</span>
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                        {participants.length + 1} in call
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Grid */}
                <div className="flex-1 p-4">
                    <div className={`grid gap-4 h-full ${
                        participants.length === 0 ? "grid-cols-1" :
                        participants.length === 1 ? "grid-cols-2" :
                        participants.length <= 3 ? "grid-cols-2 grid-rows-2" :
                        "grid-cols-3 grid-rows-2"
                    }`}>
                        {/* Local Video */}
                        <div className="relative bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className={`w-full h-full object-cover ${!isVideoEnabled ? "hidden" : ""}`}
                            />
                            {!isVideoEnabled && (
                                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-violet-600 to-purple-700">
                                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">
                                            {(user?.displayName || user?.name || user?.email)?.charAt(0)?.toUpperCase() || "?"}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <span className="px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-white text-sm font-medium">
                                    You {isOwner && "(Host)"}
                                </span>
                                {!isAudioEnabled && (
                                    <span className="p-1.5 bg-red-500 rounded-lg">
                                        <IoMicOffOutline className="w-4 h-4 text-white" />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Remote Participants */}
                        {participants.map((participant) => (
                            <div
                                key={participant.socketId}
                                className="relative bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
                            >
                                {participant.videoEnabled ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-600 to-teal-700">
                                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                            {participant.photoURL ? (
                                                <img src={participant.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold text-white">
                                                    {participant.userName?.charAt(0)?.toUpperCase() || "?"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-600 to-teal-700">
                                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                                            <span className="text-3xl font-bold text-white">
                                                {participant.userName?.charAt(0)?.toUpperCase() || "?"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-white text-sm font-medium">
                                        {participant.userName}
                                    </span>
                                    {!participant.audioEnabled && (
                                        <span className="p-1.5 bg-red-500 rounded-lg">
                                            <IoMicOffOutline className="w-4 h-4 text-white" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Empty Slot when alone */}
                        {participants.length === 0 && (
                            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <div className="text-center p-6">
                                    <IoPeopleOutline className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Waiting for others to join...</p>
                                    <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">Share the meeting link with your team</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel */}
                {(showParticipants || showChat) && (
                    <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {showParticipants ? `Participants (${participants.length + 1})` : "Chat"}
                            </h3>
                            <button
                                onClick={() => { setShowParticipants(false); setShowChat(false); }}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <IoCloseOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {showParticipants && (
                                <div className="p-3 space-y-2">
                                    {/* Self */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center overflow-hidden">
                                            {user?.photoURL ? (
                                                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-medium">
                                                    {(user?.displayName || user?.name)?.charAt(0) || "?"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-900 dark:text-white text-sm font-medium truncate">You</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">{isOwner ? "Host" : "Participant"}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isAudioEnabled ? (
                                                <IoMicOutline className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <IoMicOffOutline className="w-4 h-4 text-red-500" />
                                            )}
                                            {isVideoEnabled ? (
                                                <IoVideocamOutline className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <IoVideocamOffOutline className="w-4 h-4 text-red-500" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Other participants */}
                                    {participants.map((p) => (
                                        <div key={p.socketId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden">
                                                {p.photoURL ? (
                                                    <img src={p.photoURL} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-medium">
                                                        {p.userName?.charAt(0) || "?"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{p.userName}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {p.audioEnabled !== false ? (
                                                    <IoMicOutline className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <IoMicOffOutline className="w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showChat && (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 p-4 space-y-4">
                                        {chatMessages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <IoChatbubbleOutline className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet</p>
                                                <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">Start the conversation!</p>
                                            </div>
                                        ) : (
                                            chatMessages.map((msg) => (
                                                <div key={msg.id} className={`flex gap-2 ${msg.odatId === user?.uid ? "flex-row-reverse" : ""}`}>
                                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-purple-600 shrink-0 flex items-center justify-center overflow-hidden">
                                                        {msg.photoURL ? (
                                                            <img src={msg.photoURL} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white text-xs font-medium">
                                                                {msg.sender?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`max-w-[70%] ${msg.odatId === user?.uid ? "text-right" : ""}`}>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{msg.sender}</p>
                                                        <div className={`px-3 py-2 rounded-2xl ${
                                                            msg.odatId === user?.uid 
                                                                ? "bg-violet-600 text-white rounded-tr-none" 
                                                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none"
                                                        }`}>
                                                            <p className="text-sm">{msg.text}</p>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        {showChat && (
                            <form onSubmit={sendChatMessage} className="p-3 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-transparent focus:border-violet-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                                    >
                                        <IoSendOutline className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-2xl transition-all ${
                        isAudioEnabled
                            ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                    title={isAudioEnabled ? "Mute" : "Unmute"}
                >
                    {isAudioEnabled ? <IoMicOutline className="w-6 h-6" /> : <IoMicOffOutline className="w-6 h-6" />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-2xl transition-all ${
                        isVideoEnabled
                            ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                    title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                    {isVideoEnabled ? <IoVideocamOutline className="w-6 h-6" /> : <IoVideocamOffOutline className="w-6 h-6" />}
                </button>

                <button
                    onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}
                    className={`p-4 rounded-2xl transition-all ${
                        showChat ? "bg-violet-600 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white"
                    }`}
                    title="Chat"
                >
                    <IoChatbubbleOutline className="w-6 h-6" />
                </button>

                <button
                    onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
                    className={`p-4 rounded-2xl transition-all ${
                        showParticipants ? "bg-violet-600 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white"
                    }`}
                    title="Participants"
                >
                    <IoPeopleOutline className="w-6 h-6" />
                </button>

                <div className="w-px h-10 bg-gray-300 dark:bg-gray-700 mx-2" />

                {/* End Meeting (Host only) */}
                {isOwner && (
                    <button
                        onClick={() => setEndMeetingConfirm(true)}
                        className="px-5 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all flex items-center gap-2"
                        title="End meeting for all"
                    >
                        <IoStopCircleOutline className="w-6 h-6" />
                        End
                    </button>
                )}

                <button
                    onClick={() => setLeaveConfirm(true)}
                    className="px-6 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all flex items-center gap-2"
                    title="Leave meeting"
                >
                    <IoCallOutline className="w-6 h-6 rotate-135" />
                    Leave
                </button>
            </div>

            {/* Leave Confirm Modal */}
            <ConfirmModal
                isOpen={leaveConfirm}
                onClose={() => setLeaveConfirm(false)}
                onConfirm={handleLeave}
                title="Leave Meeting"
                message="Are you sure you want to leave this meeting?"
                confirmText="Leave"
                cancelText="Stay"
                isDanger={true}
            />

            {/* End Meeting Confirm Modal (Host only) */}
            <ConfirmModal
                isOpen={endMeetingConfirm}
                onClose={() => setEndMeetingConfirm(false)}
                onConfirm={handleEndMeeting}
                title="End Meeting for Everyone"
                message="This will end the meeting for all participants. Are you sure you want to end this meeting?"
                confirmText="End Meeting"
                cancelText="Cancel"
                isDanger={true}
                isLoading={isEnding}
            />
        </div>
    );
};

export default VideoMeetingRoom;
