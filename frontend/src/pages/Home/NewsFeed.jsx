import React from "react";
import { motion } from "framer-motion";
import { useDummyPosts } from "../../hooks/useDummyPosts";
import { FaHeart, FaCommentAlt, FaShare } from "react-icons/fa";

// Helper function to get a random Tailwind background color
const randomBgColor = () => {
  const colors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-pink-100",
    "bg-yellow-100",
    "bg-purple-100",
    "bg-orange-100",
    "bg-teal-100",
    "bg-red-100",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const NewsFeed = () => {
  const posts = useDummyPosts(40);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">News Feed</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full  flex items-center justify-center overflow-hidden ${randomBgColor()}`}
              >
                <img
                  src={post.avatar}
                  alt={post.name}
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{post.name}</h3>
                <p className="text-sm text-gray-500">{post.date}</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 pb-4">
              <p className="text-gray-700 leading-relaxed">{post.text}</p>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 flex justify-between text-gray-500 text-sm border-t border-gray-100">
              <button className="flex items-center gap-2 hover:text-blue-600 transition">
                <FaHeart className="text-gray-400 hover:text-blue-600 transition" />
                Like
              </button>
              <button className="flex items-center gap-2 hover:text-blue-600 transition">
                <FaCommentAlt className="text-gray-400 hover:text-blue-600 transition" />
                Comment
              </button>
              <button className="flex items-center gap-2 hover:text-blue-600 transition">
                <FaShare className="text-gray-400 hover:text-blue-600 transition" />
                Share
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
