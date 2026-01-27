import React, { useEffect } from 'react';
import NotificationItem from '../../pages/Home/notifications/NotificationItem.jsx';
import { getIcon, getIconBg } from '../../pages/Home/notifications/NotificationHelpers.jsx';
import { Link } from 'react-router';
import useNotifications from '../../hooks/useNotifications';
import { formatTime } from '../../utils/formatTime';

const NotificationDropdown = ({ onClose }) => {
    const { notifications, markAllAsRead, markAsRead } = useNotifications();

    useEffect(() => {
        markAllAsRead();
    }, []);
    const mappedNotifications = notifications.map(n => ({
        id: n._id,
        type: n.type, // 'proposal_request', 'workspace_invite', etc.
        actor: {
            name: n.sender?.name || 'Unknown',
            username: n.sender?.username ? `@${n.sender.username}` : '',
            avatar: n.sender?.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        },
        content: n.message,
        time: n.createdAt ? formatTime(new Date(n.createdAt)) : '',
        read: n.isRead,
        // Preserve specific fields if needed
        relatedId: n.relatedId,
        actionStatus: n.actionStatus  // Add this field
    }));

    const newNotifications = mappedNotifications.filter(n => !n.read);
    const earlierNotifications = mappedNotifications.filter(n => n.read);

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-96 max-h-[85vh] flex flex-col 
            bg-white dark:bg-gray-900 
            rounded-2xl shadow-xl 
            border border-gray-100 dark:border-gray-800 
            z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                <h2 className="font-bold text-lg">Notifications</h2>
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                    Mark all as read
                </button>
            </div>

            <div className="overflow-y-auto rn-scrollbar flex-1 p-2">
                {mappedNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No notifications yet
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* New Notifications Section */}
                        {newNotifications.length > 0 && (
                            <div>
                                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-2">New</h2>
                                <div className="space-y-1">
                                    {newNotifications.map((notif) => (
                                        <NotificationItem
                                            key={notif.id}
                                            notif={notif}
                                            getIcon={getIcon}
                                            getIconBg={getIconBg}
                                            onRead={() => markAsRead(notif.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Earlier Notifications Section */}
                        {earlierNotifications.length > 0 && (
                            <div>
                                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-4">Earlier</h2>
                                <div className="space-y-1">
                                    {earlierNotifications.map((notif) => (
                                        <NotificationItem
                                            key={notif.id}
                                            notif={notif}
                                            getIcon={getIcon}
                                            getIconBg={getIconBg}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Link to="/home/notifications" onClick={onClose}>
                <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
                    <button className="text-sm font-semibold text-primary hover:underline cursor-pointer">
                        See all notifications
                    </button>
                </div>
            </Link>
        </div>
    );
};

export default NotificationDropdown;
