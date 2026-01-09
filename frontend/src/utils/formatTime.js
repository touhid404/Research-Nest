/**
 * Formats a date into a readable string based on the following rules:
 * - < 24 hours: "X hours ago" (or "X minutes ago")
 * - 1-7 days: "X days ago"
 * - > 7 days: Absolute date (e.g., "7 Jan, 2026")
 */
export const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
        return "just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays <= 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    // Absolute date for > 7 days
    const day = past.getDate();
    const month = past.toLocaleString('en-US', { month: 'short' });
    const year = past.getFullYear();

    // Check if it's the current year to potentially omit it (optional, but professional)
    if (year === now.getFullYear()) {
        return `${day} ${month}`;
    }
    return `${day} ${month}, ${year}`;
};

/**
 * Formats a date into a full detailed string: "D MMM YYYY, H:MM AM/PM"
 */
export const formatFullTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();

    return `${day} ${month} ${year}, ${time}`;
};

/**
 * Formats a date into clock time: "10:30 AM"
 */
export const formatClockTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

/**
 * Formats a date into full date-time: "10 Jan, 10:30 AM"
 */
export const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const time = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    return `${day} ${month}, ${time}`;
};

/**
 * Formats duration in minutes to readable string: "30m", "1h", "1h 30m"
 */
export const formatDuration = (minutes) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Formats time as short format: "10:30"
 */
export const formatShortTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit" 
    });
};
