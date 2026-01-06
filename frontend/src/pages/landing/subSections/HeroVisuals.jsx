import React from 'react';
import { motion } from 'framer-motion';
import { FaGlobeAmericas, FaAtom, FaDna, FaMicrochip, FaRocket } from 'react-icons/fa';

const HeroVisuals = () => {
    return (
        <div className="relative h-[600px] w-full hidden lg:flex items-center justify-center perspective-[2000px]">
            {/* Main Central Visual */}
            <motion.div
                initial={{ rotateX: 20, rotateY: -20, rotateZ: 5, scale: 0.9 }}
                animate={{
                    rotateX: [20, 10, 20],
                    rotateY: [-20, -10, -20],
                    y: [0, -20, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[400px] h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] border border-slate-700 shadow-2xl p-6 flex flex-col justify-between z-20 group"
            >
                {/* Mock UI Header */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                </div>

                {/* Mock Content */}
                <div className="space-y-4 pt-4">
                    <div className="h-32 rounded-2xl bg-slate-800/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20" />
                        <div className="absolute bottom-4 left-4 p-2 bg-slate-900/80 backdrop-blur rounded-lg">
                            <FaAtom className="text-violet-400 text-2xl" />
                        </div>
                    </div>
                    <div className="h-4 w-3/4 bg-slate-700 rounded-full" />
                    <div className="h-4 w-1/2 bg-slate-700 rounded-full" />

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="h-24 rounded-2xl bg-cyan-900/20 border border-cyan-800/30 p-4">
                            <FaMicrochip className="text-cyan-400 text-xl mb-2" />
                            <div className="h-2 w-12 bg-cyan-700/50 rounded-full" />
                        </div>
                        <div className="h-24 rounded-2xl bg-fuchsia-900/20 border border-fuchsia-800/30 p-4">
                            <FaDna className="text-fuchsia-400 text-xl mb-2" />
                            <div className="h-2 w-12 bg-fuchsia-700/50 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Collaborators</span>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-600 border border-slate-800" />)}
                        </div>
                    </div>
                </div>

                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[40px] pointer-events-none" />
            </motion.div>

            {/* Floating Elements */}
            <FloatingCard
                delay={0}
                x={-200}
                y={-100}
                rotate={-15}
                icon={<FaGlobeAmericas className="text-3xl text-blue-400" />}
                label="Global Reach"
                value="150+ Countries"
                color="bg-slate-800"
            />
            <FloatingCard
                delay={1.5}
                x={180}
                y={150}
                rotate={10}
                icon={<div className="text-xl font-bold text-emerald-400">98%</div>}
                label="Success Rate"
                value="Funding Secured"
                color="bg-slate-900"
            />
            <FloatingCard
                delay={2.5}
                x={150}
                y={-150}
                rotate={12}
                icon={<FaRocket className="text-2xl text-orange-400" />}
                label="Active Projects"
                value="12k+ Ongoing"
                color="bg-slate-800"
            />

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
        </div>
    );
};

const FloatingCard = ({ delay, x, y, rotate, icon, label, value, color }) => (
    <motion.div
        initial={{ opacity: 0, y: y + 50 }}
        animate={{ opacity: 1, y, rotate }}
        transition={{ delay, duration: 1, type: "spring" }}
        className={`absolute top-1/2 left-1/2 w-48 p-4 rounded-2xl ${color} border border-slate-700 shadow-xl backdrop-blur-md flex items-center gap-4 z-10`}
        style={{ translateX: x, translateY: y }}
    >
        <div className="p-3 bg-white/5 rounded-xl">
            {icon}
        </div>
        <div>
            <div className="text-xs text-slate-400 font-medium">{label}</div>
            <div className="text-sm font-bold text-white">{value}</div>
        </div>
    </motion.div>
);

export default HeroVisuals;
