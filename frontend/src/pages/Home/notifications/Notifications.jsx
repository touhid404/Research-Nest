import React from 'react';
import { Link } from 'react-router';
import NotificationItem from './NotificationItem.jsx';
import { getIcon, getIconBg } from './NotificationHelpers.jsx';
import RightSidebar from '../../../components/sidebar/RightSidebar.jsx';

const Notifications = () => {
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
        {
            id: 4,
            type: 'like',
            actor: {
                name: "Emily Chen",
                username: "@e_chen",
                avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            },
            content: "liked your research proposal",
            time: "1d ago",
            read: true,
            target: "On the efficacy of..."
        },
        {
            id: 5,
            type: 'comment',
            actor: {
                name: "Michael Brown",
                username: "@m_brown",
                avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            },
            content: "commented: 'This is a fascinating approach, have you considered...'",
            time: "2d ago",
            read: true,
        }
    ];

    const newNotifications = notifications.filter(n => !n.read);
    const earlierNotifications = notifications.filter(n => n.read);

    return (



        <div className="flex h-full">
            {/* Posts Section */}
            <div className="flex-1 border-r border-gray-100 dark:border-gray-800 overflow-y-auto rn-scrollbar pr-2">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        <button className="cursor-pointer text-sm text-primary font-medium hover:underline">
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

                        {notifications.length === 0 && (
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