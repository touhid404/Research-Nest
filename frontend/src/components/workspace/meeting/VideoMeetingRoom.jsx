import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
    StreamVideo,
    StreamCall,
    StreamTheme,
    useCallStateHooks,
    CallingState,
    SpeakerLayout,
    CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import useAuth from "../../../hooks/useAuth";
import { videoApi } from "../../../lib/videoApi";
import { initializeStreamClient } from "../../../lib/streamClient";
import useWorkspaceStore from "../../../store/useWorkspaceStore";
import toast from "react-hot-toast";
import { Loader2, Users, AlertTriangle } from "lucide-react";
import ConfirmModal from "../../common/ConfirmModal";
import MeetingJoinLoader from "../../loader/MeetingJoinLoader";

const VideoCallUI = ({ onLeave, isOwner, onEndSession }) => {
    const { useCallCallingState, useParticipantCount } = useCallStateHooks();
    const callingState = useCallCallingState();
    const participantCount = useParticipantCount();

    if (callingState === CallingState.JOINING) {
        return <MeetingJoinLoader />;
    }

    return (
        <div className="md:h-[85vh] h-full flex flex-col gap-3 p-1 relative">
            {/* Main Video Area - SpeakerLayout automatically handles screen sharing */}
            <div className="flex-1 rounded-lg overflow-y-auto custom-scrollbar relative">
                <SpeakerLayout participantsBarPosition="bottom" />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <CallControls onLeave={onLeave} />

                {isOwner && (
                    <button
                        onClick={onEndSession}
                        className="flex items-center gap-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-semibold transition-all shadow-lg shadow-red-500/20"
                        title="End meeting for everyone"
                    >
                        <AlertTriangle className="w-2 h-2" />
                        End Session
                    </button>
                )}
            </div>
        </div>
    );
};

const VideoMeetingRoom = ({ meeting, workspace, onLeave }) => {
    const { user } = useAuth();
    const { updateMeeting } = useWorkspaceStore();
    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const [joinError, setJoinError] = useState(null);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const hasJoinedRef = useRef(false);

    const displayName = useMemo(
        () => user?.displayName || user?.name || user?.email || "Guest",
        [user]
    );

    const isOwner = meeting?.scheduledBy === user?.uid;

    const handleConfirmEndSession = useCallback(async () => {
        try {
            setIsEnding(true);
            await updateMeeting(meeting._id, { status: "completed" });
            toast.success("Meeting ended for everyone");

            if (call) {
                await call.endCall();
            }
        } catch (error) {
            console.error("Error ending meeting", error);
            toast.error("Failed to end meeting");
        } finally {
            setIsEnding(false);
            setIsEndModalOpen(false);
            onLeave();
        }
    }, [call, meeting?._id, updateMeeting, onLeave]);

    // Initialize Stream Video client and join call
    useEffect(() => {
        let isInstanceMounted = true;
        let activeCall = null;

        const joinCall = async () => {
            if (!user?.uid || !meeting?._id) return;
            if (hasJoinedRef.current) return;

            try {
                setJoinError(null);
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

                const streamUser = {
                    id: user.uid,
                    name: displayName,
                    image: user?.photoURL,
                };

                const videoClient = await initializeStreamClient(streamUser, tokenResponse.token);

                if (!isInstanceMounted || !videoClient) return;

                setClient(videoClient);

                const videoCall = videoClient.call("default", meeting._id);
                activeCall = videoCall;

                await videoCall.join({ create: true });

                if (!isInstanceMounted) {
                    await videoCall.leave();
                    return;
                }

                setCall(videoCall);
                console.log(`Successfully joined call for meeting ${meeting._id}`);
            } catch (err) {
                if (!isInstanceMounted) return;
                console.error("Failed to join Stream call", err);
                hasJoinedRef.current = false;
                setJoinError(err?.message || "Failed to join call");
                toast.error("Could not join the meeting");
            }
        };

        joinCall();

        return () => {
            isInstanceMounted = false;
            hasJoinedRef.current = false;
            if (activeCall) {
                activeCall.leave().catch(err => {
                    if (err.message.includes("already been left")) return;
                });
            }
        };
    }, [meeting?._id, user?.uid, displayName, user?.photoURL]);

    if (!client || !call) {
        if (joinError) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-4">
                    <div className="text-center text-error mb-4">
                        <p className="font-bold text-lg">Connection Failed</p>
                        <p className="text-sm opacity-80">{joinError}</p>
                    </div>
                    <button onClick={onLeave} className="btn btn-primary">
                        Go Back
                    </button>
                </div>
            );
        }
        return <MeetingJoinLoader />;
    }

    return (
        <StreamVideo client={client}>
            <StreamTheme className="">
                <StreamCall call={call}>
                    <VideoCallUI
                        onLeave={onLeave}
                        isOwner={isOwner}
                        onEndSession={() => setIsEndModalOpen(true)}
                    />

                    <ConfirmModal
                        isOpen={isEndModalOpen}
                        onClose={() => setIsEndModalOpen(false)}
                        onConfirm={handleConfirmEndSession}
                        title="End Session"
                        message="Are you sure you want to end this session? This will disconnect all participants."
                        confirmText="End Session"
                        isDanger={true}
                        isLoading={isEnding}
                    />
                </StreamCall>
            </StreamTheme>
        </StreamVideo>
    );
};

export default VideoMeetingRoom;
