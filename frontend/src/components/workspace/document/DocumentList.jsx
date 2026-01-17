import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
    IoDocumentTextOutline,
    IoCloseOutline,
    IoMenuOutline,
    IoSearchOutline,
    IoCloudUploadOutline,
    IoFolderOutline,
} from "react-icons/io5";

import { useWorkspaceStore } from "../../../store/useWorkspaceStore";
import DocumentEditor from "./DocumentEditor";
import CreateDocumentModal from "./CreateDocumentModal";
import CreateFolderModal from "./CreateFolderModal";
import ConfirmModal from "../../common/ConfirmModal";
import FileTree from "./FileTree";
import DocumentInfoModal from "./DocumentInfoModal";
import DocumentToolbar from "./DocumentToolbar";
import DocumentCard from "./DocumentCard";
import DocumentListItem from "./DocumentListItem";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";

const DocumentList = ({ workspace }) => {
    const {
        documents,
        fetchDocuments,
        deleteDocument,
        loadingDocuments,
        uploadDocument,
        updateDocument
    } = useWorkspaceStore();

    const { user } = useAuth();

    const { workspaceId, folderId, docId } = useParams();
    const navigate = useNavigate();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    // selectedDocument and currentFolderId are now partially derived from URL
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [documentToShowInfo, setDocumentToShowInfo] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    // currentFolderId moved to derived or URL param
    const [dragTargetFolderId, setDragTargetFolderId] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);

    const currentFolderId = folderId || null;

    // Derived: Find the selected document from the documents array
    const selectedDocument = useMemo(() => {
        if (!docId) return null;
        return documents.find(d => d._id === docId) || null;
    }, [docId, documents]);

    const fileInputRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        if (workspace?._id) {
            fetchDocuments(workspace._id, true);
        }
    }, [workspace?._id, fetchDocuments]);

    // Filters
    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = searchQuery ? true : doc.parentId === (currentFolderId || null);
        return matchesSearch && matchesFolder;
    }).sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return 0;
    });

    // Handlers
    const handleFileInputChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        handleUpload(files[0]);
    };

    const handleUpload = async (file) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("workspaceId", workspace._id);
            if (currentFolderId) formData.append("parentId", currentFolderId);
            formData.append("file", file);

            await uploadDocument(formData);
            toast.success("File uploaded successfully");
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) handleUpload(files[0]);
    };

    const handleMoveDocument = async (docId, targetFolderId) => {
        if (docId === targetFolderId) return;
        try {
            await updateDocument(workspace._id, docId, { parentId: targetFolderId });
            toast.success("Moved successfully");
        } catch (error) {
            console.error("Move failed:", error);
            toast.error("Failed to move item");
        }
    };

    const handleItemDragStart = (e, doc) => {
        e.dataTransfer.setData("text/plain", doc._id);
    };

    const handleItemDrop = async (e, targetFolder) => {
        e.preventDefault();
        e.stopPropagation();
        setDragTargetFolderId(null);
        const draggedDocId = e.dataTransfer.getData("text/plain");
        if (draggedDocId) await handleMoveDocument(draggedDocId, targetFolder._id);
    };

    const handleDocumentClick = (doc) => {
        if (doc.type === "folder") {
            navigate(`/home/workspace/${workspaceId}/documents/${doc._id}`);
        } else if (doc.type === "file" && doc.fileUrl) {
            const url = doc.fileUrl.startsWith("http") ? doc.fileUrl : `${import.meta.env.VITE_API_URL}${doc.fileUrl}`;
            window.open(url, "_blank");
        } else {
            navigate(`/home/workspace/${workspaceId}/documents/edit/${doc._id}`);
        }
    };

    const confirmDelete = async () => {
        if (!documentToDelete) return;
        try {
            await deleteDocument(workspace._id, documentToDelete._id);
            setDocumentToDelete(null);
            toast.success("Item deleted successfully");
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete item");
        }
    };

    // Main render condition
    if (docId) {
        if (!selectedDocument) {
            return (
                <div className="h-full flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            );
        }
        return (
            <DocumentEditor
                document={selectedDocument}
                workspace={workspace}
                onBack={() => navigate(-1)}
            />
        );
    }

    return (
        <div className="h-full flex flex-col sm:flex-row relative bg-white dark:bg-slate-900">
            {/* Sidebar Overlay */}
            {showSidebar && (
                <div className="fixed inset-0 bg-black/60 z-[100] sm:hidden backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
            )}

            {/* Sidebar */}
            <div className={`
                fixed sm:relative inset-y-0 left-0 z-[110] w-52 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300
                ${showSidebar ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
                sm:flex ${!showSidebar && "sm:hidden"} flex flex-col
            `}>
                <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-800 sm:hidden">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Explorer</span>
                    <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><IoCloseOutline className="w-6 h-6" /></button>
                </div>
                <FileTree
                    documents={documents}
                    activeFolderId={currentFolderId}
                    onSelectFolder={(id) => {
                        navigate(`/home/workspace/${workspaceId}/documents/${id || ""}`);
                        if (window.innerWidth < 640) setShowSidebar(false);
                    }}
                />
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative" onDragOver={handleDragOver} onDragLeave={(e) => { e.preventDefault(); if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) { setIsDragging(false); } }} onDrop={handleDrop}>
                {isDragging && !dragTargetFolderId && (
                    <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-primary border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                            <IoCloudUploadOutline className="w-12 h-12 text-primary mb-2" />
                            <p className="font-bold text-lg text-slate-700 dark:text-slate-200">Drop files to upload</p>
                        </div>
                    </div>
                )}

                <DocumentToolbar
                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                    viewMode={viewMode} setViewMode={setViewMode}
                    setShowSidebar={setShowSidebar}
                    onUploadClick={() => fileInputRef.current?.click()}
                    onNewFolderClick={() => setShowCreateFolderModal(true)}
                    onNewDocClick={() => setShowCreateModal(true)}
                    fileInputRef={fileInputRef} handleFileInputChange={handleFileInputChange}
                    documents={documents}
                    currentFolderId={currentFolderId}
                    onNavigate={(id) => navigate(`/home/workspace/${workspaceId}/documents/${id || ""}`)}
                />

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50 dark:bg-slate-950">

                    {loadingDocuments ? (
                        <div className="flex items-center justify-center h-full pb-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-20 opacity-60">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><IoDocumentTextOutline className="w-10 h-10 text-slate-300" /></div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Empty Folder</h3>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Folders Section */}
                            {filteredDocuments.some(d => d.type === 'folder') && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Folders</h3>
                                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                                        {filteredDocuments.filter(d => d.type === 'folder').map(doc => (
                                            viewMode === 'grid' ? (
                                                <DocumentCard
                                                    key={doc._id} doc={doc} user={user} documents={documents} currentFolderId={currentFolderId}
                                                    onNavigate={handleDocumentClick} onDelete={setDocumentToDelete} onShowInfo={setDocumentToShowInfo}
                                                    dragTargetFolderId={dragTargetFolderId} setDragTargetFolderId={setDragTargetFolderId}
                                                    handleItemDragStart={handleItemDragStart} handleItemDrop={handleItemDrop}
                                                />
                                            ) : (
                                                <DocumentListItem
                                                    key={doc._id} doc={doc} user={user} documents={documents}
                                                    onNavigate={handleDocumentClick} onDelete={setDocumentToDelete} onShowInfo={setDocumentToShowInfo}
                                                    dragTargetFolderId={dragTargetFolderId} setDragTargetFolderId={setDragTargetFolderId}
                                                    handleItemDragStart={handleItemDragStart} handleItemDrop={handleItemDrop}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Files Section */}
                            {filteredDocuments.some(d => d.type !== 'folder') && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Files</h3>
                                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                                        {filteredDocuments.filter(d => d.type !== 'folder').map(doc => (
                                            viewMode === 'grid' ? (
                                                <DocumentCard
                                                    key={doc._id} doc={doc} user={user} documents={documents}
                                                    onNavigate={handleDocumentClick} onDelete={setDocumentToDelete} onShowInfo={setDocumentToShowInfo}
                                                    onDownload={handleDocumentClick} onEdit={(d) => navigate(`/home/workspace/${workspaceId}/documents/edit/${d._id}`)}
                                                    handleItemDragStart={handleItemDragStart}
                                                />
                                            ) : (
                                                <DocumentListItem
                                                    key={doc._id} doc={doc} user={user} documents={documents}
                                                    onNavigate={handleDocumentClick} onDelete={setDocumentToDelete} onShowInfo={setDocumentToShowInfo}
                                                    handleItemDragStart={handleItemDragStart}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modals */}
                {showCreateModal && <CreateDocumentModal onClose={() => setShowCreateModal(false)} workspace={workspace} parentId={currentFolderId} />}
                {showCreateFolderModal && <CreateFolderModal onClose={() => setShowCreateFolderModal(false)} workspace={workspace} parentId={currentFolderId} />}
                <ConfirmModal isOpen={!!documentToDelete} onClose={() => setDocumentToDelete(null)} onConfirm={confirmDelete} title="Delete Item" message={`Are you sure you want to delete "${documentToDelete?.title}"?`} confirmText="Delete" type="danger" />
                <DocumentInfoModal document={documentToShowInfo} onClose={() => setDocumentToShowInfo(null)} />
                {isUploading && (
                    <div className="absolute inset-4 z-50 flex items-end justify-center pointer-events-none">
                        <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
                            <span className="loading loading-spinner loading-xs"></span>
                            <span className="text-sm font-medium">Uploading...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentList;
