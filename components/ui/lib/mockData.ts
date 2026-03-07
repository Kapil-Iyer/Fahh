export interface Bubble {
  id: string;
  emoji: string;
  title: string;
  category: string;
  joined: number;
  maxPeople: number;
  startingIn: string;
  distance: string;
  description: string;
  lat?: number;
  lng?: number;
  creator: string;
  creatorAvatar: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
}

export const mockBubbles: Bubble[] = [
  {
    id: "1",
    emoji: "🏀",
    title: "3v3 Basketball",
    category: "Sports",
    joined: 4,
    maxPeople: 6,
    startingIn: "15 mins",
    distance: "0.3 km",
    description: "Looking for 2 more for a quick pickup game at the campus courts!",
    creator: "Marcus J.",
    creatorAvatar: "MJ",
  },
  {
    id: "2",
    emoji: "☕",
    title: "Coffee & Chat",
    category: "Casual",
    joined: 2,
    maxPeople: 5,
    startingIn: "30 mins",
    distance: "0.5 km",
    description: "Grabbing coffee at the student lounge. Anyone want to join?",
    creator: "Sarah K.",
    creatorAvatar: "SK",
  },
  {
    id: "3",
    emoji: "📚",
    title: "CS 341 Study Group",
    category: "Study",
    joined: 3,
    maxPeople: 8,
    startingIn: "1 hr",
    distance: "0.1 km",
    description: "Prepping for the midterm. Library room 204.",
    creator: "Alex W.",
    creatorAvatar: "AW",
  },
  {
    id: "4",
    emoji: "🎮",
    title: "Smash Bros Tournament",
    category: "Gaming",
    joined: 6,
    maxPeople: 8,
    startingIn: "45 mins",
    distance: "0.8 km",
    description: "Casual Smash tourney in REV common room. All skill levels welcome!",
    creator: "Danny L.",
    creatorAvatar: "DL",
  },
  {
    id: "5",
    emoji: "🎵",
    title: "Open Jam Session",
    category: "Music",
    joined: 3,
    maxPeople: 6,
    startingIn: "2 hrs",
    distance: "1.2 km",
    description: "Bring your instrument! We have a guitar and drums set up.",
    creator: "Priya R.",
    creatorAvatar: "PR",
  },
  {
    id: "6",
    emoji: "🥾",
    title: "Sunset Hike",
    category: "Outdoors",
    joined: 5,
    maxPeople: 10,
    startingIn: "3 hrs",
    distance: "2.0 km",
    description: "Easy trail near campus. Great views and good vibes.",
    creator: "Jordan T.",
    creatorAvatar: "JT",
  },
];

export const mockConversations: Conversation[] = [
  { id: "1", name: "3v3 Basketball", avatar: "🏀", lastMessage: "See you at the courts!", time: "2m ago", unread: 2 },
  { id: "2", name: "Sarah K.", avatar: "SK", lastMessage: "The latte here is amazing", time: "15m ago", unread: 0 },
  { id: "3", name: "CS 341 Study Group", avatar: "📚", lastMessage: "Can someone share the notes?", time: "1h ago", unread: 5 },
  { id: "4", name: "Marcus J.", avatar: "MJ", lastMessage: "Good game today!", time: "3h ago", unread: 0 },
];

export const mockMessages: Message[] = [
  { id: "1", text: "Hey, are we still on for the courts?", sender: "other", time: "4:30 PM" },
  { id: "2", text: "Yeah! I'll be there in 15", sender: "me", time: "4:32 PM" },
  { id: "3", text: "Cool, I'm bringing my friend too", sender: "other", time: "4:33 PM" },
  { id: "4", text: "Perfect, we need one more!", sender: "me", time: "4:34 PM" },
  { id: "5", text: "See you at the courts!", sender: "other", time: "4:35 PM" },
];

export const interestOptions = [
  "🏀 Basketball", "⚽ Soccer", "🏃 Running", "🧘 Yoga",
  "☕ Coffee", "🍕 Food", "🎮 Gaming", "📚 Studying",
  "🎵 Music", "🎨 Arts", "🥾 Hiking", "🏊 Swimming",
  "📷 Photography", "💃 Dancing", "🎭 Theater", "🧑‍💻 Coding",
  "🎲 Board Games", "🌱 Gardening", "🏓 Ping Pong", "🎤 Karaoke",
];

export const filterChips = ["Happening Now", "Starting Soon", "Sports", "Casual", "Study", "Music", "Gaming", "Outdoors"];

export const personalityTraits = ["Chill", "Energetic", "Punctual", "Funny", "Creative", "Organized", "Adventurous", "Friendly"];
