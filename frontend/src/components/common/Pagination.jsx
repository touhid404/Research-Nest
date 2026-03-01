import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi";

const Pagination = ({ meta, currentPage, onPageChange, perPage = 8 }) => {
  if (!meta || meta.totalPages <= 1) return null;

  const { totalPages, totalCount, hasNextPage, hasPrevPage } = meta;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 mt-8 mb-2 w-full">
      {/* Results info */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center w-full px-2">
        Showing <span className="font-medium text-gray-700 dark:text-gray-200">{((currentPage - 1) * perPage) + 1}</span> to{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {Math.min(currentPage * perPage, totalCount)}
        </span>{" "}
        of <span className="font-medium text-gray-700 dark:text-gray-200">{totalCount}</span> results
      </p>

      {/* Pagination controls */}
      <nav
        className="flex flex-nowrap items-center justify-center gap-0.5 sm:gap-1 w-full sm:justify-center overflow-x-auto no-scrollbar"
        aria-label="Pagination"
      >
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="hidden sm:flex p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="First page"
        >
          <HiChevronDoubleLeft className="w-5 h-5" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="Previous page"
        >
          <HiChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex flex-nowrap items-center gap-0.5 sm:gap-1 mx-1 sm:mx-2 justify-center">
          {pageNumbers.map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 dark:text-gray-500">
                •••
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-8 sm:min-w-10 h-8 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all px-1 sm:px-2 ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline text-sm font-medium">Next</span>
          <HiChevronRight className="w-4 h-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="hidden sm:flex p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="Last page"
        >
          <HiChevronDoubleRight className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
