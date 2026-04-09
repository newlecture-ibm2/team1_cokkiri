"use client";

import { useRouter } from "next/navigation";
import { MoveLeft, Home } from "lucide-react";
import { StatusLayout } from "@/components/shared/StatusLayout";

export default function NotFound() {
  const router = useRouter();

  return (
    <StatusLayout
      status="404"
      title="요청하신 페이지를 찾을 수 없습니다."
      description={`서비스 이용에 불편을 드려 죄송합니다.
        찾으시는 웹 페이지가 현재 사용할 수 없거나
        웹 페이지의 이름이 변경 또는 삭제되었습니다.`}
      secondaryAction={{
        label: "이전페이지",
        onClick: () => router.back(),
        icon: MoveLeft
      }}
      primaryAction={{
        label: "메인으로 가기",
        onClick: () => router.push("/"),
        icon: Home
      }}
    />
  );
}
