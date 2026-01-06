import React, { useState } from 'react';
import { FaEdit, FaTimes, FaSave, FaCheck, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../../../lib/userApi';

const ResearchInterestsSection = ({ profileData, user, fetchUserProfile }) => {
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [tempInterests, setTempInterests] = useState([]);
    const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);

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

    return (
        <section className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold dark:text-white">Research Interests</h3>
                {!isEditingInterests ? (
                    <button
                        onClick={() => {
                            setTempInterests(profileData?.researchInterests || []);
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
                            disabled={isUpdatingInterests}
                        >
                            <FaTimes size={14} />
                        </button>
                        <button
                            onClick={async () => {
                                if (tempInterests.length === 0) {
                                    toast.error('Choose at least 1 interest to save');
                                    return;
                                }
                                setIsUpdatingInterests(true);
                                try {
                                    await userApi.updateUser(user.uid, { researchInterests: tempInterests });
                                    toast.success('Interests updated successfully');
                                    setIsEditingInterests(false);
                                    fetchUserProfile();
                                } catch (error) {
                                    toast.error('Failed to update interests');
                                } finally {
                                    setIsUpdatingInterests(false);
                                }
                            }}
                            className={`p-2 rounded-xl transition-colors ${tempInterests.length === 0 ? 'text-gray-300 bg-gray-50' : 'text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/20'}`}
                            disabled={isUpdatingInterests}
                        >
                            {isUpdatingInterests ? <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div> : <FaSave size={14} />}
                        </button>
                    </div>
                )}
            </div>
            {isEditingInterests && (
                <p className="text-[11px] font-bold text-indigo-500 mb-4 animate-pulse uppercase tracking-wider">
                    * User must need to choose atleast 1 interests from the list
                </p>
            )}
            <div className="flex items-center justify-center flex-wrap gap-2">
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
                    profileData?.researchInterests?.length > 0 ? (
                        profileData.researchInterests.map((tech, idx) => (
                            <span
                                key={idx}
                                className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold"
                            >
                                {tech}
                            </span>
                        ))
                    ) : (
                        <div className="w-full flex flex-col items-center py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-2">
                                <FaPlus className="text-indigo-400" size={12} />
                            </div>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 text-center px-4">
                                Ready to share your expertise? <br />
                                <span className="text-indigo-500/70">Select your first interest to get started.</span>
                            </p>
                        </div>
                    )
                )}
            </div>
        </section>
    );
};

export default ResearchInterestsSection;
