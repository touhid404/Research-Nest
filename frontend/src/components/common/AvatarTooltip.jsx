
export const AvatarTooltip = ({ name, photoURL, color, show }) => {
    return (
        show && (
            <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none whitespace-nowrap"
            >
                <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 p-1.5 pl-2 pr-4 rounded-full border border-white/10 dark:border-slate-200/50 shadow-xl flex items-center gap-2.5">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 dark:border-slate-300 shadow-inner shrink-0 relative bg-white dark:bg-slate-100">
                        {photoURL ? (
                            <img src={photoURL} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: color || "#6366f1" }}
                            >
                                {name?.charAt(0) || "?"}
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div className="flex flex-col">
                        <span className="text-xs font-bold leading-none mb-1">{name}</span>
                        <span className="text-[9px] font-medium opacity-70 leading-none mt-0.5 uppercase tracking-wider">Collaborator</span>
                    </div>
                </div>

                {/* Arrow */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 dark:bg-white/90 backdrop-blur-md rotate-45 border-l border-t border-white/10 dark:border-slate-200/50"></div>
            </div>
        )
    );
};
