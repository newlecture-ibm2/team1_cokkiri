export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string | null;
  errorCode?: string | null;
};

export type AdminPostItem = {
  postId: number;
  category: string;
  title: string;
  authorUserId: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminPostDetail = {
  postId: number;
  category: string;
  title: string;
  content: string;
  authorUserId: number;
  attachments?: { fileUrl?: string | null; fileName?: string | null; fileSize?: number | null }[] | null;
  links?: { url?: string | null }[] | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCommentItem = {
  commentId: number;
  postId: number;
  postTitle: string;
  authorUserId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCommentDetail = {
  commentId: number;
  postId: number;
  postTitle: string;
  authorUserId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type PageData<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
