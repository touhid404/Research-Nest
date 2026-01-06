import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            default: () => `user${Math.floor(Math.random() * 1000000)}`,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        photoURL: {
            type: String,
            default: "https://api.dicebear.com/7.x/adventurer/png?seed=8",
        },
        bio: {
            type: String,
            default: "",
            maxlength: 200,
        },
        gender: {
            type: String,
            default: "",
        },
        occupation: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["admin", "researcher"],
            default: "researcher", // changed default role
        },
        isVerified: {
            type: Boolean,
            default: true,  // for testing
        },
        researchInterests: {
            type: [String],
            default: [],
        },
        experience: [
            {
                title: String,
                company: String,
                location: String,
                startDate: Date,
                endDate: Date,
                description: String,
            },
        ],
        education: [
            {
                school: String,
                degree: String,
                fieldOfStudy: String,
                startDate: Date,
                endDate: Date,
                description: String,
            },
        ],
        links: {
            personalWebsite: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            googleScholar: { type: String, default: "" },
            github: { type: String, default: "" },
            other: [{ name: String, url: String }],
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;
