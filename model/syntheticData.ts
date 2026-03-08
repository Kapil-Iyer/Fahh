/**
 * Synthetic database for the recommender system.
 * Simulates user profiles and activity data for personalized recommendations.
 */

import type { User, Bubble } from "./types";

// Category → tags for matching user interests (e.g. "Sports" maps to basketball, soccer, etc.)
const categoryTags: Record<string, string[]> = {
  Sports: ["Basketball", "Soccer", "Running", "Swimming", "Yoga", "Ping Pong"],
  Casual: ["Coffee", "Food"],
  Study: ["Studying", "Coding"],
  Music: ["Music"],
  Gaming: ["Gaming", "Board Games"],
  Outdoors: ["Hiking", "Photography", "Gardening"],
};

// Parse "0.3 km" -> 0.3, "1.2 km" -> 1.2
function parseDistanceKm(distance: string): number {
  const match = distance.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 999;
}

// Infer time slot from "15 mins", "1 hr", "2 hrs", "3 hrs"
function inferTimeSlot(startingIn: string): "morning" | "afternoon" | "evening" {
  if (startingIn.includes("15") || startingIn.includes("30") || startingIn.includes("45")) return "afternoon";
  if (startingIn.includes("1 hr") || startingIn.includes("2 hrs")) return "afternoon";
  if (startingIn.includes("3 hrs")) return "evening";
  return "afternoon";
}

export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  interests: ["Basketball", "Coffee", "Gaming", "Studying", "Music", "Hiking"],
  campus: "University of Waterloo",
  preferredTime: "afternoon",
  cluster: "active-social",
};

export const syntheticBubbles: Bubble[] = [
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
  {
    id: "7",
    emoji: "⚽",
    title: "Pickup Soccer",
    category: "Sports",
    joined: 8,
    maxPeople: 14,
    startingIn: "20 mins",
    distance: "0.4 km",
    description: "Casual game at the field. Cleats recommended!",
    creator: "Chris M.",
    creatorAvatar: "CM",
  },
  {
    id: "8",
    emoji: "🍕",
    title: "Pizza Night",
    category: "Casual",
    joined: 4,
    maxPeople: 6,
    startingIn: "1 hr",
    distance: "0.2 km",
    description: "Ordering from Pizza Pizza. Dorm common room.",
    creator: "Emma L.",
    creatorAvatar: "EL",
  },
  {
    id: "9",
    emoji: "🎲",
    title: "Board Game Night",
    category: "Gaming",
    joined: 5,
    maxPeople: 8,
    startingIn: "45 mins",
    distance: "0.6 km",
    description: "Catan, Codenames, and more. REV lounge.",
    creator: "Sam P.",
    creatorAvatar: "SP",
  },
  {
    id: "10",
    emoji: "🧘",
    title: "Campus Yoga",
    category: "Sports",
    joined: 2,
    maxPeople: 12,
    startingIn: "1 hr",
    distance: "0.3 km",
    description: "Relaxing yoga session on the green. All levels welcome.",
    creator: "Maya K.",
    creatorAvatar: "MK",
  },
];

export { categoryTags, parseDistanceKm, inferTimeSlot };
