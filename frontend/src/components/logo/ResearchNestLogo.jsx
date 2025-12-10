import React, { useEffect, useState } from "react";
import { Link } from "react-router";

import { FaBrain, FaBookOpen } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";

const icons = [FaBrain, FaUsers, FaBookOpen];

const ResearchNestLogo = () => {
  const [index, setIndex] = useState(0);

  // Change icon every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % icons.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const Icon = icons[index];

  return (
    <Link
      to="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
    >
      {/* Animated Icon */}
      <span
        key={index}
        className="transition-opacity duration-700 opacity-100 animate-fade"
      >
        <Icon size={24} className="text-gray-900 dark:text-gray-100" />
      </span>

      <span className="hidden sm:block font-bold text-lg text-gray-900 dark:text-gray-100">
        Research Nest
      </span>
    </Link>
  );
};

export default ResearchNestLogo;
