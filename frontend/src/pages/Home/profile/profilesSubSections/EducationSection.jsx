import React, { useState } from 'react';
import { FaGraduationCap, FaEdit, FaTimes, FaPlus, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { userApi } from '../../../../lib/userApi';
import ConfirmModal from '../../../../components/common/ConfirmModal';

const EducationSection = ({ profileData, user, fetchUserProfile }) => {
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [educationForm, setEducationForm] = useState({
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [editingEducationIndex, setEditingEducationIndex] = useState(-1);
    const [isUpdatingEducation, setIsUpdatingEducation] = useState(false);

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);

    const handleSaveEducation = async () => {
        setIsUpdatingEducation(true);
        try {
            let newEducation = [...(profileData?.education || [])];
            if (editingEducationIndex >= 0) {
                newEducation[editingEducationIndex] = educationForm;
            } else {
                newEducation.push(educationForm);
            }
            await userApi.updateUser(user.uid, { education: newEducation });
            toast.success('Education updated successfully');
            setIsEducationModalOpen(false);
            fetchUserProfile();
        } catch (error) {
            toast.error('Failed to update education');
        } finally {
            setIsUpdatingEducation(false);
        }
    };

    const handleDeleteClick = (index) => {
        setItemToDeleteIndex(index);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteEducation = async () => {
        if (itemToDeleteIndex === null) return;

        setIsUpdatingEducation(true);
        try {
            const newEducation = profileData?.education?.filter((_, i) => i !== itemToDeleteIndex) || [];
            await userApi.updateUser(user.uid, { education: newEducation });
            toast.success('Education deleted successfully');
            fetchUserProfile();
        } catch (error) {
            toast.error('Failed to delete education');
        } finally {
            setIsUpdatingEducation(false);
            setIsDeleteModalOpen(false);
            setItemToDeleteIndex(null);
        }
    };

    return (
        <>
            <section className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 text-black dark:text-white shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Education</h3>
                    <button
                        onClick={() => {
                            setEducationForm({
                                school: '',
                                degree: '',
                                fieldOfStudy: '',
                                startDate: '',
                                endDate: '',
                                description: ''
                            });
                            setEditingEducationIndex(-1);
                            setIsEducationModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 transition-colors"
                    >
                        <FaPlus size={14} />
                    </button>
                </div>
                <div className="space-y-6">
                    {profileData?.education?.length > 0 ? (
                        profileData.education
                            .map((edu, originalIdx) => ({ ...edu, originalIdx }))
                            .sort((a, b) => {
                                const dateA = a.endDate ? new Date(a.endDate) : new Date(8640000000000000);
                                const dateB = b.endDate ? new Date(b.endDate) : new Date(8640000000000000);
                                if (dateB - dateA !== 0) return dateB - dateA;
                                return new Date(b.startDate) - new Date(a.startDate);
                            }).map((edu, idx, sortedArr) => (
                                <div key={edu.originalIdx} className="flex gap-4 relative group">
                                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                        <FaGraduationCap size={24} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg">{edu.school}</h4>
                                                <p className="text-indigo-600 dark:text-indigo-400 font-medium">{edu.degree} • {edu.fieldOfStudy}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        const { originalIdx, ...cleanEdu } = edu;
                                                        setEducationForm(cleanEdu);
                                                        setEditingEducationIndex(edu.originalIdx);
                                                        setIsEducationModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <FaEdit size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(edu.originalIdx)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        </div>
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
                                    {idx !== sortedArr.length - 1 && (
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteEducation}
                title="Delete Education"
                message="Are you sure you want to delete this education entry? This action cannot be undone."
                confirmText="Delete"
                isDanger={true}
            />

            {/* Education Modal */}
            <AnimatePresence>
                {isEducationModalOpen && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEducationModalOpen(false)}
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
                                    {editingEducationIndex >= 0 ? "Edit Education" : "Add Education"}
                                </h2>
                                <button
                                    onClick={() => setIsEducationModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-400 dark:text-gray-500 transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">School / University</label>
                                        <input
                                            type="text"
                                            value={educationForm.school}
                                            onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                            placeholder="Ex: Harvard University"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Degree</label>
                                        <input
                                            type="text"
                                            value={educationForm.degree}
                                            onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                            placeholder="Ex: Bachelor's"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Field of Study</label>
                                        <input
                                            type="text"
                                            value={educationForm.fieldOfStudy}
                                            onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                            placeholder="Ex: Computer Science"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={educationForm.startDate ? new Date(educationForm.startDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:bg-white focus:dark:bg-slate-800 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">End Date</label>
                                            <input
                                                type="date"
                                                value={educationForm.endDate ? new Date(educationForm.endDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setEducationForm({ ...educationForm, endDate: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:bg-white focus:dark:bg-slate-800 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                            />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Leave blank if present</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Description</label>
                                        <textarea
                                            value={educationForm.description}
                                            onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white min-h-[100px]"
                                            placeholder="Description of your studies, achievements, participation, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEducationModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                    disabled={isUpdatingEducation}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEducation}
                                    className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2"
                                    disabled={isUpdatingEducation}
                                >
                                    {isUpdatingEducation ? (
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

export default EducationSection;
