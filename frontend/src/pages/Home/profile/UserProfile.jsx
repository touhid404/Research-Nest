import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { FaUsers, FaArrowLeft, FaEnvelope, FaBriefcase, FaGraduationCap, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import { SiGooglescholar } from 'react-icons/si';
import { userApi } from '../../../lib/userApi';
import ProfileLoader from '../../../components/loader/ProfileLoader';
import toast from 'react-hot-toast';

const UserProfile = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const userRes = await userApi.getUserByUid(uid);
                if (userRes.success) {
                    setProfileData(userRes.data);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [uid]);

    if (isLoading) {
        return <ProfileLoader />;
    }

    if (!profileData) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FaUsers size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Not Found</h2>
                <p className="text-gray-500 mt-2">The user you're looking for doesn't exist or has been removed.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 text-primary font-bold hover:underline flex items-center gap-2 cursor-pointer"
                >
                    <FaArrowLeft size={14} /> Back
                </button>
            </div>
        );
    }

    const socialLinks = [
        { icon: <FaLinkedin size={18} />, url: profileData?.links?.linkedin, label: 'LinkedIn', color: '#0077b5' },
        { icon: <FaGithub size={18} />, url: profileData?.links?.github, label: 'GitHub', color: '#333' },
        { icon: <SiGooglescholar size={18} />, url: profileData?.links?.googleScholar, label: "Google Scholar", color: '#4285f4' },
        { icon: <FaGlobe size={18} />, url: profileData?.links?.personalWebsite, label: 'Website', color: '#4f46e5' },
    ].filter(link => link.url);

    return (
        <div className="min-h-screen bg-slate-50/30 dark:bg-transparent pb-10 custom-scrollbar overflow-y-auto">
            {/* Compact Professional Integrated Header */}
            <div className="w-full max-w-6xl mx-auto px-4 pt-6">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
                    {/* Subtle Top Accent - Reduced Height */}
                    <div className="h-20 w-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-blue-500/5" />

                    <div className="px-6 pb-6 -mt-10 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                {/* Compact Profile Picture */}
                                <div className="relative group/avatar">
                                    <div className="w-28 h-28 rounded-[24px] border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-gray-100 dark:bg-slate-800 transition-transform duration-500 group-hover:scale-[1.02]">
                                        <img
                                            className="w-full h-full object-cover"
                                            src={profileData.photoURL}
                                            alt={profileData.name}
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-50 dark:border-slate-700 flex items-center justify-center text-primary">
                                        <FaUsers size={14} />
                                    </div>
                                </div>

                                {/* Core Profile Info - Tightened Typography */}
                                <div className="text-center md:text-left space-y-2 pb-1">
                                    <div className="flex flex-col md:flex-row items-center gap-2">
                                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                            {profileData.name}
                                        </h1>
                                        {profileData.isVerified && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/30">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9.592 3.2c-.243.208-.365.312-.495.399-.298.2-.633.338-.985.408-.153.03-.313.043-.632.068-.801.064-1.202.096-1.536.214a2.713 2.713 0 0 0-1.655 1.655c-.118.334-.15.735-.214 1.536-.025.319-.038.479-.068.632-.07.352-.208.687-.408.985-.087.13-.191.252-.399.495-.521.612-.782.918-.935 1.238-.353.74-.353 1.6 0 2.34.153.32.414.626.935 1.238.208.243.312.365.399.495.2.298.338.633.408.985.03.153.043.313.068.632.064.801.096 1.202.214 1.536a2.713 2.713 0 0 0 1.655 1.655c.334.118.735.15 1.536.214.319.025.479.038.632.068.352.07.687.209.985.408.13.087.252.191.495.399.612.521.918.782 1.238.935.74.353 1.6.353 2.34 0 .32-.153.626-.414 1.238-.935.243-.208.365-.312.495-.399.298-.2.633-.338.985-.408.153-.03.313-.043.632-.068.801-.064 1.202-.096 1.536-.214a2.713 2.713 0 0 0 1.655-1.655c.118-.334.15-.735.214-1.536.025-.319.038-.479.068-.632.07-.352.209-.687.408-.985.087-.13.191-.252.399-.495.521-.612.782-.918.935-1.238.353-.74.353-1.6 0-2.34-.153-.32-.414-.626-.935-1.238-.208-.243-.312-.365-.399-.495a2.713 2.713 0 0 1-.408-.985 5.72 5.72 0 0 1-.068-.632c-.064-.801-.096-1.202-.214-1.536a2.713 2.713 0 0 0-1.655-1.655c-.334-.118-.735-.15-1.536-.214-.319-.025-.479-.038-.632-.068a2.713 2.713 0 0 1-.985-.408 5.73 5.73 0 0 1-.495-.399c-.612-.521-.918-.782-1.238-.935a2.713 2.713 0 0 0-2.34 0c-.32.153-.626.414-1.238.935Zm6.781 6.663a.814.814 0 0 0-1.15-1.15l-4.85 4.85-1.596-1.595a.814.814 0 0 0-1.15 1.15l2.17 2.17a.814.814 0 0 0 1.15 0l5.427-5.425Z" />
                                                </svg>
                                                <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1">
                                        <p className="text-gray-400 font-bold text-[13px] tracking-tight">
                                            @{profileData.username || "researcher"}
                                        </p>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                                            <FaBriefcase className="text-primary/70" size={10} />
                                            <p className="text-[12px] font-bold text-gray-600 dark:text-gray-300">
                                                {profileData.occupation || "Researcher"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Display - Compact */}
                            <div className="flex justify-center md:justify-end gap-8 px-2 md:pb-1">
                                <div className="text-center group/stat">
                                    <p className="text-xl font-black text-gray-900 dark:text-white group-hover/stat:text-primary transition-colors">
                                        {profileData.experience?.length || 0}
                                    </p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Exps</p>
                                </div>
                            </div>
                        </div>

                        {/* Direct Navigation Button - Compact */}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                                title="Go Back"
                            >
                                <FaArrowLeft size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Removed Navigation Tabs for One-Page Layout */}

            <div className="w-full max-w-6xl mx-auto px-4 mt-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    {/* Main Content Pillar */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Bio Section - Compact */}
                        <section>
                            <div className="flex items-center gap-2.5 mb-3 px-1">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Summary</h3>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-gray-50 dark:border-slate-800 shadow-sm">
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px] font-medium italic">
                                    "{profileData.bio || "This researcher is currently focusing on groundbreaking work but hasn't updated their summary yet."}"
                                </p>
                            </div>
                        </section>

                        {/* Experience Section - Denser */}
                        <section>
                            <div className="flex items-center gap-2.5 mb-4 px-1">
                                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Experience</h3>
                            </div>
                            <div className="space-y-4">
                                {profileData.experience?.length > 0 ? (
                                    profileData.experience.map((exp, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-50 dark:border-slate-800/50 hover:border-amber-200 dark:hover:border-amber-900/30 transition-all group/item shadow-sm">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                                <div className="flex gap-4">
                                                    <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/30">
                                                        <FaBriefcase size={18} className="text-amber-600" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-black text-gray-900 dark:text-white text-[15px] tracking-tight leading-tight">{exp.title}</h4>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-amber-600 dark:text-amber-500 font-bold text-[11px] uppercase tracking-wider">{exp.company}</p>
                                                            <span className="w-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full" />
                                                            <p className="text-gray-400 dark:text-gray-500 font-bold text-[11px] tracking-tight">{exp.location}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-amber-50/50 dark:bg-amber-900/5 px-3 py-1 rounded-full border border-amber-100/30 dark:border-amber-900/10 shrink-0 self-start md:self-auto">
                                                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest whitespace-nowrap">
                                                        {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} -
                                                        {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                                                    </p>
                                                </div>
                                            </div>
                                            {exp.description && (
                                                <div className="mt-3 overflow-hidden">
                                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-normal bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-gray-50 dark:border-slate-800">
                                                        {exp.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-dashed border-gray-100 dark:border-slate-800">
                                        <p className="text-gray-400 text-[13px] font-bold italic text-center">Experience profile pending...</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Education Section - Denser */}
                        <section>
                            <div className="flex items-center gap-2.5 mb-4 px-1">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Education</h3>
                            </div>
                            <div className="space-y-4">
                                {profileData.education?.length > 0 ? (
                                    profileData.education.map((edu, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-50 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-blue-900/30 transition-all group/item shadow-sm">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                                <div className="flex gap-4">
                                                    <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30">
                                                        <FaGraduationCap size={20} className="text-blue-600" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-black text-gray-900 dark:text-white text-[15px] tracking-tight leading-tight">{edu.school}</h4>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-blue-600 dark:text-blue-500 font-bold text-[11px] uppercase tracking-wider">{edu.degree}</p>
                                                            <span className="w-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full" />
                                                            <p className="text-gray-400 dark:text-gray-500 font-bold text-[11px] tracking-tight">{edu.fieldOfStudy}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50/50 dark:bg-blue-900/5 px-3 py-1 rounded-full border border-blue-100/30 dark:border-blue-900/10 shrink-0 self-start md:self-auto">
                                                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest whitespace-nowrap">
                                                        {new Date(edu.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} -
                                                        {edu.endDate ? new Date(edu.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-dashed border-gray-100 dark:border-slate-800">
                                        <p className="text-gray-400 text-[13px] font-bold italic text-center">Academic history pending...</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info - Compact */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Interests Section */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Research Focus</h3>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-50 dark:border-slate-800 shadow-sm">
                                <div className="flex flex-wrap gap-1.5">
                                    {profileData.researchInterests?.length > 0 ? (
                                        profileData.researchInterests.map((interest, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wide border border-gray-100 dark:border-slate-700 transition-all hover:bg-primary hover:text-white hover:border-primary cursor-default">
                                                {interest}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-[11px] font-bold italic">Interests pending...</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Connect Section */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Network</h3>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-50 dark:border-slate-800 shadow-sm space-y-2.5">
                                <div className="group/link flex items-center gap-3 bg-gray-50/50 dark:bg-slate-800/30 p-3.5 rounded-[16px] border border-transparent hover:border-primary/10 transition-all cursor-default">
                                    <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary shadow-sm">
                                        <FaEnvelope size={14} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Email</span>
                                        <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300 truncate">{profileData.email}</span>
                                    </div>
                                </div>

                                {socialLinks.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group/link flex items-center gap-3 bg-gray-50/50 dark:bg-slate-800/30 p-3.5 rounded-[16px] border border-transparent hover:border-primary/10 transition-all"
                                    >
                                        <div style={{ color: link.color }} className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm group-hover/link:scale-105 transition-transform">
                                            {link.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Connect</span>
                                            <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">{link.label}</span>
                                        </div>
                                    </a>
                                ))}

                                {socialLinks.length === 0 && (
                                    <div className="text-center py-4 border border-dashed border-gray-100 dark:border-slate-800 rounded-xl">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No social assets listed</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;
