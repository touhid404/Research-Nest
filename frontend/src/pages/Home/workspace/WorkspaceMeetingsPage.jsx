import { useOutletContext } from "react-router";
import MeetingScheduler from "../../../components/workspace/MeetingScheduler";

const WorkspaceMeetingsPage = () => {
    const { workspace } = useOutletContext();
    
    if (!workspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="loading loading-spinner loading-lg text-violet-500"></div>
            </div>
        );
    }

    return <MeetingScheduler workspace={workspace} />;
};

export default WorkspaceMeetingsPage;
