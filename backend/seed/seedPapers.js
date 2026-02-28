import { connectDB } from "../src/config/db.js";
import Paper from "../src/models/paper.model.js";
import User from "../src/models/user.model.js";

const TOTAL_PAPERS_TO_CREATE = 40;

const RESEARCH_DOMAINS = [
    "Artificial Intelligence",
    "Blockchain Technology",
    "Quantum Computing",
    "Sustainable Agriculture",
    "Climate Science",
    "Cybersecurity",
    "Psychology",
    "Materials Science",
    "Robotics",
    "Bioinformatics",
    "Neuroscience",
    "Fintech",
    "Environmental Science",
    "Renewable Energy",
    "Computer Vision"
];

const SAMPLE_TITLES = [
    "Exploring Neural Architecture Search for Edge Devices",
    "Decentralized Oracle Networks: A Comprehensive Survey",
    "Quantum Error Correction in Superconducting Qubits",
    "Impact of Vertical Farming on Urban Resource Consumption",
    "Multi-Scale Modeling of Carbon Sequestration in Soil",
    "Zero-Trust Architectures for Industrial IoT Networks",
    "Cognitive Behavioral Therapy via VR: A Pilot Study",
    "Novel Graphene-Based Anodes for Sodium-Ion Batteries",
    "Swarm Intelligence in Disaster Recovery Operations",
    "Comparative Genomics of Extremophilic Microorganisms",
    "Brain-Computer Interfaces for Restoring Motor Function",
    "Algorithmic Fairness in Credit Scoring Systems",
    "Phytoremediation of Heavy Metals in Industrial Wastelands",
    "Perovskite Solar Cells: Efficiency and Stability Analysis",
    "Automated Lung Nodule Detection using 3D CNNs",
    "Deep Reinforcement Learning for Smart Grid Optimization",
    "The Role of Microbiota in Neurodegenerative Diseases",
    "Secure Multiparty Computation for Private Data Sharing",
    "Haptic Teleoperation for Minimally Invasive Surgery",
    "Machine Translation for Endangered Dialects",
    "Synthetic Biology Approaches to Plastic Degradation",
    "Digital Twins for Real-Time Structural Health Monitoring",
    "Exoskeleton Optimization for Enhanced Human Mobility",
    "Latency-Aware Task Offloading in Edge-Cloud Systems",
    "CRISPR-Cas9 Gene Editing for Rare Blood Disorders",
    "Wildlife Tracking using Low-Power Satellite Networks",
    "Microfinance and Women Empowerment: A Meta-Analysis",
    "Autonomous Underwater Vehicles for Coral Reef Mapping",
    "Privacy-Preserving Federated Learning for Healthcare",
    "Bacteriophage Therapy for Multi-Drug Resistant Infections"
];

const JOURNAL_NAMES = [
    "Nature Communications",
    "Science Advances",
    "IEEE Transactions on Neural Networks",
    "ACM Computing Surveys",
    "Journal of Renewable Energy",
    "The Lancet Digital Health",
    "Cell Reports",
    "Physical Review Letters",
    "Journal of Financial Technology",
    "Environmental Research Letters"
];

const CO_AUTHORS_POOL = [
    "Dr. Sarah Johnson", "Prof. Michael Chen", "Elena Rodriguez", "David Smith",
    "Dr. Yuki Tanaka", "Amina Al-Farsi", "Hans Mueller", "Li Wei",
    "Dr. Robert Brown", "Sophie Laurent", "James Wilson", "Maria Garcia"
];

const TAGS_POOL = [
    "Machine Learning", "Deep Learning", "Sustainability", "Blockchain",
    "Cybersecurity", "Neuroscience", "Nanotechnology", "Green Energy",
    "Healthcare", "Automation", "Cryptography", "Genomics", "IoT"
];

// HELPER FUNCTIONS
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
    return shuffled.slice(0, Math.min(size, arr.length));
};

const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomPaper = (users) => {
    const user = getRandomItem(users);
    const title = getRandomItem(SAMPLE_TITLES);
    const domain = getRandomItem(RESEARCH_DOMAINS);
    
    const abstract = `This research paper provides an in-depth analysis of ${title.toLowerCase()}. ` +
        `Focusing on the domain of ${domain}, we discuss the current challenges and propose ` +
        `novel methodologies to improve system performance and reliability. ` +
        `Our experimental results demonstrate significant advancements over baseline models, ` +
        `offering new insights for future research in ${domain}. This work contributes to the ` +
        `growing body of literature by presenting comprehensive evaluations and theoretical frameworks.`;

    const randomDate = getRandomDate(new Date(2020, 0, 1), new Date());
    const randomCreatedAt = getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());

    return {
        user: {
            uid: user.uid,
            name: user.name,
            email: user.email,
            photoURL: user.photoURL,
        },
        title: title + " #" + Math.floor(Math.random() * 1000),
        abstract: abstract,
        researchDomain: domain,
        tags: getRandomSubarray(TAGS_POOL, 3),
        coAuthors: getRandomSubarray(CO_AUTHORS_POOL, 2),
        publicationDate: randomDate,
        publicationName: getRandomItem(JOURNAL_NAMES),
        doi: `10.${Math.floor(Math.random() * 10000)}/research-nest.${Math.floor(Math.random() * 100000)}`,
        status: "published",
        createdAt: randomCreatedAt,
        updatedAt: randomCreatedAt
    };
};

const seedPapers = async () => {
    try {
        console.log("Connecting to Database...");
        await connectDB();

        const users = await User.find({}).limit(10);
        if (users.length === 0) {
            console.warn("WARNING: No users found in database. Please seed users first.");
            process.exit(1);
        }

        console.log(`Generating ${TOTAL_PAPERS_TO_CREATE} papers for ${users.length} users...`);

        const papersToInsert = [];
        for (let i = 0; i < TOTAL_PAPERS_TO_CREATE; i++) {
            papersToInsert.push(generateRandomPaper(users));
        }

        const result = await Paper.insertMany(papersToInsert);

        console.log(`Successfully seeded ${result.length} papers!`);
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedPapers();
