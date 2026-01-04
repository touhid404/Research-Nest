import Paper from "../../models/paper.model.js";


export const createPaperInDB = async (paperData) => {
    const result = await Paper.create(paperData);
    return result;
};


export const getAllPapersInDB = async (query = {}) => {
    const { excludeUid } = query;
    let filter = {};
    if (excludeUid) {
        filter = { "user.uid": { $ne: excludeUid } };
    }


    // Sort by newest first
    const result = await Paper.find(filter).sort({ createdAt: -1 });
    return result;
};


export const getAllPapersByUserInDB = async (uid) => {
    const result = await Paper.find({ "user.uid": uid }).sort({ createdAt: -1 });
    return result;
};


export const getPaperByIdInDB = async (id) => {
    const result = await Paper.findById(id);
    return result;
};


export const deletePaperInDB = async (id) => {
    const result = await Paper.findByIdAndDelete(id);
    return result;
};





