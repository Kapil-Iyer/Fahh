import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

/** GET /api/moments — List Wander Moments (meetup_photos) for feed. No auth required. */
export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data: moments, error } = await admin
      .from('meetup_photos')
      .select('id, bubble_id, user_id, cloudinary_url, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: moments ?? [],
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
