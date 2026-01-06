import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../../../lib/userApi';

const BioSection = ({ profileData, user, fetchUserProfile }) => {
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState('');
    const [isUpdatingBio, setIsUpdatingBio] = useState(false);

    return (
        <section className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold dark:text-white">Bio</h3>
                {!isEditingBio ? (
                    <button
                        onClick={() => {
                            setTempBio(profileData?.bio || '');
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
                            disabled={isUpdatingBio}
                        >
                            <FaTimes size={14} />
                        </button>
                        <button
                            onClick={async () => {
                                setIsUpdatingBio(true);
                                try {
                                    await userApi.updateUser(user.uid, { bio: tempBio });
                                    toast.success('Bio updated successfully');
                                    setIsEditingBio(false);
                                    fetchUserProfile();
                                } catch (error) {
                                    toast.error('Failed to update bio');
                                } finally {
                                    setIsUpdatingBio(false);
                                }
                            }}
                            className="text-green-600 hover:text-green-700 p-2 rounded-xl bg-green-50 dark:bg-green-900/20 transition-colors"
                            disabled={isUpdatingBio}
                        >
                            {isUpdatingBio ? <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div> : <FaSave size={14} />}
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
                <p className="text-black dark:text-gray-400 leading-relaxed">
                    {profileData?.bio || <span className="text-gray-500 text-center block mb-2">No bio added yet. Update your profile to share your journey.</span>}
                </p>
            )}
        </section>
    );
};

export default BioSection;
