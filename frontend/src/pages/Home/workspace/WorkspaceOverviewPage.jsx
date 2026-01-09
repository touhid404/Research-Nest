import { useOutletContext } from "react-router";
import WorkspaceOverview from "../../../components/workspace/WorkspaceOverview";

const WorkspaceOverviewPage = () => {
    const { workspace } = useOutletContext();
    
    if (!workspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="loading loading-spinner loading-lg text-violet-500"></div>
            </div>
        );
    }

    return <WorkspaceOverview workspace={workspace} />;
};

export default WorkspaceOverviewPage;
