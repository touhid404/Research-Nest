import React from 'react';
import NotificationItem from '../../pages/Home/notifications/NotificationItem.jsx';
import { getIcon, getIconBg } from '../../pages/Home/notifications/NotificationHelpers.jsx';
import { Link } from 'react-router';

const NotificationDropdown = ({ onClose }) => {
    // Mock Data - In a real app this would come from a Context or Store
    const notifications = [
        {
            id: 1,
            type: 'request',
            actor: {
                name: "Dr. Sarah Mitchell",
                username: "@s_mitchell",
                avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            },
            content: "sent you a connection request",
            time: "2h ago",
            read: false,
        },
        {
            id: 2,
            type: 'post_share',
            actor: {
                name: "James Anderson",
                username: "@j_anderson",
                avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            },
            content: "shared a post with you",
            time: "4h ago",
            read: false,
            postSnippet: {
                title: "The Future of Quantum Computing in 2025",
                preview: "New breakthroughs in qubit stability might change everything we know about..."
            }
        },
        {
            id: 3,
            type: 'workspace_invite',
            actor: {
                name: "Research-Nest Team",
                username: "@rn_official",
                avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            },
            content: "invited you to join the 'Global Sustainability' workspace",
            time: "1d ago",
            read: true,
        },
    ];

    const newNotifications = notifications.filter(n => !n.read);
    const earlierNotifications = notifications.filter(n => n.read);

    return (
        <div className="absolute top-full right-0 mt-2 w-96 max-h-[85vh] flex flex-col 
            bg-white dark:bg-gray-900 
            rounded-2xl shadow-xl 
            border border-gray-100 dark:border-gray-800 
            z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                <h2 className="font-bold text-lg">Notifications</h2>
                <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">
                    Mark all as read
                </button>
            </div>

            <div className="overflow-y-auto rn-scrollbar flex-1 p-2">
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
