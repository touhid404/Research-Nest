import { HiSparkles } from "react-icons/hi";

const AiEnhanceButton = ({ onClick, disabled, isLoading, text = "AI Enhance", className = "" }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`group relative overflow-hidden rounded-full py-1 px-3 text-[10px] font-black text-white shadow-md transition-all hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed border border-white/20 ${className}`}
        >
            {/* AI Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-opacity opacity-90 group-hover:opacity-100" />

            {/* Enhanced Glossy Shimmer */}
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] bg-[-100%_0%] group-hover:animate-[shimmer_1.5s_infinite] transition-none" />

            {/* Outer Glow Effect (Subtle) */}
            <div className="absolute inset-0 rounded-full border border-indigo-400/30 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-1.5 leading-none">
                {isLoading ? (
                    <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                    <HiSparkles className="text-[11px] group-hover:rotate-12 transition-transform drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
                )}
                <span className="tracking-tight">{text}</span>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}} />
        </button>
    );
};

export default AiEnhanceButton;
