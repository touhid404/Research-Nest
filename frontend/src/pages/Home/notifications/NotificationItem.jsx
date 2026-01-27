import React from 'react';
import { Link } from 'react-router';

// Helper to parse **bold** text
const renderContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g); // Split by **...**
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-gray-900 dark:text-gray-100">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const NotificationItem = ({ notif, getIconBg, getIcon }) => (
    <div
        className={`relative p-4 rounded-xl transition-all duration-200 
        hover:bg-gray-100 dark:hover:bg-white/5
        ${!notif.read ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20' : 'bg-transparent border border-transparent'}`}
    >
        <div className="flex gap-4">
            {/* Avatar with Icon Badge */}
            <div className="relative shrink-0">
                <Link to={`/profile/${notif.actor.username}`} className='relative'>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800">
                        <img src={notif.actor.avatar} alt={notif.actor.name} className="w-full h-full object-cover" />
                    </div>
                    <div className={`absolute -bottom-1 z-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-black ${getIconBg(notif.type)}`}>
                        {getIcon(notif.type)}
                    </div>
                </Link>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div className="text-sm line-clamp-3">
                        <span className="font-bold text-gray-900 dark:text-gray-100 mr-1">
                            {notif.actor.name}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                            {renderContent(notif.content)}
                        </span>
                        {notif.target && (
                            <span className="text-gray-900 dark:text-gray-200 font-medium ml-1">
                                "{notif.target}"
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {notif.time}
                    </span>
                </div>

                {/* Type Specific Content */}

                {(notif.type === 'request' || notif.type === 'proposal_request') && (
                    <div className="mt-3">
                        {(!notif.actionStatus || notif.actionStatus === 'pending') ? (
                            <div className="flex items-center gap-3">
                                <button
                                    className="btn btn-sm h-9 px-5 rounded-full 
                    bg-primary text-white border-none hover:bg-primary-focus"
                                >
                                    Accept
                                </button>
                                <button
                                    className="btn btn-sm h-9 px-5 rounded-full 
                    bg-transparent 
                    border border-gray-300 dark:border-gray-600
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    text-gray-700 dark:text-gray-300
                    shadow-none"
                                >
                                    Decline
                                </button>
                            </div>
                        ) : (
                            <div className={`text-sm font-medium ${notif.actionStatus === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                {notif.actionStatus === 'accepted' ? 'Request Accepted' : 'Request Declined'}
                            </div>
                        )}
                    </div>
                )}

                {notif.type === 'proposal_accepted' && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                        Request Accepted!
                    </div>
                )}

                {notif.type === 'proposal_declined' && (
                    <div className="mt-2 text-sm text-red-500 font-medium">
                        Request Declined.
                    </div>
                )}

                {notif.type === 'post_share' && (
                    <div className="mt-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/20 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">
                            {notif.postSnippet.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {notif.postSnippet.preview}
                        </p>
                    </div>
                )}

                {notif.type === 'workspace_invite' && (
                    <div className="mt-3 p-4 rounded-xl border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-purple-900 dark:text-purple-200 text-sm">
                                    Workspace Invitation
                                </h4>
                                <p className="text-xs text-purple-700 dark:text-purple-300">
                                    You have been invited to collaborate.
                                </p>
                            </div>
                            <button className="btn btn-sm bg-purple-600 text-white border-none hover:bg-purple-700 rounded-full px-6">
                                Join
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Settings / More Dot */}
            {!notif.read && (
                <div className="mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-blue-50 dark:ring-blue-900/30"></div>
                </div>
            )}
        </div>
    </div>
);

export default NotificationItem;
