import React from 'react';

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

export default LogoMarquee;
