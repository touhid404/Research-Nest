import { useScroll, useSpring, motion } from 'framer-motion';

import HeroSection from './subSections/HeroSection';
import LogoMarquee from './subSections/LogoMarquee';
import BentoGrid from './subSections/BentoGrid';
import StickyShowcase from './subSections/StickyShowcase';
import ReviewSection from './subSections/ReviewSection';
import Footer from './subSections/Footer';

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="relative w-full overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">

            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 origin-left z-[60]"
                style={{ scaleX }}
            />

            <HeroSection />

            {/* --- MARQUEE SECTION --- */}
            <LogoMarquee />

            <BentoGrid />

            <StickyShowcase />

            <ReviewSection />


            <Footer />

        </div>
    );
};

export default LandingPage;