import React from "react";
import { FaFlask } from "react-icons/fa";
import { Link } from "react-router";

const ResearchNestLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
      <FaFlask size={24} className="text-gray-900 dark:text-gray-100" />
      <span className="hidden sm:block font-bold text-lg text-gray-900 dark:text-gray-100">
        Research Nest
      </span>
    </Link>
  );
};
export default ResearchNestLogo;
