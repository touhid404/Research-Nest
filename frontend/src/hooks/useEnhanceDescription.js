import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../lib/aiApi";
import toast from "react-hot-toast";

export const useEnhanceDescription = () => {
    return useMutation({
        mutationFn: async ({ description, context, tone }) => {
            return await aiApi.enhanceDescription({ description, context, tone });
        },
        onError: (error) => {
            console.error("Enhance Description Error:", error);
            toast.error(error.response?.data?.message || "Failed to enhance description.");
        },
    });
};
