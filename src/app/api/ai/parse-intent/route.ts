import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

const PARSE_PROMPT = `You are an intent parser for a university meetup app.
Extract structured data from the user text.
Return ONLY valid JSON with these fields (use null if missing):
- activity (string)
- zone (string, e.g. SLC, PAC, DC, CIF)
- start_time (string: ISO 8601 or time like "19:00"; assume today if only time given)
- duration_minutes (number, default 60 if unclear)
- max_members (number or null)
- description (string or null, short summary)

Return nothing but the JSON object, no markdown or explanation.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { success: false, error: "text required" },
        { status: 400 }
      );
    }

    const model = getGeminiModel();
    const prompt = `${PARSE_PROMPT}\n\nUser input: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const raw = response.text();
    if (!raw) {
      return NextResponse.json(
        { success: false, error: "No response from model" },
        { status: 500 }
      );
    }

    const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: "Could not parse model output" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        activity: typeof parsed.activity === "string" ? parsed.activity : null,
        zone: typeof parsed.zone === "string" ? parsed.zone : null,
        start_time: typeof parsed.start_time === "string" ? parsed.start_time : null,
        duration_minutes: typeof parsed.duration_minutes === "number" ? parsed.duration_minutes : 60,
        max_members: typeof parsed.max_members === "number" ? parsed.max_members : null,
        description: typeof parsed.description === "string" ? parsed.description : null,
      },
    });
  } catch (err: unknown) {
    console.error("parse-intent error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Parse failed" },
      { status: 500 }
    );
  }
}
