import { notFound } from "next/navigation";
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
      <CommunityShell>
        <MotionEnter>
          <p className="mx-auto max-w-3xl text-center font-medium text-destructive">로그인이 필요합니다.</p>
        </MotionEnter>
      </CommunityShell>
    );
  }
  if (!res.ok) notFound();

  const body = (await res.json()) as ApiResponse<PostDetail>;
  if (!body.success || !body.data) notFound();

  return (
    <CommunityShell>
      <MotionEnter>
        <PostDetailSection detail={body.data} />
      </MotionEnter>
    </CommunityShell>
  );
}
