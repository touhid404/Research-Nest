import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalApplicationApi } from "../../lib/proposalApplicationApi";
import toast from "react-hot-toast";


const RequestModal = ({ isOpen, onClose, post }) => {
    const [description, setDescription] = useState("");
    const queryClient = useQueryClient();


    const mutation = useMutation({
        mutationFn: (data) => proposalApplicationApi.sendRequest(data),
        onSuccess: () => {
            toast.success("Request sent successfully!");
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["proposalPosts"] });
            queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
            onClose();
            setDescription("");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to send request");
            onClose();
        },
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim()) return;


        mutation.mutate({
            proposalPostId: post._id,
            description: description,
        });
    };


    if (!isOpen) return null;


    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Collaboration Request
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Send a request to <span className="font-semibold text-gray-700 dark:text-gray-300">{post.user?.name}</span> to collaborate on "<span className="italic">{post.title}</span>".
                </p>


                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Why are you interested?
                        </label>
                        <textarea
                            id="description"
                            rows="4"
                            className="w-full px-3 py-2 text-black dark:text-white bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                            placeholder="Briefly explain your skills and why you'd be a good fit..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
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
                            disabled={mutation.isPending || !description.trim()}
                            className="rounded-lg px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                        >
                            {mutation.isPending ? "Sending..." : "Send Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};


export default RequestModal;



