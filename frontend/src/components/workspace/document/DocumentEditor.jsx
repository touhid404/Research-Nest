import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
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

const DocumentEditor = ({ document: doc, workspace, onBack }) => {
    const { user, socket } = useAuth();
    const { updateDocument, saveDocumentContent } = useWorkspaceStore();

    const [title, setTitle] = useState(doc?.title || "Untitled Document");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [activeEditors, setActiveEditors] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
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
        ],
        content: doc?.plainText || "",
        editorProps: {
            attributes: {
                class: "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-full",
            },
        },
        onUpdate: ({ editor }) => {
            handleContentChange(editor.getHTML());
        },
    });

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

    // Join document room
    useEffect(() => {
        if (!socket || !doc) return;

        socket.emit("document:join", {
            documentId: doc._id,
            userName: user?.displayName || user?.email,
        });

        return () => {
            socket.emit("document:leave", doc._id);
        };
    }, [socket, doc, user]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on("document:editor-joined", ({ userId, userName }) => {
            setActiveEditors((prev) => {
                if (prev.find((e) => e.userId === userId)) return prev;
                return [...prev, { userId, userName }];
            });
        });

        socket.on("document:editor-left", ({ userId }) => {
            setActiveEditors((prev) => prev.filter((e) => e.userId !== userId));
        });

        socket.on("document:updated", ({ content: newContent, updatedBy }) => {
            if (updatedBy !== user?.uid && editor) {
                const { from, to } = editor.state.selection;
                editor.commands.setContent(newContent, false);
                // Try to restore cursor position
                editor.commands.setTextSelection({ from, to });
            }
        });

        return () => {
            socket.off("document:editor-joined");
            socket.off("document:editor-left");
            socket.off("document:updated");
        };
    }, [socket, user, editor]);

    // Debounced auto-save
    const saveTimeoutRef = useCallback(() => {
        let timeout = null;
        return (content) => {
            if (timeout) clearTimeout(timeout);
            setIsSaving(true);
            timeout = setTimeout(async () => {
                try {
                    await saveDocumentContent(doc._id, null, content);
                    setLastSaved(new Date());
                } catch (error) {
                    console.error("Failed to save document:", error);
                } finally {
                    setIsSaving(false);
                }
            }, 1500);
        };
    }, [doc, saveDocumentContent]);

    const debouncedSave = useCallback(saveTimeoutRef(), [saveTimeoutRef]);

    const handleContentChange = useCallback(
        (newContent) => {
            socket?.emit("document:update", {
                documentId: doc._id,
                content: newContent,
            });
            debouncedSave(newContent);
        },
        [socket, doc, debouncedSave]
    );

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
            // Save title if changed
            if (title !== doc.title) {
                await updateDocument(workspace._id, doc._id, { title });
            }
            // Save content
            await saveDocumentContent(doc._id, null, editor.getHTML());
            setLastSaved(new Date());
        } catch (error) {
            console.error("Failed to save document:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Get cursor color for active editors
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
        const index = userId?.split("")?.reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
        return colors[index % colors.length];
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
                </div>

                <div className="flex items-center gap-4">
                    {/* Active editors */}
                    <div className="flex items-center gap-2">
                        <IoPeopleOutline className="w-5 h-5 text-slate-400" />
                        <div className="flex -space-x-2">
                            <div
                                className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-slate-900"
                                title="You"
                            >
                                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?"}
                            </div>
                            {activeEditors.slice(0, 3).map((editor) => (
                                <div
                                    key={editor.userId}
                                    className={`w-8 h-8 rounded-full ${getCursorColor(editor.userId)} flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-slate-900`}
                                    title={editor.userName}
                                >
                                    {editor.userName?.charAt(0) || "?"}
                                </div>
                            ))}
                            {activeEditors.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-sm font-medium border-2 border-white dark:border-slate-900">
                                    +{activeEditors.length - 3}
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

