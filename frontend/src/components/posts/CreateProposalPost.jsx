import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { BiUpload, BiX } from "react-icons/bi";
import { useNavigate } from "react-router";
import { proposalApi } from "../../lib/proposalApi";
import { useEnhanceDescription } from "../../hooks/useEnhanceDescription";
import AiDescriptionEnhancerModal from "../common/AiDescriptionEnhancerModal";
import AiEnhanceButton from "../common/AiEnhanceButton";

const CreateProposalPost = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        researchTopic: "",
        interests: "",
        attachments: [],
    });

    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const enhanceMutation = useEnhanceDescription();

    const handleEnhance = () => {
        if (!formData.description || formData.description.length < 20) {
            toast.error("Description must be at least 20 characters long to enhance.");
            return;
        }

        enhanceMutation.mutate(
            {
                description: formData.description,
                context: "proposal",
                tone: "academic"
            },
            {
                onSuccess: (data) => {
                    setIsAiModalOpen(true);
                }
            }
        );
    };

    const applyAiEnhancement = (newDescription) => {
        setFormData(prev => ({ ...prev, description: newDescription }));
        setIsAiModalOpen(false);
    };

    const createPostMutation = useMutation({
        mutationFn: async (postData) => {
            // Build FormData
            const formData = new FormData();
            formData.append("uid", postData.payload.uid);
            formData.append("title", postData.payload.title);
            formData.append("description", postData.payload.description);
            formData.append("researchTopic", postData.payload.researchTopic);

            // Handle interests array
            if (postData.payload.interests && postData.payload.interests.length > 0) {
                // Usually comma separated or multiple keys. Let's start with multiple keys 
                // or send as string if backend expects string parsing (we didn't add json parsing for interests, it expects array)
                // Simple way:
                postData.payload.interests.forEach(interest => formData.append("interests[]", interest));
            }

            // Append each file
            postData.rawAttachments.forEach((att) => {
                formData.append("attachments", att.file);
            });

            const data = await proposalApi.createProposalPost(formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["proposalPosts"], exact: true });
            if (user?.uid) queryClient.invalidateQueries({ queryKey: ["proposalPosts", user.uid] });

            toast.success("Proposal created successfully!");

            setFormData({
                title: "",
                description: "",
                researchTopic: "",
                interests: "",
                attachments: [],
            });

            navigate("/home/posts/myposts"); // Ensure correct path string
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.message || error.response?.data?.message || "Failed to create proposal");
        },
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Store the raw File object AND a preview URL
        const attachmentObjects = files.map((file) => ({
            file: file, // Important: Keep the raw file for uploading
            name: file.name,
            previewUrl: URL.createObjectURL(file), // For UI preview only
        }));

        setFormData((prev) => ({
            ...prev,
            attachments: [...prev.attachments, ...attachmentObjects],
        }));
    };

    const removeFile = (index) => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to create a post");
            return;
        }

        // Prepare the static data
        const basicPayload = {
            uid: user.uid,
            title: formData.title,
            description: formData.description,
            researchTopic: formData.researchTopic,
            interests: formData.interests
                ? formData.interests.split(",").map((i) => i.trim()).filter(Boolean)
                : [],
        };

        // Pass both the payload AND the raw attachments to the mutation
        createPostMutation.mutate({
            payload: basicPayload,
            rawAttachments: formData.attachments,
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-4 flex justify-center">
            <div className="w-full">
                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Create Research Proposal
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1: Title + Research Topic */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., AI in Healthcare"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Research Topic
                            </label>
                            <input
                                type="text"
                                name="researchTopic"
                                value={formData.researchTopic}
                                onChange={handleChange}
                                placeholder="e.g., Computer Science"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <AiEnhanceButton
                                onClick={handleEnhance}
                                disabled={!formData.description || formData.description.length < 20 || enhanceMutation.isPending}
                                isLoading={enhanceMutation.isPending}
                                text="Enhance Description"
                            />
                        </div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your research proposal..."
                            rows="4"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            required
                        ></textarea>
                    </div>

                    {/* Row 2: Interests + File Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Interests */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Interests (comma separated)
                            </label>
                            <input
                                type="text"
                                name="interests"
                                value={formData.interests}
                                onChange={handleChange}
                                placeholder="e.g., ML, Data Science, Python"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Attachments (Optional)
                            </label>

                            <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 cursor-pointer hover:bg-gray-200 transition">
                                <BiUpload size={22} className="text-gray-600 dark:text-gray-300" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                    Click to Upload PDF
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf" // Restrict to PDF if needed
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {/* File Preview List */}
                            {formData.attachments.length > 0 && (
                                <ul className="mt-3 space-y-2">
                                    {formData.attachments.map((item, idx) => (
                                        <li key={idx} className="flex items-center justify-between bg-gray-100 dark:bg-slate-900 p-2 rounded text-sm">
                                            <span className="truncate max-w-[200px] text-gray-700 dark:text-gray-300">
                                                {item.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <BiX size={18} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Submit + Cancel Buttons */}
                    <div className="pt-3 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/home/posts/myposts")}
                            className="px-6 py-2 rounded-full border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={createPostMutation.isPending}
                            className="px-6 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                        >
                            {createPostMutation.isPending ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                                    <span>Uploading & Posting...</span>
                                </>
                            ) : (
                                "Post Proposal"
                            )}
                        </button>
                    </div>
                </form>

                <AiDescriptionEnhancerModal
                    isOpen={isAiModalOpen}
                    onClose={() => setIsAiModalOpen(false)}
                    originalText={formData.description}
                    enhancedData={enhanceMutation.data}
                    isLoading={enhanceMutation.isPending}
                    onApply={applyAiEnhancement}
                />
            </div>
        </div>
    );
};

export default CreateProposalPost;