import React, { useEffect } from 'react';
import NotificationItem from './NotificationItem.jsx';
import { getIcon, getIconBg } from './NotificationHelpers.jsx';
import RightSidebar from '../../../components/sidebar/RightSidebar.jsx';
import useNotifications from '../../../hooks/useNotifications';
import { formatTime } from '../../../utils/formatTime';

const Notifications = () => {
    const { notifications, markAllAsRead, markAsRead } = useNotifications();

    // Map backend data to UI format
    const mappedNotifications = notifications.map(n => ({
        id: n._id,
        type: n.type,
        actor: {
            name: n.sender?.name || 'Unknown',
            username: n.sender?.username ? `@${n.sender.username}` : '',
            avatar: n.sender?.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        },
        content: n.message,
        time: n.createdAt ? formatTime(new Date(n.createdAt)) : '',
        read: n.isRead,
        relatedId: n.relatedId,
        actionStatus: n.actionStatus
    }));

    const newNotifications = mappedNotifications.filter(n => !n.read);
    const earlierNotifications = mappedNotifications.filter(n => n.read);

    // Optional: Auto-mark as read when visiting the full page?
    // User only asked to "update the notifications routes page should be updated with the same notification that have shown on the popup".
    // I won't auto-mark read here unless requested, but the "Mark all as read" button should work.

    return (
        <div className="flex h-full">
            {/* Posts Section */}
            <div className="flex-1 border-r border-gray-100 dark:border-gray-800 overflow-y-auto rn-scrollbar pr-2">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        <button
                            onClick={() => markAllAsRead()}
                            className="cursor-pointer text-sm text-primary font-medium hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* New Notifications Section */}
                        {newNotifications.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">New</h2>
                                <div className="space-y-2">
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
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Earlier</h2>
                                <div className="space-y-2">
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

                        {mappedNotifications.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                No notifications yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="md:w-[450px] hidden lg:block shrink-0 overflow-y-auto rn-scrollbar pl-2">
                <RightSidebar />
            </div>
        </div>
    );
};

export default Notifications;