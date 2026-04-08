export type AdminVocListItem = {
  vocId: number;
  userId: number;
  category: string;
  title: string;
  status: string;
  createdAt: string;
};

export type AdminVocListData = {
  content: AdminVocListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AdminVocAttachment = {
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
};

export type AdminVocDetail = {
  vocId: number;
  userId: number;
  category: string;
  title: string;
  content: string;
  attachments: AdminVocAttachment[];
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

export function adminVocCategoryLabel(code: string): string {
  switch (code) {
    case "FACILITY":
      return "시설";
    case "NOISE":
      return "소음";
    case "DEVICE":
      return "기기";
    case "OTHER":
      return "기타";
    default:
      return code;
  }
}

export function adminVocStatusLabel(status: string): string {
  switch (status) {
    case "OPEN":
      return "접수";
    case "IN_PROGRESS":
      return "처리 중";
    case "RESOLVED":
      return "처리 완료";
    case "CANCELLED":
      return "취소";
    default:
      return status;
  }
}
