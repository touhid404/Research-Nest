import React from 'react';
import { motion } from 'framer-motion';

const Step = ({ number, title, desc }) => (
    <div className="flex gap-6 group">
        <span className="text-2xl font-mono text-slate-600 dark:text-slate-500 group-hover:text-cyan-400 transition-colors">{number}</span>
        <div>
            <h4 className="text-xl font-bold mb-1">{title}</h4>
            <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{desc}</p>
        </div>
    </div>
);

const StickyShowcase = () => {
    return (
        <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Your Journey</h3>
                    <h2 className="text-4xl md:text-5xl font-bold">From Idea to <br /> Impact.</h2>
                    <div className="space-y-8">
                        <Step number="01" title="Build Profile" desc="Showcase your education, skills, and portfolio." />
                        <Step number="02" title="Find Team" desc="Browse the Proposals Feed and request to join projects." />
                        <Step number="03" title="Collaborate" desc="Use the Collab Space for docs, tasks, and video calls." />
                    </div>
                </div>
                <div className="flex-1">
                    <motion.div
                        whileHover={{ scale: 1.02, rotate: -1 }}
                        className="aspect-square rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 shadow-2xl relative overflow-hidden group"
                    >
                        {/* Interactive Abstract UI */}
                        <div className="absolute top-8 left-8 right-8 bottom-0 bg-slate-950 rounded-t-2xl shadow-inner p-6 border-t border-slate-800 transition-all group-hover:top-6">
                            <div className="flex justify-between mb-6">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <div className="text-xs text-slate-500">research-nest-app</div>
                            </div>

                            {/* Simulated Stack/Dashboard */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-4 rounded-lg h-32 animate-pulse"></div>
                                <div className="bg-slate-800/50 p-4 rounded-lg h-32 animate-pulse delay-75"></div>
                                <div className="bg-slate-800/50 p-4 rounded-lg h-32 col-span-2 animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default StickyShowcase;
