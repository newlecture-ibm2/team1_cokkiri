"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Eye, Heart, ChevronRight } from "lucide-react";
import type { PostListItem } from "../_types/community";
import { POST_CATEGORIES } from "../_types/community";
import { formatDateTimeKo } from "@/lib/format-date";

function categoryLabel(code: string) {
  return POST_CATEGORIES.find((c) => c.value === code)?.label ?? code;
}

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link 
      href={`/community/${post.postId}`} 
      className="group bg-white rounded-xl p-4 md:p-5 border border-primary/5 shadow-md shadow-primary/5 transition-all relative overflow-hidden block"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10 text-primary">
        <div className="flex flex-col gap-2.5 max-w-2xl w-full">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-semibold tracking-[0.25em] uppercase opacity-30">
              POST-00{post.postId}
            </span>
            <span className={`text-[9px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full ${
              post.category === 'NOTICE' ? 'bg-orange-100 text-orange-600' :
              post.category === 'QUESTION' ? 'bg-blue-100 text-blue-600' :
              post.category === 'MEETUP' ? 'bg-accent/20 text-accent' :
              'bg-muted/10 text-muted-foreground'
            }`}>
              {categoryLabel(post.category)}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight leading-snug group-hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="mt-1.5 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
              By {post.authorUserId} — {formatDateTimeKo(post.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2.5 border-t border-primary/5">
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] opacity-40">
              <Eye className="size-3.5 shrink-0" aria-hidden />
              {post.viewCount} views
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] opacity-40">
              <Heart className="size-3.5 shrink-0" aria-hidden />
              {post.likeCount} likes
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] opacity-40">
              <MessageCircle className="size-3.5 shrink-0" aria-hidden />
              {post.commentCount} comments
            </span>
          </div>
        </div>

        <div className="flex h-full items-center pt-2 lg:pt-0">
           <div className="h-10 w-10 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
             <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
           </div>
        </div>
      </div>

      {/* Editorial background number */}
      <span className="absolute -right-10 -bottom-20 text-[25vw] font-black opacity-[0.02] select-none pointer-events-none group-hover:opacity-[0.04] transition-opacity italic">
        {String(post.postId % 100).padStart(2, '0')}
      </span>
    </Link>
  );
}
