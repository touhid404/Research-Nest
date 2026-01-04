import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEdit,
    FaLinkedin,
    FaGithub,
    FaGoogle,
    FaGlobe,
    FaCheckCircle,
    FaBriefcase,
    FaGraduationCap,
    FaUsers
} from 'react-icons/fa';
import { IoDocumentsOutline, IoLayersOutline } from 'react-icons/io5';
import useAuth from '../../../hooks/useAuth';
import MyPosts from '../proposalFeed/MyPosts';
import Workspace from '../workspace/Workspace';

const MyProfile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    const socialLinks = [
        { icon: <FaLinkedin size={20} />, url: user?.links?.linkedin || '#', label: 'LinkedIn' },
        { icon: <FaGithub size={20} />, url: user?.links?.github || '#', label: 'GitHub' },
        { icon: <FaGoogle size={20} />, url: user?.links?.googleScholar || '#', label: 'Google Scholar' },
        { icon: <FaGlobe size={20} />, url: user?.links?.personalWebsite || '#', label: 'Website' },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'proposals', label: 'My Posts' },
        { id: 'workspaces', label: 'Workspaces' },
    ];

    return (
        <div className="min-h-screen bg-transparent pb-10 custom-scrollbar overflow-y-auto">
            {/* Header Section */}
            <div className="w-full max-w-7xl bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-slate-800">
                <div className="relative h-48 md:h-64 w-full bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop')]">
                    <div className="absolute -bottom-12 left-10">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-[8px] border-white dark:border-slate-900 shadow-xl overflow-hidden bg-gray-200">
                                <img className="w-full h-full object-cover" src={user?.photoURL} alt={user?.displayName} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-16 px-10 pb-12 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-quicksand">{user?.displayName}</h1>
                                {user?.isVerified || (
                                    <div className="mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" fill="none" viewBox="0 0 24 24" className="text-[#0081f5]">
                                            <path fill="currentColor" fillRule="evenodd" d="M9.592 3.2c-.243.208-.365.312-.495.399-.298.2-.633.338-.985.408-.153.03-.313.043-.632.068-.801.064-1.202.096-1.536.214a2.713 2.713 0 0 0-1.655 1.655c-.118.334-.15.735-.214 1.536-.025.319-.038.479-.068.632-.07.352-.208.687-.408.985-.087.13-.191.252-.399.495-.521.612-.782.918-.935 1.238-.353.74-.353 1.6 0 2.34.153.32.414.626.935 1.238.208.243.312.365.399.495.2.298.338.633.408.985.03.153.043.313.068.632.064.801.096 1.202.214 1.536a2.713 2.713 0 0 0 1.655 1.655c.334.118.735.15 1.536.214.319.025.479.038.632.068.352.07.687.209.985.408.13.087.252.191.495.399.612.521.918.782 1.238.935.74.353 1.6.353 2.34 0 .32-.153.626-.414 1.238-.935.243-.208.365-.312.495-.399.298-.2.633-.338.985-.408.153-.03.313-.043.632-.068.801-.064 1.202-.096 1.536-.214a2.713 2.713 0 0 0 1.655-1.655c.118-.334.15-.735.214-1.536.025-.319.038-.479.068-.632.07-.352.209-.687.408-.985.087-.13.191-.252.399-.495.521-.612.782-.918.935-1.238.353-.74.353-1.6 0-2.34-.153-.32-.414-.626-.935-1.238-.208-.243-.312-.365-.399-.495a2.713 2.713 0 0 1-.408-.985 5.72 5.72 0 0 1-.068-.632c-.064-.801-.096-1.202-.214-1.536a2.713 2.713 0 0 0-1.655-1.655c-.334-.118-.735-.15-1.536-.214-.319-.025-.479-.038-.632-.068a2.713 2.713 0 0 1-.985-.408 5.73 5.73 0 0 1-.495-.399c-.612-.521-.918-.782-1.238-.935a2.713 2.713 0 0 0-2.34 0c-.32.153-.626.414-1.238.935Zm6.781 6.663a.814.814 0 0 0-1.15-1.15l-4.85 4.85-1.596-1.595a.814.814 0 0 0-1.15 1.15l2.17 2.17a.814.814 0 0 0 1.15 0l5.427-5.425Z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <p className="text-md font-bold text-gray-400 dark:text-gray-500">@{user?.username || "username"}</p>
                        </div>
                        <div className="flex gap-10 lg:gap-16 items-center text-left">
                            <div className="space-y-1 group transition-transform hover:translate-y-[-2px]">
                                <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em]">Connections</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">32,086</p>
                            </div>
                            <div className="space-y-1 group transition-transform hover:translate-y-[-2px]">
                                <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em]">Workspace</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">24</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-6 mt-8">
                <div className="flex gap-8 border-b border-gray-100 dark:border-slate-900">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-6 mt-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Bio & Interests */}
                                <div className="lg:col-span-2 space-y-6">
                                    <section className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <h3 className="text-lg font-bold mb-4 dark:text-white">Biography</h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {user?.bio || "No biography added yet. Update your profile to share your research journey and academic background with the community."}
                                        </p>
                                    </section>

                                    <section className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 text-black dark:text-white">
                                        <h3 className="text-lg font-bold mb-4">Experience</h3>
                                        <div className="space-y-6">
                                            {/* Experience Item Placeholder */}
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                                    <FaBriefcase className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">Senior Research Scholar</h4>
                                                    <p className="text-sm text-gray-500">Institute of Technology • 2021 - Present</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                        Leading collaborative research projects in Distributed Systems and Cloud Computing architecture.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                                    <FaGraduationCap size={20} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">PhD in Computer Science</h4>
                                                    <p className="text-sm text-gray-500">Stanford University • 2017 - 2021</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Sidebar info: Interests */}
                                <div className="space-y-6">
                                    <section className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <h3 className="text-lg font-bold mb-4 dark:text-white">Research Interests</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(user?.researchInterests?.length > 0 ? user.researchInterests : ['Machine Learning', 'AI Ethics', 'Network Security', 'Quantum Computing']).map((tech, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'proposals' && (
                            <div className="max-w-3xl">
                                <MyPosts />
                            </div>
                        )}

                        {activeTab === 'workspaces' && (
                            <Workspace />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MyProfile;