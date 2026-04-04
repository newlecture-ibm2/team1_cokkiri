export type VocCategoryCode = "FACILITY" | "NOISE" | "DEVICE" | "OTHER";

export type VocStatusCode = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";

export type VocAttachment = {
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
};

export type VocListItem = {
  vocId: number;
  category: string;
  title: string;
  status: string;
  createdAt: string;
};

export type VocListData = {
  content: VocListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type VocDetail = {
  vocId: number;
  userId: number;
  category: string;
  title: string;
  content: string;
  attachments: VocAttachment[];
  status: string;
  adminReply: string | null;
  replyUserId: number | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string | null;
  errorCode?: string | null;
};

export const VOC_CATEGORIES: { value: VocCategoryCode; label: string }[] = [
  { value: "FACILITY", label: "시설" },
  { value: "NOISE", label: "소음" },
  { value: "DEVICE", label: "기기" },
  { value: "OTHER", label: "기타" },
];

export function vocCategoryLabel(code: string): string {
  return VOC_CATEGORIES.find((c) => c.value === code)?.label ?? code;
}

export function vocStatusLabel(status: string): string {
  switch (status) {
    case "OPEN":
      return "접수";
    case "IN_PROGRESS":
      return "처리 중";
    case "RESOLVED":
      return "답변 완료";
    case "CANCELLED":
      return "취소됨";
    default:
      return status;
  }
}
