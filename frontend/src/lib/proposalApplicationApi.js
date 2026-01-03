import { axiosInstance } from "./axios";
export const proposalApplicationApi = {
    // Send a collaboration request
    sendRequest: async (data) => {
        const response = await axiosInstance.post("/requests", data);
        return response.data;
    },


    // Get requests received by current user
    getReceivedRequests: async (status) => {
        let url = "/requests/received";
        if (status) {
            url += `?status=${status}`;
        }
        const response = await axiosInstance.get(url);
        return response.data;
    },


    // Get requests sent by current user
    getSentRequests: async () => {
        const response = await axiosInstance.get("/requests/sent");
        return response.data;
    },


    // Update request status (accept/reject)
    updateStatus: async (id, status) => {
        const response = await axiosInstance.patch(`/requests/${id}/status`, { status });
        return response.data;
    },


    // Form a group
    formGroup: async (data) => {
        const response = await axiosInstance.post("/requests/form-group", data);
        return response.data;
    },


    // Cancel a request
    cancelRequest: async (id) => {
        const response = await axiosInstance.delete(`/requests/${id}`);
        return response.data;
    },
};