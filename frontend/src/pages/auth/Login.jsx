
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FaGoogle, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import toast from 'react-hot-toast';

const Login = () => {
    const { signInUser, signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/home/posts";
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        setLoading(true);
        setError("");

        try {
            await signInUser(email, password);
            toast.success("Successfully Logged In!");
            navigate(from, { replace: true });
        } catch (err) {
            setError("Invalid email or password. Please try again.");
            toast.error("Login failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            await signInWithGoogle();
            toast.success("Successfully Logged In!");
            navigate(from, { replace: true });
        } catch (err) {
            setError("Google sign-in failed. Please try again.");
            toast.error("Google login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">

            {/* --- Background Decorations (Matches Landing Page) --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            {/* --- Login Card --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl p-8"
            >
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors mb-6">
                    <FaArrowLeft /> Back to Home
                </Link>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                        Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Back.</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Sign in to continue your research journey.
                    </p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-center text-sm text-red-600 dark:text-red-400">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative group">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Email Address"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="relative group">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Password"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center justify-end">
                        <Link
                            to="/auth/forget-pass"
                            className="text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-lg">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-semibold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    <FaGoogle className="text-red-500 text-xl" />
                    <span>Sign in with Google</span>
                </button>

                <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
                    Don't have an account?{" "}
                    <Link
                        to="/auth/register"
                        className="font-bold text-violet-600 hover:text-violet-500 dark:text-violet-400 transition-colors"
                    >
                        Create Free Account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
