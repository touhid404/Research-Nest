import { axiosInstance } from "./axios";

export const notificationsApi = {
    getAll: async () => {
        const response = await axiosInstance.get('/notifications');
        return response.data;
    },
    markAsRead: async (id) => {
        const response = await axiosInstance.patch(`/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await axiosInstance.patch('/notifications/read-all');
        return response.data;
    }
};
