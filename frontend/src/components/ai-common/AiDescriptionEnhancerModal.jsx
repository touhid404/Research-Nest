import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiCheck, BiX, BiRefresh } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi";

const AiDescriptionEnhancerModal = ({
    isOpen,
    onClose,
    originalData = { title: "", researchTopic: "", description: "" },
    onApply,
    enhancedData,
    isLoading
}) => {
    const [selectedFields, setSelectedFields] = useState({
        title: true,
        researchTopic: true,
        description: true
    });

    // Reset selection when modal opens with new data
    useEffect(() => {
        if (isOpen && enhancedData) {
            setSelectedFields({
                title: !!enhancedData.suggestedTitle,
                researchTopic: !!enhancedData.suggestedTopic,
                description: !!enhancedData.enhancedDescription
            });
        }
    }, [isOpen, enhancedData]);

    if (!isOpen) return null;

    const handleApply = () => {
        const changes = {};
        if (selectedFields.title) changes.title = enhancedData.suggestedTitle;
        if (selectedFields.researchTopic) changes.researchTopic = enhancedData.suggestedTopic;
        if (selectedFields.description) changes.description = enhancedData.enhancedDescription;
        onApply(changes);
    };

    const toggleField = (field) => {
        setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const ComparisonCard = ({ label, original, suggested, field, icon: Icon }) => {
        if (!suggested && !original) return null;
        const isSelected = selectedFields[field];

        return (
            <div className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isSelected
                ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10"
                : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 opacity-80"
                }`}>
                <div className="flex items-center justify-between p-4 border-b border-inherit bg-inherit">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-500"}`}>
                            <Icon size={18} />
                        </div>
                        <h4 className="font-bold text-sm uppercase tracking-wider">{label}</h4>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{isSelected ? "Keep Enhancement" : "Skip"}</span>
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleField(field)}
                            className="checkbox checkbox-primary checkbox-sm rounded-md"
                        />
                    </label>
                </div>

                <div className="p-4 space-y-4">
                    {original && (
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Original</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-through decoration-red-400/50">
                                {original}
                            </p>
                        </div>
                    )}
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-500 uppercase">AI Suggested</span>
                        <p className={`text-sm leading-relaxed font-medium ${isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}>
                            {suggested || "No suggestion generated"}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <div className="modal modal-open bg-black/60 backdrop-blur-md z-[100]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="modal-box w-11/12 max-w-5xl bg-white dark:bg-slate-900 shadow-2xl rounded-[2rem] p-0 overflow-hidden border border-white/10"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 flex items-center justify-between text-white relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                    <HiSparkles className="text-2xl animate-pulse text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">AI Academic Architect</h3>
                                    <p className="text-blue-100 text-xs font-medium uppercase tracking-widest mt-0.5 opacity-80">Refining Research Methodology</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20 transition-all active:scale-90">
                            <BiX size={28} />
                        </button>

                        {/* Decorative blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />
                    </div>

                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                    <HiSparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-blue-500 animate-bounce" />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Synthesizing Improvements</h4>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                                        Our AI is analyzing academic standards to refine your research proposal...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6 h-full">
                                        <ComparisonCard
                                            label="Research Title"
                                            original={originalData.title}
                                            suggested={enhancedData?.suggestedTitle}
                                            field="title"
                                            icon={BiRefresh}
                                        />
                                        <ComparisonCard
                                            label="Research Domain"
                                            original={originalData.researchTopic}
                                            suggested={enhancedData?.suggestedTopic}
                                            field="researchTopic"
                                            icon={BiCheck}
                                        />
                                    </div>

                                    <div className="h-full">
                                        <ComparisonCard
                                            label="Abstract / Description"
                                            original={originalData.description}
                                            suggested={enhancedData?.enhancedDescription}
                                            field="description"
                                            icon={HiSparkles}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions - Keep fixed at bottom */}
                    {!isLoading && (
                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                {Object.values(selectedFields).filter(Boolean).length} Improvements selected
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="btn btn-ghost px-6 rounded-xl normal-case font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={isLoading || !Object.values(selectedFields).some(Boolean)}
                                    className="btn border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 rounded-xl normal-case font-black shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:grayscale"
                                >
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AiDescriptionEnhancerModal;
