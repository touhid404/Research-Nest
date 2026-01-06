import React from 'react';
import { motion } from 'framer-motion';
import {
    FaRocket,
    FaBrain,
    FaVideo,
    FaFileAlt,
    FaCommentDots,
} from 'react-icons/fa';

const BentoCard = ({ colSpan = "", rowSpan = "", bg = "bg-slate-100 dark:bg-slate-800", title, desc, icon, children }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className={`
      ${colSpan} ${rowSpan}
      relative overflow-hidden rounded-2xl p-6
      ${bg}
      group cursor-pointer
      border border-transparent hover:border-slate-200 dark:hover:border-slate-700
      shadow-sm hover:shadow-lg
      transition-all duration-300
    `}
    >
        <div className="relative z-10 flex flex-col h-full">
            <div className="mb-3 p-2 bg-white/50 dark:bg-slate-950/30 rounded-lg w-fit backdrop-blur-sm">{icon}</div>
            <h3 className="text-lg font-bold mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-sm">{desc}</p>
        </div>
        {children}
    </motion.div>
);

const BentoGrid = () => {
    return (
        <section id="features" className="py-20 px-6">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Your research ecosystem, <span className="text-violet-600 dark:text-violet-400">Reimagined</span>.</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Everything you need, from funding to publication.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">

                    {/* Large Card: Collab Space */}
                    <BentoCard
                        colSpan="md:col-span-2"
                        bg="bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-violet-900/40 dark:to-indigo-900/20"
                        title="Collab Space"
                        desc="A dedicated workspace for your team. Create and edit documents in real-time, manage tasks with Kanban boards, and host video meetings without leaving the platform."
                        icon={<FaVideo className="text-2xl text-violet-600 dark:text-violet-300" />}
                    >
                        <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-white dark:bg-slate-800 rounded-tl-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-700 transform translate-x-8 translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform">
                            {/* UI Mockup for Video Call / Chat */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800" />)}
                                </div>
                                <div className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full animate-pulse">Live</div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-1.5 w-3/4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Tall Card: Proposals Feed */}
                    <BentoCard
                        colSpan="md:col-span-1"
                        rowSpan="md:row-span-2"
                        bg="bg-gradient-to-b from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/30 dark:to-pink-900/10"
                        title="Proposals Feed"
                        desc="Access a curated feed of research proposals. Filter by domain, funding status, or institution to find your next break."
                        icon={<FaRocket className="text-2xl text-fuchsia-600 dark:text-fuchsia-300" />}
                    >
                        <div className="absolute inset-x-0 bottom-0 h-1/2 p-4 space-y-3">
                            {/* Mockup Cards */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-md border border-fuchsia-100 dark:border-slate-700"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/50" />
                                    <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                                <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded-md" />
                            </motion.div>
                        </div>
                    </BentoCard>

                    {/* Regular Card: AI Features */}
                    <BentoCard
                        title="AI Power"
                        desc="Leverage our advanced AI to auto-summarize papers, suggest collaborators, and draft grants."
                        icon={<FaBrain className="text-2xl text-cyan-600 dark:text-cyan-300" />}
                        bg="bg-cyan-50 dark:bg-cyan-900/10"
                    />

                    {/* Regular Card: Public Paper Feed */}
                    <BentoCard
                        title="Paper Feed"
                        desc="Stay ahead with a personalized feed of the latest academic papers and journals."
                        icon={<FaFileAlt className="text-2xl text-emerald-600 dark:text-emerald-300" />}
                        bg="bg-emerald-50 dark:bg-emerald-900/10"
                    />

                    {/* Wide Card: Chat & Profile */}
                    <BentoCard
                        colSpan="md:col-span-3"
                        title="Communication"
                        desc="Connect instantly with peers. Create group chats for your lab, direct message collaborators, and showcase your academic portfolio."
                        icon={<FaCommentDots className="text-2xl text-rose-600 dark:text-rose-300" />}
                        bg="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex gap-4 opacity-50 group-hover:opacity-100 transition-opacity scale-90">
                            {/* Chat Bubbles Animation */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-t-lg rounded-bl-lg shadow-md transform -rotate-6"
                            >
                                Hey team!
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-sm rounded-t-lg rounded-br-lg shadow-md transform rotate-6"
                            >
                                Nice! 👍
                            </motion.div>
                        </div>
                    </BentoCard>

                </div>
            </div>
        </section>
    );
};

export default BentoGrid;
