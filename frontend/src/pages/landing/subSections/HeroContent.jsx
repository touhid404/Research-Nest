import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { FaRocket, FaArrowRight } from 'react-icons/fa';

const HeroContent = ({ y, opacity }) => {
    return (
        <motion.div
            style={{ y, opacity }}
            className="text-left space-y-8 relative z-10"
        >
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-200 dark:border-white/10 backdrop-blur-md"
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                    The Future of Research
                </span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white"
            >
                Research
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 animate-gradient-x">
                    Redefined.
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg font-medium leading-relaxed"
            >
                Connect with global minds, streamline proposals, and accelerate discovery with our AI-powered ecosystem.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-wrap gap-4 pt-4"
            >
                <Link to="/home/posts" className="btn-shine group relative px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                    <FaRocket /> Start Exploring
                </Link>
            </motion.div>

            {/* Trust badge or extra info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="pt-8 flex items-center gap-4 text-sm text-slate-500 font-medium"
            >
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }} />
                    ))}
                </div>
                <div>Trusted by 2,000+ Researchers</div>
            </motion.div>

        </motion.div>
    );
};

export default HeroContent;
