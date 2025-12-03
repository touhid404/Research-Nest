import { useState, useEffect } from "react";

// names from your dummy post file
const names = [
  "Ayesha Rahman", "Rafiul Islam", "Nadia Hasan", "Touhid Alam", "Arif Khan",
  "Jannat Hossain", "Mahir Uddin", "Sadia Akter", "Imran Hossain", "Tasnim Noor",
  "Fahim Rahman", "Lamia Sultana", "Tanvir Ahmed", "Samiha Chowdhury", "Rahat Hasan",
  "Mou Akter", "Ridoy Khan", "Mehjabin Karim", "Tawsif Islam", "Sakib Rahman"
];

function getRandomAvatar(seed) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

function getRandomDateTime() {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 10);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);

  const date = new Date(now);
  date.setDate(now.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function useDummyChats(count = 15) {
  const [chats, setChats] = useState([]);

  const lastMessages = [
    "Hey, what's up?",
    "Did you finish the task?",
    "Let's meet tomorrow.",
    "Call me when you’re free.",
    "Check your mail!",
    "I'm on my way.",
    "Sure, no problem!",
    "Thanks a lot!",
    "Let’s work on this together.",
    "That’s awesome 😄",
    "Can you send the file?",
    "I'll update you soon!",
    "Great idea!",
    "Haha that was funny 😂",
    "Ok bro, noted!"
  ];

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => {
      const name = names[Math.floor(Math.random() * names.length)];

      return {
        id: i + 1,
        name,
        avatar: getRandomAvatar(name + "_chat" + i),
        lastMessage: lastMessages[Math.floor(Math.random() * lastMessages.length)],
        date: getRandomDateTime(),
        isOnline: Math.random() > 0.5
      };
    });

    setChats(generated);
  }, [count]);

  return chats;
}
