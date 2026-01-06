import React, { useState } from 'react';
import { FaLinkedin, FaGithub, FaGlobe, FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { SiGooglescholar } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { userApi } from '../../../../lib/userApi';

const SocialLinksSection = ({ profileData, user, fetchUserProfile }) => {
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [tempLinks, setTempLinks] = useState({
        linkedin: '',
        github: '',
        googleScholar: '',
        personalWebsite: ''
    });
    const [isUpdatingLinks, setIsUpdatingLinks] = useState(false);

    const socialLinks = [
        { icon: <FaLinkedin size={20} />, url: profileData?.links?.linkedin || '#', label: 'LinkedIn', color: '#0077b5' },
        { icon: <FaGithub size={20} />, url: profileData?.links?.github || '#', label: 'GitHub', color: '#333' },
        { icon: <SiGooglescholar size={20} />, url: profileData?.links?.googleScholar || '#', label: "Google Scholar", color: '#4285f4' },
        { icon: <FaGlobe size={20} />, url: profileData?.links?.personalWebsite || '#', label: 'Website', color: '#4f46e5' },
    ];

    return (
        <>
            <section className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold dark:text-white">Social Links</h3>
                    <button
                        onClick={() => {
                            setTempLinks({
                                linkedin: profileData?.links?.linkedin || '',
                                github: profileData?.links?.github || '',
                                googleScholar: profileData?.links?.googleScholar || '',
                                personalWebsite: profileData?.links?.personalWebsite || ''
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
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: `${link.color}15`, color: link.color }}
                                >
                                    {link.icon}
                                </div>
                                <span className="text-sm font-medium">{link.label}</span>
                            </a>
                        ))
                    ) : (
                        <p className="text-sm text-center text-gray-500 italic">No social links added yet.</p>
                    )}
                </div>
            </section>

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
                                            { id: 'linkedin', label: 'LinkedIn URL', icon: <FaLinkedin className="text-[#0077b5]" /> },
                                            { id: 'github', label: 'GitHub URL', icon: <FaGithub className="text-gray-800 dark:text-white" /> },
                                            { id: 'googleScholar', label: 'Google Scholar URL', icon: <SiGooglescholar className="text-[#4285f4]" /> },
                                            { id: 'personalWebsite', label: 'Personal Website URL', icon: <FaGlobe className="text-indigo-600" /> }
                                        ].map((field) => (
                                            <div key={field.id} className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    {field.icon} {field.label}
                                                </label>
                                                <input
                                                    type="url"
                                                    value={tempLinks[field.id]}
                                                    onChange={(e) => setTempLinks({ ...tempLinks, [field.id]: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black dark:text-white"
                                                    placeholder={`https://${field.id === 'personalWebsite' ? 'example.com' : `${field.id}.com/in/...`}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                                        <button
                                            onClick={() => setIsSocialModalOpen(false)}
                                            className="px-5 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                                            disabled={isUpdatingLinks}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setIsUpdatingLinks(true);
                                                try {
                                                    await userApi.updateUser(user.uid, { links: tempLinks });
                                                    toast.success('Social links updated successfully');
                                                    setIsSocialModalOpen(false);
                                                    fetchUserProfile();
                                                } catch (error) {
                                                    toast.error('Failed to update social links');
                                                } finally {
                                                    setIsUpdatingLinks(false);
                                                }
                                            }}
                                            className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            disabled={isUpdatingLinks}
                                        >
                                            {isUpdatingLinks ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <FaSave size={14} /> Save Changes
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
        </>
    );
};

export default SocialLinksSection;
