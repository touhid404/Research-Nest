import { useOutletContext } from "react-router";
import TaskCalendar from "../../../components/workspace/TaskCalendar";

const WorkspaceCalendarPage = () => {
    const { workspace } = useOutletContext();
    
    if (!workspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="loading loading-spinner loading-lg text-violet-500"></div>
            </div>
        );
    }

    return <TaskCalendar workspace={workspace} />;
};

export default WorkspaceCalendarPage;
