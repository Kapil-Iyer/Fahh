/**
 * GET /api/recommendations
 *
 * Calls the Python ML microservice for K-means recommendations.
 * Fallback: returns top 6 mock bubbles when ML service is unavailable.
 *
 * Architecture: Next.js → ML Service (Render) → K-means clustering
 */

import { NextResponse } from "next/server";
import { mockBubbles } from "@/lib/mockData";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          interests: ["Basketball", "Coffee", "Gaming", "Studying", "Music", "Hiking"],
          preferred_time: "afternoon",
          social_level: 0.8,
        },
        activities: mockBubbles.map((b) => ({
          id: b.id,
          emoji: b.emoji,
          title: b.title,
          category: b.category,
          joined: b.joined,
          maxPeople: b.maxPeople,
          startingIn: b.startingIn,
          distance: b.distance,
          description: b.description,
          creator: b.creator,
          creatorAvatar: b.creatorAvatar,
        })),
        top_k: 6,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        return NextResponse.json(data.recommendations);
      }
    }
  } catch {
    // Fallback below
  }

  // Fallback: top 6 mock bubbles with generic reason
  const fallback = mockBubbles.slice(0, 6).map((b) => ({
    ...b,
    recommendationScore: 0,
    recommendationReason: "Recommended for you",
  }));
  return NextResponse.json(fallback);
}
