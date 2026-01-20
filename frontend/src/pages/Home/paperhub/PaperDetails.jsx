import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { paperApi } from '../../../lib/paperApi';
import { BiArrowBack, BiDownload, BiLinkExternal } from "react-icons/bi";
import PostLoader from '../../../components/loader/postLoader';




const PaperDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();




    const { data, isPending, error } = useQuery({
        queryKey: ["paper", id],
        queryFn: async () => {
            const res = await paperApi.getPaperById(id);
            return res.data;
        },
        enabled: !!id,
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
    const formattedDate = new Date(paper.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });




    const coAuthorsList = paper.coAuthors
        ? (Array.isArray(paper.coAuthors) ? paper.coAuthors : paper.coAuthors.split(',').map(s => s.trim()))
        : [];


    return (
        <div className="min-h-full bg-white dark:bg-slate-900 animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition group"
                >
                    <BiArrowBack className="group-hover:-translate-x-1 transition-transform" size={20} />
                    <span className="font-medium">Back</span>
                </button>
                <div className="flex gap-3">
                    {paper.paperLink && (
                        <a
                            href={paper.paperLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                            <BiLinkExternal size={18} />
                            <span className="hidden sm:inline">View Source</span>
                        </a>
                    )}
                    {paper.paperFile?.url && (
                        <a
                            href={paper.paperFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition shadow-sm"
                        >
                            <BiDownload size={18} />
                            <span className="hidden sm:inline">Download PDF</span>
                            <span className="sm:hidden">PDF</span>
                        </a>
                    )}
                </div>
            </div>




            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content: Title, Abstract, Info */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Title & Meta */}
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wider uppercase rounded-full">
                                {paper.researchDomain}
                            </span>
                            <span className="text-gray-300 dark:text-slate-700">|</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Published {formattedDate}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-[1.15]">
                            {paper.title}
                        </h1>


                        {/* Authors Helper Line */}
                        <div className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                            By <span className="font-semibold text-gray-900 dark:text-white">{paper.user.name}</span>
                            {coAuthorsList.length > 0 && (
                                <span>, {coAuthorsList.join(", ")}</span>
                            )}
                        </div>
                    </div>


                    {/* Abstract */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-2">Abstract</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-8 text-lg font-serif">
                            {paper.abstract}
                        </p>
                    </div>


                    {/* Tags */}
                    {paper.tags && paper.tags.length > 0 && (
                        <div className="pt-6">
                            <div className="flex flex-wrap gap-2">
                                {paper.tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium uppercase tracking-wide">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


                {/* Sidebar: Authenticated Members / Metadata */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Authors / Members Box */}
                    <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            Authors
                        </h3>
                        <div className="space-y-4">
                            {/* Primary Author */}
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <img
                                    src={paper.user.photoURL || "https://ui-avatars.com/api/?name=" + paper.user.name}
                                    alt={paper.user.name}
                                    className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-slate-700 group-hover:border-blue-500 transition"
                                />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition">
                                        {paper.user.name}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                                        Corresponding Author
                                    </p>
                                </div>
                            </div>


                            {/* Co-Authors as list items */}
                            {coAuthorsList.map((authorName, idx) => (
                                <div key={idx} className="flex items-center gap-3 pl-1">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                                        {authorName.charAt(0)}
                                    </div>
                                    <p className="font-medium text-gray-600 dark:text-gray-300 text-sm">
                                        {authorName}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Info Card */}
                    <div className="border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <ul className="space-y-4 text-sm">
                            <li className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
                                <span className="text-gray-500 dark:text-gray-400">Publication Date</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {paper.publicationDate
                                        ? new Date(paper.publicationDate).toLocaleDateString()
                                        : "N/A"}
                                </span>
                            </li>
                            <li className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
                                <span className="text-gray-500 dark:text-gray-400">Journal/Conf</span>
                                <span className="font-medium text-gray-900 dark:text-white text-right max-w-[150px] truncate" title={paper.publicationName}>
                                    {paper.publicationName || "N/A"}
                                </span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Paper Type</span>
                                <span className="font-medium text-gray-900 dark:text-white">{paper.paperFile ? "PDF" : "Link"}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>


            {/* PDF Viewer - Full Width */}
            {paper.paperFile?.url && (
                <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
                    <div className="pt-10 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">Full Text</h3>
                            <a
                                href={paper.paperFile.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                            >
                                <BiLinkExternal /> Open in new tab
                            </a>
                        </div>
                        <div className="w-full h-[800px] bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm relative group">
                            <iframe
                                src={`${paper.paperFile.url}#view=FitH&toolbar=0&navpanes=0`}
                                className="w-full h-full"
                                title="Paper PDF Preview"
                            ></iframe>


                            {/* Overlay hint */}
                            <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};




export default PaperDetails;









