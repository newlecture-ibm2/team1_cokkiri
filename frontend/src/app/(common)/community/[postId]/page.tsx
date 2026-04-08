import Link from "next/link";
import { notFound } from "next/navigation";
import { ACCESS_DENIED_MESSAGE, LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { bffGet } from "../_api/bff-server";
import type { ApiResponse, PostDetail } from "../_types/community";
import { CommunityShell } from "../_components/CommunityShell";
import { MotionEnter } from "../_components/MotionEnter";
import { PostDetailSection } from "../_components/PostDetailSection";

type Params = Promise<{ postId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { postId } = await params;
  return { title: `게시글 #${postId} | 커뮤니티` };
}

export default async function CommunityPostDetailPage({ params }: { params: Params }) {
  const { postId } = await params;
  const id = parseInt(postId, 10);
  if (Number.isNaN(id)) notFound();

  const res = await bffGet(`posts/${id}`);

  if (res.status === 404) notFound();
  if (res.status === 401) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <LoginRequiredGate />
        <p className="font-medium text-destructive">{LOGIN_REQUIRED_MESSAGE}</p>
      </div>
    );
  }
  if (res.status === 403) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-medium text-destructive">{ACCESS_DENIED_MESSAGE}</p>
      </div>
    );
  }
  if (!res.ok) notFound();

  const body = (await res.json()) as ApiResponse<PostDetail>;
  if (!body.success || !body.data) notFound();

  type MeData = {
    userId: number;
    role?: string | null;
  };

  let currentUser: MeData | undefined;
  const meRes = await bffGet(`users/me`);
  if (meRes.ok) {
    const meBody = (await meRes.json()) as ApiResponse<MeData>;
    if (meBody.success && meBody.data) currentUser = meBody.data;
  }

  return (
    <PostDetailSection detail={body.data} currentUser={currentUser} />
  );

}
