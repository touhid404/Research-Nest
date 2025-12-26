
const SidebarUserItem = ({ user, onClick }) => {
    return (
        <div
            onClick={() => onClick(user)}
            className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm group"
        >
            <div className="avatar placeholder group-hover:scale-105 transition-transform">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.name} />
                    ) : (
                        <span className="text-slate-500 font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <span className="font-semibold block text-slate-700 dark:text-slate-300 truncate">
                    {user?.name}
                </span>
                <span className="text-xs text-slate-400 truncate">
                    Start a new conversation
                </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-violet-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
            </div>
        </div>
    );
};

export default SidebarUserItem;
