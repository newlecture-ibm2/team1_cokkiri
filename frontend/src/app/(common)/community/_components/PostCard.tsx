"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Eye, Heart } from "lucide-react";
import type { PostListItem } from "../_types/community";
import { POST_CATEGORIES } from "../_types/community";
import { formatDateTimeKo } from "@/lib/format-date";

function categoryLabel(code: string) {
  return POST_CATEGORIES.find((c) => c.value === code)?.label ?? code;
}

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link href={`/community/${post.postId}`} className="block rounded-[2rem] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      <motion.div
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className="rounded-[2rem] border border-border bg-background/80 p-6 shadow-sm backdrop-blur-sm md:p-8"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-black text-[10px] uppercase tracking-[0.28em] text-secondary">
            {categoryLabel(post.category)}
          </span>
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {formatDateTimeKo(post.createdAt)}
          </span>
        </div>
        <h2 className="mt-4 line-clamp-2 text-xl font-black uppercase leading-tight tracking-tighter text-foreground md:text-2xl">
          {post.title}
        </h2>
        <div className="mt-6 flex flex-wrap gap-6 font-medium text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-4 shrink-0 opacity-80" aria-hidden />
            {post.viewCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-4 shrink-0 opacity-80" aria-hidden />
            {post.likeCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="size-4 shrink-0 opacity-80" aria-hidden />
            {post.commentCount}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
