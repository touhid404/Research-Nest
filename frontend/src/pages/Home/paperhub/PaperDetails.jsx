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


    return (
        <div className="min-h-full bg-white dark:bg-slate-900">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition"
                >
                    <BiArrowBack size={20} />
                    <span className="font-medium">Back</span>
                </button>
                <div className="flex gap-3">
                    {paper.paperLink && (
                        <a
                            href={paper.paperLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                            <BiLinkExternal size={18} />
                            View Source
                        </a>
                    )}
                    {paper.paperFile?.url && (
                        <a
                            href={paper.paperFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                        >
                            <BiDownload size={18} />
                            Read / Download PDF
                        </a>
                    )}
                </div>
            </div>


            <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">


                {/* Main Content: Title, Abstract, Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Title & Domain */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                                {paper.researchDomain}
                            </span>
                            <span className="text-gray-300 dark:text-slate-600">|</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Published: {formattedDate}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                            {paper.title}
                        </h1>
                    </div>


                    {/* Authors List (Scholar Style) */}
                    <div className="flex flex-wrap items-center gap-2 text-lg text-gray-700 dark:text-gray-300">
                        <span className="font-medium border-b border-transparent hover:border-black dark:hover:border-white cursor-pointer transition">
                            {paper.user.name}
                        </span>
                        {/* Dummy co-authors to match the "members" request if actual data isn't there,
                            or just stick to single author if strict.
                            Let's keep it strictly real data for now but styled like a list */}
                    </div>


                    {/* Abstract */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide text-sm">Abstract</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg text-justify">
                            {paper.abstract}
                        </p>
                    </div>


                    {/* Tags */}
                    {paper.tags && paper.tags.length > 0 && (
                        <div className="pt-4">
                            <div className="flex flex-wrap gap-2">
                                {paper.tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-md text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


                {/* Sidebar: Authenticated Members / Metadata */}
                <div className="space-y-8">
                    {/* Authors / Members Box */}
                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-100 dark:border-slate-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Authors & Affiliations</h3>
                        <div className="space-y-4">
                            {/* Primary Author */}
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden">
                                    <img src={paper.user.photoURL} alt={paper.user.name} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                        {paper.user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Primary Author
                                    </p>
                                </div>
                            </div>


                            {/* Placeholder for future collaborators */}
                            {/* <div className="text-xs text-gray-400 italic">
                                No other collaborators listed.
                            </div> */}
                        </div>
                    </div>


                    {/* Stats or Extra Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase">Paper Stats</h3>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex justify-between">
                                <span>Views</span>
                                <span className="font-medium text-gray-900 dark:text-white">--</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Citations</span>
                                <span className="font-medium text-gray-900 dark:text-white">--</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Format</span>
                                <span className="font-medium text-gray-900 dark:text-white">PDF</span>
                            </li>
                        </ul>
                    </div>
                </div>


            </div>
        </div>
    );
};


export default PaperDetails;



