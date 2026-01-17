import { useEffect } from "react";
import { Outlet, useNavigate, useParams, NavLink } from "react-router";
import {
    IoGridOutline,
    IoCalendarOutline,
    IoVideocamOutline,
    IoDocumentTextOutline,
    IoPeopleOutline,
    IoChevronDownOutline,
    IoChatbubbleEllipsesOutline,
    IoGitPullRequestOutline,
} from "react-icons/io5";
import useAuth from "../../../hooks/useAuth";
import useWorkspaceStore from "../../../store/useWorkspaceStore";
import { useState, useRef, useEffect as useEffectRef } from "react";
import WorkspaceLoader from "../../../components/loader/WorkspaceLoader";
const WorkspaceBase = () => {
    const navigate = useNavigate();
    const { workspaceId } = useParams();
    const { user, socket } = useAuth();

    const {
        workspaces,
        selectedWorkspace,
        fetchWorkspaces,
        fetchWorkspaceById,
        setSelectedWorkspace,
        subscribeToWorkspace,
        unsubscribeFromWorkspace,
        isLoading,
    } = useWorkspaceStore();

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const selectorRef = useRef(null);

    // Close selector when clicking outside
    useEffectRef(() => {
        const handleClickOutside = (e) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target)) {
                setIsSelectorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch workspaces on mount
    useEffect(() => {
        fetchWorkspaces();
    }, []);

    // Fetch selected workspace when ID changes
    useEffect(() => {
        if (workspaceId && workspaceId !== selectedWorkspace?._id) {
            fetchWorkspaceById(workspaceId);
        }
    }, [workspaceId]);

    // Auto-select first workspace if none selected
    useEffect(() => {
        if (!workspaceId && workspaces.length > 0) {
            const firstWorkspace = workspaces[0];
            navigate(`/home/workspace/${firstWorkspace._id}/overview`, { replace: true });
        }
    }, [workspaces.length, workspaceId, navigate]);

    // Subscribe to workspace socket events
    useEffect(() => {
        const workspaceId = selectedWorkspace?._id;
        if (socket && workspaceId) {
            subscribeToWorkspace(socket, workspaceId);

            return () => {
                unsubscribeFromWorkspace(socket, workspaceId);
            };
        }
    }, [socket, selectedWorkspace?._id]);

    const handleWorkspaceSelect = (workspace) => {
        setSelectedWorkspace(workspace);
        setIsSelectorOpen(false);
        navigate(`/home/workspace/${workspace._id}/overview`);
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: IoGridOutline, path: "overview" },
        { id: "calendar", label: "Calendar", icon: IoCalendarOutline, path: "calendar" },
        { id: "meetings", label: "Meetings", icon: IoVideocamOutline, path: "meetings" },
        { id: "documents", label: "Documents", icon: IoDocumentTextOutline, path: "documents" },
    ];

    const renderNoWorkspace = () => (
        <div className="flex flex-col items-center justify-center h-full py-20 px-6">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-8 bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-3xl flex items-center justify-center shadow-inner">
                    <IoPeopleOutline className="w-12 h-12 text-violet-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                    Your Workspace is empty
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed text-sm">
                    You're not a member of any research workspace yet. Start collaborating by joining a group or creating your own through the chat.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/home/messages')}
                        className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <IoChatbubbleEllipsesOutline className="w-5 h-5" />
                        Go to Chat
                    </button>
                    <button
                        onClick={() => navigate('/home/requests')}
                        className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <IoGitPullRequestOutline className="w-5 h-5" />
                        View Requests
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header - Transparent with backdrop blur like ProposalPostsBase */}
            <div className="sticky top-0 bg-transparent backdrop-blur-md z-[60] sm:z-[500] px-4">
                <div className="flex items-center justify-between">
                    {/* Left: Workspace Selector */}
                    {workspaces.length > 0 && (
                        <div className="relative shrink-0" ref={selectorRef}>
                            <button
                                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                                className="flex items-center gap-2 transition-all group cursor-pointer"
                            >
                                <div className="w-5 h-5 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0 shadow-sm">
                                    {selectedWorkspace?.name?.charAt(0) || "W"}
                                </div>
                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate max-w-[120px] md:max-w-[180px]">
                                    {selectedWorkspace?.name || "Select Workspace"}
                                </span>
                                <IoChevronDownOutline className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${isSelectorOpen ? 'rotate-180' : ''} group-hover:text-primary`} />
                            </button>

                            {/* Dropdown */}
                            {isSelectorOpen && (
                                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-[999]">
                                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Workspaces</p>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {workspaces.map((ws) => (
                                            <button
                                                key={ws._id}
                                                onClick={() => handleWorkspaceSelect(ws)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedWorkspace?._id === ws._id ? 'bg-violet-50 dark:bg-violet-900/20' : ''
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedWorkspace?._id === ws._id
                                                    ? 'bg-linear-to-br from-violet-500 to-purple-600'
                                                    : 'bg-slate-200 dark:bg-slate-600'
                                                    }`}>
                                                    <span className={`text-sm font-bold ${selectedWorkspace?._id === ws._id ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                        {ws.name?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className={`text-sm font-medium truncate ${selectedWorkspace?._id === ws._id
                                                        ? 'text-violet-700 dark:text-violet-300'
                                                        : 'text-slate-700 dark:text-slate-200'
                                                        }`}>
                                                        {ws.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {ws.members?.length || 0} members
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Placeholder when no workspaces to maintain layout if needed, or simply let it collapse */}
                    {workspaces.length === 0 && <div className="w-1" />}

                    {/* Center: Tabs - Similar to ProposalPostsBase style */}
                    {selectedWorkspace && (
                        <div className="flex items-center gap-6">
                            {tabs.map((tab) => (
                                <NavLink
                                    key={tab.id}
                                    to={`/home/workspace/${selectedWorkspace._id}/${tab.path}`}
                                    className={({ isActive }) =>
                                        `pb-3 pt-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${isActive
                                            ? "border-black dark:border-white text-black dark:text-white"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        }`
                                    }
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Right: Team Members */}
                    {selectedWorkspace && (
                        <div className="hidden  md:flex items-center shrink-0 pb-1">
                            <div className="flex items-center -space-x-1.5">
                                {selectedWorkspace.members?.slice(0, 3).map((member) => (
                                    <div
                                        key={member.uid}
                                        className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-linear-to-br from-violet-500 to-purple-600"
                                        title={member.user?.name || "Member"}
                                    >
                                        {member.user?.photoURL ? (
                                            <img
                                                src={member.user.photoURL}
                                                alt={member.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="flex items-center justify-center w-full h-full text-white text-[10px] font-medium">
                                                {member.user?.name?.charAt(0) || "?"}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {selectedWorkspace.members?.length > 3 && (
                                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                        +{selectedWorkspace.members.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <WorkspaceLoader />
                ) : !selectedWorkspace && !workspaceId ? (
                    renderNoWorkspace()
                ) : (
                    <Outlet context={{ workspace: selectedWorkspace }} />
                )}
            </div>
        </div>
    );
};

export default WorkspaceBase;
