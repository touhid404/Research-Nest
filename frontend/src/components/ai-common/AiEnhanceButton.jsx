import { HiSparkles } from "react-icons/hi";

const AiEnhanceButton = ({ onClick, disabled, isLoading, text = "Enhance with AI", className = "" }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
                flex items-center gap-1.5 text-xs font-bold py-1.5 px-4 rounded-full 
                bg-primary/5 dark:bg-primary/10 text-primary border border-primary/20 
                hover:bg-primary/10 dark:hover:bg-primary/20 transition-all 
                disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden
                ${className}
            `}
        >
            {/* Subtle Breath Animation */}
            <div className="absolute inset-0 bg-primary/5 animate-pulse group-hover:hidden" />

            {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
            ) : (
                <HiSparkles className="text-sm group-hover:rotate-12 transition-transform" />
            )}
            <span className="relative z-10">{text}</span>
        </button>
    );
};

export default AiEnhanceButton;
