"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Home } from "lucide-react";
import { StatusLayout } from "@/components/shared/StatusLayout";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <StatusLayout
      status="500"
      title="애플리케이션 오류가 발생했습니다."
      description={`서버와의 연결이 원활하지 않거나 렌더링 중 문제가 발생했습니다.
        잠시 후 다시 시도해 주시기 바랍니다.`}
      isError={true}
      secondaryAction={{
        label: "메인으로 가기",
        onClick: () => router.push("/"),
        icon: Home
      }}
      primaryAction={{
        label: "다시 시도하기",
        onClick: () => reset(),
        icon: RefreshCcw
      }}
    />
  );
}
