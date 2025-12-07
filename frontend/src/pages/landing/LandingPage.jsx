import React, { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
    FaRocket,
    FaUsers,
    FaBrain,
    FaLock,
    FaGlobeAmericas,
    FaArrowRight,
    FaPlay,
    FaBolt,
    FaSearch,
    FaPenNib
} from 'react-icons/fa';

// --- Constants ---
// Video: Abstract "Liquid" Ink/Smoke - High contrast for both modes
const HERO_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-2055-large.mp4";

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="relative w-full overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 origin-left z-[60]"
                style={{ scaleX }}
            />

            {/* --- HERO SECTION --- */}
            <HeroSection />

            {/* --- MARQUEE SECTION --- */}
            <LogoMarquee />

            {/* --- BENTO GRID FEATURES --- */}
            <BentoGrid />

            {/* --- INTERACTIVE SHOWCASE --- */}
            <StickyShowcase />

            {/* --- CTA --- */}
            <CTASection />

        </div>
    );
};

// --- SECTIONS ---

const HeroSection = () => {
    const ref = useRef(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/80 z-10 backdrop-blur-[2px]" />
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover grayscale-[20%] opacity-80 dark:opacity-40"
                >
                    <source src={HERO_VIDEO_URL} type="video/mp4" />
                </video>
                {/* Gradient Overlay for aesthetic fade */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950 z-20" />
            </div>

            <motion.div
                style={{ y, opacity }}
                className="relative z-30 max-w-7xl mx-auto px-6 text-center space-y-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-sm mb-4">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                        v2.0 is Live
                    </span>
                </div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]"
                >
                    Research at <br />
                    <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
                        Light Speed.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium"
                >
                    The all-in-one workspace where aesthetics meet intelligence.
                    Manage, analyze, and publish with <span className="italic text-slate-900 dark:text-white">unmatched style</span>.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                    <Link to="/home" className="btn-shine group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-105 transition-all">
                        <span className="relative z-10 flex items-center gap-2">
                            Start Creating <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                    <button className="px-8 py-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-md font-bold hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all flex items-center gap-2">
                        <FaPlay className="text-xs" /> Demo Video
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
};

const LogoMarquee = () => {
    return (
        <section className="py-10 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
            <div className="flex gap-16 animate-marquee whitespace-nowrap opacity-50 dark:opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                {[...Array(2)].map((_, i) => (
                    <React.Fragment key={i}>
                        <span className="text-2xl font-bold mx-8">MIT</span>
                        <span className="text-2xl font-bold mx-8">STANFORD</span>
                        <span className="text-2xl font-bold mx-8">HARVARD</span>
                        <span className="text-2xl font-bold mx-8">OXFORD</span>
                        <span className="text-2xl font-bold mx-8">GOOGLE SCHOLAR</span>
                        <span className="text-2xl font-bold mx-8">NATURE</span>
                        <span className="text-2xl font-bold mx-8">IEEE</span>
                    </React.Fragment>
                ))}
            </div>
        </section>
    )
}

const BentoGrid = () => {
    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Designed for the <span className="text-violet-600 dark:text-violet-400">Bold</span>.</h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400">
                        A grid of powerful tools, meticulously crafted to accelerate your workflow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                    {/* Large Card */}
                    <BentoCard
                        colSpan="md:col-span-2"
                        bg="bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-violet-900/40 dark:to-indigo-900/20"
                        title="AI Co-Pilot"
                        desc="Reads 100 papers in seconds. Summarizes, extracts, and connects the dots."
                        icon={<FaBrain className="text-4xl text-violet-600 dark:text-violet-300" />}
                    >
                        <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-white dark:bg-slate-800 rounded-tl-3xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700 transform translate-x-10 translate-y-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform">
                            <div className="space-y-3">
                                <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                                <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-600 rounded"></div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
                                <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-600 rounded"></div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Tall Card */}
                    <BentoCard
                        colSpan="md:col-span-1"
                        rowSpan="md:row-span-2"
                        bg="bg-gradient-to-b from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/30 dark:to-pink-900/10"
                        title="Global Sync"
                        desc="Real-time cursors. Live comments. It feels like you're in the same room."
                        icon={<FaUsers className="text-4xl text-fuchsia-600 dark:text-fuchsia-300" />}
                    >
                        <div className="absolute inset-x-0 bottom-0 h-1/2 flex justify-center items-end pb-8">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg`} />
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    {/* Regular Card */}
                    <BentoCard
                        title="Smart Search"
                        desc="Find that one citation from 3 years ago instantly."
                        icon={<FaSearch className="text-3xl text-cyan-600 dark:text-cyan-300" />}
                        bg="bg-cyan-50 dark:bg-cyan-900/10"
                    />

                    {/* Regular Card */}
                    <BentoCard
                        title="Secure Vault"
                        desc="Bank-grade encryption for your IP."
                        icon={<FaLock className="text-3xl text-emerald-600 dark:text-emerald-300" />}
                        bg="bg-emerald-50 dark:bg-emerald-900/10"
                    />

                    {/* Wide Card */}
                    <BentoCard
                        colSpan="md:col-span-3"
                        title="Publication Ready"
                        desc="Auto-format to IEEE, APA, or MLA with one click. Export to PDF or LaTeX."
                        icon={<FaPenNib className="text-4xl text-rose-600 dark:text-rose-300" />}
                        bg="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="w-24 h-32 bg-white dark:bg-slate-800 shadow-lg rounded border dark:border-slate-700 rotate-[-6deg]"></div>
                            <div className="w-24 h-32 bg-white dark:bg-slate-800 shadow-lg rounded border dark:border-slate-700 rotate-[3deg] z-10"></div>
                            <div className="w-24 h-32 bg-white dark:bg-slate-800 shadow-lg rounded border dark:border-slate-700 rotate-[12deg]"></div>
                        </div>
                    </BentoCard>

                </div>
            </div>
        </section>
    );
};

const StickyShowcase = () => {
    return (
        <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Workflow</h3>
                    <h2 className="text-4xl md:text-5xl font-bold">From Chaos to <br /> Clarity.</h2>
                    <div className="space-y-8">
                        <Step number="01" title="Collect" desc="Gather papers, datasets, and notes in one dropzone." />
                        <Step number="02" title="Connect" desc="Let AI build the knowledge graph for you." />
                        <Step number="03" title="Create" desc="Write with distraction-free tools and smart citations." />
                    </div>
                </div>
                <div className="flex-1">
                    <motion.div
                        whileHover={{ scale: 1.02, rotate: -1 }}
                        className="aspect-square rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 shadow-2xl relative overflow-hidden"
                    >
                        {/* Abstract UI representation */}
                        <div className="absolute top-8 left-8 right-8 bottom-0 bg-slate-900 rounded-t-2xl shadow-inner p-6">
                            <div className="flex gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-32 w-full bg-slate-800 rounded-lg animate-pulse"></div>
                                <div className="flex gap-4">
                                    <div className="h-20 w-1/3 bg-slate-800 rounded-lg"></div>
                                    <div className="h-20 w-2/3 bg-slate-800 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const CTASection = () => {
    return (
        <section className="py-32 px-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-50/50 dark:to-violet-900/20 pointer-events-none" />
            <div className="max-w-3xl mx-auto relative z-10 space-y-8">
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                    Start your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Masterpiece.</span>
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400">
                    Join 10,000+ researchers building the future, today.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/home" className="btn-shine px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg shadow-2xl hover:scale-105 transition-transform">
                        Get Started Free
                    </Link>
                </div>
            </div>
        </section>
    )
}

// --- SUBCOMPONENTS ---

const BentoCard = ({ colSpan = "", rowSpan = "", bg = "bg-slate-100 dark:bg-slate-800", title, desc, icon, children }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`
      ${colSpan} ${rowSpan}
      relative overflow-hidden rounded-3xl p-8 
      ${bg}
      group cursor-pointer
      border border-transparent hover:border-slate-200 dark:hover:border-slate-700
      transition-all duration-300
    `}
    >
        <div className="relative z-10 flex flex-col h-full">
            <div className="mb-4">{icon}</div>
            <h3 className="text-2xl font-bold mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-sm">{desc}</p>
        </div>
        {children}
    </motion.div>
);

const Step = ({ number, title, desc }) => (
    <div className="flex gap-6 group">
        <span className="text-2xl font-mono text-slate-600 dark:text-slate-500 group-hover:text-cyan-400 transition-colors">{number}</span>
        <div>
            <h4 className="text-xl font-bold mb-1">{title}</h4>
            <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{desc}</p>
        </div>
    </div>
);

// Add custom keyframes for marquee in index.css if not present, 
// but for now we rely on a utility class or simple style
// .animate-marquee { animation: marquee 25s linear infinite; }

export default LandingPage;