import React, { useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";

const GoogleSignInButton = ({ label = "Sign in with Google", className = "", loading: externalLoading, setLoading: externalSetLoading }) => {
    const { signInWithGoogle } = useAuth();
    const [localLoading, setLocalLoading] = useState(false);
    const navigate = useNavigate();

    const loading = externalLoading !== undefined ? externalLoading : localLoading;
    const setLoading = externalSetLoading || setLocalLoading;

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const res = await signInWithGoogle();
            const userDataToSend = {
                uid: res.user.uid,
                email: res.user.email,
                name: res.user.displayName,
                photoURL: res.user.photoURL,
            };

            const response = await axiosInstance.post(
                "/auth/google-login",
                userDataToSend
            );

            if (response.status === 201 || response.status === 200) {
                toast.success("Successfully Registered!");
                navigate("/home/posts");
            } else {
                toast.error(response.data.message || "Login failed");
            }
        } catch (err) {
            console.error("Google Sign-In Error:", err);
            toast.error("Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleGoogleSignIn}
            type="button"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-semibold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 ${className}`}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M47.532 24.5528C47.532 22.8886 47.396 21.2819 47.1352 19.7432H24.48V28.9181H37.4432C36.9056 31.8933 35.176 34.4256 32.6144 36.1211V42.2307H40.3808C44.9216 38.052 47.532 31.88 47.532 24.5528Z"
                    fill="#4285F4"
                />
                <path
                    d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2307L32.6224 36.1211C30.472 37.5744 27.72 38.4239 24.48 38.4239C18.2272 38.4239 12.9184 34.1867 11.0136 28.4896H3.03921V34.6648C7.00161 42.548 15.1104 48.0016 24.48 48.0016Z"
                    fill="#34A853"
                />
                <path
                    d="M11.0056 28.4891C10.5224 27.0544 10.2504 25.5264 10.2504 23.9413C10.2504 22.3563 10.5224 20.8283 11.0056 19.3936V13.2184H3.03921C1.40321 16.44-0.513601 20.0811-0.513601 23.9413C-0.513601 27.8016 1.40321 31.4427 3.03921 34.6643L11.0056 28.4891Z"
                    fill="#FBBC05"
                />
                <path
                    d="M24.48 9.49922C28.0104 9.49922 31.18 10.7187 33.6704 13.0997L40.5632 6.20642C36.4016 2.36162 30.9432 0 24.48 0C15.1104 0 7.00161 5.45362 3.03921 13.2168L11.0056 19.392C12.9184 13.6944 18.2272 9.49922 24.48 9.49922Z"
                    fill="#EA4335"
                />
            </svg>
            <span>{loading ? "Connecting..." : label}</span>
        </button>
    );
};

export default GoogleSignInButton;
