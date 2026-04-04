/** ISO 날짜 문자열을 한국어 로캘의 날짜+짧은 시간으로 표시합니다. */
export function formatDateTimeKo(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
