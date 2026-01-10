import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
    StreamVideo,
    StreamCall,
    StreamTheme,
    useCallStateHooks,
    CallingState,
    PaginatedGridLayout,
    SpeakerLayout,
    CallControls,
    ParticipantView,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./VideoMeetingRoom.css"; // We'll create this for custom overrides
import useAuth from "../../hooks/useAuth";
import { videoApi } from "../../lib/videoApi";
import { initializeStreamClient } from "../../lib/streamClient";
import useWorkspaceStore from "../../store/useWorkspaceStore";
import toast from "react-hot-toast";
import { Loader2, Users, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

const MeetingSkeleton = () => {
    return (
        <div className="h-[80vh] w-full flex flex-col bg-transparent animate-pulse overflow-hidden">
            {/* 90% Video Area Skeleton */}
            <div className="h-[90%] relative flex items-center justify-center min-h-0 bg-transparent dark:bg-black/20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500/40 mx-auto mb-6" />
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-3" />
                    <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded-full mx-auto" />
                </div>

                {/* Top Meta Skeleton */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
            </div>

            {/* 10% Docked Footer Skeleton */}
            <div className="h-[10%] max-w-4xl w-full rounded-xl mx-auto bg-gray-200 dark:bg-slate-800 flex items-center justify-center p-3">
                <div className="w-full flex items-center justify-between px-6">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-700" />
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-700" />
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-700" />
                    </div>
                    <div className="w-32 h-10 rounded-2xl bg-gray-300 dark:bg-slate-700" />
                </div>
            </div>
        </div>
    );
};

const MeetingContent = ({
    meeting,
    workspace,
    timeRemaining,
    formatTimeRemaining,
    leaveCall,
    endCall,
    isOwner
}) => {
    const { useCallCallingState, useParticipantCount, useScreenShareState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const participantCount = useParticipantCount();
    const { screenShareParticipant } = useScreenShareState();

    const isTimeWarning = timeRemaining !== null && timeRemaining <= 5 * 60 * 1000 && timeRemaining > 0;

    // Show professional loading skeleton during connection & joining
    if (callingState === CallingState.JOINING) {
        return <MeetingSkeleton />;
    }

    return (
        <div className="h-[80vh] w-full flex flex-col">
            <div className="h-[90%] relative flex items-center justify-center min-h-0">

                <div className="w-full h-full max-w-7xl mx-auto overflow-hidden z-0">
                    {screenShareParticipant ? (
                        <SpeakerLayout />
                    ) : (
                        <PaginatedGridLayout />
                    )}
                </div>

                <div className="absolute top-4 right-4 flex items-center justify-between pointer-events-none z-10">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-600/20 backdrop-blur-xl rounded-xl border border-red-500/30">
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                            <span className="text-red-400 text-[11px] font-black uppercase tracking-widest">Live</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 bg-black/40 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-white text-xs font-bold">{participantCount}</span>
                        </div>

                        {timeRemaining !== null && timeRemaining > 0 && (
                            <div className={`flex items-center gap-2 px-3 py-2 bg-black/40 dark:bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 transition-all duration-500 ${isTimeWarning ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : "text-white"}`}>
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-bold">{formatTimeRemaining(timeRemaining)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-[10%] max-w-4xl rounded-xl mx-auto bg-gray-200 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800 flex items-center justify-center p-3 z-20">
                <div className="w-full  flex items-center justify-between px-6">

                    {/* Central Controls */}
                    <div className="flex items-center gap-6">
                        <div className="p-2">
                            <CallControls onLeave={leaveCall} />
                        </div>

                        {isOwner && (
                            <button
                                onClick={endCall}
                                className="group/end flex items-center gap-2.5 px-8 py-3 bg-red-600 hover:bg-black dark:hover:bg-white dark:hover:text-black text-white rounded-2xl text-[11px] font-black tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/20"
                            >
                                <AlertTriangle className="w-4 h-4 group-hover/end:animate-bounce" />
                                END FOR ALL
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoMeetingRoom = ({ meeting, workspace, onLeave }) => {
    const { user } = useAuth();
    const { updateMeeting } = useWorkspaceStore();
    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const [isJoining, setIsJoining] = useState(true);
    const [joinError, setJoinError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);

    // Ref to prevent multiple end calls
    const hasEndedRef = useRef(false);
    const hasJoinedRef = useRef(false);
    const timerRef = useRef(null);

    const displayName = useMemo(
        () => user?.displayName || user?.name || user?.email || "Guest",
        [user]
    );

    const isOwner = meeting?.scheduledBy === user?.uid;

    // Calculate meeting end time
    const meetingEndTime = useMemo(() => {
        if (!meeting) return null;
        if (meeting.endTime) return new Date(meeting.endTime);
        if (meeting.duration && meeting.startTime) {
            return new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60 * 1000);
        }
        return null;
    }, [meeting?.endTime, meeting?.duration, meeting?.startTime]);

    // Format time remaining
    const formatTimeRemaining = useCallback((ms) => {
        if (ms <= 0) return "Ending...";
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }, []);

    // Leave call function (for non-owners)
    const leaveCall = useCallback(async () => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;

        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        try {
            if (call) await call.leave();
        } catch (error) {
            console.error("Error leaving call", error);
        }
        onLeave();
    }, [call, onLeave]);

    // End call function (for owner - marks meeting as completed)
    const endCall = useCallback(async () => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;

        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        try {
            await updateMeeting(meeting._id, { status: "completed" });
            toast.success("Meeting ended for everyone");
        } catch (error) {
            console.error("Error ending meeting", error);
        }

        try {
            if (call) {
                // End call for everyone
                await call.endCall();
            }
        } catch (error) {
            console.error("Error ending call for everyone", error);
        }
        onLeave();
    }, [call, onLeave, meeting?._id, updateMeeting]);

    // Handler that decides whether to leave or end based on ownership
    const handleLeaveOrEnd = useCallback(async () => {
        console.log("handleLeaveOrEnd triggered", { isOwner });
        if (isOwner) {
            await endCall();
        } else {
            await leaveCall();
        }
    }, [isOwner, endCall, leaveCall]);

    // Timer for auto-end and time remaining display
    useEffect(() => {
        if (!meetingEndTime || hasEndedRef.current) return;

        const updateTimer = () => {
            if (hasEndedRef.current) return;

            const now = Date.now();
            const remaining = meetingEndTime.getTime() - now;
            setTimeRemaining(remaining);

            if (remaining <= 0 && !hasEndedRef.current) {
                toast("Meeting time has ended", { icon: "⏰" });
                if (isOwner) {
                    endCall();
                } else {
                    leaveCall();
                }
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [meetingEndTime, isOwner, endCall, leaveCall]);

    // Initialize Stream Video client and join call
    useEffect(() => {
        let isInstanceMounted = true;
        const sessionToken = Math.random().toString(36).substring(7);
        let activeCall = null;

        const joinCall = async () => {
            if (!user?.uid || !meeting?._id) return;

            // If we've already joined OR if there's a join in progress, abort
            if (hasJoinedRef.current) return;

            try {
                setIsJoining(true);
                setJoinError(null);

                // Set joined flag immediately to prevent other effects from starting a join
                hasJoinedRef.current = true;

                // Get token from backend
                const tokenResponse = await videoApi.getToken({
                    userId: user.uid,
                    userName: displayName,
                });

                if (!isInstanceMounted) return;

                if (!tokenResponse?.token) {
                    throw new Error("Stream token missing from server response");
                }

                // Initialize Stream Video Client using singleton
                const streamUser = {
                    id: user.uid,
                    name: displayName,
                    image: user?.photoURL,
                };

                const videoClient = await initializeStreamClient(streamUser, tokenResponse.token);

                if (!isInstanceMounted || !videoClient) return;

                setClient(videoClient);

                // Create and join call
                const videoCall = videoClient.call("default", meeting._id);
                activeCall = videoCall;

                await videoCall.join({ create: true });

                if (!isInstanceMounted) {
                    await videoCall.leave();
                    return;
                }

                setCall(videoCall);
                console.log(`[Session ${sessionToken}] Successfully joined call`);
            } catch (err) {
                if (!isInstanceMounted) return;
                console.error("Failed to join Stream call", err);
                hasJoinedRef.current = false; // Allow retry on error
                setJoinError(err?.message || "Failed to join call");
                toast.error("Could not join the meeting");
            } finally {
                if (isInstanceMounted) {
                    setIsJoining(false);
                }
            }
        };

        joinCall();

        // Cleanup on unmount - only leave the call, don't disconnect the singleton client
        return () => {
            isInstanceMounted = false;
            hasJoinedRef.current = false;

            if (activeCall) {
                console.log(`[Session ${sessionToken}] Cleaning up call session on unmount`);
                activeCall.leave().catch(err => console.error("Error leaving call in cleanup:", err));
            }
        };
    }, [meeting?._id, user?.uid, displayName, user?.photoURL]);

    // Unified Loading State (initial connection + engine startup)
    if (isJoining || (!joinError && (!client || !call))) {
        return <MeetingSkeleton />;
    }

    // Error state
    if (joinError) {
        return (
            <div className="flex-1 w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 text-center px-4">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center mb-8 shadow-sm">
                    <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
                </div>
                <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-black mb-3 tracking-tight">CONNECTION FAILED</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 max-w-sm leading-relaxed">{joinError}</p>
                <button
                    onClick={onLeave}
                    className="px-8 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-500/20 active:scale-95"
                >
                    Return to Workspace
                </button>
            </div>
        );
    }

    return (
        <StreamVideo client={client}>
            <StreamTheme>
                <StreamCall call={call}>
                    <MeetingContent
                        meeting={meeting}
                        workspace={workspace}
                        timeRemaining={timeRemaining}
                        formatTimeRemaining={formatTimeRemaining}
                        leaveCall={leaveCall}
                        endCall={endCall}
                        isOwner={isOwner}
                    />
                </StreamCall>
            </StreamTheme>
        </StreamVideo>
    );
};

export default VideoMeetingRoom;
