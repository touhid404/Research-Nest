import { useState, useEffect } from "react";
import {
    IoDocumentTextOutline,
    IoAddOutline,
    IoSearchOutline,
    IoGridOutline,
    IoListOutline,
    IoTimeOutline,
    IoTrashOutline,
    IoCreateOutline,
    IoPeopleOutline,
} from "react-icons/io5";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";
import DocumentEditor from "./DocumentEditor";
import CreateDocumentModal from "./CreateDocumentModal";
import ConfirmModal from "../../common/ConfirmModal";

const DocumentList = ({ workspace }) => {
    const { documents, fetchDocuments, deleteDocument, loadingDocuments } = useWorkspaceStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    useEffect(() => {
        if (workspace?._id) {
            fetchDocuments(workspace._id, true); // Force refresh when documents tab opens
        }
    }, [workspace?._id, fetchDocuments]);

    const filteredDocuments = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteDocument = async () => {
        if (!documentToDelete) return;
        try {
            await deleteDocument(workspace._id, documentToDelete._id);
            setDocumentToDelete(null);
        } catch (error) {
            console.error("Failed to delete document:", error);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // If a document is selected, show the editor
    if (selectedDocument) {
        return (
            <DocumentEditor
                document={selectedDocument}
                workspace={workspace}
                onBack={() => setSelectedDocument(null)}
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Documents</h2>
                    <p className="text-base-content/60">
                        {documents.length} document{documents.length !== 1 ? "s" : ""} in this workspace
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary gap-2"
                >
                    <IoAddOutline className="w-5 h-5" />
                    New Document
                </button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input input-bordered w-full pl-10"
                    />
                </div>

                <div className="flex items-center gap-2 bg-base-200 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                                ? "bg-base-100 shadow-sm"
                                : "hover:bg-base-300"
                            }`}
                    >
                        <IoGridOutline className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                                ? "bg-base-100 shadow-sm"
                                : "hover:bg-base-300"
                            }`}
                    >
                        <IoListOutline className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loadingDocuments ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <IoDocumentTextOutline className="w-16 h-16 text-base-content/20 mb-4" />
                    {searchQuery ? (
                        <>
                            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                            <p className="text-base-content/60">
                                No documents match your search "{searchQuery}"
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                            <p className="text-base-content/60 mb-4">
                                Create your first document to get started
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn btn-primary gap-2"
                            >
                                <IoAddOutline className="w-5 h-5" />
                                Create Document
                            </button>
                        </>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDocuments.map((doc) => (
                        <div
                            key={doc._id}
                            onClick={() => setSelectedDocument(doc)}
                            className="group bg-base-200 rounded-xl p-4 cursor-pointer hover:bg-base-300 transition-colors border border-transparent hover:border-violet-500"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                    <IoDocumentTextOutline className="w-6 h-6 text-violet-600" />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDocument(doc);
                                        }}
                                        className="p-2 rounded-lg hover:bg-base-100"
                                        title="Edit"
                                    >
                                        <IoCreateOutline className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDocumentToDelete(doc);
                                        }}
                                        className="p-2 rounded-lg hover:bg-base-100 text-red-500"
                                        title="Delete"
                                    >
                                        <IoTrashOutline className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-semibold mb-2 line-clamp-1">{doc.title}</h3>
                            <p className="text-sm text-base-content/60 line-clamp-2 mb-3">
                                {doc.plainText?.slice(0, 100) || "No content yet"}
                            </p>

                            <div className="flex items-center justify-between text-xs text-base-content/50">
                                <div className="flex items-center gap-1">
                                    <IoTimeOutline className="w-3 h-3" />
                                    {formatDate(doc.updatedAt)}
                                </div>
                                {doc.activeEditors?.length > 0 && (
                                    <div className="flex items-center gap-1 text-green-500">
                                        <IoPeopleOutline className="w-3 h-3" />
                                        {doc.activeEditors.length} editing
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="space-y-2">
                    {filteredDocuments.map((doc) => (
                        <div
                            key={doc._id}
                            onClick={() => setSelectedDocument(doc)}
                            className="group flex items-center gap-4 p-4 bg-base-200 rounded-xl cursor-pointer hover:bg-base-300 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                <IoDocumentTextOutline className="w-5 h-5 text-violet-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{doc.title}</h3>
                                <p className="text-sm text-base-content/60 truncate">
                                    {doc.plainText?.slice(0, 100) || "No content yet"}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-base-content/50 shrink-0">
                                {doc.activeEditors?.length > 0 && (
                                    <div className="flex items-center gap-1 text-green-500">
                                        <IoPeopleOutline className="w-4 h-4" />
                                        {doc.activeEditors.length}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <IoTimeOutline className="w-4 h-4" />
                                    {formatDate(doc.updatedAt)}
                                </div>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDocument(doc);
                                    }}
                                    className="p-2 rounded-lg hover:bg-base-100"
                                    title="Edit"
                                >
                                    <IoCreateOutline className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDocumentToDelete(doc);
                                    }}
                                    className="p-2 rounded-lg hover:bg-base-100 text-red-500"
                                    title="Delete"
                                >
                                    <IoTrashOutline className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateDocumentModal
                    workspace={workspace}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {documentToDelete && (
                <ConfirmModal
                    isOpen={!!documentToDelete}
                    title="Delete Document"
                    message={`Are you sure you want to delete "${documentToDelete.title}"? This action cannot be undone.`}
                    confirmText="Delete"
                    isDanger={true}
                    onConfirm={handleDeleteDocument}
                    onClose={() => setDocumentToDelete(null)}
                />
            )}
        </div>
    );
};

export default DocumentList;
