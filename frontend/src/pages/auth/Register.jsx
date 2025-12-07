import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaArrowLeft, FaArrowRight, FaMars, FaVenus, FaGenderless, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import toast from 'react-hot-toast';

const Register = () => {
    const { createUser, updateUserProfile, signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    // --- New State for Multi-Step ---
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        gender: "",
        role: "",
        interests: []
    });

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const toggleInterest = (interest) => {
        setFormData(prev => {
            const exists = prev.interests.includes(interest);
            if (exists) return { ...prev, interests: prev.interests.filter(i => i !== interest) };
            return { ...prev, interests: [...prev.interests, interest] };
        });
    }

    // --- Handlers ---

    const handleNext = () => {
        setError("");
        // Step 1: Personal (Gender/Role)
        if (step === 1) {
            if (!formData.gender || !formData.role) {
                setError("Please select your gender and role.");
                return;
            }
        }
        // Step 2: Interests (Optional or check length)
        if (step === 2) {
            // Optional validation
        }

        setStep(prev => prev + 1);
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleRegister = async () => {
        // Final Validation for Step 3
        if (!formData.name || !formData.email || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");

        // --- Log Data for Backend ---
        console.log("Full Registration Data:", formData);
        // -----------------------------

        try {
            await createUser(formData.email, formData.password);
            await updateUserProfile({ displayName: formData.name });
            // Here you would typically post formData to your backend user endpoint
            toast.success("Successfully Registered!");
            navigate("/home/posts");
        } catch (err) {
            if (err.message === "Firebase: Error (auth/email-already-in-use).") {
                setError("Email already in use")
            } else {
                setError("Registration failed. Please try again.")
            }
            toast.error("Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        setError("");
        try {
            await signInWithGoogle();
            toast.success("Successfully Registered!");
            navigate("/home/posts");
        } catch (err) {
            setError("Google sign-in failed. Please try again.");
            toast.error("Google signup failed.");
        } finally {
            setLoading(false);
        }
    };

    // --- Constants ---
    const genderOptions = [
        { id: 'male', label: 'Male', icon: <FaMars /> },
        { id: 'female', label: 'Female', icon: <FaVenus /> },
        { id: 'other', label: 'Other', icon: <FaGenderless /> }
    ];

    const roleOptions = ["Student", "Researcher", "Professor", "Company", "Enthusiast"];

    const interestTags = [
        "Artificial Intelligence", "Biotechnology", "Quantum Computing",
        "Robotics", "Neuroscience", "Blockchain", "Sustainability",
        "Space Science", "Nanotechnology", "Psychology"
    ];

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    };


    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">

            {/* --- Background --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <motion.div
                layout
                className="relative z-10 w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    {step > 1 ? (
                        <button onClick={handleBack} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"><FaArrowLeft /></button>
                    ) : (
                        <Link to="/" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"><FaArrowLeft /></Link>
                    )}

                    {/* Step Indicators */}
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-violet-600" : (i < step ? "w-2 bg-violet-400" : "w-2 bg-slate-300 dark:bg-slate-700")}`} />
                        ))}
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {step === 1 && "Personal Details"}
                        {step === 2 && "Research Interests"}
                        {step === 3 && "Create Account"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {step === 1 && "Tell us a bit about yourself"}
                        {step === 2 && "Pick topics you care about"}
                        {step === 3 && "Finalize your profile"}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-center text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait" custom={1}>
                    {step === 1 && (
                        <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 ml-1">Select Gender</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {genderOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => updateFormData("gender", opt.id)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.gender === opt.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-600' : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 text-slate-600 dark:text-slate-400'}`}
                                        >
                                            <span className="text-xl mb-1">{opt.icon}</span>
                                            <span className="text-xs font-medium">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 ml-1">I am a...</label>
                                <div className="flex flex-wrap gap-2">
                                    {roleOptions.map(role => (
                                        <button
                                            key={role}
                                            onClick={() => updateFormData("role", role)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${formData.role === role ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400'}`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">Select up to 5 topics</label>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {interestTags.map(tag => {
                                        const active = formData.interests.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => toggleInterest(tag)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${active ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-violet-400 text-slate-600 dark:text-slate-300'}`}
                                            >
                                                {active && <FaCheck size={10} />}
                                                {tag}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="text-center text-xs text-slate-400 mt-4">{formData.interests.length} selected</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                            <div className="relative group">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateFormData("name", e.target.value)}
                                    placeholder="Full Name"
                                    className="input-field"
                                />
                            </div>
                            <div className="relative group">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateFormData("email", e.target.value)}
                                    placeholder="Email Address"
                                    className="input-field"
                                />
                            </div>
                            <div className="relative group">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => updateFormData("password", e.target.value)}
                                    placeholder="Password"
                                    className="input-field"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Continue <FaArrowRight />
                        </button>
                    ) : (
                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {loading ? "Creating Profile..." : "Complete Registration"}
                        </button>
                    )}
                </div>

                {step === 1 && (
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400 mb-4">Or join with</p>
                        <button onClick={handleGoogleRegister} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300">
                            <FaGoogle className="text-red-500" /> Google
                        </button>
                        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                            Already have an account? <Link to="/auth/login" className="font-bold text-violet-600">Sign In</Link>
                        </p>
                    </div>
                )}
            </motion.div>

            <style>{`
          .input-field {
              width: 100%;
              background: transparent;
              background-color: rgb(248 250 252);
              border: 1px solid rgb(226 232 240);
              border-radius: 0.75rem;
              padding-top: 0.875rem;
              padding-bottom: 0.875rem;
              padding-left: 2.75rem;
              padding-right: 1rem;
              outline: none;
              transition: all 0.2s;
              color: rgb(15 23 42); 
          }
          :is(.dark .input-field) {
              background-color: rgb(2 6 23 / 0.5);
              border-color: rgb(51 65 85);
              color: white;
          }
          .input-field:focus {
              border-color: #8b5cf6;
              box-shadow: 0 0 0 1px #8b5cf6;
          }
      `}</style>
        </div>
    );
};

export default Register;