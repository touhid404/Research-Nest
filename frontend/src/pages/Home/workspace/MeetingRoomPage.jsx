import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import VideoMeetingRoom from "../../../components/workspace/VideoMeetingRoom";
import useWorkspaceStore from "../../../store/useWorkspaceStore";
import { AlertTriangle, Loader2 } from "lucide-react";

const MeetingRoomPage = () => {
    const { workspaceId, meetingId } = useParams();
    const navigate = useNavigate();
    const { workspace } = useOutletContext();
    const { meetings, fetchMeetings } = useWorkspaceStore();
    const [loading, setLoading] = useState(true);

    // Get meeting directly from store to keep it reactive to updates
    const meeting = meetings.find((m) => m._id === meetingId);

    useEffect(() => {
        const loadMeeting = async () => {
            if (!workspaceId) return;

            // Check if meeting exists in store
            let foundMeeting = meetings.find((m) => m._id === meetingId);

            if (!foundMeeting) {
                // Fetch meetings if not in store
                await fetchMeetings(workspaceId, { forceRefresh: true });
            }

            setLoading(false);
        };

        loadMeeting();
    }, [workspaceId, meetingId, meetings.length, fetchMeetings]);

    useEffect(() => {
        if (meeting?.status === "completed") {
            handleLeave();
        }
    }, [meeting?.status]);

    const handleLeave = () => {
        navigate(`/home/workspace/${workspaceId}/meetings`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex-1 w-full flex flex-col bg-slate-900 animate-pulse overflow-hidden">
                {/* Skeleton Header */}
                <div className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800" />
                        <div className="space-y-2">
                            <div className="w-24 h-3 bg-slate-800 rounded" />
                            <div className="w-16 h-2 bg-slate-800 rounded" />
                        </div>
                    </div>
                </div>
                {/* Skeleton Content */}
                <div className="flex-1 bg-slate-950 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium text-sm tracking-wide uppercase">Verifying Meeting...</p>
                    </div>
                </div>
                {/* Skeleton Footer */}
                <div className="h-20 bg-slate-950 border-t border-slate-900 flex items-center justify-center">
                    <div className="w-48 h-12 bg-slate-900 rounded-2xl" />
                </div>
            </div>
        );
    }
    // If meeting not found, redirect to meetings page
    if (!meeting) {
        navigate(`/home/workspace/${workspaceId}/meetings`);
    }

    return (
        <div className="flex-1 w-full flex flex-col min-h-0">
            <VideoMeetingRoom
                meeting={meeting}
                workspace={workspace}
                onLeave={handleLeave}
            />
        </div>
    );
};

export default MeetingRoomPage;
