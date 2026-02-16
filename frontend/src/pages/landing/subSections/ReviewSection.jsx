import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import Marquee from "react-fast-marquee";
import { reviewApi } from "../../../lib/reviewApi";

const ReviewCard = ({ userName, userRole, comment, userPhoto, rating }) => (
    <div className="w-[380px] min-h-60 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl relative mx-3 flex flex-col shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
        {/* Quote icon */}
        <div className="absolute top-4 right-4 text-violet-200 dark:text-violet-900/50">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={`text-sm ${i < rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
            ))}
        </div>

        {/* Comment - no line clamp, full text visible */}
        <p className="text-slate-600 dark:text-slate-300 mb-auto text-[15px] leading-relaxed font-medium italic">
            "{comment}"
        </p>

        {/* User info */}
        <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <img 
                src={userPhoto} 
                alt={userName} 
                className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-100 dark:ring-violet-900/50 shadow-sm" 
            />
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{userName}</h4>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">{userRole}</p>
            </div>
        </div>
    </div>
);

const ReviewCardSkeleton = () => (
    <div className="w-[380px] min-h-60 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl relative mx-3 flex flex-col shadow-md animate-pulse">
        <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
            ))}
        </div>

        <div className="space-y-3 grow">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-11/12" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/5" />
        </div>

        <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-16" />
            </div>
        </div>
    </div>
);

const FALLBACK_REVIEWS = [
    {
        userName: "Dr. Sarah Chen",
        userRole: "Researcher",
        comment: "Research Nest has completely transformed how our lab collaborates. The proposal tools are a game-changer.",
        userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        rating: 5,
    },
    {
        userName: "James Wilson",
        userRole: "Student",
        comment: "Finding collaborators was always a struggle until I joined this platform. I found my dream team in a week!",
        userPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        rating: 5,
    },
    {
        userName: "Emily Davis",
        userRole: "Researcher",
        comment: "The automated summaries and AI insights save me hours every day. Highly recommended for any academic.",
        userPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
        rating: 4,
    },
    {
        userName: "Michael Chang",
        userRole: "Industry",
        comment: "Seamless integration of tools and community. It's the GitHub for researchers we've been waiting for.",
        userPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        rating: 5,
    },
    {
        userName: "Dr. Alisha Gupta",
        userRole: "Professor",
        comment: "The collaboration features are intuitive and powerful. Perfect for cross-border research projects.",
        userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        rating: 5,
    },
    {
        userName: "Robert Fox",
        userRole: "Student",
        comment: "I love the clean interface and how easy it is to manage references and docs in one place.",
        userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        rating: 4,
    },
    {
        userName: "Lisa Wong",
        userRole: "Professor",
        comment: "A must-have tool for modern academia. It bridges the gap between communication and project management.",
        userPhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
        rating: 5,
    }
];

const ReviewSection = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await reviewApi.getReviews(50);
                if (response.data && response.data.length > 0) {
                    setReviews(response.data);
                } else {
                    setReviews(FALLBACK_REVIEWS);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
                setReviews(FALLBACK_REVIEWS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
    const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

    // Skeleton placeholders
    const skeletonCount = 4;

    return (
        <section id="reviews" className="mx-4 py-24 overflow-hidden relative">
            <div className="text-center mb-12 max-w-2xl mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by <span className="text-violet-600">Innovators</span></h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">See what the community is saying.</p>
            </div>

            <div className="relative w-full space-y-8">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

                {isLoading ? (
                    <>
                        {/* Skeleton Row 1 */}
                        <div className="flex w-max">
                            {[...Array(skeletonCount)].map((_, i) => (
                                <ReviewCardSkeleton key={`skeleton-1-${i}`} />
                            ))}
                        </div>
                        {/* Skeleton Row 2 */}
                        <div className="flex w-max">
                            {[...Array(skeletonCount)].map((_, i) => (
                                <ReviewCardSkeleton key={`skeleton-2-${i}`} />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Row 1: Left Scroll */}
                        <Marquee speed={30} pauseOnHover gradient={false}>
                            {firstRow.map((review, i) => (
                                <ReviewCard key={`row1-${i}`} {...review} />
                            ))}
                        </Marquee>

                        {/* Row 2: Right Scroll (Reverse) */}
                        <Marquee speed={30} pauseOnHover gradient={false} direction="right">
                            {secondRow.map((review, i) => (
                                <ReviewCard key={`row2-${i}`} {...review} />
                            ))}
                        </Marquee>
                    </>
                )}
            </div>
        </section>
    );
};

export default ReviewSection;
