import { FaStar } from "react-icons/fa";

const ReviewCard = ({ name, role, quote, image, stars }) => (
    <div className="w-[350px] h-[220px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-xl relative mx-3 flex flex-col shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`text-xs ${i < stars ? 'text-amber-400' : 'text-slate-200'}`} />
                ))}
            </div>
        </div>

        <p className="text-slate-700 dark:text-slate-300 mb-6 text-sm leading-relaxed flex-grow">
            "{quote}"
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
            <img src={image} alt={name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{name}</h4>
                <p className="text-[10px] text-slate-500 font-medium">{role}</p>
            </div>
        </div>
    </div>
);

const ReviewSection = () => {
    const reviews = [
        {
            name: "Dr. Sarah Chen",
            role: "AI Researcher @ MIT",
            quote: "Research Nest has completely transformed how our lab collaborates. The proposal tools are a game-changer.",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
            stars: 5,
        },
        {
            name: "James Wilson",
            role: "PhD Candidate @ Stanford",
            quote: "Finding collaborators was always a struggle until I joined this platform. I found my dream team in a week!",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
            stars: 5,
        },
        {
            name: "Emily Davis",
            role: "Grant Writer @ FutureLabs",
            quote: "The automated summaries and AI insights save me hours every day. Highly recommended for any academic.",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
            stars: 4,
        },
        {
            name: "Michael Chang",
            role: "Data Scientist",
            quote: "Seamless integration of tools and community. It's the GitHub for researchers we've been waiting for.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
            stars: 5,
        },
        {
            name: "Dr. Alisha Gupta",
            role: "Biotech Lead",
            quote: "The collaboration features are intuitive and powerful. Perfect for cross-border research projects.",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
            stars: 5,
        },
        {
            name: "Robert Fox",
            role: "Research Assistant",
            quote: "I love the clean interface and how easy it is to manage references and docs in one place.",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
            stars: 4,
        },
        {
            name: "Lisa Wong",
            role: "Professor @ Oxford",
            quote: "A must-have tool for modern academia. It bridges the gap between communication and project management.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
            stars: 5,
        }
    ];

    const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
    const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

    return (
        <section id="reviews" className="mx-4 py-24 overflow-hidden relative">
            <div className="text-center mb-12 max-w-2xl mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by <span className="text-violet-600">Innovators</span></h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">See what the community is saying.</p>
            </div>

            <div className="relative w-full space-y-8">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

                {/* Row 1: Left Scroll */}
                <div
                    className="flex w-max animate-marquee hover:[animation-play-state:paused]"
                    style={{ animationDuration: '60s' }}
                >
                    {[...firstRow, ...firstRow, ...firstRow, ...firstRow].map((review, i) => (
                        <ReviewCard key={i*3} {...review} />
                    ))}
                </div>

                {/* Row 2: Right Scroll (Reverse) */}
                <div
                    className="flex w-max animate-marquee hover:[animation-play-state:paused]"
                    style={{ animationDuration: '60s', animationDirection: 'reverse' }}
                >
                    {[...secondRow, ...secondRow, ...secondRow, ...secondRow].map((review, i) => (
                        <ReviewCard key={i*2} {...review} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ReviewSection;
