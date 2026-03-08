/**
 * Recommender model for "Upcoming for you" on the Home screen.
 * Scores bubbles based on user interests, category match, distance, and time fit.
 */

import type { User, Bubble, ScoredBubble } from "./types";
import { categoryTags, parseDistanceKm, inferTimeSlot } from "./syntheticData";

function getTagsForCategory(category: string): string[] {
  return categoryTags[category] ?? [category];
}

function getExplanationTags(user: User, bubble: Bubble): string[] {
  const tags: string[] = [];
  const bubbleTags = getTagsForCategory(bubble.category);
  const matchingInterests = bubbleTags.filter((tag) =>
    user.interests.some((i) => i.toLowerCase().includes(tag.toLowerCase()))
  );
  if (matchingInterests.length > 0) tags.push("Matches your interests");

  const distanceKm = parseDistanceKm(bubble.distance);
  if (distanceKm <= 0.5) tags.push("Nearby");
  else if (distanceKm <= 1) tags.push("Close by");

  const slot = inferTimeSlot(bubble.startingIn);
  if (slot === user.preferredTime) tags.push("Fits your schedule");

  const fillRate = bubble.joined / bubble.maxPeople;
  if (fillRate >= 0.7) tags.push("Popular");

  return tags.slice(0, 3);
}

function scoreBubble(user: User, bubble: Bubble): number {
  let score = 0;

  const bubbleTags = getTagsForCategory(bubble.category);
  const interestMatches = bubbleTags.filter((tag) =>
    user.interests.some((i) => i.toLowerCase().includes(tag.toLowerCase()))
  ).length;
  score += interestMatches * 3;

  const distanceKm = parseDistanceKm(bubble.distance);
  if (distanceKm <= 0.3) score += 2;
  else if (distanceKm <= 0.5) score += 1.5;
  else if (distanceKm <= 1) score += 1;

  const slot = inferTimeSlot(bubble.startingIn);
  if (slot === user.preferredTime) score += 1.5;

  score += (bubble.joined / bubble.maxPeople) * 1.5;

  return score;
}

export function getRecommendedBubbles(user: User, bubbles: Bubble[]): ScoredBubble[] {
  return bubbles
    .map((bubble) => {
      const score = scoreBubble(user, bubble);
      const tags = getExplanationTags(user, bubble);
      return {
        ...bubble,
        recommendationScore: score,
        recommendationReason: tags.length > 0 ? tags.join(" • ") : "Recommended for you",
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 6);
}
