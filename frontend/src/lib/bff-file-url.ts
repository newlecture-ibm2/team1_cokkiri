/** 백엔드가 주는 `/api/files/...` 경로를 브라우저용 BFF 경로로 바꿉니다. */
export function apiFileUrlToBffPath(fileUrl: string): string {
  if (!fileUrl) return fileUrl;
  if (fileUrl.startsWith("/api/")) return `/api/bff/${fileUrl.slice(5)}`;
  return fileUrl;
}
