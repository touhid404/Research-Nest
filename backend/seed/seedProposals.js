import { connectDB } from "../src/config/db.js";
import ProposalPost from "../src/models/proposalPost.model.js";
const TARGET_USER_UIDS = [
    "OUvE3QkdVlakvFd7nVHNT5QDnrP2",
    "lJ2p9370uDN6uEofMruhZVTiCok1",
    "idQE1d1I0pgbDOCqY0jt5ZUlCo42",
    "9w2CfiGSLSaMVYFhrHJzUZppy6W2",
    "mrsBH5lTVPX97C3Zcd4p0kDbRsM2",
    "FnNGbpp5NQWFbgDBEidkWSjOMdQ2",
    "VJjyrBSk57aO0U1nvshMLqwf52J2",
    "61RWyo8OHGgLOiFHw63Iqlds4Kz1",
    "qdaG5kYRmPgEigoUNVOvl0wv9J02"
];

const TOTAL_POSTS_TO_CREATE = 40;


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
    "Machine Translation for Low-Resource Languages",
    "Neural Networks for Early Cancer Detection",
    "Decentralized Finance Platforms for Emerging Markets",
    "Ocean Plastic Cleanup Using Autonomous Drones",
    "Brain-Computer Interfaces for Paralysis Treatment",
    "Climate-Resilient Crop Development Through CRISPR",
    "Virtual Reality Therapy for PTSD Patients",
    "Hydrogen Fuel Cell Infrastructure Planning",
    "Artificial Photosynthesis for Carbon Capture",
    "Acoustic Monitoring for Wildlife Conservation",
    "Edge AI for Real-Time Video Analytics",
    "Microbiome Analysis for Personalized Nutrition",
    "Quantum Cryptography for Secure Communications",
    "3D Bioprinting for Organ Transplantation",
    "Smart Contracts for Intellectual Property Rights",
    "Satellite-Based Precision Agriculture Systems",
    "Natural Language Processing for Mental Health Support",
    "Transparent Solar Panels for Building Integration",
    "Adaptive Learning Algorithms for Special Education",
    "Drone Delivery Systems for Medical Emergencies",
    "Neuromorphic Computing for Energy-Efficient AI",
    "Bacteriophage Therapy Against Antibiotic Resistance",
    "Digital Twin Technology for Urban Planning",
    "Exoskeleton Design for Industrial Workers",
    "Fog Computing for Latency-Critical Applications",
    "Gene Therapy for Rare Genetic Disorders",
    "Haptic Feedback Systems for Remote Surgery",
    "Indoor Air Quality Monitoring with IoT Sensors",
    "Jellyfish-Inspired Soft Robotics",
    "Kinetic Energy Harvesting from Urban Infrastructure",
    "Light Field Displays for 3D Visualization"
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
    "Natural Language Processing",
    "Neuroscience",
    "Fintech",
    "Marine Biology",
    "Biomedical Engineering",
    "Synthetic Biology",
    "Virtual Reality",
    "Renewable Energy",
    "Computer Vision",
    "Wildlife Conservation",
    "Embedded Systems",
    "Microbiology",
    "Cryptography",
    "Tissue Engineering",
    "Legal Technology",
    "Remote Sensing",
    "Computational Linguistics",
    "Photovoltaics",
    "Special Education",
    "Aerospace Engineering",
    "Cognitive Computing",
    "Bacteriology",
    "Geospatial Analysis",
    "Rehabilitation Engineering",
    "Distributed Computing",
    "Genetics",
    "Telemedicine",
    "Air Quality",
    "Soft Robotics",
    "Energy Harvesting",
    "Display Technology"
];

const INTERESTS_POOL = [
    "Machine Learning", "Data Security", "Cryptography", "Sustainability",
    "IoT", "Mental Health", "Nanomaterials", "AI Ethics", "Pedagogy",
    "VR/AR", "Green Chemistry", "Smart Cities", "Healthcare Policy",
    "Automation", "Genomics", "Fintech", "Transportation", "Elderly Care",
    "Linguistics", "Cloud Computing"
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
    return shuffled.slice(0, size);
};

// Description templates for variety
const DESCRIPTION_TEMPLATES = [
    (title, topic) => `This research proposal focuses on ${title.toLowerCase()}. We aim to explore innovative approaches in ${topic}. Our team is seeking collaborators with expertise in this domain to contribute to groundbreaking research.`,
    (title, topic) => `We are investigating ${title.toLowerCase()} through the lens of ${topic}. This project combines theoretical frameworks with practical applications. Join us in pushing the boundaries of current knowledge.`,
    (title, topic) => `Our proposal addresses the critical need for ${title.toLowerCase()}. Within the field of ${topic}, this research has the potential to create significant impact. We welcome experts passionate about solving complex challenges.`,
    (title, topic) => `Seeking research partners for ${title.toLowerCase()}. This interdisciplinary project leverages cutting-edge ${topic} methodologies. Together, we can develop solutions that matter.`,
    (title, topic) => `This initiative explores ${title.toLowerCase()} as a transformative approach in ${topic}. We prioritize collaboration, innovation, and evidence-based outcomes. Looking for committed researchers to join our team.`,
    (title, topic) => `Join us in advancing ${title.toLowerCase()}. Our research spans multiple aspects of ${topic}, offering opportunities for publication and real-world application. Ideal for those seeking impactful research experiences.`,
    (title, topic) => `We propose a comprehensive study on ${title.toLowerCase()}. Grounded in ${topic}, this work addresses gaps in existing literature while fostering practical solutions. Collaboration is key to our success.`,
    (title, topic) => `This project tackles ${title.toLowerCase()} using novel ${topic} frameworks. We're building a diverse team to conduct rigorous research with potential for significant breakthroughs.`,
];

const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const generateRandomPost = (uids, index) => {
    const ownerUid = getRandomItem(uids);
    const title = getRandomItem(SAMPLE_TITLES);
    const researchTopic = getRandomItem(RESEARCH_TOPICS);

    const descriptionTemplate = getRandomItem(DESCRIPTION_TEMPLATES);
    const description = descriptionTemplate(title, researchTopic);

    // Generate a random date within the last 1 month (30 days)
    const randomDate = getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());

    return {
        ownerUid: ownerUid,
        title: title,
        description: description,
        researchTopic: researchTopic,
        interests: getRandomSubarray(INTERESTS_POOL, 3), // 3 random interests
        attachments: [], // Empty for seed
        status: "published",
        createdAt: randomDate,
        updatedAt: randomDate
    };
};


const seedProposals = async () => {
    try {
        console.log("Connecting to Database...");
        await connectDB();

        if (TARGET_USER_UIDS.length === 0 || TARGET_USER_UIDS[0].includes("REPLACE")) {
            console.warn(" WARNING: No valid User UIDs provided in TARGET_USER_UIDS.");
            console.warn("Please edit the script and add valid UIDs to the TARGET_USER_UIDS array.");
            process.exit(1);
        }

        console.log(`Generating ${TOTAL_POSTS_TO_CREATE} proposal posts for ${TARGET_USER_UIDS.length} users...`);

        const postsToInsert = [];
        for (let i = 0; i < TOTAL_POSTS_TO_CREATE; i++) {
            postsToInsert.push(generateRandomPost(TARGET_USER_UIDS, i));
        }

        const result = await ProposalPost.insertMany(postsToInsert);

        console.log(`Successfully seeded ${result.length} proposal posts!`);
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedProposals();
