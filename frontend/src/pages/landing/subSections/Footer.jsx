import React from 'react';
import { Link } from 'react-router';
import { FaTwitter, FaGithub, FaLinkedin, FaDiscord } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-3 w-3 rounded-full bg-violet-600"></span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Research Nest</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Empowering the next generation of researchers with AI-driven tools and seamless collaboration.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link to="/features" className="hover:text-violet-600 transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-violet-600 transition-colors">Pricing</Link></li>
                            <li><Link to="/about" className="hover:text-violet-600 transition-colors">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-violet-600 transition-colors">Careers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link to="/blog" className="hover:text-violet-600 transition-colors">Blog</Link></li>
                            <li><Link to="/docs" className="hover:text-violet-600 transition-colors">Documentation</Link></li>
                            <li><Link to="/community" className="hover:text-violet-600 transition-colors">Community</Link></li>
                            <li><Link to="/help" className="hover:text-violet-600 transition-colors">Help Center</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-600 hover:text-white transition-all">
                                <FaTwitter size={18} />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white transition-all">
                                <FaGithub size={18} />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all">
                                <FaLinkedin size={18} />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-all">
                                <FaDiscord size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Research Nest. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-300">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
