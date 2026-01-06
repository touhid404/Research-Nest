import React, { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import HeroContent from './HeroContent';
import HeroVisuals from './HeroVisuals';

const HeroSection = () => {
    const ref = useRef(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 bg-white dark:bg-slate-950">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                {/* Tech Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="relative z-30 lg:mx-12 px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
                {/* Left: Text Content */}
                <HeroContent y={y} opacity={opacity} />

                {/* Right: Visual Content */}
                <HeroVisuals />
            </div>
        </section>
    );
};

export default HeroSection;