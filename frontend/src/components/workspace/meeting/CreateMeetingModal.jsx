import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoCloseOutline,
    IoVideocamOutline,
    IoRocketOutline,
    IoPeopleOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import useWorkspaceStore from "../../../store/useWorkspaceStore";
import useAuth from "../../../hooks/useAuth";

const CreateMeetingModal = ({ isOpen, onClose, workspace }) => {
    const { createMeeting } = useWorkspaceStore();
    const { user } = useAuth();

    const [meetingMode, setMeetingMode] = useState("instant");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        startTime: "",
        duration: null, // null means no end time
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCustomDuration, setShowCustomDuration] = useState(false);
    const [customMinutes, setCustomMinutes] = useState("");

    useEffect(() => {
        if (isOpen) {
            // Reset to defaults when opening
            setMeetingMode("instant");
            setFormData({
                title: "",
                description: "",
                date: new Date().toISOString().split("T")[0],
                startTime: "",
                duration: null, // null means no end time
            });

            setShowCustomDuration(false);
            setCustomMinutes("");
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isInstant = meetingMode === "instant";

        if (!isInstant && (!formData.date || !formData.startTime)) {
            toast.error("Please select date and start time");
            return;
        }

        setIsSubmitting(true);

        try {
            const meetingData = {
                workspaceId: workspace._id,
                title: formData.title.trim() || (isInstant ? "Quick Meeting" : "Scheduled Meeting"),
                description: formData.description.trim(),
                isInstant,
                duration: formData.duration,
            };

            if (!isInstant) {
                const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
                meetingData.startTime = startDateTime.toISOString();
                console.log("=== Meeting Creation Debug ===");
                console.log("Form date:", formData.date);
                console.log("Form time:", formData.startTime);
                console.log("Combined local:", `${formData.date}T${formData.startTime}`);
                console.log("Parsed Date object:", startDateTime.toString());
                console.log("ISO string sent:", meetingData.startTime);
            }

            await createMeeting(meetingData);
            toast.success(isInstant ? "Meeting started!" : "Meeting scheduled!");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create meeting");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const durations = [
        { value: null, label: "None" }, // No end time option
        { value: 15, label: "15m" },
        { value: 30, label: "30m" },
        { value: 60, label: "1h" },
        { value: 120, label: "2h" },
    ];

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-3">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isSubmitting ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="relative w-full max-w-[470px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative px-6 pt-6 pb-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-violet-500/10 to-purple-500/10 rounded-bl-full" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                                        <IoVideocamOutline className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                            New Meeting
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Start or schedule a meeting
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <IoCloseOutline className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Mode Toggle */}
                        <div className="px-6">
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                <button
                                    type="button"
                                    onClick={() => setMeetingMode("instant")}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${meetingMode === "instant"
                                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    Start Now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMeetingMode("scheduled")}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${meetingMode === "scheduled"
                                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    Schedule
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Title */}
                            <div>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Meeting title (optional)"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm"
                                />
                            </div>

                            {/* Meeting Type */}


                            {/* Scheduled: Date & Time */}
                            {meetingMode === "scheduled" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm"
                                    />
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm"
                                    />
                                </div>
                            )}

                            {/* Duration */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    Duration
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {durations.map((d) => (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, duration: d.value });
                                                setShowCustomDuration(false);
                                                setCustomMinutes("");
                                            }}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${(d.value === null ? formData.duration === null : formData.duration === d.value) && !showCustomDuration
                                                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomDuration(!showCustomDuration)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${showCustomDuration
                                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        Custom
                                    </button>
                                </div>
                                {showCustomDuration && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="2"
                                            max="480"
                                            value={customMinutes}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setCustomMinutes(value);
                                                if (value && parseInt(value) >= 2) {
                                                    setFormData({ ...formData, duration: parseInt(value) });
                                                }
                                            }}
                                            placeholder="Enter minutes"
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm"
                                        />
                                        <span className="text-sm text-slate-500 dark:text-slate-400">minutes</span>
                                    </div>
                                )}
                            </div>

                            {/* External Link */}


                            {/* Participants Note */}
                            <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/20 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-800 flex items-center justify-center shrink-0">
                                        <IoPeopleOutline className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-200">
                                            Everyone is invited
                                        </h3>
                                        <p className="text-xs text-violet-700 dark:text-violet-400 mt-0.5">
                                            All workspace members will be automatically added to this meeting.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <IoRocketOutline className="w-4 h-4" />
                                        {meetingMode === "instant" ? "Start Meeting" : "Schedule Meeting"}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;

    return createPortal(modalContent, document.body);
};

export default CreateMeetingModal;
