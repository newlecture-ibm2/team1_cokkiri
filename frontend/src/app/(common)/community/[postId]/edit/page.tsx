import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ACCESS_DENIED_MESSAGE, LOGIN_REQUIRED_MESSAGE } from "@/lib/auth-messages";
import { LoginRequiredGate } from "@/components/shared/LoginRequiredGate";
import { normalizePostBodyApiCommunityUrlsToBff } from "@/lib/post-html";
import { bffGet } from "../../_api/bff-server";
import type { ApiResponse, PostDetail } from "../../_types/community";
import { EditPostForm } from "./_components/EditPostForm";

type Params = Promise<{ postId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { postId } = await params;
  return { title: `수정하기 #${postId} | 커뮤니티` };
}

export default async function CommunityEditPage({ params }: { params: Params }) {
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

  /* 권한 확인 — 작성자 또는 ADMIN만 수정 가능 */
  type MeData = { userId: number; role?: string | null };
  let currentUser: MeData | undefined;
  const meRes = await bffGet(`users/me`);
  if (meRes.ok) {
    const meBody = (await meRes.json()) as ApiResponse<MeData>;
    if (meBody.success && meBody.data) currentUser = meBody.data;
  }

  const canEdit =
    currentUser &&
    (currentUser.role === "ADMIN" || currentUser.userId === body.data.author.userId);
  if (!canEdit) redirect(`/community/${id}`);

  const detail = body.data;

  return (
    <div className="pt-4 pb-32">
      <header className="mx-auto max-w-5xl mb-12">
        <div className="flex flex-col gap-6">
          <Link
            href={`/community/${id}`}
            className="group inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary/60 hover:text-accent transition-colors w-fit"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 group-hover:bg-accent/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            게시글로 돌아가기
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-primary/10 pb-8">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase">
                EDI<span className="underline underline-offset-4 decoration-[var(--color-accent)]">T.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">수정하기</span>
              </h1>
              <p className="text-sm leading-tight font-medium opacity-70 md:text-base">
                게시글을 수정합니다.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative">
        <EditPostForm
          postId={id}
          initialCategory={detail.category}
          initialTitle={detail.title}
          initialContent={normalizePostBodyApiCommunityUrlsToBff(detail.content)}

          initialAttachments={detail.attachments ?? []}
        />
      </div>
    </div>
  );
}
