import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { BiX } from "react-icons/bi";
import useAuth from "../../hooks/useAuth";

const CreateProposalModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        researchTopic: "",
        interests: "",
    });

    const createPostMutation = useMutation({
        mutationFn: async (newPost) => {
            const res = await axiosInstance.post("/posts", newPost);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["proposalPosts"]);
            toast.success("Proposal created successfully!");
            onClose();
            setFormData({
                title: "",
                description: "",
                researchTopic: "",
                interests: "",
            });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create proposal");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to create a post");
            return;
        }

        const payload = {
            uid: user.uid, // Using uid as per backend requirement
            title: formData.title,
            description: formData.description,
            researchTopic: formData.researchTopic,
            interests: formData.interests.split(",").map((i) => i.trim()).filter(i => i),
            attachments: [], // Placeholder for now
        };

        createPostMutation.mutate(payload);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create Proposal</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <BiX size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., AI in Healthcare"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Research Topic</label>
                        <input
                            type="text"
                            name="researchTopic"
                            value={formData.researchTopic}
                            onChange={handleChange}
                            placeholder="e.g., Computer Science"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your research proposal..."
                            rows="4"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interests (comma separated)</label>
                        <input
                            type="text"
                            name="interests"
                            value={formData.interests}
                            onChange={handleChange}
                            placeholder="e.g., ML, Data Science, Python"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Attachments (Optional)
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => {
                                // For now, just logging or storing in state if needed
                                // In a real app, we'd handle file upload here
                                console.log(e.target.files);
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-full text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createPostMutation.isPending}
                            className="px-6 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 disabled:opacity-70 transition-all shadow-lg active:scale-95"
                        >
                            {createPostMutation.isPending ? "Posting..." : "Post Proposal"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateProposalModal;
