import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaUsers, FaUserMinus, FaSignOutAlt, FaTrash, FaUser } from "react-icons/fa";
import useChatStore from "../../store/useChatStore";
import useAuth from "../../hooks/useAuth";
import ConfirmModal from "../common/ConfirmModal";

const ConversationInfoModal = ({ isOpen, onClose, conversation }) => {
    const { user } = useAuth();
    const { removeMember, leaveGroup, deleteConversation } = useChatStore();
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'leave' | 'delete' | 'kick', payload: any }
    const modalRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && !document.getElementById('confirm-modal')) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !conversation) return null;

    const isGroup = conversation.isGroup;
    const participants = conversation.participants || [];
    const isAdmin = isGroup && conversation.groupAdmin === user?.uid;
    const otherUser = conversation.otherUser;

    const handleAction = async () => {
        if (!confirmAction) return;

        try {
            if (confirmAction.type === 'leave') {
                await leaveGroup(conversation._id);
                onClose();
            } else if (confirmAction.type === 'delete') {
                await deleteConversation(conversation._id);
                onClose();
            } else if (confirmAction.type === 'kick') {
                await removeMember(conversation._id, confirmAction.payload);
                // For kick, we don't necessarily close, but we should refetch or update UI?
                // The store action updates local state.
                setConfirmAction(null);
            }
        } catch (error) {
            console.error("Action failed:", error);
            // Optionally show error toast
        } finally {
            if (confirmAction?.type !== 'kick') {
                setConfirmAction(null);
            }
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {isGroup ? <FaUsers className="text-violet-500" /> : <FaUser className="text-violet-500" />}
                        {isGroup ? "Group Info" : "Chat Info"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800">
                            {isGroup ? (
                                <FaUsers className="text-4xl text-violet-500" />
                            ) : otherUser?.photoURL ? (
                                <img src={otherUser.photoURL} alt={otherUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-slate-500">
                                    {otherUser?.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            {isGroup ? conversation.groupName : otherUser?.name}
                        </h3>
                        {isGroup ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{participants.length} members</p>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{otherUser?.email}</p>
                        )}
                    </div>

                    {isGroup && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Members</h4>
                            <div className="space-y-2">
                                {participants.map((member, index) => {
                                    const isMe = member.uid === user?.uid || member._id === user?.uid;
                                    const isMemberAdmin = conversation.groupAdmin === (member.uid || member._id);

                                    return (

                                        <div key={member.uid || member._id || index} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700">
                                                        {member.photoURL ? (
                                                            <img src={member.photoURL} alt={member.name || "?"} />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-500">
                                                                {(member.name || member.email || "?").charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                        {isMe ? "You" : (member.name || member.email || "Unknown User")}
                                                    </p>
                                                    {isMemberAdmin && (
                                                        <span className="text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded font-medium">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isAdmin && !isMe && (
                                                <button
                                                    onClick={() => setConfirmAction({ type: 'kick', payload: member.uid || member._id })}
                                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Remove member"
                                                >
                                                    <FaUserMinus />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>


            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleAction}
                title={
                    confirmAction?.type === 'leave' ? "Leave Group" :
                        confirmAction?.type === 'delete' ? (isGroup ? "Delete Group" : "Delete Conversation") :
                            "Remove Member"
                }
                message={
                    confirmAction?.type === 'leave' ? "Are you sure you want to leave this group?" :
                        confirmAction?.type === 'delete' ? "Are you sure you want to delete this conversation? This cannot be undone." :
                            "Are you sure you want to remove this member?"
                }
                confirmText={
                    confirmAction?.type === 'leave' ? "Leave" :
                        confirmAction?.type === 'delete' ? "Delete" :
                            "Remove"
                }
                isDanger={true}
            />
        </div>,
        document.body
    );
};

export default ConversationInfoModal;
