import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

/**
 * GET /api/recommendations
 * Runs the Python K-means recommender and returns JSON for the Home screen.
 * Falls back to TypeScript recommender if Python fails.
 */
export async function GET() {
  const projectRoot = process.cwd();

  try {
    const result = await runPythonRecommender(projectRoot);
    if (result) return NextResponse.json(result);
  } catch {
    // Fallback handled below
  }

  const { getRecommendedBubbles } = await import("@/model/recommender");
  const { currentUser, syntheticBubbles } = await import("@/model/syntheticData");

  const bubbles = syntheticBubbles.map((b) => ({
    ...b,
    maxPeople: b.maxPeople,
  }));
  const recs = getRecommendedBubbles(currentUser, bubbles);
  return NextResponse.json(
    recs.map((r) => ({
      ...r,
      creatorAvatar: r.creatorAvatar ?? r.creator.slice(0, 2).toUpperCase(),
    }))
  );
}

function runPythonRecommender(projectRoot: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const py = spawn("python", ["-m", "model.kmeans.run_recommender"], {
      cwd: projectRoot,
      env: { ...process.env, PYTHONPATH: projectRoot },
    });
    let stdout = "";
    let stderr = "";
    py.stdout?.on("data", (d) => (stdout += d.toString()));
    py.stderr?.on("data", (d) => (stderr += d.toString()));
    py.on("close", (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error("Invalid JSON from Python"));
        }
      } else reject(new Error(stderr || `Python exited ${code}`));
    });
    py.on("error", reject);
  });
}
