import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
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
    FaPenNib,
    FaVideo,
    FaFileAlt,
    FaCommentDots,
    FaUserGraduate
} from 'react-icons/fa';

// --- Constants ---

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

    // High-quality Research/Tech Images from Unsplash
    const slides = [
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000", // Lab/Science
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000", // Collaboration/People
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000", // Data/Screen
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000"  // Future/VR
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section ref={ref} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 bg-white dark:bg-slate-950">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                {/* Tech Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="relative z-30 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
                {/* Left: Text Content */}
                <motion.div
                    style={{ y, opacity }}
                    className="text-left space-y-8"
                >
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-200 dark:border-white/10 backdrop-blur-md"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                            Research Nest 2.0
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white"
                    >
                        Accelerate Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600">
                            Discovery.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl font-medium leading-relaxed"
                    >
                        Connect with top researchers, manage your lab proposals, and unlock AI-powered insights. The platform designed for the modern scientist.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex flex-wrap gap-4 pt-2"
                    >
                        <Link to="/home/posts" className="btn-shine group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-transform flex items-center gap-2">
                            <FaRocket /> Join Now
                        </Link>
                        <button className="px-8 py-4 rounded-2xl border border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-semibold flex items-center gap-2">
                            Explore Papers
                        </button>
                    </motion.div>

                    {/* Mini Stats */}
                    <div className="pt-8 flex items-center gap-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p>Trusted by 10,000+ Researchers</p>
                    </div>
                </motion.div>

                {/* Right: Innovative 3D Slider */}
                <div className="relative h-[600px] w-full flex items-center justify-center perspective-[1000px] hidden lg:flex">
                    <AnimatePresence mode="popLayout">
                        {slides.map((slide, index) => {
                            // Only render current, prev, next for performance if list is huge,
                            // but here we just render the active one with a cool transition
                            if (index !== currentSlide) return null;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, rotateY: -30, x: 100, scale: 0.8 }}
                                    animate={{ opacity: 1, rotateY: -6, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, rotateY: 20, x: -100, scale: 0.8 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    className="absolute w-[80%] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                                    style={{
                                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                                    }}
                                >
                                    <img
                                        src={slide}
                                        alt="Research"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Glass Overlay Card inside the image */}
                                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                                <FaGlobeAmericas size={20} />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-bold">Global Connection</p>
                                                <p className="text-slate-300 text-xs">Real-time collaboration across borders</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Decorative Elements behind slider */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-dashed border-slate-300 dark:border-slate-700 rounded-full animate-spin-slow pointer-events-none -z-10 opacity-30"></div>
                </div>
            </div>
        </section>
    );
};

const LogoMarquee = () => {
    return (
        <section className="py-10 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
            <div className="flex gap-16 animate-marquee whitespace-nowrap opacity-50 dark:opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                {[...Array(2)].map((_, i) => (
                    <React.Fragment key={i}>
                        <span className="text-2xl font-bold mx-8">PROPOSALS</span>
                        <span className="text-2xl font-bold mx-8">COLLABORATION</span>
                        <span className="text-2xl font-bold mx-8">AI INSIGHTS</span>
                        <span className="text-2xl font-bold mx-8">PUBLICATION</span>
                        <span className="text-2xl font-bold mx-8">NETWORKING</span>
                        <span className="text-2xl font-bold mx-8">RESEARCH GROUPS</span>
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
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Your research ecosystem, <span className="text-violet-600 dark:text-violet-400">Reimagined</span>.</h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400">
                        From funding proposals to final publication, we've got you covered.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                    {/* Large Card: Collab Space */}
                    <BentoCard
                        colSpan="md:col-span-2"
                        bg="bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-violet-900/40 dark:to-indigo-900/20"
                        title="Collab Space"
                        desc="A unified workspace with real-time docs, task lists, video calls, and screen sharing."
                        icon={<FaVideo className="text-4xl text-violet-600 dark:text-violet-300" />}
                    >
                        <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-white dark:bg-slate-800 rounded-tl-3xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700 transform translate-x-10 translate-y-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform">
                            {/* UI Mockup for Video Call / Chat */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800" />)}
                                </div>
                                <div className="px-3 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">Live</div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Tall Card: Proposals Feed */}
                    <BentoCard
                        colSpan="md:col-span-1"
                        rowSpan="md:row-span-2"
                        bg="bg-gradient-to-b from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/30 dark:to-pink-900/10"
                        title="Proposals Feed"
                        desc="Discover trending research. Create proposals, request to join teams, and manage applications."
                        icon={<FaRocket className="text-4xl text-fuchsia-600 dark:text-fuchsia-300" />}
                    >
                        <div className="absolute inset-x-0 bottom-0 h-1/2 p-6 space-y-4">
                            {/* Mockup Cards */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-fuchsia-100 dark:border-slate-700"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/50" />
                                    <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                                <div className="h-16 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                            </motion.div>
                        </div>
                    </BentoCard>

                    {/* Regular Card: AI Features */}
                    <BentoCard
                        title="AI Power"
                        desc="Auto-summarize papers, get proposal suggestions, and find smart collaborator matches."
                        icon={<FaBrain className="text-3xl text-cyan-600 dark:text-cyan-300" />}
                        bg="bg-cyan-50 dark:bg-cyan-900/10"
                    />

                    {/* Regular Card: Public Paper Feed */}
                    <BentoCard
                        title="Paper Feed"
                        desc="Browse essential papers sorted by keywords, category, or author."
                        icon={<FaFileAlt className="text-3xl text-emerald-600 dark:text-emerald-300" />}
                        bg="bg-emerald-50 dark:bg-emerald-900/10"
                    />

                    {/* Wide Card: Chat & Profile */}
                    <BentoCard
                        colSpan="md:col-span-3"
                        title="Communication & Profile"
                        desc="Real-time group chats for your lab. Build a rich profile with skills and portfolio."
                        icon={<FaCommentDots className="text-4xl text-rose-600 dark:text-rose-300" />}
                        bg="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            {/* Chat Bubbles Animation */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-t-xl rounded-bl-xl shadow-lg transform -rotate-6"
                            >
                                Hey team!
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-t-xl rounded-br-xl shadow-lg transform rotate-6"
                            >
                                Files attached 📎
                            </motion.div>
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

const CTASection = () => {
    return (
        <section className="py-32 px-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-50/50 dark:to-violet-900/20 pointer-events-none" />
            <div className="max-w-3xl mx-auto relative z-10 space-y-8">
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                    Start your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Research Journey.</span>
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400">
                    Join thousands of researchers building the future with AI and Collaboration.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/home" className="btn-shine px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg shadow-2xl hover:scale-105 transition-transform">
                        Create Free Account
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

export default LandingPage;