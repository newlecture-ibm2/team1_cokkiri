"use client";

import Link from "next/link";
import { MessageCircle, Eye, Heart, ArrowUpRight, Megaphone, HelpCircle, Lightbulb, Users, PenLine, type LucideIcon } from "lucide-react";
import type { PostListItem } from "../_types/community";
import { POST_CATEGORIES } from "../_types/community";
import { formatDateTimeKo } from "@/lib/format-date";

function categoryLabel(code: string) {
  return POST_CATEGORIES.find((c) => c.value === code)?.label ?? code;
}

function categoryEnglish(code: string) {
  switch (code) {
    case "NOTICE":
      return "Notice";
    case "QUESTION":
      return "Question";
    case "SUGGESTION":
      return "Suggestion";
    case "MEETUP":
      return "Meetup";
    case "FREE":
      return "Free";
    default:
      return "Post";
  }
}

function categoryIcon(code: string): LucideIcon {
  switch (code) {
    case "NOTICE":
      return Megaphone;
    case "QUESTION":
      return HelpCircle;
    case "SUGGESTION":
      return Lightbulb;
    case "MEETUP":
      return Users;
    default:
      return PenLine;
  }
}

function categoryStyle(code: string) {
  if (code === "NOTICE") {
    // 공지: primary(dark moss) 강조
    return "bg-primary/10 text-primary ring-1 ring-primary/15";
  }
  // 나머지: accent(sage green) 통일
  return "bg-accent/15 text-accent ring-1 ring-accent/20";
}

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link
      href={`/community/${post.postId}`}
      className="group block rounded-xl border border-primary/8 bg-white px-8 py-4 md:px-10 md:py-6 shadow-sm ring-1 ring-transparent transition-all duration-300 hover:shadow-xl hover:shadow-primary/8 hover:border-primary/15 hover:ring-primary/10 relative overflow-hidden"
    >
      {/* Category + Title row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h2 className="text-lg tracking-tight leading-snug text-primary group-hover:text-accent transition-colors duration-300 line-clamp-2">
          <span className={`font-bold ${post.category === "NOTICE" ? "text-[#7F1D1D]" : "text-[#4A7C6F]"}`}>
            {categoryLabel(post.category)}
          </span>
          <span className={`text-[10px] font-medium align-middle ${post.category === "NOTICE" ? "text-[#7F1D1D]/50" : "text-[#4A7C6F]/50"}`}>
            .{categoryEnglish(post.category).toLowerCase()}
          </span>
          <span className="mx-1.5 text-muted-foreground/30 font-light">|</span>
          <span className="font-medium">{post.title}</span>
        </h2>
        <span className="relative flex items-center justify-center size-7 shrink-0 rounded-full bg-muted/0 group-hover:bg-accent/10 transition-all duration-300 mt-0.5">
          <ArrowUpRight
            className="size-4 text-muted-foreground/25 transition-all duration-300 ease-out group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110"
            aria-hidden
          />
        </span>
      </div>

      {/* Bottom row: author (left) + stats (right) */}
      <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-primary/5">
        <span className="text-xs text-muted-foreground font-medium">
          {post.authorName || `사용자${post.authorUserId}`} · {formatDateTimeKo(post.createdAt)}
        </span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary/70">
            <Eye className="size-3.5 shrink-0" aria-hidden />
            {post.viewCount}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary/70">
            <Heart className="size-3.5 shrink-0" aria-hidden />
            {post.likeCount}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary/70">
            <MessageCircle className="size-3.5 shrink-0" aria-hidden />
            {post.commentCount}
          </span>
        </div>
      </div>

      {/* Watermark Icon */}
      {(() => {
        const WatermarkIcon = categoryIcon(post.category);
        return (
          <WatermarkIcon
            className="absolute -right-6 -bottom-6 size-36 opacity-[0.04] select-none pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-500 text-primary"
            strokeWidth={1.5}
            aria-hidden
          />
        );
      })()}
    </Link>
  );
}
