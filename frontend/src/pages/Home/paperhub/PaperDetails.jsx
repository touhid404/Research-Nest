import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperApi } from '../../../lib/paperApi';
import { BiArrowBack, BiLinkExternal, BiCopy, BiCalendar, BiBookOpen, BiMessageDetail, BiEditAlt, BiHide, BiShow, BiDotsVerticalRounded } from "react-icons/bi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { MdOutlineSchool } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";
import PostLoader from '../../../components/loader/PostLoader';
import toast from 'react-hot-toast';
import useAuth from '../../../hooks/useAuth';
import useChatStore from '../../../store/useChatStore';
import PaperMenu from '../../../components/papers/PaperMenu';
import ConfirmModal from '../../../components/common/ConfirmModal';


const MetaRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-0.5 py-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
        </div>
    );
};

const PaperDetails = () => {
    const { id } = useParams();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();
    const { getOrCreateConversation, sendMessage } = useChatStore();
    const [requestStatus, setRequestStatus] = useState(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (!currentUser || !id) return;
            setIsCheckingStatus(true);
            try {
                const res = await paperApi.checkRequestStatus(id, currentUser.uid);
                setRequestStatus(res.data.isRequested);
            } catch (error) {
                console.error("Error checking request status:", error);
            } finally {
                setIsCheckingStatus(false);
            }
        };
        checkStatus();
    }, [id, currentUser]);

    const { data, isPending, error } = useQuery({
        queryKey: ["paper", id],
        queryFn: async () => {
            const res = await paperApi.getPaperById(id);
            return res.data;
        },
        enabled: !!id,
    });

    const updatePaperMutation = useMutation({
        mutationFn: ({ id, data }) => paperApi.updatePaper(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["paper", id] });
            queryClient.invalidateQueries({ queryKey: ["papers"] });
            toast.success("Paper updated successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update paper");
        }
    });

    const deletePaperMutation = useMutation({
        mutationFn: (id) => paperApi.deletePaper(id),
        onSuccess: () => {
            toast.success("Paper deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["papers"] });
            if (currentUser?.uid) {
                queryClient.invalidateQueries({ queryKey: ["papers", currentUser.uid] });
            }
            navigate("/home/paper-hub/my-papers");
        },
        onError: (err) => {
            toast.error(err.message || "Failed to delete paper");
        }
    });

    if (isPending) return <div className="p-6"><PostLoader count={1} /></div>;

    if (error || !data) {
        return (
            <div className="p-6 text-center text-red-500">
                <p>Paper not found or error loading details.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const paper = data;
    const isOwner = currentUser?.uid === paper.user?.uid;

    const postedDate = new Date(paper.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });

    const pubDate = paper.publicationDate
        ? new Date(paper.publicationDate).toLocaleDateString("en-US", { year: "numeric", month: "long" })
        : null;

    const publicationYear = paper.publicationDate
        ? new Date(paper.publicationDate).getFullYear()
        : new Date(paper.createdAt).getFullYear();

    const coAuthorsList = paper.coAuthors
        ? (Array.isArray(paper.coAuthors) ? paper.coAuthors : paper.coAuthors.split(',').map(s => s.trim()))
        : [];

    const allAuthors = [paper.user?.name, ...coAuthorsList].filter(Boolean);

    const handleCopyDoi = () => {
        if (paper.doi) {
            navigator.clipboard.writeText(paper.doi);
            toast.success("DOI copied to clipboard");
        }
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const handleHidePaper = () => {
        const newStatus = paper.status === 'archived' ? 'published' : 'archived';
        updatePaperMutation.mutate({
            id: paper._id,
            data: { status: newStatus }
        });
    };

    const handleRequestPaper = async () => {
        if (!currentUser) {
            toast.error("Please login to request papers");
            return;
        }

        if (isOwner) {
            toast.error("This is your own paper!");
            return;
        }

        if (requestStatus) {
            toast.info("You already requested this paper");
            return;
        }

        const loadingToast = toast.loading("Sending request...");
        try {
            const conversation = await getOrCreateConversation(paper.user.uid);
            const requestMsg = `Hello! I am interested in your paper '${paper.title}'. Would it be possible to share the full PDF for research purposes? Thank you!`;
            await sendMessage(conversation._id, requestMsg);
            await paperApi.recordRequest({
                paperId: id,
                requesterUid: currentUser.uid,
                authorUid: paper.user.uid
            });

            setRequestStatus(true);
            toast.success("Request sent to author!", { id: loadingToast });
        } catch (error) {
            console.error("Error requesting paper:", error);
            toast.error(error.response?.data?.message || "Failed to send request", { id: loadingToast });
        }
    };

    return (
        <div className="min-h-full bg-white dark:bg-slate-900 animate-in fade-in duration-300 flex flex-col">

            {/* Top Bar */}
            <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-3 md:px-8 py-2 md:py-3 flex items-center justify-between gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition group text-xs md:text-sm shrink-0"
                >
                    <BiArrowBack className="group-hover:-translate-x-1 transition-transform" size={18} />
                    <span className="font-bold hidden sm:inline">Back</span>
                    <span className="font-bold sm:hidden">Papers</span>
                </button>

                <div className="flex gap-2 items-center flex-1 justify-end">
                    {/* Owner Actions */}
                    {isOwner && (
                        <div className="mr-2 pr-2 border-r border-gray-100 dark:border-slate-800">
                            <PaperMenu
                                isOwner={true}
                                onEdit={() => navigate(`/home/paper-hub/edit-paper/${paper._id}`)}
                                onDelete={() => setIsDeleteModalOpen(true)}
                                onToggleStatus={handleHidePaper}
                                onCopyLink={handleCopyLink}
                                status={paper.status}
                            />
                        </div>
                    )}

                    {paper.paperLink && (
                        <a
                            href={paper.paperLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] md:text-xs font-bold text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-full hover:bg-green-100 dark:hover:bg-green-900/40 transition whitespace-nowrap"
                        >
                            <BiLinkExternal size={13} />
                            <span className="hidden xs:inline">Source</span>
                            <span className="xs:hidden">Link</span>
                        </a>
                    )}
                    {paper.paperFile?.url && (
                        <a
                            href={paper.paperFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] md:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition shadow-sm whitespace-nowrap"
                        >
                            <AiOutlineFilePdf size={14} />
                            PDF
                        </a>
                    )}
                </div>
            </div>


            {/* Main layout */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left / Main Content */}
                <div className="lg:col-span-8 space-y-8">

                    {paper.status === 'archived' && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3 text-amber-800 dark:text-amber-300">
                                <BiHide size={24} />
                                <div>
                                    <p className="font-bold text-sm">This paper is currently hidden</p>
                                    <p className="text-xs opacity-80">It won't appear in public explore or searches.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleHidePaper}
                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-full transition shadow-sm"
                            >
                                Make Public
                            </button>
                        </div>
                    )}

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                        {paper.researchDomain && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40">
                                <MdOutlineSchool size={11} />
                                {paper.researchDomain}
                            </span>
                        )}
                        {paper.paperType && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <HiOutlineDocumentText size={11} />
                                {paper.paperType}
                            </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex items-center gap-1">
                            <BiCalendar size={12} />
                            {publicationYear}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
                        {paper.title}
                    </h1>

                    {/* Authors */}
                    <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                        {allAuthors.map((name, i) => (
                            <span key={i} className="flex items-center gap-1">
                                <span className="text-sm text-blue-700 dark:text-blue-400 font-medium hover:underline cursor-pointer">
                                    {name}
                                </span>
                                {i < allAuthors.length - 1 && (
                                    <span className="text-gray-300 dark:text-slate-600">,</span>
                                )}
                                {i === 0 && (
                                    <sup className="text-[9px] text-blue-500 ml-0.5">✉</sup>
                                )}
                            </span>
                        ))}
                    </div>

                    {/* DOI */}
                    {paper.doi && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">DOI:</span>
                            <a
                                href={`https://doi.org/${paper.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                            >
                                {paper.doi}
                            </a>
                            <button
                                onClick={handleCopyDoi}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                title="Copy DOI"
                            >
                                <BiCopy size={13} />
                            </button>
                        </div>
                    )}

                    {/* Publication Info inline */}
                    {(paper.publicationName || pubDate) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 border-l-2 border-blue-400 pl-3">
                            {paper.publicationName && (
                                <span className="italic font-medium text-gray-700 dark:text-gray-300">{paper.publicationName}</span>
                            )}
                            {pubDate && (
                                <span className="flex items-center gap-1">
                                    <BiCalendar size={13} />
                                    {pubDate}
                                </span>
                            )}
                            {paper.citationCount != null && paper.citationCount !== "" && (
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    Cited by {paper.citationCount}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Access Paper Link */}
                    <div className="border border-blue-100 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-900/10 rounded-xl p-4">
                        <h4 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Access Paper</h4>
                        <div className="flex flex-wrap gap-3">
                            {paper.paperLink && (
                                <a
                                    href={paper.paperLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
                                >
                                    <BiLinkExternal size={16} />
                                    Open Paper Link
                                    <span className="text-[10px] opacity-75 hidden sm:inline">↗ external</span>
                                </a>
                            )}
                            {!paper.paperFile?.url && !isOwner && (
                                <button
                                    onClick={handleRequestPaper}
                                    disabled={requestStatus || isCheckingStatus}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm ${requestStatus
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                        : "bg-violet-600 hover:bg-violet-700 text-white shadow-blue-100"
                                        }`}
                                >
                                    <BiMessageDetail size={16} />
                                    {isCheckingStatus ? "Checking..." : requestStatus ? "Already Requested" : "Request Full Paper"}
                                </button>
                            )}
                        </div>
                    </div>

                {/* Abstract */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-2">Abstract</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-8 text-[15px]">
                            {paper.abstract}
                        </p>
                    </div>

                    {/* Keywords / Tags */}
                    {paper.tags && paper.tags.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {paper.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 rounded text-[11px] font-medium hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Metadata */}
                <div className="lg:col-span-4 space-y-4">

                    {/* Authors Card */}
                    <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-5">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Authors</h3>
                        <div className="space-y-3">
                            {/* Primary Author */}
                            <div className="flex items-center gap-3 group">
                                <img
                                    src={paper.user.photoURL || `https://ui-avatars.com/api/?name=${paper.user.name}&background=1d4ed8&color=fff`}
                                    alt={paper.user.name}
                                    className="h-9 w-9 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition truncate">
                                        {paper.user.name}
                                    </p>
                                    <p className="text-[9px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">Corresponding</p>
                                </div>
                            </div>
                            {coAuthorsList.map((name, idx) => (
                                <div key={idx} className="flex items-center gap-3 pl-1">
                                    <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Publication Metadata Card */}
                    <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-5">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Publication Details</h3>
                        <MetaRow label="Paper Type" value={paper.paperType} />
                        <MetaRow label="Journal / Conference" value={paper.publicationName} />
                        <MetaRow label="Research Domain" value={paper.researchDomain} />
                        <MetaRow label="Publication Date" value={pubDate} />
                        <MetaRow label="Posted On" value={postedDate} />
                        {paper.citationCount != null && paper.citationCount !== "" && (
                            <MetaRow label="Citation Count" value={`${paper.citationCount} citations`} />
                        )}
                        {paper.doi && (
                            <div className="flex flex-col gap-0.5 py-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">DOI</span>
                                <div className="flex items-center gap-2 min-w-0">
                                    <a
                                        href={`https://doi.org/${paper.doi}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[12px] font-mono text-blue-600 dark:text-blue-400 hover:underline truncate"
                                        title={paper.doi}
                                    >
                                        {paper.doi}
                                    </a>
                                    <button onClick={handleCopyDoi} className="shrink-0 text-gray-400 hover:text-gray-600 transition" title="Copy DOI">
                                        <BiCopy size={12} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Access badges */}
                        <div className="flex flex-col gap-0.5 py-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Access</span>
                            <div className="flex gap-2 flex-wrap">
                                {paper.paperFile?.url ? (
                                    <a href={paper.paperFile.url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1.5 text-[11px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                                        <AiOutlineFilePdf size={13} /> PDF
                                    </a>
                                ) : !isOwner ? (
                                    <button
                                        onClick={handleRequestPaper}
                                        disabled={requestStatus || isCheckingStatus}
                                        className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-bold transition ${requestStatus
                                            ? "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
                                            : "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/40"
                                            }`}
                                    >
                                        <BiMessageDetail size={13} /> {isCheckingStatus ? "..." : requestStatus ? "Requested" : "Request PDF"}
                                    </button>
                                ) : (
                                    <span className="text-[11px] text-blue-600 font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">Owner Access</span>
                                )}
                                {paper.paperLink ? (
                                    <a href={paper.paperLink} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1.5 text-[11px] bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                                        <BiLinkExternal size={12} /> Link
                                    </a>
                                ) : (
                                    <span className="text-[11px] text-gray-300 dark:text-gray-600">No Link</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Posted info */}
                    <div className="text-xs text-gray-400 dark:text-gray-500 px-1 flex items-center gap-1">
                        <BiBookOpen size={12} />
                        Posted on Research Nest • {postedDate}
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deletePaperMutation.mutate(paper._id)}
                title="Delete Paper"
                message="Are you sure you want to delete this paper? This action cannot be undone."
                confirmText="Yes, Delete"
                isDanger={true}
            />
        </div>
    );
};

export default PaperDetails;

