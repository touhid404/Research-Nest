import { useQuery } from "@tanstack/react-query";
import { paperApi } from "../../../lib/paperApi";
import PaperCard from "../../../components/papers/PaperCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";


const MyPapers = () => {
    const { user } = useAuth();


    const { isPending, error, data } = useQuery({
        queryKey: ["papers", user?.uid],
        queryFn: async () => {
            if (!user?.uid) return { data: [] };
            return await paperApi.getAllPapersByUser(user.uid);
        },
        enabled: !!user?.uid
    });


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


    const papers = data?.data || [];


    return (
        <div className="pb-10">
            <div className="p-4">
                {papers.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't published any papers yet.</p>
                    </div>
                ) : (
                    papers.map((paper) => <PaperCard key={paper._id} paper={paper} />)
                )}
            </div>
        </div>
    );
};


export default MyPapers;



