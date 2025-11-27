import { useState, useEffect } from "react";

const names = [
  "Ayesha Rahman", "Rafiul Islam", "Nadia Hasan", "Touhid Alam", "Arif Khan",
  "Jannat Hossain", "Mahir Uddin", "Sadia Akter", "Imran Hossain", "Tasnim Noor",
  "Fahim Rahman", "Lamia Sultana", "Tanvir Ahmed", "Samiha Chowdhury", "Rahat Hasan",
  "Mou Akter", "Ridoy Khan", "Mehjabin Karim", "Tawsif Islam", "Sakib Rahman"
];

const sampleTexts = [
  "Exploring new design ideas today 🎨",
  "Another day, another bug squashed 🐛💪",
  "Frontend magic in progress ✨",
  "React + Tailwind = ❤️",
  "Working on a side project, can’t wait to share soon!",
  "Nothing beats a productive coding night 🌙",
  "Design is not just what it looks like — it’s how it works.",
  "Trying out a new animation concept with Framer Motion.",
  "Weekend hackathon mode activated ⚡",
  "Deploying updates to my portfolio 🚀",
  "Met some amazing devs today at the meetup!",
  "Experimenting with AI integrations 🤖",
  "Finally fixed that annoying state bug 😅",
  "UI improvements coming soon 🔧",
  "Learning GraphQL this week 🧠",
];

function getRandomDateTime() {
  // Generate a random date/time within the last 15 days
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 15);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);

  const date = new Date(now);
  date.setDate(now.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes);

  // Example: "Nov 7, 2025 · 3:45 PM"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getRandomAvatar(seed) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export function useDummyPosts(count = 20) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => {
      const name = names[Math.floor(Math.random() * names.length)];
      return {
        id: i + 1,
        name,
        avatar: getRandomAvatar(name + i),
        date: getRandomDateTime(), // ✅ now includes both date & time
        text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
      };
    });
    setPosts(generated);
  }, [count]);

  return posts;
}
