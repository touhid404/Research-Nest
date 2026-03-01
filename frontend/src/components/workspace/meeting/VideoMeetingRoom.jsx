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
import { aiApi } from "../../../lib/aiApi";
import { initializeStreamClient } from "../../../lib/streamClient";
import useWorkspaceStore from "../../../store/useWorkspaceStore";
import useCallRecording from "../../../hooks/useCallRecording";
import toast from "react-hot-toast";
import { Loader2, Users, AlertTriangle, Mic, MicOff, Circle } from "lucide-react";
import ConfirmModal from "../../common/ConfirmModal";
import MeetingJoinLoader from "../../loader/MeetingJoinLoader";

/**
 * Format seconds into MM:SS display
 */
const formatDurationTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

const VideoCallUI = ({ onLeave, isOwner, onEndSession, recording }) => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();

    const {
        isRecording,
        recordingDuration,
        onToggleRecording,
    } = recording;

    if (callingState === CallingState.JOINING) {
        return <MeetingJoinLoader />;
    }

    return (
        <div className="md:h-[85vh] h-full flex flex-col gap-3 p-1 relative">
            {/* Recording Indicator */}
            {isRecording && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg animate-pulse">
                    <Circle className="w-2.5 h-2.5 fill-white" />
                    REC {formatDurationTimer(recordingDuration)}
                </div>
            )}

            {/* Main Video Area - SpeakerLayout automatically handles screen sharing */}
            <div className="flex-1 rounded-lg overflow-y-auto custom-scrollbar relative">
                <SpeakerLayout participantsBarPosition="bottom" />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <CallControls onLeave={onLeave} />

                {/* Record Toggle Button */}
                <button
                    onClick={onToggleRecording}
                    className={`flex items-center gap-2 p-2 px-3 rounded-3xl font-semibold transition-all text-sm ${
                        isRecording
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                            : "bg-gray-700 hover:bg-gray-600 text-white shadow-lg"
                    }`}
                    title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                    {isRecording ? (
                        <>
                            <MicOff className="w-4 h-4" />
                            Stop Rec
                        </>
                    ) : (
                        <>
                            <Mic className="w-4 h-4" />
                            Record
                        </>
                    )}
                </button>

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

const VideoMeetingRoom = ({ meeting, onLeave }) => {
    const { user } = useAuth();
    const { updateMeeting } = useWorkspaceStore();
    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const [joinError, setJoinError] = useState(null);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const hasJoinedRef = useRef(false);

    // Recording hook
    const {
        isRecording,
        recordingDuration,
        audioBlob,
        startRecording,
        stopRecording,
        resetRecording,
    } = useCallRecording();

    const displayName = useMemo(
        () => user?.displayName || user?.name || user?.email || "Guest",
        [user]
    );

    const isOwner = meeting?.scheduledBy === user?.uid;

    /**
     * Get a mixed audio stream of all participants (local + remote)
     */
    const getMixedAudioStream = useCallback(async () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioContext.createMediaStreamDestination();
        const sources = [];

        try {
            // 1. Add local participant stream
            const localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });
            const localSource = audioContext.createMediaStreamSource(localStream);
            localSource.connect(dest);
            sources.push(localStream);

            // 2. Add remote participants streams
            // We can get them from the call object
            if (call) {
                const participants = call.state.participants;
                participants.forEach(p => {
                    if (!p.isLocal && p.audioStream) {
                        const remoteSource = audioContext.createMediaStreamSource(p.audioStream);
                        remoteSource.connect(dest);
                    }
                });
            }

            return { stream: dest.stream, audioContext, sources };
        } catch (error) {
            console.error("Error mixing audio streams:", error);
            // Fallback to local mic only if mixing fails
            return null;
        }
    }, [call]);

    /**
     * Upload audio recording and trigger transcription + summarization
     */
    const processRecording = useCallback(async (blob) => {
        if (!blob || blob.size === 0 || !meeting?._id) return;

        const toastId = toast.loading("Processing recording... Transcribing & generating summary");

        try {
            // Pass user info so we know who recorded it
            const result = await aiApi.transcribeMeeting(
                blob, 
                meeting._id, 
                user?.uid, 
                user?.displayName || user?.name || "Participant"
            );

            if (result.success) {
                toast.success("Meeting summary generated successfully!", { id: toastId });
            } else {
                toast.error(result.message || "Failed to generate summary", { id: toastId });
            }
        } catch (error) {
            console.error("Error processing recording:", error);
            toast.error(
                error.response?.data?.message || "Failed to process recording. Please try again.",
                { id: toastId }
            );
        } finally {
            resetRecording();
        }
    }, [meeting?._id, resetRecording, user]);

    /**
     * Toggle recording on/off
     */
    const handleToggleRecording = useCallback(async () => {
        if (isRecording) {
            const blob = await stopRecording();
            if (blob) {
                // Attach recordedBy info to the blob context if needed, 
                // but we'll pass it to processRecording directly
                processRecording(blob);
            }
        } else {
            try {
                const mixed = await getMixedAudioStream();
                if (mixed) {
                    await startRecording(mixed.stream);
                } else {
                    // Fallback to default behavior in hook (mic only)
                    await startRecording();
                }
                toast.success("Recording started. All participant audio will be captured.");
            } catch (err) {
                toast.error(err.message || "Failed to start recording");
            }
        }
    }, [isRecording, startRecording, stopRecording, processRecording, getMixedAudioStream]);

    /**
     * Handle leaving the call - process recording if exists
     */
    const handleLeave = useCallback(async () => {
        // Stop recording if still active
        let recordingBlob = audioBlob;
        if (isRecording) {
            recordingBlob = await stopRecording();
        }

        // If we have a recording, process it in background
        if (recordingBlob && recordingBlob.size > 0) {
            // Process in background - don't block leaving
            processRecording(recordingBlob);
        }

        onLeave();
    }, [audioBlob, isRecording, stopRecording, processRecording, onLeave]);

    const handleConfirmEndSession = useCallback(async () => {
        try {
            setIsEnding(true);

            // Stop recording if active
            let recordingBlob = audioBlob;
            if (isRecording) {
                recordingBlob = await stopRecording();
            }

            await updateMeeting(meeting._id, { status: "completed" });
            toast.success("Meeting ended for everyone");

            if (call) {
                await call.endCall();
            }

            // Process recording if exists
            if (recordingBlob && recordingBlob.size > 0) {
                processRecording(recordingBlob);
            }
        } catch (error) {
            console.error("Error ending meeting", error);
            toast.error("Failed to end meeting");
        } finally {
            setIsEnding(false);
            setIsEndModalOpen(false);
            onLeave();
        }
    }, [call, meeting?._id, updateMeeting, onLeave, audioBlob, isRecording, stopRecording, processRecording]);

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
                        onLeave={handleLeave}
                        isOwner={isOwner}
                        onEndSession={() => setIsEndModalOpen(true)}
                        recording={{
                            isRecording,
                            recordingDuration,
                            onToggleRecording: handleToggleRecording,
                        }}
                    />

                    <ConfirmModal
                        isOpen={isEndModalOpen}
                        onClose={() => setIsEndModalOpen(false)}
                        onConfirm={handleConfirmEndSession}
                        title="End Session"
                        message={
                            isRecording
                                ? "Are you sure you want to end this session? The recording will be processed and a summary will be generated automatically."
                                : "Are you sure you want to end this session? This will disconnect all participants."
                        }
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
