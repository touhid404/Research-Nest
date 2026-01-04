import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { BiUpload, BiX } from "react-icons/bi";
import { paperApi } from "../../lib/paperApi"; // Assume this exists


import { useNavigate } from "react-router";


const CreatePaper = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        title: "",
        abstract: "",
        researchDomain: "",
        tags: "",
        paperLink: "",
        paperFile: null, // Single file
        coAuthors: "",
        publicationDate: "",
        publicationName: "",
        doi: "",
    });


    const createPaperMutation = useMutation({
        mutationFn: async (postData) => {
            const data = new FormData();
            data.append("uid", postData.payload.uid);
            data.append("title", postData.payload.title);
            data.append("abstract", postData.payload.abstract);
            data.append("researchDomain", postData.payload.researchDomain);
            data.append("paperLink", postData.payload.paperLink);
            data.append("tags", postData.payload.tags);


            // New fields
            data.append("coAuthors", postData.payload.coAuthors);
            data.append("publicationDate", postData.payload.publicationDate);
            data.append("publicationName", postData.payload.publicationName);
            data.append("doi", postData.payload.doi);




            if (postData.file) {
                data.append("paperFile", postData.file);
            }


            return await paperApi.createPaper(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["papers"] });
            if (user?.uid) queryClient.invalidateQueries({ queryKey: ["papers", user.uid] });
            toast.success("Paper published successfully!");
            navigate("/home/paper-hub/my-papers");
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            const msg = error.response?.data?.message || error.message || "Failed to publish paper";
            toast.error("Error: " + msg);
        },
    });


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, paperFile: file });
        }
    };


    const removeFile = () => {
        setFormData({ ...formData, paperFile: null });
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to publish a paper");
            return;
        }
        if (!formData.paperFile && !formData.paperLink) {
            toast.error("Please provide either a Paper Link or upload a PDF file.");
            return;
        }


        // Prepare the static data
        const basicPayload = {
            uid: user.uid,
            title: formData.title,
            abstract: formData.abstract,
            researchDomain: formData.researchDomain,
            tags: formData.tags, // passed as string
            paperLink: formData.paperLink,
            // New Payload fields
            coAuthors: formData.coAuthors,
            publicationDate: formData.publicationDate,
            publicationName: formData.publicationName,
            doi: formData.doi,
        };


        createPaperMutation.mutate({
            payload: basicPayload,
            file: formData.paperFile,
        });
    };


    return (
        <div className="p-4 md:p-8 h-full">
            <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Publish Research Paper</h2>
                </div>


                <form onSubmit={handleSubmit} className="space-y-6">


                    {/* Row 1: Title (Full width) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Paper Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Attention Is All You Need"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>


                    {/* Row 2: 4 Columns for Meta Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Research Domain
                            </label>
                            <input
                                type="text"
                                name="researchDomain"
                                value={formData.researchDomain}
                                onChange={handleChange}
                                placeholder="e.g., CS"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Publication Date
                            </label>
                            <input
                                type="date"
                                name="publicationDate"
                                value={formData.publicationDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Journal / Conference Name
                            </label>
                            <input
                                type="text"
                                name="publicationName"
                                value={formData.publicationName}
                                onChange={handleChange}
                                placeholder="e.g., IEEE Access"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>


                    {/* Row 3: Co-Authors & DOI (3 Cols) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Co-Authors (comma separated)
                            </label>
                            <input
                                type="text"
                                name="coAuthors"
                                value={formData.coAuthors}
                                onChange={handleChange}
                                placeholder="e.g., Jane Doe, John Smith"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                DOI (Optional)
                            </label>
                            <input
                                type="text"
                                name="doi"
                                value={formData.doi}
                                onChange={handleChange}
                                placeholder="10.1109/..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>


                    {/* Row 4: Abstract (Full Width) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Abstract / Description
                        </label>
                        <textarea
                            name="abstract"
                            value={formData.abstract}
                            onChange={handleChange}
                            placeholder="Brief summary of your paper..."
                            rows="5"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            required
                        />
                    </div>


                    {/* Row 5: Tags, Link, File (3 Cols) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="e.g., AI, NLP"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Paper Link
                            </label>
                            <input
                                type="url"
                                name="paperLink"
                                value={formData.paperLink}
                                onChange={handleChange}
                                placeholder="External URL"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Upload PDF
                            </label>
                            {!formData.paperFile ? (
                                <label className="flex items-center justify-center gap-3 px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 cursor-pointer hover:bg-gray-200 transition h-[42px]">
                                    <BiUpload size={20} className="text-gray-600 dark:text-gray-300" />
                                    <span className="text-gray-700 dark:text-gray-300 text-sm">Select PDF</span>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg px-3 py-2 h-[42px]">
                                    <span className="truncate text-sm text-green-700 dark:text-green-400 max-w-[150px]">
                                        {formData.paperFile.name}
                                    </span>
                                    <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700">
                                        <BiX size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/home/paper-hub")}
                            className="px-6 py-2 rounded-full border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createPaperMutation.isPending}
                            className="px-6 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 disabled:opacity-60 transition shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            {createPaperMutation.isPending ? "Publishing..." : "Publish Paper"}
                        </button>
                    </div>


                </form>
            </div>
        </div>
    );
};


export default CreatePaper;





