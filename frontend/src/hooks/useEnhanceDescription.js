import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../lib/aiApi";
import toast from "react-hot-toast";

export const useEnhanceDescription = () => {
    return useMutation({
        mutationFn: async ({ title, researchTopic, description, context, tone }) => {
            return await aiApi.enhanceDescription({ title, researchTopic, description, context, tone });
        },
        onError: (error) => {
            console.error("Enhance Description Error:", error);
            toast.error(error.response?.data?.message || "Failed to enhance description.");
        },
    });
};
