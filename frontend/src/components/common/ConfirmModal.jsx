import React from "react";
import { createPortal } from "react-dom";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {message}
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${isDanger ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
