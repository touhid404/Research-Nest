import {
    IoCloudDownloadOutline,
    IoCreateOutline,
    IoTrashOutline,
    IoInformationCircleOutline,
    IoImageOutline
} from "react-icons/io5";
import { getDocumentIcon, formatSize } from "../../../utils/documentUtils.jsx";
import { formatTime } from "../../../utils/formatTime";

const DocumentCard = ({
    doc,
    user,
    documents,
    currentFolderId,
    onNavigate,
    onDownload,
    onEdit,
    onDelete,
    onShowInfo,
    dragTargetFolderId,
    setDragTargetFolderId,
    handleItemDragStart,
    handleItemDrop
}) => {
    const isFolder = doc.type === 'folder';
    const isOwner = user?.uid === (doc.createdBy || doc.creator?.uid);

    const folderItemsCount = isFolder
        ? documents.filter(d => d.parentId === doc._id).length
        : 0;

    return (
        <div
            draggable
            onDragStart={(e) => handleItemDragStart(e, doc)}
            onDragOver={(e) => {
                if (isFolder) {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragTargetFolderId(doc._id);
                }
            }}
            onDragLeave={() => {
                if (isFolder) setDragTargetFolderId(null);
            }}
            onDrop={(e) => {
                if (isFolder) handleItemDrop(e, doc);
            }}
            onClick={() => onNavigate(doc)}
            className={`group cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col
                ${isFolder
                    ? `bg-amber-50 dark:bg-amber-900/10 border-2 ${dragTargetFolderId === doc._id
                        ? 'border-amber-500 scale-105 shadow-xl ring-4 ring-amber-500/20'
                        : 'border-amber-100 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-md hover:-translate-y-1'
                    } rounded-2xl`
                    : `bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border ${doc.type === 'notes' ? 'hover:border-violet-400 dark:hover:border-violet-700' : 'hover:border-sky-400 dark:hover:border-sky-700'
                    } border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 rounded-xl`
                }
            `}
        >
            {/* Drag Overlay for Folders */}
            {dragTargetFolderId === doc._id && isFolder && (
                <div className="absolute inset-0 bg-amber-500/10 z-10 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-white/95 dark:bg-black/80 px-3 py-1.5 rounded-full text-xs font-bold text-amber-600 shadow-sm border border-amber-200">
                        Drop to move
                    </span>
                </div>
            )}

            {/* Preview/Icon area */}
            {!isFolder && doc.fileUrl && doc.mimeType?.startsWith('image/') ? (
                <div className="h-32 w-full bg-slate-100 dark:bg-slate-900 relative">
                    <img
                        src={doc.fileUrl.startsWith('http') ? doc.fileUrl : `${import.meta.env.VITE_API_URL}${doc.fileUrl}`}
                        className="w-full h-full object-cover"
                        alt={doc.title}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center text-slate-400">
                        <IoImageOutline className="w-10 h-10" />
                    </div>
                </div>
            ) : (
                <div className="h-28 w-full flex items-center justify-center border-b border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-700/50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isFolder
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                        : doc.type === 'file'
                            ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                            : 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
                        }`}>
                        {getDocumentIcon(doc)}
                    </div>
                </div>
            )}

            <div className="p-4 flex flex-col h-full bg-white dark:bg-slate-800/40">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-snug text-slate-700 dark:text-slate-200" title={doc.title}>
                            {doc.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {isFolder
                                ? `${folderItemsCount} items`
                                : doc.type === 'file' ? formatSize(doc.size) : "Note"
                            }
                        </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1 transform translate-y-1 group-hover:translate-y-0 duration-200">
                        {!isFolder && doc.type === 'file' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDownload(doc); }}
                                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-primary transition-colors"
                                title="Download"
                            >
                                <IoCloudDownloadOutline className="w-4 h-4" />
                            </button>
                        )}
                        {!isFolder && doc.type === 'notes' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(doc); }}
                                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-primary transition-colors"
                                title="Edit"
                            >
                                <IoCreateOutline className="w-4 h-4" />
                            </button>
                        )}
                        {isOwner && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
                                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors"
                                title="Delete"
                            >
                                <IoTrashOutline className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onShowInfo(doc); }}
                            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 hover:text-violet-500 transition-colors"
                            title="View Info"
                        >
                            <IoInformationCircleOutline className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5" title={`Created by ${doc.creator?.name || "Unknown"}`}>
                        {doc.creator?.photoURL ? (
                            <img src={doc.creator.photoURL} className="w-4 h-4 rounded-full ring-1 ring-slate-200 dark:ring-slate-700" alt="" />
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center text-[8px] font-bold text-white">
                                {(doc.creator?.name?.[0] || 'U').toUpperCase()}
                            </div>
                        )}
                        <span className="truncate max-w-[60px]">{doc.creator?.name?.split(' ')[0] || 'Unknown'}</span>
                    </div>
                    <span>{formatTime(doc.updatedAt)}</span>
                </div>
            </div>
        </div>
    );
};

export default DocumentCard;
