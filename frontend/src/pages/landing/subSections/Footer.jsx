import { useState } from 'react';
import { Link } from 'react-router';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { IoStar } from 'react-icons/io5';
import useAuth from '../../../hooks/useAuth';
import ReviewModal from '../../../components/common/ReviewModal';

const Footer = () => {
    const { user } = useAuth();
    const [showReviewModal, setShowReviewModal] = useState(false);

    const handleReviewModalClose = () => {
        setShowReviewModal(false);
        
    };

    return (
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                    {/* Logo, Description & Review Button */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-3 w-3 rounded-full bg-violet-600"></span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Research Nest</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm text-center md:text-left max-w-sm">
                            Empowering researchers with AI-driven tools and seamless collaboration.
                        </p>
                        {/* Review Button */}
                        {user && (
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
                            >
                                <IoStar size={18} />
                                Give a Review
                            </button>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-3">
                        <a href="#" className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white transition-all">
                            <FaGithub size={18} />
                        </a>
                        <a href="#" className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all">
                            <FaLinkedin size={18} />
                        </a>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Research Nest. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-300">Terms of Service</Link>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={handleReviewModalClose}
                existingReview={null}
            />
        </footer>
    );
};

export default Footer;
