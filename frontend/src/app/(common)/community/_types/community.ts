/** 백엔드 ApiResponse<T>와 동일 */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string | null;
  errorCode?: string | null;
};

export type PostListItem = {
  postId: number;
  category: string;
  title: string;
  authorUserId: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

export type PostListData = {
  content: PostListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type PostAuthor = {
  userId: number;
  name: string;
  profileImage?: string | null;
};

export type PostAttachment = {
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};

export type PostLink = {
  url?: string | null;
};

export type PostComment = {
  commentId: number;
  parentCommentId?: number | null;
  content: string;
  author: PostAuthor;
  createdAt: string;
};

export type PostDetail = {
  postId: number;
  category: string;
  title: string;
  content: string;
  attachments?: PostAttachment[] | null;
  links?: PostLink[] | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  /** Jackson 직렬화에 따라 둘 중 하나로 올 수 있음 */
  likedByMe?: boolean;
  isLikedByMe?: boolean;
  author: PostAuthor;
  comments: PostComment[];
  createdAt: string;
};

export type PostIdData = {
  postId: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ToggleLikeData = {
  postId: number;
  liked: boolean;
  likeCount: number;
};

export const POST_CATEGORIES = [
  { value: "FREE", label: "자유" },
  { value: "QUESTION", label: "질문" },
  { value: "SUGGESTION", label: "건의" },
  { value: "MEETUP", label: "모임" },
  { value: "NOTICE", label: "공지" },
] as const;
