import React from 'react';
import { FaUserPlus, FaHeart, FaComment, FaBriefcase, FaShare, FaCircle } from 'react-icons/fa';

export const getIcon = (type) => {
    switch (type) {
        case 'request': return <FaUserPlus className="text-white text-xs" />;
        case 'post_share': return <FaShare className="text-white text-xs" />;
        case 'workspace_invite': return <FaBriefcase className="text-white text-xs" />;
        case 'like': return <FaHeart className="text-white text-xs" />;
        case 'comment': return <FaComment className="text-white text-xs" />;
        default: return <FaCircle className="text-white text-xs" />;
    }
};

export const getIconBg = (type) => {
    switch (type) {
        case 'request': return "bg-blue-500";
        case 'post_share': return "bg-green-500";
        case 'workspace_invite': return "bg-purple-600";
        case 'like': return "bg-red-500";
        case 'comment': return "bg-indigo-500";
        default: return "bg-gray-400";
    }
};
