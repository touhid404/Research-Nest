import React from 'react';
import { Link } from 'react-router';

const PendingRq = () => {
    // Mock Data for Pending Requests
    const requests = [
        {
            id: 1,
            name: "Dr. Sarah Mitchell",
            username: "@s_mitchell",
            bio: "Neuroscience • Ph.D. Candidate at Stanford",
            avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", // detailed avatar
            time: "2h ago"
        },
        {
            id: 2,
            name: "James Anderson",
            username: "@j_anderson_ai",
            bio: "AI Researcher • Deep Learning enthusiast",
            avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
            time: "5h ago"
        },
        {
            id: 3,
            name: "Emily Chen",
            username: "@emily_chen_bio",
            bio: "Bioinformatics • Harvard Medical School",
            avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
            time: "1d ago"
        },
        {
            id: 4,
            name: "Michael Brown",
            username: "@mike_brown_phys",
            bio: "Theoretical Physics • Quantum Computing",
            avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
            time: "2d ago"
        },
        {
            id: 5,
            name: "Lisa Wong",
            username: "@lisa_wong_chem",
            bio: "Organic Chemistry • Research Associate",
            avatar: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
            time: "3d ago"
        }
    ];

    return (
        <div className="w-full max-w-2xl mx-auto pb-20">
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-6 px-2 flex items-center">Pending Requests <span className="ml-2">({requests.length})</span></h1>

                <div className="space-y-4">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="flex flex-col sm:flex-row items-center gap-4 p-5 
              rounded-3xl bg-white dark:bg-gray-800 
              border border-gray-100 dark:border-gray-800 
              hover:border-gray-200 dark:hover:border-gray-700
              hover:bg-gray-50 dark:hover:bg-gray-900/50
              transition-all duration-300 group"
                        >
                            {/* Avatar Section */}
                            <Link to={`/profile/${req.username}`} className="shrink-0 relative">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-800 group-hover:border-white dark:group-hover:border-gray-600 transition-colors">
                                    <img
                                        src={req.avatar}
                                        alt={req.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>

                            {/* Info Section */}
                            <div className="flex-1 text-center sm:text-left min-w-0 w-full sm:w-auto">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1 justify-center sm:justify-start">
                                    <Link to={`/profile/${req.username}`} className="shrink-0 relative">
                                        <h3 className="font-bold text-lg decoration-2 decoration-primary cursor-pointer truncate">
                                            {req.name}
                                        </h3>
                                    </Link>
                                    <span className="mx-1.5 mt-.5">•</span>
                                    <span className="text-sm text-gray-400 font-medium">
                                        {req.time}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                                    {req.username}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                    {req.bio}
                                </p>
                            </div>

                            {/* Actions Section */}
                            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                <button
                                    className="flex-1 sm:flex-none btn btn-sm h-10 px-6 rounded-full 
                  bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white 
                  border-none transition-all"
                                >
                                    Accept
                                </button>
                                <button
                                    className="flex-1 sm:flex-none btn btn-sm h-10 px-6 rounded-full 
                  bg-transparent 
                  border border-red-200 dark:border-red-900/30 
                  text-red-500 dark:text-red-400 
                  hover:bg-red-50 dark:hover:bg-red-900/20 
                  hover:border-red-300 dark:hover:border-red-800
                  transition-all duration-200 shadow-none"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {requests.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-2 text-6xl">📭</div>
                        <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">No pending requests</h3>
                        <p className="text-gray-500">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingRq;