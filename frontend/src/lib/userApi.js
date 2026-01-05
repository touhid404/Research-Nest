import { axiosInstance } from "./axios";


export const userApi = {
    // Get all users
    getAllUsers: async () => {
        const response = await axiosInstance.get("/users");
        return response.data;
    },


    // Update user profile
    updateUser: async (uid, updateData) => {
        const response = await axiosInstance.put(`/users/${uid}`, updateData);
        return response.data;
    },

    // Get user by UID
    getUserByUid: async (uid) => {
        const response = await axiosInstance.get(`/users/${uid}`);
        return response.data;
    },
};