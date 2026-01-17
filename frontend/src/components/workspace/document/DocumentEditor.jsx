import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from "y-protocols/awareness";
import {
    IoDocumentTextOutline,
    IoSaveOutline,
    IoArrowBackOutline,
    IoPeopleOutline,
    IoTimeOutline,
    IoCloudDoneOutline,
    IoCloudUploadOutline,
} from "react-icons/io5";
import {
    LuBold,
    LuItalic,
    LuUnderline,
    LuStrikethrough,
    LuHeading1,
    LuHeading2,
    LuHeading3,
    LuList,
    LuListOrdered,
    LuCode,
    LuQuote,
    LuLink,
    LuUnlink,
    LuAlignLeft,
    LuAlignCenter,
    LuAlignRight,
    LuHighlighter,
    LuUndo,
    LuRedo,
} from "react-icons/lu";
import useAuth from "../../../hooks/useAuth";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";

// Toolbar button component
const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1.5 rounded-lg transition-colors ${isActive
            ? "bg-primary text-primary-content"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

// Toolbar divider
const ToolbarDivider = () => (
    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
);

// Cursor colors for collaborators
const CURSOR_COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"
];

const getUserColor = (userId) => {
    if (!userId) return CURSOR_COLORS[0];
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CURSOR_COLORS[hash % CURSOR_COLORS.length];
};

const DocumentEditor = ({ document: doc, workspace, onBack }) => {
    const { user, socket } = useAuth();
    const { updateDocument, saveDocumentContent } = useWorkspaceStore();

    const [title, setTitle] = useState(doc?.title || "Untitled Document");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isSynced, setIsSynced] = useState(false);

    const saveTimeoutRef = useRef(null);

    // Create Yjs document and awareness
    const ydoc = useMemo(() => new Y.Doc(), []);
    const awareness = useMemo(() => new Awareness(ydoc), [ydoc]);

    // Initialize TipTap editor with Yjs collaboration
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                history: false, // Disable default history, Yjs handles it
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline cursor-pointer hover:text-primary/80",
                },
            }),
            Placeholder.configure({
                placeholder: "Start writing your document...",
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Highlight.configure({
                multicolor: false,
            }),
            Collaboration.configure({
                document: ydoc,
                field: "content", // Use 'content' field in Yjs
            }),
            CollaborationCursor.configure({
                provider: { awareness }, // Pass awareness for cursor rendering
                user: {
                    name: user?.displayName || user?.email || "Anonymous",
                    color: getUserColor(user?.uid),
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-full",
            },
        },
    });

    // Socket event handlers for Yjs synchronization
    useEffect(() => {
        if (!socket || !doc?._id || !ydoc) return;

        const documentId = doc._id;

        // Join document room
        socket.emit("document:join", {
            documentId,
            userName: user?.displayName || user?.email || "Anonymous",
        });

        // Handle initial sync state from server
        const handleSync = ({ state }) => {
            if (state && state.length > 0) {
                try {
                    const uint8State = new Uint8Array(state);
                    Y.applyUpdate(ydoc, uint8State, "remote");
                    setIsSynced(true);
                } catch (error) {
                    console.error("Error applying sync state:", error);
                }
            } else {
                // No existing state, initialize with plainText if available
                if (doc.plainText && editor) {
                    editor.commands.setContent(doc.plainText);
                }
                setIsSynced(true);
            }
        };

        // Handle Yjs updates from other clients
        const handleYjsUpdate = ({ update, senderId }) => {
            if (senderId === user?.uid) return; // Ignore own updates
            if (update) {
                try {
                    const uint8Update = new Uint8Array(update);
                    Y.applyUpdate(ydoc, uint8Update, "remote");
                } catch (error) {
                    console.error("Error applying Yjs update:", error);
                }
            }
        };

        // Local awareness state
        awareness.setLocalStateField("user", {
            name: user?.displayName || user?.email || "Anonymous",
            color: getUserColor(user?.uid),
        });

        // Handle awareness updates from other clients
        const onAwarenessUpdate = ({ update }) => {
            if (update) {
                try {
                    applyAwarenessUpdate(awareness, new Uint8Array(update), "remote");
                } catch (error) {
                    // console.error("Error applying awareness update:", error);
                }
            }
        };

        // Broadcast local awareness updates
        const onLocalAwarenessUpdate = ({ added, updated, removed }, origin) => {
            if (origin === "remote") return;
            const changedClients = added.concat(updated).concat(removed);
            const awarenessUpdate = encodeAwarenessUpdate(awareness, changedClients);
            socket.emit("document:awareness-update", {
                documentId,
                update: Array.from(awarenessUpdate),
            });
        };

        // Handle collaborators list
        const handleCollaborators = ({ collaborators: collabs }) => {
            setCollaborators(collabs.filter(c => c.uid !== user?.uid));
        };

        // Listen for Yjs document updates and broadcast
        const onDocUpdate = (update, origin) => {
            if (origin === "remote") return;
            socket.emit("document:yjs-update", {
                documentId,
                update: Array.from(update),
            });

            // Auto-save with debounce
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            setIsSaving(true);
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    const state = Y.encodeStateAsUpdate(ydoc);
                    const plainText = editor?.getHTML() || "";
                    await saveDocumentContent(doc._id, Array.from(state), plainText);
                    setLastSaved(new Date());
                } catch (error) {
                    console.error("Error saving document:", error);
                } finally {
                    setIsSaving(false);
                }
            }, 2000);
        };

        // Set up listeners
        socket.on("document:yjs-sync", handleSync);
        socket.on("document:yjs-update", handleYjsUpdate);
        socket.on("document:awareness-update", onAwarenessUpdate);
        socket.on("document:collaborators", handleCollaborators);
        ydoc.on("update", onDocUpdate);
        awareness.on("update", onLocalAwarenessUpdate);

        // Cleanup
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            socket.emit("document:leave", documentId);
            socket.off("document:yjs-sync", handleSync);
            socket.off("document:yjs-update", handleYjsUpdate);
            socket.off("document:awareness-update", onAwarenessUpdate);
            socket.off("document:collaborators", handleCollaborators);
            ydoc.off("update", onDocUpdate);
            awareness.off("update", onLocalAwarenessUpdate);
        };
    }, [socket, doc?._id, ydoc, user, editor, saveDocumentContent]);

    // Handle link insertion
    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL:", previousUrl);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    // Save title
    const handleTitleSave = async () => {
        setIsEditingTitle(false);
        if (title !== doc.title) {
            try {
                await updateDocument(workspace._id, doc._id, { title });
            } catch (error) {
                console.error("Failed to update title:", error);
            }
        }
    };

    // Manual save
    const handleSave = async () => {
        if (!editor) return;
        setIsSaving(true);
        try {
            if (title !== doc.title) {
                await updateDocument(workspace._id, doc._id, { title });
            }
            const state = Y.encodeStateAsUpdate(ydoc);
            await saveDocumentContent(doc._id, Array.from(state), editor.getHTML());
            setLastSaved(new Date());
        } catch (error) {
            console.error("Failed to save document:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!editor) {
        return (
            <div className="h-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <IoArrowBackOutline className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>

                    <IoDocumentTextOutline className="w-6 h-6 text-violet-600" />

                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                            className="text-lg font-semibold bg-transparent border-b-2 border-violet-500 focus:outline-none px-1 text-slate-800 dark:text-slate-100"
                            autoFocus
                        />
                    ) : (
                        <h2
                            onClick={() => setIsEditingTitle(true)}
                            className="text-lg font-semibold cursor-pointer hover:text-violet-600 transition-colors text-slate-800 dark:text-slate-100"
                        >
                            {title}
                        </h2>
                    )}

                    {/* Sync indicator */}
                    {!isSynced && (
                        <span className="text-xs text-amber-500 animate-pulse">Syncing...</span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Active collaborators */}
                    <div className="flex items-center gap-2">
                        <IoPeopleOutline className="w-5 h-5 text-slate-400" />
                        <div className="flex -space-x-2">
                            <div
                                className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-slate-900"
                                title="You"
                            >
                                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?"}
                            </div>
                            {collaborators.slice(0, 3).map((collab, index) => (
                                <div
                                    key={collab.uid || index}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-slate-900"
                                    style={{ backgroundColor: collab.color || getUserColor(collab.uid) }}
                                    title={collab.name}
                                >
                                    {collab.name?.charAt(0) || "?"}
                                </div>
                            ))}
                            {collaborators.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-sm font-medium border-2 border-white dark:border-slate-900">
                                    +{collaborators.length - 3}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save status */}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        {isSaving ? (
                            <>
                                <IoCloudUploadOutline className="w-4 h-4 animate-pulse" />
                                <span>Saving...</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <IoCloudDoneOutline className="w-4 h-4 text-green-500" />
                                <span className="hidden sm:inline">
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
                        <span className="hidden sm:inline">Save</span>
                    </button>
                </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-0.5 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-wrap">
                {/* Undo/Redo */}
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                    <LuUndo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                    <LuRedo className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Text formatting */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold (Ctrl+B)">
                    <LuBold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic (Ctrl+I)">
                    <LuItalic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline (Ctrl+U)">
                    <LuUnderline className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough">
                    <LuStrikethrough className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive("highlight")} title="Highlight">
                    <LuHighlighter className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Headings */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
                    <LuHeading1 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
                    <LuHeading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
                    <LuHeading3 className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
                    <LuList className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List">
                    <LuListOrdered className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Align Left">
                    <LuAlignLeft className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Align Center">
                    <LuAlignCenter className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Align Right">
                    <LuAlignRight className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Code & Quote */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Inline Code">
                    <LuCode className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
                    <LuQuote className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Link */}
                <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Add Link">
                    <LuLink className="w-4 h-4" />
                </ToolbarButton>
                {editor.isActive("link") && (
                    <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
                        <LuUnlink className="w-4 h-4" />
                    </ToolbarButton>
                )}
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-8">
                    <EditorContent editor={editor} className="min-h-[500px]" />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-4">
                    <span>{editor.storage.characterCount?.characters?.() ?? editor.getText().length} characters</span>
                    <span>{editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length} words</span>
                    {collaborators.length > 0 && (
                        <span className="text-green-500">• {collaborators.length + 1} editing</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <IoTimeOutline className="w-4 h-4" />
                    <span>
                        Last updated:{" "}
                        {doc?.updatedAt
                            ? new Date(doc.updatedAt).toLocaleString()
                            : "Never"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;
