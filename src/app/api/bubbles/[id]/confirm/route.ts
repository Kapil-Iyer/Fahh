import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Simple POST route to update a bubble's status to 'completed'
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bubbleId = params.id;

    if (!bubbleId) {
      return NextResponse.json(
        { error: 'Bubble ID is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Keep auth simple for now: Require a logged-in user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be logged in' },
        { status: 401 }
      );
    }

    // Update the bubble status to 'completed'
    const { data: updatedBubble, error } = await supabase
      .from('bubbles')
      .update({ status: 'completed' })
      .eq('id', bubbleId)
      .select()
      .single();

    if (error) {
      console.error('Error updating bubble status:', error);
      return NextResponse.json(
        { error: 'Failed to update bubble status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Bubble completed successfully',
      bubble: updatedBubble
    });

  } catch (error: unknown) {
    console.error('Error in bubble completion route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
