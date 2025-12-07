import React from "react";
import { FaSearch, FaEllipsisH } from "react-icons/fa";

const RightSidebar = () => {
  return (
    <div
      className="lg:flex rn-scrollbar flex-col gap-4 p-2 h-screen 
      text-gray-900 dark:text-gray-100 
      bg-white dark:bg-gray-900"
    >
      {/* Search Bar */}
      <div className="relative group">
        <div
          className="absolute inset-y-0 left-0 pl-3 flex items-center 
          pointer-events-none text-gray-500 dark:text-gray-400 
          group-focus-within:text-primary"
        >
          <FaSearch />
        </div>

        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-full pl-10 
          bg-gray-100 dark:bg-gray-800 
          text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400
          focus:bg-white dark:focus:bg-gray-700
          transition-colors duration-200 py-2.5 outline-none"
        />
      </div>

      {/* Premium Card */}
      <div className="rounded-2xl p-4 gap-2 bg-gray-100 dark:bg-gray-800">
        <h2 className="font-bold text-xl">Get Premium for just A$1</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          It's Premium's 3rd birthday! Have the best of X from A$1 in your first
          month. Ends soon.
        </p>

        <button
          className="btn bg-black hover:bg-gray-800 
          dark:bg-blue-600 dark:hover:bg-blue-500
          border-none rounded-full text-white font-bold w-fit mt-2"
        >
          Claim offer
        </button>
      </div>

      {/* Trending Section */}
      <div className="rounded-2xl pt-4 bg-gray-100 dark:bg-gray-800">
        <h2 className="font-bold text-xl px-4 mb-2">What's happening</h2>

        {/* Trend Item 1 */}
        <div
          className="hover:bg-gray-200 dark:hover:bg-gray-700 
          p-4 cursor-pointer transition-colors duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Sports · Trending
            </div>
            <FaEllipsisH className="text-gray-500 dark:text-gray-400 hover:text-primary" />
          </div>
          <div className="font-bold text-sm">
            Manchester United Held Goalless by Palace in Tense First Half
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            40.8K posts
          </div>
        </div>

        {/* Trend Item 2 */}
        <div
          className="hover:bg-gray-200 dark:hover:bg-gray-700 
          p-4 cursor-pointer transition-colors duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Entertainment · Trending
            </div>
            <FaEllipsisH className="text-gray-500 dark:text-gray-400 hover:text-primary" />
          </div>
          <div className="font-bold text-sm">
            EmiBonnie Captivate Fans at Macau Blush Blossom Fest
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            23.1K posts
          </div>
        </div>

        {/* Show More */}
        <div
          className="hover:bg-gray-200 dark:hover:bg-gray-700 
          p-4 cursor-pointer transition-colors duration-200 rounded-b-2xl"
        >
          <span className="text-primary text-sm">Show more</span>
        </div>
      </div>

      {/* Who to follow */}
      <div className="rounded-2xl pt-4 bg-gray-100 dark:bg-gray-800">
        <h2 className="font-bold text-xl px-4 mb-2">Who to follow</h2>

        {/* User 1 */}
        <div
          className="hover:bg-gray-200 dark:hover:bg-gray-700 
          p-4 cursor-pointer transition-colors duration-200 
          flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm hover:underline">
                Elon Musk
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                @elonmusk • 5 years
              </span>
            </div>
          </div>

          <button
            className="btn btn-sm bg-black hover:bg-gray-800 
            dark:bg-blue-600 dark:hover:bg-blue-500
            border-none rounded-full text-white"
          >
            Follow
          </button>
        </div>

        {/* User 2 */}
        <div
          className="hover:bg-gray-200 dark:hover:bg-gray-700 
          p-4 cursor-pointer transition-colors duration-200 
          flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm hover:underline">
                Lee Patriot
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                @Mofoman360 • 5 years
              </span>
            </div>
          </div>

          <button
            className="btn btn-sm bg-black hover:bg-gray-800 
            dark:bg-blue-600 dark:hover:bg-blue-500
            border-none rounded-full text-white"
          >
            Follow
          </button>
        </div>

        {/* Show more */}
        <div
          className="hover:bg-gray-200 dark:hover:bg-gray-700 
          p-4 cursor-pointer transition-colors duration-200 rounded-b-2xl"
        >
          <span className="text-primary text-sm">Show more</span>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
