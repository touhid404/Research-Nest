import React from "react";
import {
  FaFolder,
  FaFileAlt,
  FaPlus,
  FaStickyNote,
  FaFileWord,
  FaFileExcel,
} from "react-icons/fa";

const Workspace = () => {
  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">

      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 p-5 bg-white/80 dark:bg-gray-800/40 backdrop-blur-md">
        <h2 className="font-bold text-xl mb-6">Workspace</h2>

        {/* New File Button */}
        <button className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-md active:scale-[0.98]">
          <FaPlus /> Create New
        </button>

        {/* Folders */}
        <div className="mt-6">
          <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Collections
          </h3>

          <div className="flex flex-col gap-2">
            {["My Projects", "Work Files", "Shared Docs"].map((folder, i) => (
              <div
                key={i}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-200/70 
                           dark:hover:bg-gray-700 p-2 rounded-lg transition-all"
              >
                <FaFolder className="text-yellow-500" />
                <span className="font-medium">{folder}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="flex-1 p-8 overflow-y-auto rn-scrollbar">

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">Your Workspace</h1>

        {/* CREATE NEW SECTION */}
        <h2 className="text-lg font-semibold mb-3">Create New</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

          {/* Card Component */}
          <WorkspaceCard
            icon={<FaFileWord size={45} className="text-blue-600" />}
            title="Document"
          />

          <WorkspaceCard
            icon={<FaFileExcel size={45} className="text-green-600" />}
            title="Spreadsheet"
          />

          <WorkspaceCard
            icon={<FaStickyNote size={45} className="text-yellow-500" />}
            title="Quick Note"
          />
        </div>

        {/* RECENT FILES */}
        <h2 className="text-lg font-semibold mb-3">Recent Files</h2>

        <div className="space-y-4">
          {[
            { name: "Project Proposal.docx", icon: <FaFileAlt className="text-blue-500" />, time: "2 days ago" },
            { name: "Budget Sheet.xlsx", icon: <FaFileAlt className="text-green-500" />, time: "5 days ago" },
            { name: "Meeting Notes", icon: <FaStickyNote className="text-yellow-500" />, time: "1 week ago" },
          ].map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border rounded-xl bg-white/70 dark:bg-gray-800/60 
                         backdrop-blur-md hover:shadow-lg transition-all cursor-pointer hover:-translate-y-[1px]"
            >
              <div>{file.icon}</div>
              <div className="flex flex-col">
                <p className="font-semibold">{file.name}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last opened {file.time}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// ------------------ CARD COMPONENT -------------------
const WorkspaceCard = ({ icon, title }) => {
  return (
    <div
      className="p-6 border rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-md 
                 hover:shadow-xl hover:-translate-y-[3px] active:scale-[0.98]
                 transition-all cursor-pointer flex flex-col items-center text-center"
    >
      {icon}
      <p className="mt-3 font-semibold text-lg">{title}</p>
    </div>
  );
};

export default Workspace;
