import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import VideoMeetingRoom from "../../../components/workspace/VideoMeetingRoom";
import useWorkspaceStore from "../../../store/useWorkspaceStore";

const MeetingRoomPage = () => {
    const { workspaceId, meetingId } = useParams();
    const navigate = useNavigate();
    const { workspace } = useOutletContext();
    const { meetings, fetchMeetings } = useWorkspaceStore();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMeeting = async () => {
            if (!workspaceId) return;

            // Check if meeting exists in store
            let foundMeeting = meetings.find((m) => m._id === meetingId);

            if (!foundMeeting) {
                // Fetch meetings if not in store
                await fetchMeetings(workspaceId, { forceRefresh: true });
            }

            // Get meeting from updated store
            const state = useWorkspaceStore.getState();
            foundMeeting = state.meetings.find((m) => m._id === meetingId);

            if (foundMeeting) {
                setMeeting(foundMeeting);
            }
            setLoading(false);
        };

        loadMeeting();
    }, [workspaceId, meetingId, meetings.length]);

    const handleLeave = () => {
        navigate(`/home/workspace/${workspaceId}/meetings`);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-violet-500 mb-4"></div>
                    <p className="text-white">Joining meeting...</p>
                </div>
            </div>
        );
    }

    if (!meeting) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Meeting not found</h2>
                    <p className="text-slate-400 mb-4">This meeting may have ended or been deleted.</p>
                    <button
                        onClick={handleLeave}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                    >
                        Back to Meetings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <VideoMeetingRoom
            meeting={meeting}
            workspace={workspace}
            onLeave={handleLeave}
        />
    );
};

export default MeetingRoomPage;
