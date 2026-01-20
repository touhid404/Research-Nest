import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { paperApi } from "../../../lib/paperApi";
import PaperCard from "../../../components/papers/PaperCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/postLoader";
import { useSearchParams } from "react-router";


const PublicPapers = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("q") || "";


    const { isPending, error, data } = useQuery({
        queryKey: ["papers"],
        queryFn: async () => {
            return await paperApi.getAllPapers(user?.uid);
        },
    });


    // Filter papers client-side
    const filteredPapers = useMemo(() => {
        const allPapers = data?.data || [];
        if (!searchQuery) return allPapers;

        const lowerQuery = searchQuery.toLowerCase();
        return allPapers.filter(paper => {
            const inTitle = paper.title?.toLowerCase().includes(lowerQuery);
            const inAbstract = paper.abstract?.toLowerCase().includes(lowerQuery);
            const inAuthor = paper.user?.name?.toLowerCase().includes(lowerQuery);
            const inTags = paper.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
            const inDomain = paper.researchDomain?.toLowerCase().includes(lowerQuery);

            return inTitle || inAbstract || inAuthor || inTags || inDomain;
        });
    }, [data, searchQuery]);


    if (isPending) {
        return <PostLoader count={5} />;
    }


    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                Error loading papers: {error.message}
            </div>
        );
    }


    return (
        <div className="pb-10">
            <div className="p-4 pt-2">
                {filteredPapers.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {searchQuery ? `No papers found matching "${searchQuery}"` : "No papers found."}
                        </p>
                    </div>
                ) : (
                    filteredPapers.map((paper) => <PaperCard key={paper._id} paper={paper} />)
                )}
            </div>
        </div>
    );
};


export default PublicPapers;



