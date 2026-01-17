import {
    IoCloudDownloadOutline,
    IoTrashOutline,
    IoInformationCircleOutline,
    IoTimeOutline
} from "react-icons/io5";
import { getDocumentIcon, formatSize } from "../../../utils/documentUtils.jsx";
import { formatTime } from "../../../utils/formatTime";

const DocumentListItem = ({
    doc,
    user,
    documents,
    onNavigate,
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
            key={doc._id}
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
            className={`group flex items-center gap-3 p-2 px-3 rounded-lg cursor-pointer border transition-all duration-150
                ${isFolder
                    ? `${dragTargetFolderId === doc._id ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500' : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200'}`
                    : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:shadow-sm'
                }
            `}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isFolder ? 'text-amber-500 bg-amber-100/50 dark:bg-amber-900/30' :
                doc.type === 'file' ? 'text-sky-500 bg-sky-100/50 dark:bg-sky-900/30' :
                    'text-violet-500 bg-violet-100/50 dark:bg-violet-900/30'
                }`}>
                {getDocumentIcon(doc)}
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className="font-medium text-sm truncate w-1/3 text-slate-700 dark:text-slate-200">{doc.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-24 truncate hidden sm:block">
                    {isFolder ? `${folderItemsCount} items` : doc.type === 'file' ? formatSize(doc.size) : 'Note'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:flex items-center gap-1">
                    <IoTimeOutline className="w-3 h-3" />
                    {formatTime(doc.updatedAt)}
                </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isFolder && doc.type === 'file' && (
                    <button className="btn btn-xs btn-ghost btn-square text-slate-500 hover:text-primary" title="Download">
                        <IoCloudDownloadOutline className="w-3.5 h-3.5" />
                    </button>
                )}
                {isOwner && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
                        className="btn btn-xs btn-ghost btn-square text-error/70 hover:bg-error/10 hover:text-error"
                        title="Delete"
                    >
                        <IoTrashOutline className="w-3.5 h-3.5" />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onShowInfo(doc); }}
                    className="btn btn-xs btn-ghost btn-square text-slate-500 hover:text-violet-500"
                    title="Info"
                >
                    <IoInformationCircleOutline className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export default DocumentListItem;
