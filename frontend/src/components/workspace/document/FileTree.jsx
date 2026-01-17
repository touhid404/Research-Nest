import React, { useState, useEffect } from "react";
import {
    IoChevronForward,
    IoChevronDown,
    IoFolderOutline,
    IoFolderOpenOutline,
    IoDocumentOutline,
    IoImageOutline,
    IoDocumentTextOutline,
    IoReaderOutline
} from "react-icons/io5";

const FileTreeNode = ({ node, level = 0, activeFolderId, onToggle, onSelect, expandedFolders }) => {
    const isFolder = node.type === "folder";
    const isExpanded = expandedFolders.has(node._id);
    const isActive = activeFolderId === node._id;
    const paddingLeft = level * 12 + 12;

    const handleClick = (e) => {
        e.stopPropagation();
        if (isFolder) {
            onToggle(node._id);
            onSelect(node._id);
        }
    };

    const getIcon = () => {
        if (isFolder) {
            return isExpanded || isActive
                ? <IoFolderOpenOutline className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'}`} />
                : <IoFolderOutline className="w-4 h-4 text-amber-500" />;
        }
        if (node.mimeType?.startsWith("image/")) return <IoImageOutline className="w-4 h-4 text-sky-500" />;
        if (node.mimeType === "application/pdf") return <IoDocumentTextOutline className="w-4 h-4 text-rose-500" />;
        if (node.type === 'notes') return <IoReaderOutline className="w-4 h-4 text-violet-500" />;
        return <IoDocumentOutline className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    };

    return (
        <div>
            <div
                onClick={handleClick}
                className={`flex items-center gap-1.5 py-2 pr-2 cursor-pointer select-none transition-colors border-l-2
                    ${isActive
                        ? "bg-violet-100 dark:bg-violet-900/30 border-violet-500 text-violet-700 dark:text-violet-300 font-medium"
                        : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }
                `}
                style={{ paddingLeft: `${paddingLeft}px` }}
            >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {isFolder && (
                        <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                            <IoChevronForward className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        </div>
                    )}
                </div>

                {getIcon()}

                <span className="truncate text-sm leading-none pt-0.5">{node.title}</span>
            </div>

            {isFolder && isExpanded && node.children && (
                <div className="border-l border-slate-200 dark:border-slate-700 ml-3">
                    {node.children.map((child) => (
                        <FileTreeNode
                            key={child._id}
                            node={child}
                            level={level + 1}
                            activeFolderId={activeFolderId}
                            onToggle={onToggle}
                            onSelect={onSelect}
                            expandedFolders={expandedFolders}
                        />
                    ))}
                    {node.children.length === 0 && (
                        <div
                            className="text-xs text-slate-400 dark:text-slate-600 py-1 pl-8 italic"
                            style={{ paddingLeft: `${paddingLeft + 28}px` }}
                        >
                            Empty
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const FileTree = ({ documents, activeFolderId, onSelectFolder }) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set());

    const buildTree = (docs, parentId = null) => {
        return docs
            .filter((d) => d.parentId === parentId)
            .sort((a, b) => {
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;
                return a.title.localeCompare(b.title);
            })
            .map((d) => ({
                ...d,
                children: d.type === 'folder' ? buildTree(docs, d._id) : []
            }));
    };

    const treeData = buildTree(documents);

    const toggleFolder = (folderId) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    useEffect(() => {
        if (!activeFolderId) return;

        const expandPath = (targetId) => {
            const path = new Set();
            let current = documents.find(d => d._id === targetId);
            while (current) {
                if (current.type === 'folder') {
                    path.add(current._id);
                }
                current = documents.find(d => d._id === current.parentId);
            }
            return path;
        };

        const pathSet = expandPath(activeFolderId);
        setExpandedFolders(prev => {
            const next = new Set(prev);
            pathSet.forEach(id => next.add(id));
            return next;
        });

    }, [activeFolderId, documents]);

    return (
        <div className="h-full flex flex-col select-none bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="p-3 pb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <span>Explorer</span>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 custom-scrollbar">
                {/* Root Level Item */}
                <div
                    onClick={() => onSelectFolder(null)}
                    className={`flex items-center gap-2 py-2 px-3 cursor-pointer my-2 mx-2 rounded-lg transition-all
                        ${!activeFolderId
                            ? "bg-violet-500 text-white font-semibold shadow-md shadow-violet-500/25"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }
                    `}
                >
                    <IoFolderOpenOutline className="w-4 h-4" />
                    <span className="text-sm">Workspace Root</span>
                </div>

                {treeData.map((node) => (
                    <FileTreeNode
                        key={node._id}
                        node={node}
                        activeFolderId={activeFolderId}
                        onToggle={toggleFolder}
                        onSelect={onSelectFolder}
                        expandedFolders={expandedFolders}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileTree;

