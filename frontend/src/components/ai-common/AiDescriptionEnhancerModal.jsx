import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
            <div className={`relative rounded-3xl border transition-all duration-300 ${isSelected
                ? "border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm"
                : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 grayscale opacity-60"
                }`}>
                <div className="flex items-center justify-between p-5 border-b border-inherit">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-primary text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-500"}`}>
                            <Icon size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{label}</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isSelected}
                            onChange={() => toggleField(field)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="p-6 space-y-5">
                    {original && (
                        <div className="space-y-1.5 px-1">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Your Original</span>
                            <p className="text-sm text-gray-500 dark:text-gray-500 line-through leading-relaxed">
                                {original}
                            </p>
                        </div>
                    )}
                    <div className="space-y-1.5 px-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-primary" : "text-gray-400"}`}>AI Suggestion</span>
                            {isSelected && (
                                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                            )}
                        </div>
                        <p className={`text-sm leading-relaxed font-semibold ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                            {suggested || "Generating..."}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                                    <HiSparkles size={24} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">AI Content Enhancer</h3>
                                    <p className="text-sm text-gray-500 font-medium">Refine your research metadata with academic AI</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
                            >
                                <BiX size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <p className="mt-6 text-gray-900 dark:text-white font-bold text-lg">Synthesizing Improvements...</p>
                                    <p className="mt-2 text-gray-500 text-sm">Our AI is analyzing academic patterns</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-8">
                                        <ComparisonCard
                                            label="Research Title"
                                            original={originalData.title}
                                            suggested={enhancedData?.suggestedTitle}
                                            field="title"
                                            icon={BiRefresh}
                                        />
                                        <ComparisonCard
                                            label="Research Topic / Domain"
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
                            )}
                        </div>

                        {/* Footer */}
                        {!isLoading && (
                            <div className="p-8 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {Object.values(selectedFields).filter(Boolean).length} Improvements Active
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleApply}
                                        disabled={!Object.values(selectedFields).some(Boolean)}
                                        className="flex-1 sm:flex-none px-10 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                    >
                                        Apply Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;
    return createPortal(modalContent, document.body);
};

export default AiDescriptionEnhancerModal;
