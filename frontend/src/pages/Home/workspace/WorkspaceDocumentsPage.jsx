import { useOutletContext } from "react-router";
import DocumentList from "../../../components/workspace/document/DocumentList";

const WorkspaceDocumentsPage = () => {
    const { workspace } = useOutletContext();

    if (!workspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="loading loading-spinner loading-lg text-violet-500"></div>
            </div>
        );
    }

    return <DocumentList workspace={workspace} />;
};

export default WorkspaceDocumentsPage;
