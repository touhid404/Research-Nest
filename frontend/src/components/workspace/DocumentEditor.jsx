import { useState, useEffect, useRef, useCallback } from "react";
import {
    IoDocumentTextOutline,
    IoSaveOutline,
    IoArrowBackOutline,
    IoPeopleOutline,
    IoTimeOutline,
    IoCloudDoneOutline,
    IoCloudUploadOutline,
} from "react-icons/io5";
import useAuth from "../../hooks/useAuth";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

const DocumentEditor = ({ document, workspace, onBack }) => {
    const { user, socket } = useAuth();
    const { updateDocument } = useWorkspaceStore();
    
    const [content, setContent] = useState(document?.plainText || "");
    const [title, setTitle] = useState(document?.title || "Untitled Document");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [activeEditors, setActiveEditors] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [cursors, setCursors] = useState({});
    
    const textareaRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    // Join document room
    useEffect(() => {
        if (!socket || !document) return;

        socket.emit("document:join", {
            documentId: document._id,
            userName: user?.displayName || user?.email,
        });

        return () => {
            socket.emit("document:leave", document._id);
        };
    }, [socket, document, user]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        // Handle editor joined
        socket.on("document:editor-joined", ({ userId, userName }) => {
            setActiveEditors((prev) => {
                if (prev.find((e) => e.oderId === userId)) return prev;
                return [...prev, { oderId: userId, userName }];
            });
        });

        // Handle editor left
        socket.on("document:editor-left", ({ userId }) => {
            setActiveEditors((prev) => prev.filter((e) => e.oderId !== userId));
            setCursors((prev) => {
                const newCursors = { ...prev };
                delete newCursors[userId];
                return newCursors;
            });
        });

        // Handle content update from other editors
        socket.on("document:updated", ({ content: newContent, updatedBy }) => {
            if (updatedBy !== user?.uid) {
                setContent(newContent);
            }
        });

        // Handle cursor updates
        socket.on("document:cursor-update", ({ userId, userName, position }) => {
            if (userId !== user?.uid) {
                setCursors((prev) => ({
                    ...prev,
                    [userId]: { userName, position },
                }));
            }
        });

        return () => {
            socket.off("document:editor-joined");
            socket.off("document:editor-left");
            socket.off("document:updated");
            socket.off("document:cursor-update");
        };
    }, [socket, user]);

    // Auto-save with debounce
    const handleContentChange = useCallback(
        (newContent) => {
            setContent(newContent);

            // Broadcast to other editors
            socket?.emit("document:update", {
                documentId: document._id,
                content: newContent,
            });

            // Debounced save
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            setIsSaving(true);
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    await updateDocument(workspace._id, document._id, {
                        plainText: newContent,
                    });
                    setLastSaved(new Date());
                } catch (error) {
                    console.error("Failed to save document:", error);
                } finally {
                    setIsSaving(false);
                }
            }, 1000);
        },
        [socket, document, workspace, updateDocument]
    );

    // Handle cursor position change
    const handleCursorChange = useCallback(() => {
        if (!textareaRef.current) return;

        const position = textareaRef.current.selectionStart;
        socket?.emit("document:cursor", {
            documentId: document._id,
            position,
        });
    }, [socket, document]);

    // Save title
    const handleTitleSave = async () => {
        setIsEditingTitle(false);
        if (title !== document.title) {
            try {
                await updateDocument(workspace._id, document._id, { title });
            } catch (error) {
                console.error("Failed to update title:", error);
            }
        }
    };

    // Manual save
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDocument(workspace._id, document._id, {
                title,
                plainText: content,
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Failed to save document:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Generate random color for cursor
    const getCursorColor = (userId) => {
        const colors = [
            "bg-red-500",
            "bg-blue-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-orange-500",
            "bg-teal-500",
        ];
        const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    return (
        <div className="h-full flex flex-col bg-base-100">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-base-200 transition-colors"
                    >
                        <IoArrowBackOutline className="w-5 h-5" />
                    </button>

                    <IoDocumentTextOutline className="w-6 h-6 text-violet-600" />

                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                            className="text-lg font-semibold bg-transparent border-b-2 border-violet-500 focus:outline-none px-1"
                            autoFocus
                        />
                    ) : (
                        <h2
                            onClick={() => setIsEditingTitle(true)}
                            className="text-lg font-semibold cursor-pointer hover:text-violet-600 transition-colors"
                        >
                            {title}
                        </h2>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Active editors */}
                    <div className="flex items-center gap-2">
                        <IoPeopleOutline className="w-5 h-5 text-base-content/60" />
                        <div className="flex -space-x-2">
                            {/* Self */}
                            <div
                                className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-medium border-2 border-base-100"
                                title="You"
                            >
                                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?"}
                            </div>
                            {/* Other editors */}
                            {activeEditors.slice(0, 3).map((editor, index) => (
                                <div
                                    key={editor.userId}
                                    className={`w-8 h-8 rounded-full ${getCursorColor(editor.userId)} flex items-center justify-center text-white text-sm font-medium border-2 border-base-100`}
                                    title={editor.userName}
                                >
                                    {editor.userName?.charAt(0) || "?"}
                                </div>
                            ))}
                            {activeEditors.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-sm font-medium border-2 border-base-100">
                                    +{activeEditors.length - 3}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save status */}
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                        {isSaving ? (
                            <>
                                <IoCloudUploadOutline className="w-4 h-4 animate-pulse" />
                                <span>Saving...</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <IoCloudDoneOutline className="w-4 h-4 text-green-500" />
                                <span>
                                    Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            </>
                        ) : null}
                    </div>

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn btn-sm btn-primary gap-2"
                    >
                        <IoSaveOutline className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 p-6">
                    <div className="h-full max-w-4xl mx-auto">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            onSelect={handleCursorChange}
                            onClick={handleCursorChange}
                            onKeyUp={handleCursorChange}
                            placeholder="Start writing..."
                            className="w-full h-full resize-none bg-base-100 focus:outline-none text-lg leading-relaxed"
                            style={{ fontFamily: "inherit" }}
                        />
                    </div>
                </div>

                {/* Remote cursors indicator */}
                {Object.entries(cursors).length > 0 && (
                    <div className="absolute top-4 right-4 space-y-2">
                        {Object.entries(cursors).map(([userId, { userName }]) => (
                            <div
                                key={userId}
                                className={`px-2 py-1 rounded text-white text-xs ${getCursorColor(userId)}`}
                            >
                                {userName} is editing
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-base-300 text-sm text-base-content/60">
                <div className="flex items-center gap-4">
                    <span>{content.length} characters</span>
                    <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <div className="flex items-center gap-2">
                    <IoTimeOutline className="w-4 h-4" />
                    <span>
                        Last updated:{" "}
                        {document?.updatedAt
                            ? new Date(document.updatedAt).toLocaleString()
                            : "Never"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;
