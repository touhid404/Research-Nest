const ErrorMessage = ({ error }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 mx-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl shadow-md text-center">
            {/* Emoji */}
            <span className="text-5xl mb-3">⚠️</span>

            {/* Illustration */}
            <img
                src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png"
                alt="Oops, something went wrong"
                className="w-32 h-32 mb-4"
            />

            {/* Heading */}
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-1">
                Oops! Something went wrong
            </h2>

            {/* Error message */}
            <p className="text-sm text-red-600 dark:text-red-200">
                {error?.message || "Unable to load the posts at the moment."}
            </p>
        </div>
    );
};

export default ErrorMessage;
