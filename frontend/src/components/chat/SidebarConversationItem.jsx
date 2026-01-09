import { FaUsers, FaInfoCircle, FaSignOutAlt, FaTrash } from "react-icons/fa";

const SidebarConversationItem = ({
    conversation,
    selectedConversation,
    onlineUsers,
    user,
    onClick,
    onDeleteClick,
    onInfoClick
}) => {
    const otherUser = conversation.otherUser;
    const isSelected = selectedConversation?._id === conversation._id;
    const isOnline = onlineUsers.includes(otherUser?.uid);

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 24) {
            return d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        return d.toLocaleDateString();
    };

    return (
        <div
            onClick={() => onClick(conversation)}
            className={`
        group relative flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-300
        ${isSelected
                    ? "bg-white dark:bg-slate-800 shadow-sm ring-1 ring-violet-500/20"
                    : "hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm"
                }
      `}
        >
            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-violet-500 rounded-r-full"></div>
            )}

            {/* Avatar */}
            <div className="relative shrink-0">
                <div className={`avatar placeholder transition-transform ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}>
                    <div className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-900 bg-linear-to-br from-violet-100 to-fuchsia-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        {conversation.isGroup ? (
                            <FaUsers className="text-violet-500 text-lg" />
                        ) : otherUser?.photoURL ? (
                            <img src={otherUser.photoURL} alt={otherUser.name} />
                        ) : (
                            <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                                {otherUser?.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
                {/* Status Dot */}
                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`font-semibold truncate ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-800 dark:text-slate-200'}`}>
                        {conversation.isGroup ? conversation.groupName : otherUser?.name}
                    </span>
                    {conversation.lastMessage && (
                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                            {formatTime(conversation.updatedAt)}
                        </span>
                    )}
                </div>
                <div className="flex justify-between items-center">
                    <p className={`text-sm truncate max-w-[140px] ${conversation.unreadCount > 0 ? 'font-semibold text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>
                        {conversation.lastMessage?.text || "No messages yet"}
                    </p>
                    <div className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                            <span className="flex items-center justify-center p-1 min-w-[20px] h-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[10px] font-bold text-white shadow-sm">
                                {conversation.unreadCount}
                            </span>
                        )}

                        {/* Info Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onInfoClick(conversation);
                            }}
                            className="p-1.5 text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                            title="Info"
                        >
                            <FaInfoCircle size={14} />
                        </button>

                        <button
                            onClick={(e) => onDeleteClick(e, conversation)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                            title={conversation.isGroup && conversation.groupAdmin !== user?.uid ? "Leave Group" : "Delete"}
                        >
                            {conversation.isGroup && conversation.groupAdmin !== user?.uid ? <FaSignOutAlt size={14} /> : <FaTrash size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarConversationItem;
