import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../lib/aiApi";
import toast from "react-hot-toast";

export const useParsePdf = () => {
    return useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            return await aiApi.parsePdf(formData);
        },
        onError: (error) => {
            console.error("PDF Parse Error:", error);
            toast.error(error.response?.data?.message || "Failed to parse PDF.");
        },
    });
};
