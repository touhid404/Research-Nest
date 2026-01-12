import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaUsers, FaUserMinus, FaSignOutAlt, FaTrash, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useChatStore from "../../store/useChatStore";
import useAuth from "../../hooks/useAuth";
import ConfirmModal from "../common/ConfirmModal";
import { useNavigate } from "react-router";

const ConversationInfoModal = ({ isOpen, onClose, conversation }) => {
    const { user } = useAuth();
    const { removeMember, leaveGroup, deleteConversation } = useChatStore();
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'leave' | 'delete' | 'kick', payload: any }
    const [isProcessing, setIsProcessing] = useState(false);
    const modalRef = useRef(null);
    const navigate = useNavigate();

    if (!isOpen || !conversation) return null;

    const isGroup = conversation.isGroup;
    const participants = conversation.participants || [];
    const isAdmin = isGroup && conversation.groupAdmin === user?.uid;
    const otherUser = conversation.otherUser;

    const handleAction = async () => {
        if (!confirmAction) return;
        setIsProcessing(true);

        try {
            if (confirmAction.type === 'leave') {
                await leaveGroup(conversation._id);
                toast.success("Left group successfully");
                onClose();
                navigate('/home/messages');
            } else if (confirmAction.type === 'delete') {
                await deleteConversation(conversation._id);
                toast.success("Conversation deleted");
                onClose();
                navigate('/home/messages');
            } else if (confirmAction.type === 'kick') {
                await removeMember(conversation._id, confirmAction.payload);
                toast.success("Member removed from group");
                setConfirmAction(null);
            }
        } catch (error) {
            console.error("Action failed:", error);
            const actionText = confirmAction.type === 'leave' ? "Leave Group" :
                confirmAction.type === 'delete' ? "Delete Conversation" : "Remove Member";
            toast.error(`Failed to ${actionText}`);
        } finally {
            setIsProcessing(false);
            if (confirmAction?.type !== 'kick') {
                setConfirmAction(null);
            }
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="p-4 pb-0 flex justify-between items-center shrink-0">
                            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/40 rounded-xl">
                                    {isGroup ? <FaUsers size={14} className="text-violet-600 dark:text-violet-400" /> : <FaUser size={12} className="text-violet-600 dark:text-violet-400" />}
                                </div>
                                {isGroup ? "Group Details" : "Contact Info"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all active:scale-95"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Body - Main Content (Fixed Layout to prioritize list scroll) */}
                        <div className="p-5 pt-2 flex-1 flex flex-col min-h-0">
                            {/* Profile Section - Compact */}
                            <div className="text-center mb-4 pt-1 shrink-0">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative w-16 h-16 mx-auto mb-2"
                                >
                                    <div className="w-full h-full rounded-[1.4rem] bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-0.5 shadow-lg">
                                        <div className="w-full h-full rounded-[1.3rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {isGroup ? (
                                                <FaUsers className="text-2xl text-violet-500" />
                                            ) : otherUser?.photoURL ? (
                                                <img src={otherUser.photoURL} alt={otherUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-500 to-fuchsia-500">
                                                    {otherUser?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-lg shadow-md"></div>
                                </motion.div>

                                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-0.5 leading-tight">
                                    {isGroup ? conversation.groupName : otherUser?.name}
                                </h3>
                                {isGroup ? (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                        <div className="w-1 h-1 rounded-full bg-violet-500 animate-pulse"></div>
                                        <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{participants.length} Members</p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 opacity-80">{otherUser?.email}</p>
                                )}
                            </div>

                            {/* Group Members List Container - Scrollable Area */}
                            {isGroup && (
                                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Participants</h4>
                                    </div>

                                    {/* The ONLY scroll container */}
                                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[1.2rem] p-1.5 space-y-0.5 flex-1 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800 shadow-inner">
                                        {participants.map((member, index) => {
                                            const isMe = member.uid === user?.uid || member._id === user?.uid;
                                            const isMemberAdmin = conversation.groupAdmin === (member.uid || member._id);

                                            return (
                                                <motion.div
                                                    key={member.uid || member._id || index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="flex items-center justify-between p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="relative">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
                                                                {member.photoURL ? (
                                                                    <img src={member.photoURL} alt={member.name || "?"} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400">
                                                                        {(member.name || member.email || "?").charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isMemberAdmin && (
                                                                <div className="absolute -top-0.5 -right-0.5 p-0.5 bg-violet-500 rounded-md text-[5px] text-white ring-1 ring-white dark:ring-slate-800 shadow-lg">
                                                                    <FaUsers size={5} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-none">
                                                                {isMe ? "You" : (member.name || member.email || "Unknown User")}
                                                            </p>
                                                            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                                                {isMemberAdmin ? "Admin" : "Member"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {isAdmin && !isMe && (
                                                        <button
                                                            onClick={() => setConfirmAction({ type: 'kick', payload: member.uid || member._id })}
                                                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-all"
                                                            title="Remove member"
                                                        >
                                                            <FaUserMinus size={10} />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons Section - Fixed at Bottom */}
                            <div className="mt-3 space-y-1.5 shrink-0">
                                {isGroup ? (
                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            onClick={() => setConfirmAction({ type: 'leave' })}
                                            className="w-full flex items-center justify-between p-2.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold rounded-[0.8rem] transition-all hover:translate-x-1 active:scale-95 border border-orange-100 dark:border-orange-500/20"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FaSignOutAlt size={12} />
                                                <span className="text-[11px]">Leave Group</span>
                                            </div>
                                            <div className="w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-900 rounded-md shadow-sm">
                                                <FaSignOutAlt size={8} className="opacity-40" />
                                            </div>
                                        </button>

                                        {isAdmin && (
                                            <button
                                                onClick={() => setConfirmAction({ type: 'delete' })}
                                                className="w-full flex items-center justify-between p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-[0.8rem] transition-all hover:translate-x-1 active:scale-95 border border-rose-100 dark:border-rose-500/20"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FaTrash size={11} />
                                                    <span className="text-[11px]">Delete Group</span>
                                                </div>
                                                <div className="w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-900 rounded-md shadow-sm">
                                                    <FaTrash size={8} className="opacity-40" />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmAction({ type: 'delete' })}
                                        className="w-full flex items-center justify-center gap-1.5 p-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black rounded-[1.2rem] transition-all hover:scale-[1.02] active:scale-95 border border-rose-100 dark:border-rose-500/20 shadow-sm"
                                    >
                                        <FaTrash size={12} />
                                        <span className="uppercase tracking-[0.1em] text-[10px]">Delete Conversation</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Confirmation Overlay handled by ConfirmModal */}
                        <ConfirmModal
                            isOpen={!!confirmAction}
                            onClose={() => !isProcessing && setConfirmAction(null)}
                            onConfirm={handleAction}
                            isLoading={isProcessing}
                            title={
                                confirmAction?.type === 'leave' ? "Leave Group" :
                                    confirmAction?.type === 'delete' ? (isGroup ? "Delete Group" : "Delete Conversation") :
                                        "Remove Member"
                            }
                            message={
                                confirmAction?.type === 'leave' ? "Are you sure you want to leave this group? You won't be able to rejoin unless added by an admin." :
                                    confirmAction?.type === 'delete' ? "Are you sure you want to delete this conversation? This action cannot be undone and all message history will be lost." :
                                        "Are you sure you want to remove this member? They can be added back later by an admin."
                            }
                            confirmText={
                                confirmAction?.type === 'leave' ? "Leave Group" :
                                    confirmAction?.type === 'delete' ? "Delete" :
                                        "Remove"
                            }
                            isDanger={true}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
export default ConversationInfoModal;
