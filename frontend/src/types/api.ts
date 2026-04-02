// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error_code?: string;   // 실패 시에만 포함
}
