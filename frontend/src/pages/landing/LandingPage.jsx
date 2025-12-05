import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { FaRocket, FaUsers, FaBrain, FaLock, FaBookOpen, FaCheckCircle } from 'react-icons/fa';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-900">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl space-y-6"
                >
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-gray-900 dark:text-white">
                        Where Ideas <span className="text-primary">Take Flight</span>
                    </h1>
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-300 sm:text-2xl">
                        Empowering students, researchers, and innovators with seamless tools to create, collaborate, and grow.
                    </p>
                    <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">
                        Research Nest is your digital workspace for managing projects, exploring knowledge, and turning insights into impactful results.
                        Discover a smarter way to organize your research. From streamlined documentation to collaborative tools and intelligent search,
                        Research Nest helps you focus on what truly matters—your work.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <Link to="/home" className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-transform text-white">
                            Get Started
                        </Link>
                        <button className="btn btn-outline btn-lg hover:scale-105 transition-transform dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-gray-900">
                            Learn More
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Core Features Section */}
            <section className="px-6 py-20 bg-gray-50 dark:bg-gray-800/50">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 dark:text-white">Core Features</h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Everything you need to elevate your research workflow</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon={<FaBookOpen className="text-4xl text-blue-500" />}
                            title="Smart Research Management"
                            description="Organize documents, notes, references, and datasets in one powerful and intuitive platform."
                        />
                        <FeatureCard
                            icon={<FaUsers className="text-4xl text-green-500" />}
                            title="Collaboration-Ready Workspace"
                            description="Share projects, invite team members, and work together in real time."
                        />
                        <FeatureCard
                            icon={<FaBrain className="text-4xl text-purple-500" />}
                            title="AI-Powered Insights"
                            description="Summarize, analyze, and extract key findings instantly with built-in AI tools."
                        />
                        <FeatureCard
                            icon={<FaLock className="text-4xl text-red-500" />}
                            title="Secure Cloud Storage"
                            description="Your research is safe, encrypted, and accessible from anywhere."
                        />
                        <FeatureCard
                            icon={<FaRocket className="text-4xl text-orange-500" />}
                            title="Publication Support"
                            description="Format citations, generate reports, and prepare research for submission effortlessly."
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Research Nest */}
            <section className="px-6 py-20 bg-white dark:bg-gray-900">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center gap-12 lg:flex-row">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 dark:text-white">Why Choose Research Nest?</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Research Nest is designed for modern researchers who value clarity, efficiency, and innovation.
                                Whether you're a student, academic, or industry professional, we provide the tools you need to stay organized, informed, and ahead.
                            </p>
                            <ul className="space-y-4">
                                <ListItem text="Streamlined workflow for maximum productivity" />
                                <ListItem text="Advanced AI tools to accelerate discovery" />
                                <ListItem text="Secure and reliable platform for your data" />
                                <ListItem text="Community-driven innovation" />
                            </ul>
                        </div>
                        <div className="flex-1">
                            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-gray-100 dark:border-gray-600 shadow-xl">
                                <div className="space-y-4 text-center">
                                    <div className="inline-block p-4 rounded-full bg-white dark:bg-gray-600 text-primary shadow-sm">
                                        <FaRocket size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ready to Innovate?</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Join thousands of researchers who are transforming the way they work.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="px-6 py-24 text-center bg-primary text-primary-content">
                <div className="mx-auto max-w-4xl space-y-8">
                    <h2 className="text-4xl font-bold sm:text-5xl text-white">Start Building Your Nest Today.</h2>
                    <p className="text-xl opacity-90 text-blue-50">
                        Create your free workspace and elevate your research journey.
                    </p>
                    <Link to="/home" className="btn btn-lg bg-white text-primary hover:bg-gray-100 border-none shadow-lg font-bold">
                        Create Free Workspace
                    </Link>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
    >
        <div className="mb-4">{icon}</div>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
);

const ListItem = ({ text }) => (
    <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
        <FaCheckCircle className="text-primary flex-shrink-0" />
        <span className="text-lg">{text}</span>
    </li>
);

export default LandingPage;