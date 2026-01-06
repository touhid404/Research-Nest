import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUsers,
} from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import { userApi } from '../../../lib/userApi';
import toast from 'react-hot-toast';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router';

const MyProfile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchUserProfile();
    }, [user?.uid]);

    // Redirect to overview if on root my-profile path is handled by router index now, 
    // but just in case or for cleaner tabs logic we can rely on router matching.

    const tabs = [
        { id: 'overview', label: 'Overview', path: 'overview' },
        { id: 'posts', label: 'My Posts', path: 'posts' },
        { id: 'workspace', label: 'Workspaces', path: 'workspace' },
    ];

    if (isLoadingProfile) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-800 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
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
                <div className="pt-14 px-6 pb-4">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="space-y-2">
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
        </div>
    );
};

export default MyProfile;
