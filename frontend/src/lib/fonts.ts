import localFont from "next/font/local";
import { Manrope } from "next/font/google";

/**
 * 방 카드 등: 라틴·숫자·기호는 Manrope.
 * Manrope(공식 배포)에는 한글 글립이 없어, 같은 font-family 스택의 Pretendard Variable이 한글을 담당합니다.
 */
export const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "greek", "vietnamese"],
  variable: "--font-manrope",
  display: "swap",
});

export const pretendardVariable = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});
