import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalApplicationApi } from "../../lib/proposalApplicationApi";
import toast from "react-hot-toast";


const FormGroupModal = ({ isOpen, onClose, proposalPostId, defaultName }) => {
    const [groupName, setGroupName] = useState(defaultName || "");
    const queryClient = useQueryClient();


    const mutation = useMutation({
        mutationFn: (data) => proposalApplicationApi.formGroup(data),
        onSuccess: (data) => {
            toast.success("Group formed successfully! 🎉");
            queryClient.invalidateQueries({ queryKey: ["receivedRequests"] });
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to form group");
        },
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!groupName.trim()) return;


        mutation.mutate({
            proposalPostId,
            groupName
        });
    };


    if (!isOpen) return null;


    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Form Research Team
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Create a group chat with all accepted candidates for this proposal.
                </p>


                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Team Name
                        </label>
                        <input
                            type="text"
                            id="groupName"
                            className="w-full text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm"
                            placeholder="e.g. Alpha Research Team"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                        />
                    </div>


                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending || !groupName.trim()}
                            className="rounded-lg px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
                        >
                            {mutation.isPending ? "Creating..." : "Create Team"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};


export default FormGroupModal;