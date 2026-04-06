import { apiFetch } from "@/lib/api";
import type { AdminCommentItem, AdminPostItem, PageData } from "../_types/community-admin";

export async function fetchAdminPosts(params: { p?: number; s?: number; sort?: string; keyword?: string }) {
  const qs = new URLSearchParams();
  qs.set("p", String(params.p ?? 0));
  qs.set("s", String(params.s ?? 20));
  qs.set("sort", params.sort ?? "createdAt,desc");
  if (params.keyword) qs.set("keyword", params.keyword);
  return apiFetch<PageData<AdminPostItem>>(`/admin/posts?${qs.toString()}`);
}

export async function fetchAdminComments(params: { p?: number; s?: number; sort?: string; postId?: number }) {
  const qs = new URLSearchParams();
  qs.set("p", String(params.p ?? 0));
  qs.set("s", String(params.s ?? 20));
  qs.set("sort", params.sort ?? "createdAt,desc");
  if (params.postId != null) qs.set("post_id", String(params.postId));
  return apiFetch<PageData<AdminCommentItem>>(`/admin/comments?${qs.toString()}`);
}

export async function deleteAdminPost(postId: number) {
  return apiFetch<void>(`/admin/posts/${postId}`, { method: "DELETE" });
}

export async function deleteAdminComment(commentId: number) {
  return apiFetch<void>(`/admin/comments/${commentId}`, { method: "DELETE" });
}
