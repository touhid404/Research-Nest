import { useState } from "react";
import {
    IoCloseOutline,
    IoDocumentTextOutline,
} from "react-icons/io5";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

const CreateDocumentModal = ({ workspace, onClose }) => {
    const { createDocument } = useWorkspaceStore();
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            setError("Document title is required");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await createDocument(workspace._id, {
                title: title.trim(),
                plainText: "",
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create document");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <IoDocumentTextOutline className="w-5 h-5 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-bold">Create Document</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                    >
                        <IoCloseOutline className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Document Title</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter document title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input input-bordered w-full"
                            autoFocus
                        />
                    </div>

                    {/* Actions */}
                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !title.trim()}
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                "Create Document"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
        </div>
    );
};

export default CreateDocumentModal;
