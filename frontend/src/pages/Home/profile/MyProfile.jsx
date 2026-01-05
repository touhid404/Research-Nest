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
    FaUsers,
    FaCheck,
    FaPlus,
    FaTimes,
    FaSave
} from 'react-icons/fa';
import { IoDocumentsOutline, IoLayersOutline } from 'react-icons/io5';
import useAuth from '../../../hooks/useAuth';
import MyPosts from '../proposalFeed/MyPosts';
import Workspace from '../workspace/Workspace';
import { userApi } from '../../../lib/userApi';
import toast from 'react-hot-toast';

const MyProfile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState(user?.bio || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [tempLinks, setTempLinks] = useState({
        linkedin: user?.links?.linkedin || '',
        github: user?.links?.github || '',
        googleScholar: user?.links?.googleScholar || '',
        personalWebsite: user?.links?.personalWebsite || ''
    });
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [tempInterests, setTempInterests] = useState(user?.researchInterests || []);

    const interestTags = [
        "Artificial Intelligence", "Biotechnology", "Quantum Computing",
        "Robotics", "Neuroscience", "Blockchain", "Sustainability",
        "Space Science", "Nanotechnology", "Psychology",
        "Machine Learning", "AI Ethics", "Network Security", "Data Science",
        "IoT", "Cybersecurity", "Human-Computer Interaction"
    ];

    const toggleInterest = (interest) => {
        setTempInterests(prev => {
            const exists = prev.includes(interest);
            if (exists) return prev.filter(i => i !== interest);
            return [...prev, interest];
        });
    };

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
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold dark:text-white">Bio</h3>
                                            {!isEditingBio ? (
                                                <button
                                                    onClick={() => {
                                                        setTempBio(user?.bio || '');
                                                        setIsEditingBio(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-700 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 transition-colors"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setIsEditingBio(false)}
                                                        className="text-gray-500 hover:text-gray-700 p-2 rounded-xl bg-gray-50 dark:bg-slate-800 transition-colors"
                                                        disabled={isUpdating}
                                                    >
                                                        <FaTimes size={14} />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            setIsUpdating(true);
                                                            try {
                                                                await userApi.updateUser(user.uid, { bio: tempBio });
                                                                toast.success('Bio updated successfully');
                                                                setIsEditingBio(false);
                                                                // Note: we might need a way to refresh user context here
                                                                // For now assuming AuthProvider handles sync or refresh is manual
                                                            } catch (error) {
                                                                toast.error('Failed to update bio');
                                                            } finally {
                                                                setIsUpdating(false);
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-700 p-2 rounded-xl bg-green-50 dark:bg-green-900/20 transition-colors"
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div> : <FaSave size={14} />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {isEditingBio ? (
                                            <div className="space-y-4">
                                                <textarea
                                                    value={tempBio}
                                                    onChange={(e) => setTempBio(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-4 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px]"
                                                    placeholder="Share your research journey and academic background..."
                                                    maxLength={200}
                                                />
                                                <p className="text-right text-xs text-slate-400">{tempBio.length}/200</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                                {user?.bio || <span className="text-gray-400">No bio added yet. Update your profile to share your journey.</span>}
                                            </p>
                                        )}
                                    </section>

                                    <section className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 text-black dark:text-white shadow-sm overflow-hidden relative">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold">Education</h3>
                                            <button className="text-indigo-600 hover:text-indigo-700 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 transition-colors">
                                                <FaEdit size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-8">
                                            {user?.education?.length > 0 ? (
                                                user.education.map((edu, idx) => (
                                                    <div key={idx} className="flex gap-5 relative group">
                                                        <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                                            <FaGraduationCap size={24} className="text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-bold text-lg">{edu.school}</h4>
                                                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">{edu.degree} • {edu.fieldOfStudy}</p>
                                                            <p className="text-sm text-gray-500 font-medium capitalize">
                                                                {new Date(edu.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} -
                                                                {edu.endDate ? new Date(edu.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                                                            </p>
                                                            {edu.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                                                                    {edu.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {idx !== user.education.length - 1 && (
                                                            <div className="absolute left-7 top-16 bottom-[-2rem] w-[2px] bg-slate-100 dark:bg-slate-800"></div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-gray-500 italic">No education details added yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <section className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 text-black dark:text-white shadow-sm overflow-hidden relative">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold">Experience</h3>
                                            <button className="text-indigo-600 hover:text-indigo-700 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 transition-colors">
                                                <FaEdit size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-8">
                                            {user?.experience?.length > 0 ? (
                                                user.experience.map((exp, idx) => (
                                                    <div key={idx} className="flex gap-5 relative group">
                                                        <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                                            <FaBriefcase size={22} className="text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-bold text-lg">{exp.title}</h4>
                                                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                                                            <p className="text-sm text-gray-500 font-medium capitalize">
                                                                {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} -
                                                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                                                            </p>
                                                            {exp.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                                                                    {exp.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {idx !== user.experience.length - 1 && (
                                                            <div className="absolute left-7 top-16 bottom-[-2rem] w-[2px] bg-slate-100 dark:bg-slate-800"></div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-gray-500 italic">No experience details added yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* Sidebar info: Interests */}
                                <div className="space-y-6">
                                    <section className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold dark:text-white">Research Interests</h3>
                                            {!isEditingInterests ? (
                                                <button
                                                    onClick={() => {
                                                        setTempInterests(user?.researchInterests || []);
                                                        setIsEditingInterests(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-700 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 transition-colors"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setIsEditingInterests(false)}
                                                        className="text-gray-500 hover:text-gray-700 p-2 rounded-xl bg-gray-50 dark:bg-slate-800 transition-colors"
                                                        disabled={isUpdating}
                                                    >
                                                        <FaTimes size={14} />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            setIsUpdating(true);
                                                            try {
                                                                await userApi.updateUser(user.uid, { researchInterests: tempInterests });
                                                                toast.success('Interests updated successfully');
                                                                setIsEditingInterests(false);
                                                            } catch (error) {
                                                                toast.error('Failed to update interests');
                                                            } finally {
                                                                setIsUpdating(false);
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-700 p-2 rounded-xl bg-green-50 dark:bg-green-900/20 transition-colors"
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div> : <FaSave size={14} />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {isEditingInterests ? (
                                                interestTags.map(tag => {
                                                    const active = tempInterests.includes(tag);
                                                    return (
                                                        <button
                                                            key={tag}
                                                            onClick={() => toggleInterest(tag)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${active
                                                                ? 'bg-indigo-600 text-white border-transparent'
                                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}
                                                        >
                                                            {active ? <FaCheck size={8} /> : <FaPlus size={8} />}
                                                            {tag}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                (user?.researchInterests?.length > 0 ? user.researchInterests : ['Machine Learning', 'AI Ethics', 'Network Security', 'Quantum Computing']).map((tech, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </section>

                                    <section className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold dark:text-white">Social Links</h3>
                                            <button
                                                onClick={() => {
                                                    setTempLinks({
                                                        linkedin: user?.links?.linkedin || '',
                                                        github: user?.links?.github || '',
                                                        googleScholar: user?.links?.googleScholar || '',
                                                        personalWebsite: user?.links?.personalWebsite || ''
                                                    });
                                                    setIsSocialModalOpen(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-700 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 transition-colors"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {socialLinks.filter(link => link.url && link.url !== '#').length > 0 ? (
                                                socialLinks.filter(link => link.url && link.url !== '#').map((link, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all group"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            {link.icon}
                                                        </div>
                                                        <span className="text-sm font-medium">{link.label}</span>
                                                    </a>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No social links added yet.</p>
                                            )}
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

            {/* Social Links Modal */}
            <AnimatePresence>
                {isSocialModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSocialModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold dark:text-white">Edit Social Links</h2>
                                    <button
                                        onClick={() => setIsSocialModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-400 dark:text-gray-500 transition-colors"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        {[
                                            { id: 'linkedin', icon: <FaLinkedin className="text-blue-600" />, label: 'LinkedIn URL' },
                                            { id: 'github', icon: <FaGithub className="text-gray-900 dark:text-white" />, label: 'GitHub URL' },
                                            { id: 'googleScholar', icon: <FaGoogle className="text-red-500" />, label: 'Google Scholar URL' },
                                            { id: 'personalWebsite', icon: <FaGlobe className="text-indigo-600" />, label: 'Personal Website URL' }
                                        ].map(field => (
                                            <div key={field.id} className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">{field.label}</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform group-focus-within:scale-110">
                                                        {field.icon}
                                                    </div>
                                                    <input
                                                        type="url"
                                                        value={tempLinks[field.id]}
                                                        onChange={(e) => setTempLinks(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                        placeholder={`https://${field.id}.com/in/username`}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <button
                                            onClick={() => setIsSocialModalOpen(false)}
                                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                                            disabled={isUpdating}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setIsUpdating(true);
                                                try {
                                                    await userApi.updateUser(user.uid, { links: tempLinks });
                                                    toast.success('Social links updated successfully');
                                                    setIsSocialModalOpen(false);
                                                } catch (error) {
                                                    toast.error('Failed to update social links');
                                                } finally {
                                                    setIsUpdating(false);
                                                }
                                            }}
                                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <FaSave />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyProfile;