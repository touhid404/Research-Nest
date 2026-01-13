import { useOutletContext } from "react-router";
import WorkspaceOverview from "../../../components/workspace/WorkspaceOverview";
import WorkspaceLoader from "../../../components/loader/WorkspaceLoader";

const WorkspaceOverviewPage = () => {
    const { workspace } = useOutletContext();
    
    if (!workspace) {
        return (
            <WorkspaceLoader />
        );
    }

    return <WorkspaceOverview workspace={workspace} />;
};

export default WorkspaceOverviewPage;
