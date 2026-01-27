import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagic, FaFileUpload, FaTimes, FaListUl, FaCheckSquare, FaLightbulb, FaSpinner } from 'react-icons/fa';
import { aiApi } from '../../lib/aiApi';
import toast from 'react-hot-toast';

const MeetingSummaryPanel = ({ isOpen, onClose, conversationId }) => {
    const [summaryData, setSummaryData] = useState(null);
    const [inputFile, setInputFile] = useState(null);

    const { mutate: generateSummary, isPending } = useMutation({
        mutationFn: async (payload) => {
            return await aiApi.summarizeMeeting(payload);
        },
        onSuccess: (data) => {
            if (data.success) {
                setSummaryData(data.data);
                toast.success("Summary generated!");
            } else {
                toast.error(data.message || "Failed to generate summary");
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    });

    const handleSummarizeCurrent = () => {
        if (!conversationId) return toast.error("No conversation selected");
        generateSummary({ sourceType: 'chat', content: conversationId });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            generateSummary({ sourceType: 'text', content: text });
        };
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-base-100 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-base-300"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                                <FaMagic />
                            </div>
                            <h2 className="text-xl font-bold">AI Meeting Summary</h2>
                        </div>
                        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-base-100">
                        {!summaryData && !isPending && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                <div className="max-w-md space-y-2">
                                    <h3 className="text-2xl font-bold text-base-content">Ready to Summarize?</h3>
                                    <p className="text-base-content/60">Generate concise summaries, action items, and key decisions from your chat history or uploaded logs.</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleSummarizeCurrent}
                                        className="btn btn-primary btn-lg gap-3 shadow-lg shadow-primary/20"
                                    >
                                        <FaMagic /> Summarize This Conversation
                                    </button>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".txt,.md,.json"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="btn btn-outline btn-lg gap-3 cursor-pointer"
                                        >
                                            <FaFileUpload /> Upload Text File
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isPending && (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <FaSpinner className="animate-spin text-4xl text-primary" />
                                <p className="text-lg font-medium animate-pulse">Analyzing conversation...</p>
                                <div className="w-64 flex flex-col gap-2">
                                    <div className="h-2 w-full bg-base-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary animate-progress w-full origin-left"></div>
                                    </div>
                                    <p className="text-xs text-center text-base-content/50">This may take a few moments</p>
                                </div>
                            </div>
                        )}

                        {summaryData && !isPending && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Summary Section */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4 text-primary">
                                        <FaListUl className="text-xl" />
                                        <h3 className="text-lg font-bold uppercase tracking-wider">Executive Summary</h3>
                                    </div>
                                    <div className="bg-base-200/50 rounded-xl p-6 border border-base-200">
                                        <ul className="space-y-3">
                                            {summaryData.summary?.map((point, index) => (
                                                <li key={index} className="flex gap-3 text-base-content/80">
                                                    <span className="text-primary mt-1.5">•</span>
                                                    <span className="leading-relaxed">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Action Items */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4 text-emerald-600">
                                            <FaCheckSquare className="text-xl" />
                                            <h3 className="text-lg font-bold uppercase tracking-wider">Action Items</h3>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl overflow-hidden border border-emerald-100 dark:border-emerald-900/30">
                                            <table className="table w-full">
                                                <thead className="bg-emerald-100/50 dark:bg-emerald-900/30">
                                                    <tr>
                                                        <th className="text-emerald-700 dark:text-emerald-400">Owner</th>
                                                        <th className="text-emerald-700 dark:text-emerald-400">Task</th>
                                                        <th className="text-emerald-700 dark:text-emerald-400 text-right">Due</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {summaryData.actionItems?.map((item, index) => (
                                                        <tr key={index} className="border-b border-emerald-100 dark:border-emerald-900/30 last:border-0 hover:bg-emerald-100/30 dark:hover:bg-emerald-900/20 transition-colors">
                                                            <td className="font-semibold text-emerald-900 dark:text-emerald-200 whitespace-nowrap">{item.who || "Unassigned"}</td>
                                                            <td className="text-emerald-800 dark:text-emerald-300">{item.action}</td>
                                                            <td className="text-right text-xs opacity-70 font-mono text-emerald-900 dark:text-emerald-200">{item.due || "-"}</td>
                                                        </tr>
                                                    ))}
                                                    {(!summaryData.actionItems || summaryData.actionItems.length === 0) && (
                                                        <tr>
                                                            <td colSpan="3" className="text-center py-4 text-emerald-600/60 italic">No explicit action items detected</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* Decisions */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4 text-amber-600">
                                            <FaLightbulb className="text-xl" />
                                            <h3 className="text-lg font-bold uppercase tracking-wider">Key Decisions</h3>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30 h-full">
                                            <div className="flex flex-wrap gap-2">
                                                {summaryData.decisions?.map((decision, index) => (
                                                    <div key={index} className="badge badge-lg badge-outline gap-2 p-4 h-auto text-left items-start border-amber-200 bg-amber-100/50 text-amber-900 dark:text-amber-200 dark:border-amber-800 dark:bg-amber-900/30">
                                                        <FaCheckSquare className="mt-1 flex-shrink-0 text-amber-500" />
                                                        <span className="text-sm leading-snug">{decision}</span>
                                                    </div>
                                                ))}
                                                {(!summaryData.decisions || summaryData.decisions.length === 0) && (
                                                    <p className="text-amber-600/60 italic w-full text-center py-4">No key decisions detected</p>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {summaryData && (
                        <div className="p-4 border-t border-base-200 bg-base-200/30 flex justify-end gap-2">
                            <button
                                onClick={() => setSummaryData(null)}
                                className="btn btn-ghost"
                            >
                                Start Over
                            </button>
                            <button
                                onClick={onClose}
                                className="btn btn-primary"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MeetingSummaryPanel;
