import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import VideoMeetingRoom from "../../../components/workspace/meeting/VideoMeetingRoom";
import useWorkspaceStore from "../../../store/useWorkspaceStore";
import { AlertTriangle } from "lucide-react";
import MeetingJoinLoader from "../../../components/loader/MeetingJoinLoader";

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
        return <MeetingJoinLoader />;
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
