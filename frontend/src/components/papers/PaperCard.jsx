import { useNavigate } from "react-router";
import { BiCalendar } from "react-icons/bi";
import { MdOutlineSchool } from "react-icons/md";

const PaperCard = ({ paper }) => {
    const navigate = useNavigate();
    const { user, title, abstract, researchDomain, tags, createdAt, _id } = paper;

    const coAuthorsList = paper.coAuthors
        ? (Array.isArray(paper.coAuthors) ? paper.coAuthors : paper.coAuthors.split(',').map(s => s.trim()))
        : [];

    const allAuthors = [user?.name, ...coAuthorsList].filter(Boolean);

    const publicationYear = paper.publicationDate
        ? new Date(paper.publicationDate).getFullYear()
        : new Date(createdAt).getFullYear();

    const handleCardClick = () => {
        navigate(`/home/paper-hub/paper/${_id}`);
    };

    const stopProp = (e) => e.stopPropagation();

    return (
        <div
            onClick={handleCardClick}
            className="border-b border-gray-100 dark:border-slate-800/60 py-4 md:py-5 px-3 md:px-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group relative cursor-pointer"
        >
            {/* Top row: domain + year + delete */}
            <div className="flex items-center gap-2 mb-2 flex-wrap min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40 shrink-0">
                    <MdOutlineSchool size={10} />
                    {researchDomain || "Research"}
                </span>
                {paper.paperType && (
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tight shrink-0">
                        {paper.paperType}
                    </span>
                )}
                {paper.publicationName && (
                    <span className="text-[10px] md:text-[11px] text-gray-400 dark:text-gray-500 italic truncate max-w-[120px] sm:max-w-[200px]">
                        {paper.publicationName}
                    </span>
                )}
                <div className="ml-auto flex items-center gap-2 shrink-0">
                    {paper.status === "archived" && (
                        <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            Hidden
                        </span>
                    )}
                    <span className="text-[10px] md:text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <BiCalendar size={11} />
                        {publicationYear}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-[14px] md:text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 leading-snug mb-1.5 transition-colors line-clamp-2">
                {title}
            </h3>

            {/* Authors */}
            <div className="flex items-center gap-1 mb-2 flex-wrap min-w-0">
                {allAuthors.map((name, i) => (
                    <span key={i} className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {name}{i < allAuthors.length - 1 ? "," : ""}
                    </span>
                ))}
                {paper.doi && (
                    <div className="flex items-center">
                        <span className="text-gray-300 dark:text-slate-700 mx-1 text-xs sm:inline hidden">·</span>
                        <a
                            href={`https://doi.org/${paper.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stopProp}
                            className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 font-mono transition-colors truncate max-w-[150px] sm:max-w-none"
                        >
                            {paper.doi}
                        </a>
                    </div>
                )}
            </div>

            {/* Abstract snippet */}
            <p className="text-[12px] md:text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 md:line-clamp-3 mb-3">
                {abstract}
            </p>

            {/* Footer: tags */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex flex-wrap gap-1.5">
                    {tags && tags.length > 0 && tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800/40"
                        >
                            #{tag.toLowerCase()}
                        </span>
                    ))}
                    {tags && tags.length > 3 && (
                        <span className="text-[9px] text-gray-400">+{tags.length - 3}</span>
                    )}
                </div>
            </div>



        </div>
    );
};

export default PaperCard;
