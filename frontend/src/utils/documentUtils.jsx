import {
    IoFolderOutline,
    IoImageOutline,
    IoDocumentTextOutline,
    IoDocumentOutline,
    IoReaderOutline
} from "react-icons/io5";

/**
 * Formats bytes into a readable string (e.g., "1.5 MB").
 */
export const formatSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

/**
 * Returns the appropriate icon for a document based on its type and MIME type.
 */
export const getDocumentIcon = (doc) => {
    if (doc.type === "folder") {
        return <IoFolderOutline className="w-6 h-6 text-amber-500" />;
    }
    if (doc.type === "file") {
        if (doc.mimeType?.startsWith("image/")) {
            return <IoImageOutline className="w-6 h-6 text-sky-500" />;
        }
        if (doc.mimeType === "application/pdf") {
            return <IoDocumentTextOutline className="w-6 h-6 text-rose-500" />;
        }
        return <IoDocumentOutline className="w-6 h-6 text-slate-500" />;
    }
    return <IoReaderOutline className="w-6 h-6 text-violet-500" />;
};
