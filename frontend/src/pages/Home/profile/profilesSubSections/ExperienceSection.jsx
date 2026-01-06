import React, { useState } from 'react';
import { FaBriefcase, FaEdit, FaTimes, FaPlus, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { userApi } from '../../../../lib/userApi';
import ConfirmModal from '../../../../components/common/ConfirmModal';

const ExperienceSection = ({ profileData, user, fetchUserProfile }) => {
    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
    const [experienceForm, setExperienceForm] = useState({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [editingExperienceIndex, setEditingExperienceIndex] = useState(-1);
    const [isUpdatingExperience, setIsUpdatingExperience] = useState(false);

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);

    const handleSaveExperience = async () => {
        setIsUpdatingExperience(true);
        try {
            let newExperience = [...(profileData?.experience || [])];
            if (editingExperienceIndex >= 0) {
                newExperience[editingExperienceIndex] = experienceForm;
            } else {
                newExperience.push(experienceForm);
            }
            await userApi.updateUser(user.uid, { experience: newExperience });
            toast.success('Experience updated successfully');
            setIsExperienceModalOpen(false);
            fetchUserProfile();
        } catch (error) {
            toast.error('Failed to update experience');
        } finally {
            setIsUpdatingExperience(false);
        }
    };

    const handleDeleteClick = (index) => {
        setItemToDeleteIndex(index);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteExperience = async () => {
        if (itemToDeleteIndex === null) return;

        setIsUpdatingExperience(true);
        try {
            const newExperience = profileData?.experience?.filter((_, i) => i !== itemToDeleteIndex) || [];
            await userApi.updateUser(user.uid, { experience: newExperience });
            toast.success('Experience deleted successfully');
            fetchUserProfile();
        } catch (error) {
            toast.error('Failed to delete experience');
        } finally {
            setIsUpdatingExperience(false);
            setIsDeleteModalOpen(false);
            setItemToDeleteIndex(null);
        }
    };

    return (
        <>
            <section className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 text-black dark:text-white shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Experience</h3>
                    <button
                        onClick={() => {
                            setExperienceForm({
                                title: '',
                                company: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                description: ''
                            });
                            setEditingExperienceIndex(-1);
                            setIsExperienceModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 transition-colors"
                    >
                        <FaPlus size={14} />
                    </button>
                </div>
                <div className="space-y-6">
                    {profileData?.experience?.length > 0 ? (
                        [...(profileData.experience)].sort((a, b) => {
                            const dateA = a.endDate ? new Date(a.endDate) : new Date(8640000000000000);
                            const dateB = b.endDate ? new Date(b.endDate) : new Date(8640000000000000);
                            if (dateB - dateA !== 0) return dateB - dateA;
                            return new Date(b.startDate) - new Date(a.startDate);
                        }).map((exp, idx, sortedArr) => (
                            <div key={idx} className="flex gap-4 relative group">
                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                    <FaBriefcase size={22} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg">{exp.title}</h4>
                                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setExperienceForm(exp);
                                                    setEditingExperienceIndex(idx);
                                                    setIsExperienceModalOpen(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <FaEdit size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(idx)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    </div>
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
                                {idx !== sortedArr.length - 1 && (
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteExperience}
                title="Delete Experience"
                message="Are you sure you want to delete this experience entry? This action cannot be undone."
                confirmText="Delete"
                isDanger={true}
            />

            {/* Experience Modal */}
            <AnimatePresence>
                {isExperienceModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsExperienceModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold dark:text-white">
                                    {editingExperienceIndex >= 0 ? "Edit Experience" : "Add Experience"}
                                </h2>
                                <button
                                    onClick={() => setIsExperienceModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-400 dark:text-gray-500 transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Title / Role</label>
                                        <input
                                            type="text"
                                            value={experienceForm.title}
                                            onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                            placeholder="Ex: Senior Researcher"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Company / Organization</label>
                                        <input
                                            type="text"
                                            value={experienceForm.company}
                                            onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                            placeholder="Ex: Research Nest"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Location</label>
                                        <input
                                            type="text"
                                            value={experienceForm.location}
                                            onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                            placeholder="Ex: New York, USA"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={experienceForm.startDate ? new Date(experienceForm.startDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:bg-white focus:dark:bg-slate-800 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">End Date</label>
                                            <input
                                                type="date"
                                                value={experienceForm.endDate ? new Date(experienceForm.endDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:bg-white focus:dark:bg-slate-800 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                            />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Leave blank if present</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Description</label>
                                        <textarea
                                            value={experienceForm.description}
                                            onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-sla-te200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white min-h-[100px]"
                                            placeholder="Description of your role, responsibilities, projects, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsExperienceModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                    disabled={isUpdatingExperience}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveExperience}
                                    className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2"
                                    disabled={isUpdatingExperience}
                                >
                                    {isUpdatingExperience ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FaSave /> Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ExperienceSection;
