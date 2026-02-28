import { useState } from "react";
import { useSearchParams } from "react-router";
import { BiSearch, BiX, BiReset, BiLoaderAlt } from "react-icons/bi";
import { MdOutlineTune } from "react-icons/md";
import { HiCheck } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import { paperApi } from "../../lib/paperApi";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "relevance", label: "Relevance" },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1990;

const PaperRightSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [yearFrom, setYearFrom] = useState(searchParams.get("yearFrom") || "");
    const [yearTo, setYearTo] = useState(searchParams.get("yearTo") || "");

    const searchQuery = searchParams.get("q") || "";
    const selectedDomains = searchParams.get("domains")?.split(",").filter(Boolean) || [];
    const selectedSort = searchParams.get("sort") || "newest";
    const hasPdf = searchParams.get("hasPdf") === "true";
    const hasLink = searchParams.get("hasLink") === "true";

    const hasActiveFilters = searchQuery || selectedDomains.length > 0 || yearFrom || yearTo || hasPdf || hasLink || selectedSort !== "newest";

    const updateParam = (key, value) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            // reset page when filtering
            next.set("page", "1");
            if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
                next.delete(key);
            } else {
                next.set(key, Array.isArray(value) ? value.join(",") : value);
            }
            return next;
        });
    };

    const handleSearch = (e) => updateParam("q", e.target.value);

    const toggleDomain = (domain) => {
        const next = selectedDomains.includes(domain)
            ? selectedDomains.filter(d => d !== domain)
            : [...selectedDomains, domain];
        updateParam("domains", next);
    };

    const handleYearApply = () => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("page", "1");
            if (yearFrom) next.set("yearFrom", yearFrom);
            else next.delete("yearFrom");
            
            if (yearTo) next.set("yearTo", yearTo);
            else next.delete("yearTo");
            
            return next;
        });
    };

    const handleYearReset = () => {
        setYearFrom("");
        setYearTo("");
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("page", "1");
            next.delete("yearFrom");
            next.delete("yearTo");
            return next;
        });
    };

    const clearAll = () => {
        setYearFrom("");
        setYearTo("");
        setSearchParams({});
    };

    const { data: domainsData, isLoading: isLoadingDomains } = useQuery({
        queryKey: ["paper-domains"],
        queryFn: paperApi.getResearchDomains,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const domains = domainsData?.data || [];

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 border-l border-slate-200/60 dark:border-slate-800/60">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl">
                            <MdOutlineTune className="text-blue-600 dark:text-blue-400 text-base" />
                        </div>
                        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-[15px] tracking-tight">
                            Filter Papers
                        </h2>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="text-[11px] text-red-500 hover:text-red-600 font-semibold flex items-center gap-0.5 transition-colors"
                        >
                            <BiX size={13} /> Clear All
                        </button>
                    )}
                </div>

                {/* Search */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-0.5">Keywords</h4>
                    <div className="relative">
                        <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Title, authors, DOI..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-8 pr-3 py-2 text-[12px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                </section>

                {/* Year Range */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-0.5">Publication Year</h4>
                    <div className="flex gap-2 items-center mb-2.5">
                        <input
                            type="number"
                            min={MIN_YEAR}
                            max={CURRENT_YEAR}
                            placeholder="From"
                            value={yearFrom}
                            onChange={e => setYearFrom(e.target.value)}
                            className="w-full px-2 py-2 text-[12px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center shadow-sm"
                        />
                        <span className="text-slate-400 text-xs shrink-0">–</span>
                        <input
                            type="number"
                            min={MIN_YEAR}
                            max={CURRENT_YEAR}
                            placeholder="To"
                            value={yearTo}
                            onChange={e => setYearTo(e.target.value)}
                            className="w-full px-2 py-2 text-[12px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleYearApply}
                            className="flex-1 py-1.5 text-[11px] font-bold bg-black dark:bg-white text-white dark:text-black rounded-lg transition-all hover:opacity-80 active:scale-95 shadow-sm"
                        >
                            Apply
                        </button>
                        {(yearFrom || yearTo) && (
                            <button
                                onClick={handleYearReset}
                                className="px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:text-red-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                                title="Reset Year"
                            >
                                <BiReset size={14} />
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 px-1 text-center italic">
                        Same year in both for a single-year search.
                    </p>
                </section>

                {/* Sort By */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-0.5">Order By</h4>
                    <div className="space-y-1">
                        {SORT_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => updateParam("sort", opt.value === "newest" ? "" : opt.value)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-[12px] font-medium ${
                                    selectedSort === opt.value
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                                }`}
                            >
                                <span className="flex-1 text-left">{opt.label}</span>
                                {selectedSort === opt.value && <HiCheck className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Access */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-0.5">Availability</h4>
                    <div className="space-y-1">
                        <button
                            onClick={() => updateParam("hasPdf", hasPdf ? "" : "true")}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-[12px] font-medium ${
                                hasPdf
                                    ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100/50 dark:border-red-900/30 border"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-transparent"
                            }`}
                        >
                            <span className="flex-1 text-left flex items-center gap-2">
                                <span className="opacity-70">📄</span> Has PDF
                            </span>
                            {hasPdf && <HiCheck className="w-3.5 h-3.5 text-red-600" />}
                        </button>
                        <button
                            onClick={() => updateParam("hasLink", hasLink ? "" : "true")}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-[12px] font-medium ${
                                hasLink
                                    ? "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-100/50 dark:border-green-900/30 border"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-transparent"
                            }`}
                        >
                            <span className="flex-1 text-left flex items-center gap-2">
                                <span className="opacity-70">🔗</span> External Link
                            </span>
                            {hasLink && <HiCheck className="w-3.5 h-3.5 text-green-600" />}
                        </button>
                    </div>
                </section>

                {/* Domains */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm flex flex-col mb-4">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-0.5 flex items-center justify-between">
                        Domains
                        {selectedDomains.length > 0 && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{selectedDomains.length}</span>
                        )}
                    </h4>
                    <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {isLoadingDomains ? (
                            <div className="flex flex-col items-center py-6 gap-2 text-slate-400">
                                <BiLoaderAlt className="animate-spin" size={20} />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Loading...</span>
                            </div>
                        ) : domains.length > 0 ? (
                            domains.map(domain => (
                                <button
                                    key={domain}
                                    onClick={() => toggleDomain(domain)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-[12px] ${
                                        selectedDomains.includes(domain)
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900/50"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border border-transparent"
                                    }`}
                                >
                                    <span className="flex-1 text-left leading-tight truncate">{domain}</span>
                                    {selectedDomains.includes(domain) && <HiCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                </button>
                            ))
                        ) : (
                            <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] text-slate-400 font-medium italic px-4">No domains found in database.</p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>

    );
};


export default PaperRightSidebar;
