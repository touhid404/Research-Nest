import mongoose from "mongoose";


const paperSchema = new mongoose.Schema(
    {
        user: {
            uid: { type: String, required: true },
            name: { type: String, required: true },
            email: { type: String, required: true },
            photoURL: { type: String, required: true },
        },


        title: {
            type: String,
            required: true,
            trim: true,
        },
        abstract: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        researchDomain: {
            type: String,
            required: true,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        paperLink: {
            type: String,
            trim: true,
        },
        // New metadata fields
        coAuthors: {
            type: [String], // Array of names
            default: [],
        },
        publicationDate: {
            type: Date,
        },
        publicationName: {
            type: String, // Journal or Conference name
            trim: true,
        },
        doi: {
            type: String,
            trim: true,
        },
        // Main PDF file of the paper
        paperFile: {
            name: { type: String },
            url: { type: String },
        },
        status: {
            type: String,
            enum: ["published", "draft", "archived"],
            default: "published",
        },
    },
    { timestamps: true }
);


const Paper = mongoose.model("Paper", paperSchema);


export default Paper;



