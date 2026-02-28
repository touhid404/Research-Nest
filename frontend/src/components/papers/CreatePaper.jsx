import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { BiUpload, BiX, BiCheck, BiFile, BiBuilding, BiUserPlus } from "react-icons/bi";
import { FaMagic } from "react-icons/fa";
import { paperApi } from "../../lib/paperApi";
import { workspaceApi } from "../../lib/workspaceApi";
import { useNavigate } from "react-router";

import { useParsePdf } from "../../hooks/useParsePdf";


const CreatePaper = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();


    const [uploadMode, setUploadMode] = useState("manual"); // 'manual' | 'workspace'
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
    const [selectedWorkspaceFile, setSelectedWorkspaceFile] = useState(null);
    const [selectedDynamicTeammates, setSelectedDynamicTeammates] = useState([]);


    const [formData, setFormData] = useState({
        title: "",
        abstract: "",
        researchDomain: "",
        tags: "",
        paperLink: "",
        paperFile: null,
        coAuthors: "",
        publicationDate: "",
        publicationName: "",
        doi: "",
        paperType: "",
        citationCount: "",
    });

    // AI state
    const parsePdfMutation = useParsePdf();


    // Fetch workspaces
    const { data: workspaceResponse } = useQuery({
        queryKey: ["workspaces"],
        queryFn: workspaceApi.getWorkspaces,
        enabled: !!user,
    });


    const workspaces = useMemo(() => workspaceResponse?.data || [], [workspaceResponse]);


    // Fetch documents if workspace selected
    const { data: documentResponse } = useQuery({
        queryKey: ["workspaceDocuments", selectedWorkspaceId],
        queryFn: () => workspaceApi.getDocuments(selectedWorkspaceId),
        enabled: !!selectedWorkspaceId,
    });


    // Get selected workspace object for members
    const selectedWorkspace = useMemo(() =>
        workspaces?.find(w => w._id === selectedWorkspaceId),
        [workspaces, selectedWorkspaceId]
    );


    // Filtered lists
    const ownedWorkspaces = useMemo(() =>
        workspaces?.filter(w => w.ownerUid === user?.uid) || [],
        [workspaces, user]
    );


    const availableFiles = useMemo(() =>
        documentResponse?.data?.filter(doc => doc.type === 'file') || [],
        [documentResponse]
    );




    const availableTeammates = useMemo(() =>
        selectedWorkspace?.members?.filter(m => m.uid !== user?.uid) || [],
        [selectedWorkspace, user]
    );


    // Update form when selecting file
    useEffect(() => {
        if (selectedWorkspaceFile) {
            setFormData(prev => ({
                ...prev,
                title: prev.title || selectedWorkspaceFile.title || "", // Auto-fill title if empty
            }));
        }
    }, [selectedWorkspaceFile]);




    const createPaperMutation = useMutation({
        mutationFn: async (postData) => {
            const data = new FormData();
            data.append("uid", postData.payload.uid);
            data.append("title", postData.payload.title);
            data.append("abstract", postData.payload.abstract);
            data.append("researchDomain", postData.payload.researchDomain);
            data.append("paperLink", postData.payload.paperLink);
            data.append("tags", postData.payload.tags);
            data.append("coAuthors", postData.payload.coAuthors);
            data.append("publicationDate", postData.payload.publicationDate);
            data.append("publicationName", postData.payload.publicationName);
            data.append("doi", postData.payload.doi);
            data.append("paperType", postData.payload.paperType);
            if (postData.payload.citationCount) data.append("citationCount", postData.payload.citationCount);


            if (postData.file) {
                data.append("paperFile", postData.file);
            }


            if (postData.workspaceFile) {
                // Pass workspace file as stringified JSON or handle in backend
                data.append("workspaceFile", JSON.stringify(postData.workspaceFile));
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


    const handleAiScan = async () => {
        let fileToScan = null;

        if (uploadMode === 'manual') {
            fileToScan = formData.paperFile;
        } else if (selectedWorkspaceFile) {
            const fileUrl = selectedWorkspaceFile.fileData?.fileUrl;
            if (!fileUrl) {
                toast.error("No file URL found for this workspace document.");
                return;
            }

            try {
                toast.loading("Fetching file for scanning...", { id: "pdf-scan" });
                const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`;
                const response = await fetch(fullUrl);
                if (!response.ok) throw new Error("Failed to fetch");
                const blob = await response.blob();
                fileToScan = new File([blob], selectedWorkspaceFile.title || "document.pdf", { type: "application/pdf" });
            } catch {
                toast.dismiss("pdf-scan");
                toast.error("Failed to fetch file from workspace.");
                return;
            }
        }

        if (!fileToScan || fileToScan.type !== "application/pdf") {
            toast.error("Please provide a valid PDF file for scanning.");
            return;
        }

        toast.loading("Scanning PDF for metadata...", { id: "pdf-scan" });
        parsePdfMutation.mutate(fileToScan, {
            onSuccess: (data) => {
                toast.dismiss("pdf-scan");
                toast.success("PDF Scanned! Metadata auto-filled.");
                setFormData(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    abstract: data.abstract || prev.abstract,
                    researchDomain: data.researchDomain || prev.researchDomain,
                    publicationDate: data.publicationDate || prev.publicationDate,
                    publicationName: data.publicationName || prev.publicationName,
                    doi: data.doi || prev.doi,
                    coAuthors: data.coAuthors || prev.coAuthors,
                    tags: data.tags || prev.tags,
                }));
            },
            onError: (error) => {
                toast.dismiss("pdf-scan");
                console.error("Scan Error:", error);
                toast.error("Failed to extract data from PDF.");
            }
        });
    };


    const removeFile = () => {
        setFormData({ ...formData, paperFile: null });
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const toggleTeammate = (member) => {
        setSelectedDynamicTeammates(prev => {
            const exists = prev.find(m => m.uid === member.uid);
            if (exists) return prev.filter(m => m.uid !== member.uid);
            return [...prev, member];
        });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to publish a paper");
            return;
        }


        // Validation based on mode
        if (uploadMode === 'manual') {
            if (!formData.paperFile && !formData.paperLink) {
                toast.error("Please provide either a Paper Link or upload a PDF file.");
                return;
            }
        } else {
            if (!selectedWorkspaceFile) {
                toast.error("Please select a file from your workspace.");
                return;
            }
        }


        // Combine co-authors
        let finalCoAuthors = formData.coAuthors;
        if (uploadMode === 'workspace' && selectedDynamicTeammates.length > 0) {
            const dynamicNames = selectedDynamicTeammates.map(m => m.user?.name || "Unknown").join(", ");
            finalCoAuthors = finalCoAuthors ? `${finalCoAuthors}, ${dynamicNames}` : dynamicNames;
        }


        // Prepare Payload
        const basicPayload = {
            uid: user.uid,
            title: formData.title,
            abstract: formData.abstract,
            researchDomain: formData.researchDomain,
            tags: formData.tags,
            paperLink: formData.paperLink,
            coAuthors: finalCoAuthors,
            publicationDate: formData.publicationDate,
            publicationName: formData.publicationName,
            doi: formData.doi,
            paperType: formData.paperType,
            citationCount: formData.citationCount,
        };


        const mutationData = {
            payload: basicPayload,
        };


        if (uploadMode === 'manual') {
            mutationData.file = formData.paperFile;
        } else {
            // Construct workspace file object matching what backend expects/stores
            const fileData = selectedWorkspaceFile.fileData || {};
            mutationData.workspaceFile = {
                name: fileData.originalName || selectedWorkspaceFile.title,
                url: fileData.fileUrl
                    ? (fileData.fileUrl.startsWith('http') ? fileData.fileUrl : `${window.location.origin}${fileData.fileUrl}`)
                    : "",
            };
        }


        createPaperMutation.mutate(mutationData);
    };


    // Fetch unique domains for suggestions
    const { data: domainsData } = useQuery({
        queryKey: ["paper-domains"],
        queryFn: paperApi.getResearchDomains,
    });
    const existingDomains = useMemo(() => domainsData?.data || [], [domainsData]);

    return (
        <div className="p-4 md:p-8 h-full">
            {/* ... rest of the JSX ... */}
            <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1 h-5 bg-blue-600 rounded-full inline-block"></span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit Research Paper</h2>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-4">Share your research with the academic community</p>
                    </div>
                </div>


                {/* Upload Mode Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-lg mb-8 w-fit">
                    <button
                        onClick={() => setUploadMode("manual")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${uploadMode === "manual"
                            ? "bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        Manual Upload
                    </button>
                    <button
                        onClick={() => setUploadMode("workspace")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${uploadMode === "workspace"
                            ? "bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        From Workspace
                    </button>
                </div>


                <form onSubmit={handleSubmit} className="space-y-6">


                    {/* WORKSPACE SELECTION SECTION */}
                    {uploadMode === "workspace" && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30 mb-6 space-y-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <BiBuilding /> Select from Workspace
                            </h3>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Workspace Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Choose Workspace (Owner Only)
                                    </label>
                                    <select
                                        value={selectedWorkspaceId}
                                        onChange={(e) => {
                                            setSelectedWorkspaceId(e.target.value);
                                            setSelectedWorkspaceFile(null);
                                            setSelectedDynamicTeammates([]);
                                        }}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select a Workspace</option>
                                        {ownedWorkspaces.map(ws => (
                                            <option key={ws._id} value={ws._id}>
                                                {ws.name}
                                            </option>
                                        ))}
                                    </select>
                                    {ownedWorkspaces.length === 0 && (
                                        <p className="text-xs text-amber-500 mt-1">You don't own any workspaces yet.</p>
                                    )}
                                </div>


                                {/* File Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select File
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <select
                                            value={selectedWorkspaceFile?._id || ""}
                                            onChange={(e) => {
                                                const file = availableFiles.find(f => f._id === e.target.value);
                                                setSelectedWorkspaceFile(file);
                                            }}
                                            disabled={!selectedWorkspaceId}
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                        >
                                            <option value="">Select a Document</option>
                                            {availableFiles.map(doc => (
                                                <option key={doc._id} value={doc._id}>
                                                    {doc.title}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedWorkspaceFile && (
                                            <div className="magical-border-flow h-fit">
                                                <button
                                                    type="button"
                                                    onClick={handleAiScan}
                                                    disabled={parsePdfMutation.isPending}
                                                    className="flex items-center justify-center gap-2 px-6 py-2 bg-transparent backdrop-blur-sm text-black dark:text-white rounded-[0.5rem] text-sm font-bold transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap group w-full border border-blue-500/10 hover:border-blue-500/30"
                                                >
                                                    {parsePdfMutation.isPending ? (
                                                        <span className="animate-pulse flex items-center gap-2">
                                                            <FaMagic className="animate-spin text-cyan-400 dark:text-cyan-600" />
                                                            <span>Scanning...</span>
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <FaMagic className="group-hover:rotate-12 transition-transform text-cyan-400 dark:text-cyan-600" />
                                                            <span>AI Scan and Fill</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Dynamic Teammates */}
                            {selectedWorkspaceId && availableTeammates.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <BiUserPlus /> Add Teammates as Co-Authors
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTeammates.map(member => {
                                            const isSelected = selectedDynamicTeammates.some(m => m.uid === member.uid);
                                            return (
                                                <button
                                                    key={member.uid}
                                                    type="button"
                                                    onClick={() => toggleTeammate(member)}
                                                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border transition-all ${isSelected
                                                        ? "bg-black dark:bg-white text-white dark:text-black border-transparent"
                                                        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-400"
                                                        }`}
                                                >
                                                    {member.user?.name || "Unknown User"}
                                                    {isSelected && <BiCheck />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* MANUAL UPLOAD SECTION */}
                    {uploadMode === "manual" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
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
                                        {parsePdfMutation.isPending ? (
                                            <span className="text-gray-700 dark:text-gray-300 text-sm animate-pulse">Scanning...</span>
                                        ) : (
                                            <>
                                                <BiUpload size={20} className="text-gray-600 dark:text-gray-300" />
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">Select PDF</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg px-3 py-2 h-[42px]">
                                            <span className="truncate text-sm text-green-700 dark:text-green-400 max-w-[150px]">
                                                {formData.paperFile.name}
                                            </span>
                                            <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700">
                                                <BiX size={18} />
                                            </button>
                                        </div>
                                        {formData.paperFile?.type === "application/pdf" && (
                                            <div className="magical-border-flow h-fit shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={handleAiScan}
                                                    disabled={parsePdfMutation.isPending}
                                                    className="flex items-center gap-2 px-4 py-2 bg-transparent backdrop-blur-sm text-black dark:text-white rounded-[0.5rem] text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap group border border-blue-500/10 hover:border-blue-500/30"
                                                >
                                                    {parsePdfMutation.isPending ? (
                                                        <span className="animate-pulse flex items-center gap-2">
                                                            <FaMagic className="animate-spin text-cyan-400 dark:text-cyan-600" />
                                                            <span>Scanning...</span>
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <FaMagic className="group-hover:rotate-12 transition-transform text-cyan-400 dark:text-cyan-600" />
                                                            <span>AI Scan and Fill</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}




                    {/* COMMON FIELDS */}
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


                    {/* Row 2: Meta Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Research Domain <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="researchDomain"
                                list="research-domains-list"
                                value={formData.researchDomain}
                                onChange={handleChange}
                                placeholder="e.g., Computer Science"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                            <datalist id="research-domains-list">
                                {existingDomains.map(domain => (
                                    <option key={domain} value={domain} />
                                ))}
                            </datalist>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Paper Type
                            </label>
                            <select
                                name="paperType"
                                value={formData.paperType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select type</option>
                                <option value="Journal Article">Journal Article</option>
                                <option value="Conference Paper">Conference Paper</option>
                                <option value="Workshop Paper">Workshop Paper</option>
                                <option value="Preprint">Preprint</option>
                                <option value="Thesis">Thesis</option>
                                <option value="Book Chapter">Book Chapter</option>
                                <option value="Technical Report">Technical Report</option>
                            </select>
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
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Citation Count (Optional)
                            </label>
                            <input
                                type="number"
                                name="citationCount"
                                min="0"
                                value={formData.citationCount}
                                onChange={handleChange}
                                placeholder="e.g., 42"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Journal Name Full Row */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Journal / Conference Name
                        </label>
                        <input
                            type="text"
                            name="publicationName"
                            value={formData.publicationName}
                            onChange={handleChange}
                            placeholder="e.g., IEEE Transactions on Neural Networks, NeurIPS 2024"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
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
                            {uploadMode === 'workspace' && selectedDynamicTeammates.length > 0 && (
                                <p className="text-xs text-blue-500 mt-1">
                                    + {selectedDynamicTeammates.map(m => m.user?.name).join(", ")}
                                </p>
                            )}
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
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Abstract / Description
                            </label>

                        </div>
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


                    {/* Row 5: Tags (Full Width in workspace, part of grid in manual) */}
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
                            className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 transition shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            {createPaperMutation.isPending ? "Submitting..." : "Share Paper"}
                        </button>
                    </div>


                </form>
            </div>
        </div>
    );
};


export default CreatePaper;
