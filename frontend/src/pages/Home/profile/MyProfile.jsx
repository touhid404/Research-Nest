/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUsers, FaEdit, FaCamera, FaSave, FaTimes, FaCheck, FaExclamationCircle, FaSpinner
} from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import { userApi } from '../../../lib/userApi';
import toast from 'react-hot-toast';
import { Outlet, NavLink } from 'react-router';
import ProfileLoader from '../../../components/loader/ProfileLoader';

const MyProfile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    // Edit Profile Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        username: ''
    });
    const [usernameStatus, setUsernameStatus] = useState({
        checking: false,
        available: null,
        message: '',
        suggestions: []
    });
    const [isSaving, setIsSaving] = useState(false);

    // Debounce username check
    const [debouncedUsername, setDebouncedUsername] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedUsername(editForm.username);
        }, 500);
        return () => clearTimeout(timer);
    }, [editForm.username]);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!debouncedUsername || debouncedUsername === profileData?.username) {
                setUsernameStatus({ checking: false, available: true, message: '', suggestions: [] });
                return;
            }

            setUsernameStatus(prev => ({ ...prev, checking: true }));
            try {
                const res = await userApi.checkUsername(debouncedUsername, user?.uid);
                if (res.success) {
                    setUsernameStatus({
                        checking: false,
                        available: res.available,
                        message: res.message,
                        suggestions: res.suggestions || []
                    });
                }
            } catch (error) {
                console.error('Error checking username:', error);
            } finally {
                setUsernameStatus(prev => ({ ...prev, checking: false }));
            }
        };

        if (isEditModalOpen) {
            checkAvailability();
        }
    }, [debouncedUsername, isEditModalOpen, profileData?.username, user?.uid]);

    const fetchUserProfile = async () => {
        if (!user?.uid) return;
        setIsLoadingProfile(true);
        try {
            const res = await userApi.getUserByUid(user.uid);
            if (res.success) {
                setProfileData(res.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile details');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!editForm.name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        if (!editForm.username.trim()) {
            toast.error("Username cannot be empty");
            return;
        }
        if (!usernameStatus.available && editForm.username !== profileData?.username) {
            toast.error("Please choose an available username");
            return;
        }

        setIsSaving(true);
        try {
            const res = await userApi.updateUser(user.uid, {
                name: editForm.name,
                username: editForm.username.toLowerCase()
            });

            if (res.success) {
                toast.success("Profile updated successfully");
                setIsEditModalOpen(false);
                fetchUserProfile();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [user?.uid]);

    // Redirect to overview if on root my-profile path is handled by router index now, 
    // but just in case or for cleaner tabs logic we can rely on router matching.

    const tabs = [
        { id: 'overview', label: 'Overview', path: 'overview' },
    ];

    if (isLoadingProfile) {
        return <ProfileLoader />;
    }

    return (
        <div className="min-h-screen bg-transparent pb-10 custom-scrollbar overflow-y-auto">
            {/* Header Section */}
            <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-900 md:rounded-4xl overflow-hidden border border-gray-100 dark:border-slate-800">
                <div className="relative h-28 w-full bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop')]">
                    <div className="absolute -bottom-12 left-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border border-white dark:border-slate-900 shadow-xl overflow-hidden bg-gray-200">
                                <img className="w-full h-full object-cover" src={profileData?.photoURL || user?.photoURL} alt={profileData?.name || user?.displayName} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-14 px-6 pb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-1">
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-quicksand">{profileData?.name || user?.displayName}</h1>
                                {(profileData?.isVerified || user?.isVerified) && (
                                    <div className="mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" fill="none" viewBox="0 0 24 24" className="text-[#0081f5]">
                                            <path fill="currentColor" fillRule="evenodd" d="M9.592 3.2c-.243.208-.365.312-.495.399-.298.2-.633.338-.985.408-.153.03-.313.043-.632.068-.801.064-1.202.096-1.536.214a2.713 2.713 0 0 0-1.655 1.655c-.118.334-.15.735-.214 1.536-.025.319-.038.479-.068.632-.07.352-.208.687-.408.985-.087.13-.191.252-.399.495-.521.612-.782.918-.935 1.238-.353.74-.353 1.6 0 2.34.153.32.414.626.935 1.238.208.243.312.365.399.495.2.298.338.633.408.985.03.153.043.313.068.632.064.801.096 1.202.214 1.536a2.713 2.713 0 0 0 1.655 1.655c.334.118.735.15 1.536.214.319.025.479.038.632.068.352.07.687.209.985.408.13.087.252.191.495.399.612.521.918.782 1.238.935.74.353 1.6.353 2.34 0 .32-.153.626-.414 1.238-.935.243-.208.365-.312.495-.399.298-.2.633-.338.985-.408.153-.03.313-.043.632-.068.801-.064 1.202-.096 1.536-.214a2.713 2.713 0 0 0 1.655-1.655c.118-.334.15-.735.214-1.536.025-.319.038-.479.068-.632.07-.352.209-.687.408-.985.087-.13.191-.252.399-.495.521-.612.782-.918.935-1.238.353-.74.353-1.6 0-2.34-.153-.32-.414-.626-.935-1.238-.208-.243-.312-.365-.399-.495a2.713 2.713 0 0 1-.408-.985 5.72 5.72 0 0 1-.068-.632c-.064-.801-.096-1.202-.214-1.536a2.713 2.713 0 0 0-1.655-1.655c-.334-.118-.735-.15-1.536-.214-.319-.025-.479-.038-.632-.068a2.713 2.713 0 0 1-.985-.408 5.73 5.73 0 0 1-.495-.399c-.612-.521-.918-.782-1.238-.935a2.713 2.713 0 0 0-2.34 0c-.32.153-.626.414-1.238.935Zm6.781 6.663a.814.814 0 0 0-1.15-1.15l-4.85 4.85-1.596-1.595a.814.814 0 0 0-1.15 1.15l2.17 2.17a.814.814 0 0 0 1.15 0l5.427-5.425Z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <p className="text-md font-bold text-gray-400 dark:text-gray-500">@{profileData?.username || user?.username || "username"}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 md:gap-8 items-center">
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

                            <button
                                onClick={() => {
                                    setEditForm({
                                        name: profileData?.name || user?.displayName || '',
                                        username: profileData?.username || ''
                                    });
                                    setIsEditModalOpen(true);
                                }}
                                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
                            >
                                <FaEdit size={14} />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-6 mt-4">
                <div className="flex gap-8 border-b border-gray-100 dark:border-slate-900">
                    {tabs.map(tab => (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            className={({ isActive }) => `pb-3 text-sm font-semibold transition-all relative ${isActive
                                ? 'text-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {({ isActive }) => (
                                <>
                                    {tab.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-6 mt-6">
                <Outlet context={{ profileData, user, fetchUserProfile }} />
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaEdit className="text-primary" />
                                    Edit Profile
                                </h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    <FaTimes className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                                            <img
                                                src={profileData?.photoURL || user?.photoURL}
                                                alt="Profile"
                                                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                                            />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                                                <FaCamera size={18} />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Profile Picture</span>
                                </div>

                                <div className="space-y-5">
                                    {/* Name Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    {/* Username Input */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Username</label>
                                            {editForm.username && usernameStatus.checking && (
                                                <div className="flex items-center gap-1.5 text-xs text-primary animate-pulse">
                                                    <FaSpinner className="animate-spin" size={10} />
                                                    Checking availability...
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                                                className={`w-full bg-slate-50 dark:bg-slate-800 border ${usernameStatus.available === false ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl p-3.5 pl-8 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white`}
                                                placeholder="username"
                                            />
                                            {usernameStatus.available !== null && editForm.username !== profileData?.username && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {usernameStatus.available ? (
                                                        <FaCheck className="text-emerald-500" />
                                                    ) : (
                                                        <FaExclamationCircle className="text-red-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Message & Suggestions */}
                                        <AnimatePresence>
                                            {usernameStatus.available === false && editForm.username !== profileData?.username && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">
                                                        This username is already taken. Try these:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {usernameStatus.suggestions.map((suggestion) => (
                                                            <button
                                                                key={suggestion}
                                                                onClick={() => setEditForm(prev => ({ ...prev, username: suggestion }))}
                                                                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary rounded-lg text-[11px] font-bold text-gray-600 dark:text-gray-400 border border-transparent hover:border-primary/20 transition-all"
                                                            >
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Email Input (Disabled) */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-500 ml-1">Email Address (Cannot be changed)</label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={isSaving || (usernameStatus.available === false && editForm.username !== profileData?.username)}
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                                >
                                    {isSaving ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyProfile;
