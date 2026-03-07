"use client";

/**
 * FEED POST - "Recent Moments" / meetup photo card
 * -----------------------------------------------------------------------------
 * Props: post (FeedPostType from mockFeedPosts)
 * API: GET /api/feed or meetup_photos. Like → POST /api/feed/:id/like
 *      Comment → POST /api/feed/:id/comments
 * -----------------------------------------------------------------------------
 */

import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import type { FeedPost as FeedPostType, FeedComment } from "@/lib/mockData";
import { ProfileLink } from "@/components/ProfileLink";

type FeedPostProps = {
  post: FeedPostType;
};

export default function FeedPost({ post }: FeedPostProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState<FeedComment[]>(post.comments);
  const [commentInput, setCommentInput] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    setComments((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, username: "you", text: trimmed },
    ]);
    setCommentInput("");
  };

  return (
    <article className="bg-card border-b border-border flex flex-col items-center py-3">
      <div className="w-full max-w-[28rem] mx-auto px-3">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
              {post.userAvatar}
            </div>
            <ProfileLink name={post.username} avatar={post.userAvatar} className="text-xs font-semibold text-foreground">
              {post.username}
            </ProfileLink>
          </div>
          <button
            type="button"
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Content area - vertical portrait placeholder */}
        <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center rounded-lg overflow-hidden">
          <span className="text-3xl text-muted-foreground/50">📷</span>
        </div>

        {/* Interaction bar */}
        <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLike}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={liked ? "Unlike" : "Like"}
          >
            <Heart
              className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : ""}`}
              strokeWidth={liked ? 0 : 2}
            />
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Comment"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Share"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Save"
        >
          <Bookmark className="w-5 h-5" />
        </button>
        </div>

        {/* Engagement */}
        <div className="pb-2 space-y-1">
        {likeCount > 0 && (
          <p className="text-xs font-semibold text-foreground">{likeCount} likes</p>
        )}
        <p className="text-xs line-clamp-2">
          <ProfileLink name={post.username} avatar={post.userAvatar} className="font-semibold text-foreground">
            {post.username}
          </ProfileLink>{" "}
          <span className="text-foreground">{post.caption}</span>
        </p>
        {comments.length > 2 && (
          <button
            type="button"
            onClick={() => setShowAllComments((prev) => !prev)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAllComments ? "Hide comments" : `View all ${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
          </button>
        )}
        {(showAllComments ? comments : comments.slice(-2)).map((c) => (
          <p key={c.id} className="text-xs line-clamp-1">
            <ProfileLink name={c.username} className="font-semibold text-foreground">
              {c.username}
            </ProfileLink>{" "}
            <span className="text-foreground">{c.text}</span>
          </p>
        ))}
        <p className="text-[10px] text-muted-foreground">{post.timestamp}</p>
        </div>

        {/* Comment input */}
        <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1 border-t border-border">
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none py-1.5"
        />
        <button
          type="submit"
          disabled={!commentInput.trim()}
          className="text-xs font-semibold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
        >
          Post
        </button>
        </form>
      </div>
    </article>
  );
}
