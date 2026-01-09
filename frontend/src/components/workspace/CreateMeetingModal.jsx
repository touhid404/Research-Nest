import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoCloseOutline,
    IoVideocamOutline,
    IoCallOutline,
    IoLocationOutline,
    IoRocketOutline,
    IoPeopleOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import useWorkspaceStore from "../../store/useWorkspaceStore";
import useAuth from "../../hooks/useAuth";

const CreateMeetingModal = ({ isOpen, onClose, workspace }) => {
    const { createMeeting } = useWorkspaceStore();
    const { user } = useAuth();

    // Filter out current user (owner) from selectable members
    const selectableMembers = useMemo(() => {
        if (!workspace?.members || !user) return [];
        return workspace.members.filter((member) => member.uid !== user.uid);
    }, [workspace?.members, user?.uid]);

    const [meetingMode, setMeetingMode] = useState("instant");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "video",
        date: "",
        startTime: "",
        duration: 30,
        externalLink: "",
    });
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset to defaults when opening
            setMeetingMode("instant");
            setFormData({
                title: "",
                description: "",
                type: "video",
                date: new Date().toISOString().split("T")[0],
                startTime: "",
                duration: 30,
                externalLink: "",
            });
            setSelectedParticipants([]);
        }
    }, [isOpen]);

    const handleToggleParticipant = (member) => {
        const isSelected = selectedParticipants.some((p) => p.uid === member.uid);
        if (isSelected) {
            setSelectedParticipants(selectedParticipants.filter((p) => p.uid !== member.uid));
        } else {
            setSelectedParticipants([...selectedParticipants, member]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isInstant = meetingMode === "instant";

        if (!isInstant && (!formData.date || !formData.startTime)) {
            toast.error("Please select date and start time");
            return;
        }

        // Require at least 1 participant (other than owner)
        if (selectedParticipants.length === 0) {
            toast.error("Please select at least one participant");
            return;
        }

        setIsSubmitting(true);

        try {
            // Auto-include owner and selected participants
            const participantIds = [user.uid, ...selectedParticipants.map((p) => p.uid)];
            
            const meetingData = {
                workspaceId: workspace._id,
                title: formData.title.trim() || (isInstant ? "Quick Meeting" : "Scheduled Meeting"),
                description: formData.description.trim(),
                type: formData.type,
                participants: participantIds,
                externalLink: formData.externalLink.trim() || null,
                isInstant,
                duration: formData.duration,
            };

            if (!isInstant) {
                const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
                meetingData.startTime = startDateTime.toISOString();
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

    const meetingTypes = [
        { value: "video", label: "Video", icon: IoVideocamOutline },
        { value: "audio", label: "Audio", icon: IoCallOutline },
        { value: "in_person", label: "In Person", icon: IoLocationOutline },
    ];

    const durations = [
        { value: 15, label: "15m" },
        { value: 30, label: "30m" },
        { value: 45, label: "45m" },
        { value: 60, label: "1h" },
        { value: 90, label: "1.5h" },
        { value: 120, label: "2h" },
    ];

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
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
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
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
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                                        meetingMode === "instant"
                                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                                            : "text-slate-500 dark:text-slate-400"
                                    }`}
                                >
                                    Start Now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMeetingMode("scheduled")}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                                        meetingMode === "scheduled"
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
                            <div className="flex gap-2">
                                {meetingTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: type.value })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                                            formData.type === type.value
                                                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
                                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                                        }`}
                                    >
                                        <type.icon className="w-4 h-4" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>

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
                                <div className="flex gap-2">
                                    {durations.map((d) => (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, duration: d.value })}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                                formData.duration === d.value
                                                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* External Link */}
                            <div>
                                <input
                                    type="url"
                                    value={formData.externalLink}
                                    onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                                    placeholder="External link (optional)"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm"
                                />
                            </div>

                            {/* Participants */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        <IoPeopleOutline className="w-3.5 h-3.5" />
                                        Participants ({selectedParticipants.length + 1} total)
                                    </label>
                                    {selectableMembers.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedParticipants(
                                                selectedParticipants.length === selectableMembers.length ? [] : selectableMembers
                                            )}
                                            className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
                                        >
                                            {selectedParticipants.length === selectableMembers.length ? "Clear" : "Select All"}
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar p-1">
                                    {/* Owner - always included */}
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500">
                                        <div className="w-5 h-5 rounded-full overflow-hidden bg-linear-to-br from-emerald-500 to-green-600 shrink-0">
                                            {user?.photoURL ? (
                                                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full text-white text-[9px] font-medium">
                                                    {user?.displayName?.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        You (Host)
                                    </div>
                                    
                                    {/* Selectable members */}
                                    {selectableMembers.map((member) => (
                                        <button
                                            key={member.uid}
                                            type="button"
                                            onClick={() => handleToggleParticipant(member)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                                selectedParticipants.some((p) => p.uid === member.uid)
                                                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            <div className="w-5 h-5 rounded-full overflow-hidden bg-linear-to-br from-violet-500 to-purple-600 shrink-0">
                                                {member.user?.photoURL ? (
                                                    <img src={member.user.photoURL} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="flex items-center justify-center w-full h-full text-white text-[9px] font-medium">
                                                        {member.user?.name?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            {member.user?.name?.split(" ")[0]}
                                        </button>
                                    ))}
                                    
                                    {selectableMembers.length === 0 && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 py-2">
                                            No other members in this workspace
                                        </p>
                                    )}
                                </div>
                                {selectableMembers.length > 0 && selectedParticipants.length === 0 && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                                        Select at least one participant
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting || (selectableMembers.length > 0 && selectedParticipants.length === 0)}
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
