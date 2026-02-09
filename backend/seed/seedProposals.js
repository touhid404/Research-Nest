import { connectDB } from "../src/config/db.js";
import ProposalPost from "../src/models/proposalPost.model.js";
// replace to actual user uids
const TARGET_USER_UIDS = [
    "OUvE3QkdVlakvFd7nVHNT5QDnrP2",
    "wYdJ8DJCnWWBCWQJYiptLv5yWD13"
];

const TOTAL_POSTS_TO_CREATE = 20;

// ==========================================
// SEED DATA
// ==========================================
const SAMPLE_TITLES = [
    "AI-Driven Diagnostic Tools for Rural Healthcare",
    "Blockchain-Based Supply Chain Transparency",
    "Optimizing Quantum Algorithms for Financial Modeling",
    "Sustainable Urban Vertical Farming Systems",
    "Deep Learning Approaches to Climate Change Prediction",
    "Cybersecurity Frameworks for IoT Devices",
    "Psychological Impacts of Social Media on Adolescents",
    "Renewable Energy Storage Solutions using Nanotechnology",
    "Ethical Implications of Autonomous Vehicles",
    "Personalized Education Systems using Machine Learning",
    "Augmented Reality for Historical Preservation",
    "Biodegradable Plastics from Agricultural Waste",
    "Smart Grid Management using Edge Computing",
    "Telemedicine Adoption in Developing Countries",
    "Robotic Swarms for Disaster Response",
    "Genomic Data Privacy in the Era of Big Data",
    "Microfinance Impact Assessment in Southeast Asia",
    "Urban Traffic Congestion Prediction Models",
    "Wearable Health Monitors for Elderly Care",
    "Machine Translation for Low-Resource Languages"
];

const RESEARCH_TOPICS = [
    "Artificial Intelligence",
    "Blockchain Technology",
    "Quantum Computing",
    "Sustainable Agriculture",
    "Climate Science",
    "Cybersecurity",
    "Psychology",
    "Materials Science",
    "Ethics in Technology",
    "Educational Technology",
    "Augmented Reality",
    "Environmental Science",
    "Energy Systems",
    "Public Health",
    "Robotics",
    "Bioinformatics",
    "Economics",
    "Urban Planning",
    "Health Informatics",
    "Natural Language Processing"
];

const INTERESTS_POOL = [
    "Machine Learning", "Data Security", "Cryptography", "Sustainability",
    "IoT", "Mental Health", "Nanomaterials", "AI Ethics", "Pedagogy",
    "VR/AR", "Green Chemistry", "Smart Cities", "Healthcare Policy",
    "Automation", "Genomics", "Fintech", "Transportation", "Elderly Care",
    "Linguistics", "Cloud Computing"
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomSubarray = (arr, size) => {
    const shuffled = arr.slice(0);
    let i = arr.length;
    let temp, index;
    while (i--) {
        index = Math.floor(Math.random() * (i + 1));
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
};

const generateRandomPost = (uids) => {
    const ownerUid = getRandomItem(uids);
    const title = getRandomItem(SAMPLE_TITLES);
    const researchTopic = getRandomItem(RESEARCH_TOPICS);

    return {
        ownerUid: ownerUid,
        title: title,
        description: `This is a research proposal focused on ${title}. We aim to investigate the core challenges and potential solutions within the domain of ${researchTopic}. The project will involve comprehensive data analysis, prototype development, and field testing. We are looking for collaborators who are passionate about this field and can contribute their expertise.`,
        researchTopic: researchTopic,
        interests: getRandomSubarray(INTERESTS_POOL, 3), // 3 random interests
        attachments: [], // Empty for seed
        status: "published"
    };
};

// ==========================================
// MAIN SCRIPT
// ==========================================
const seedProposals = async () => {
    try {
        console.log("Connecting to Database...");
        await connectDB();

        if (TARGET_USER_UIDS.length === 0 || TARGET_USER_UIDS[0].includes("REPLACE")) {
            console.warn("⚠️  WARNING: No valid User UIDs provided in TARGET_USER_UIDS.");
            console.warn("Please edit the script and add valid UIDs to the TARGET_USER_UIDS array.");
            process.exit(1);
        }

        console.log(`Generating ${TOTAL_POSTS_TO_CREATE} proposal posts for ${TARGET_USER_UIDS.length} users...`);

        const postsToInsert = [];
        for (let i = 0; i < TOTAL_POSTS_TO_CREATE; i++) {
            postsToInsert.push(generateRandomPost(TARGET_USER_UIDS));
        }

        const result = await ProposalPost.insertMany(postsToInsert);

        console.log(`✅ Successfully seeded ${result.length} proposal posts!`);
        console.log("Done.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

// Run the seed function
seedProposals();
