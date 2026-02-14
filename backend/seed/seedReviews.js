import { connectDB } from "../src/config/db.js";
import Review from "../src/models/review.model.js";

// Replace with actual user UIDs from your database
const TARGET_USER_UIDS = [
    "OUvE3QkdVlakvFd7nVHNT5QDnrP2",
    "VrQEdGdvtyc2tWAKAKu8lpPXmSi1",
    "M1FlVDaqXOYSF1j1qAnua5VKnBD3"
];

const TOTAL_REVIEWS = 60;

// Sample review comments
const SAMPLE_COMMENTS = [
    "Research Nest has completely transformed how our lab collaborates. The proposal tools are a game-changer.",
    "Finding collaborators was always a struggle until I joined this platform. I found my dream team in a week!",
    "The automated summaries and AI insights save me hours every day. Highly recommended for any academic.",
    "Seamless integration of tools and community. It's the GitHub for researchers we've been waiting for.",
    "The collaboration features are intuitive and powerful. Perfect for cross-border research projects.",
    "I love the clean interface and how easy it is to manage references and docs in one place.",
    "A must-have tool for modern academia. It bridges the gap between communication and project management.",
    "The workspace feature is incredibly useful for managing multiple research projects simultaneously.",
    "Best platform I've used for academic collaboration. The video meetings integration is seamless.",
    "The AI-powered features help me write better proposals. My success rate has improved significantly.",
    "Finally, a platform that understands researchers' needs. The document sharing is exceptional.",
    "Great for interdisciplinary research. I've connected with experts from fields I never knew existed.",
    "The notification system keeps me updated without being overwhelming. Well designed!",
    "Perfect for PhD students looking for mentors and collaborators. Highly recommend!",
    "The paper management system is top-notch. Much better than other tools I've tried.",
    "Love how easy it is to find researchers with similar interests. The matching algorithm works great.",
    "The calendar integration makes scheduling meetings across time zones so much easier.",
    "Excellent platform for grant writing collaboration. The version control is a lifesaver.",
    "The mobile responsiveness is great. I can check updates on the go without any issues.",
    "Research Nest has become an essential part of my daily workflow. Can't imagine working without it.",
    "The community here is incredibly supportive and engaged. Great discussions happen daily.",
    "Simple yet powerful. Everything I need for research collaboration in one place.",
    "The onboarding was smooth and the learning curve is minimal. Started collaborating within minutes.",
    "Best investment for our research group. Productivity has increased significantly.",
    "The task management features are perfect for tracking research milestones and deadlines.",
    "I appreciate how the platform respects data privacy. Important for sensitive research.",
    "The export features make it easy to share work with external collaborators.",
    "Great customer support! They responded to my query within hours.",
    "The dark mode is easy on the eyes during those late-night research sessions.",
    "Perfect balance between simplicity and functionality. Not cluttered like other platforms.",
    "The search functionality helps me find relevant papers and researchers quickly.",
    "Love the proposal templates. They've helped me structure my ideas better.",
    "The real-time collaboration on documents is fantastic. No more version conflicts!",
    "Research Nest has made remote collaboration feel seamless and natural.",
    "The analytics dashboard gives great insights into project progress.",
    "Excellent for managing literature reviews with my research team.",
    "The tagging system helps organize everything efficiently.",
    "Great for both solo researchers and large research groups.",
    "The citation management integration is a huge time-saver.",
    "I've published two papers thanks to collaborations started on this platform.",
    "The meeting recording feature is invaluable for reviewing discussions later.",
    "Clean, modern design that doesn't distract from the work.",
    "The file storage is generous and well-organized.",
    "Perfect for conference planning and coordination.",
    "The milestone tracking helps keep long-term projects on schedule.",
    "Excellent API documentation for those who want to integrate with other tools.",
    "The feedback system for proposals is constructive and helpful.",
    "Great for student-advisor communication and project tracking.",
    "The workspace templates save so much setup time.",
    "I recommend Research Nest to all my colleagues. It's that good!",
];

// Helper function to get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random rating (weighted towards higher ratings, 1-5 only)
const getRandomRating = () => {
    const weights = [1, 2, 5, 25, 67]; // 1 star: 1%, 2 star: 2%, 3 star: 5%, 4 star: 25%, 5 star: 67%
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return i + 1; // Return rating 1-5
        }
    }
    return 5; // Default to 5 stars
};

const seedReviews = async () => {
    try {
        await connectDB();
        console.log("Connected to database");

        // Check if we have user UIDs
        if (TARGET_USER_UIDS.length === 0) {
            console.error("No user UIDs provided. Please add user UIDs to TARGET_USER_UIDS array.");
            process.exit(1);
        }

        // Drop the old unique index if it exists
        try {
            await Review.collection.dropIndex("userUid_1");
            console.log("Dropped old userUid unique index");
        } catch (err) {
            // Index might not exist, that's fine
            console.log("No existing userUid index to drop");
        }

        // Clear existing reviews
        await Review.deleteMany({});
        console.log("Cleared existing reviews");

        const reviews = [];

        for (let i = 0; i < TOTAL_REVIEWS; i++) {
            // Randomly select a user UID for each review
            const userUid = getRandomItem(TARGET_USER_UIDS);

            reviews.push({
                userUid,
                rating: getRandomRating(),
                comment: getRandomItem(SAMPLE_COMMENTS),
                isApproved: true,
                createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
            });
        }

        if (reviews.length > 0) {
            await Review.insertMany(reviews);
            console.log(`Successfully seeded ${reviews.length} reviews`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding reviews:", error);
        process.exit(1);
    }
};

seedReviews();
