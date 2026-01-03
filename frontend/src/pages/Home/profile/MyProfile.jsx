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

    // Mock data for missing backend fields
    const stats = [
        { label: 'Posts', value: '15', icon: <IoDocumentsOutline size={20} /> },
        { label: 'Workspaces', value: '5', icon: <IoLayersOutline size={20} /> },
        { label: 'Connections', value: '120', icon: <FaUsers size={20} /> },
    ];

    const socialLinks = [
        { icon: <FaLinkedin size={20} />, url: user?.links?.linkedin || '#', label: 'LinkedIn' },
        { icon: <FaGithub size={20} />, url: user?.links?.github || '#', label: 'GitHub' },
        { icon: <FaGoogle size={20} />, url: user?.links?.googleScholar || '#', label: 'Google Scholar' },
        { icon: <FaGlobe size={20} />, url: user?.links?.personalWebsite || '#', label: 'Website' },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'proposals', label: 'My Proposals' },
        { id: 'workspaces', label: 'Workspaces' },
    ];

    return (
        <div className="min-h-screen bg-transparent pb-10 custom-scrollbar overflow-y-auto">
            {/* Header Section */}
            <div className="relative">
                {/* Cover Image */}
                <div className="h-48 w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-900/40 dark:to-purple-900/40 relative overflow-hidden rounded-b-3xl">
                    <div className="absolute inset-0 backdrop-blur-[2px]"></div>
                    {/* Abstract shapes for academic feel */}
                    <div className="absolute top-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-10 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                </div>

                {/* Profile Info Card */}
                <div className="px-6 -mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-slate-800/50"
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full ring-4 ring-white dark:ring-slate-800 overflow-hidden bg-gray-200 shadow-2xl">
                                    <img
                                        src={user?.photoURL}
                                        alt={user?.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform hidden">
                                    <FaEdit size={14} />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h1 className="text-2xl md:text-3xl font-bold dark:text-white">
                                        {user?.displayName}
                                    </h1>
                                    {user?.isVerified && (
                                        <FaCheckCircle className="text-blue-500" title="Verified Researcher" />
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium mb-3">
                                    {user?.role === 'researcher' ? 'Researcher' : 'Administrator'} • {user?.occupation || 'Scholar'}
                                </p>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    {socialLinks.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors p-1"
                                            title={link.label}
                                        >
                                            {link.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-4 md:mt-0">
                                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-semibold transition-all active:scale-95 shadow-lg flex items-center gap-2">
                                    <FaEdit size={16} />
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center group cursor-default">
                                    <div className="flex items-center justify-center text-primary mb-1 group-hover:scale-110 transition-transform">
                                        {stat.icon}
                                    </div>
                                    <div className="text-xl font-bold dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
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