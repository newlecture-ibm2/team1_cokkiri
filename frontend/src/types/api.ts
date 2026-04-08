// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  /** 백엔드 JSON (camelCase) */
  errorCode?: string;
  /** 레거시/스네이크 케이스 대비 */
  error_code?: string;
}
