---
trigger: always_on
---

# 💻 [프론트엔드] 아키텍처 및 디자인 룰 (Next.js & Tailwind CSS v4)

프론트엔드를 스캐폴딩하거나 페이지를 생성할 때 AI가 무조건 반영해야 하는 아키텍처 및 스타일 규칙입니다.

### 1. App Router Co-location (콜로케이션 방식 필수 준수)
- **도메인 캡슐화:** 특정 페이지(예: 관리자의 기기 목록)에서만 사용되는 컴포넌트, 훅, API 로직은 절대 글로벌 `components/` 폴더에 생성하지 않습니다. 
- **내부 폴더 분리:** 반드시 해당 페이지 도메인 폴더 내부(예: `app/(admin)/devices/`)에 `_components`, `_hooks`, `_api`, `_types` 라는 껌딱지(언더스코어) 폴더를 만들어 라우팅을 우회하고 로직을 숨깁니다.
- **예외 (글로벌 UI):** 원자 UI(Button, Modal, Input 등)는 `src/components/ui`. **헤더·푸터·사이드바·PageLayout·ScrollToTop** 등 앱 뼈대는 **`src/components/layout`** 에만 둔다. (`ui-guideline.md` 와 동일) 

### 2. Tailwind CSS v4 Strict Guidelines (스타일링 룰)
- **Hex 코드 및 하드코딩 절대 금지:** 컴포넌트를 만들 때 임의의 색상 값(예: `text-[#2c3424]`, `bg-[#4c583e]`)을 강제로 주입하지 않습니다.
- **Theme 연동:** 이미 프로젝트 루트의 `styles/theme.css` 내부에 `@theme inline`으로 디자인 가이드(Moss & Aloe 등)의 모든 컬러 토큰이 예약되어 있습니다.
- 따라서 반드시 `bg-background`, `text-primary`, `border-border`, `bg-muted` 같은 **시맨틱 유틸리티 클래스만 사용**하여 테마 일관성을 강제합니다.
- 복잡한 클래스 조합 시 `clsx`와 `tailwind-merge`를 섞어쓰는 shadcn/ui의 기본 원칙을 따릅니다.

### 3. Data Fetching (BFF Pattern)
- 브라우저 클라이언트(`"use client"`)에서 Spring Boot 백엔드 호스트로 직접 `fetch`하는 것을 금지한다.
- **`/api/bff/...`** 만 호출한다. BFF는 Spring **`/api/...`** 와 **동일 경로**로 프록시한다(역할 프리픽스 `/bff/user/` 등은 필수 아님 — `01-general-convention.md` §1-1).
- `lib/api.ts` 의 `apiFetch` 등: `BASE_URL` + `/bff` + 백엔드와 동일한 세그먼트(예: `/rooms`, `/posts`, `/vocs`), `credentials: 'include'` 로 httpOnly 쿠키 전달.
- Server Component에서는 `INTERNAL_BACKEND_URL` 로 서버 전용 호출 가능하되, 브라우저에 백엔드 URL이 노출되면 안 된다.

### 4. Responsive & Typography Rules (UI 가이드라인 강제 룰)
- **적응형 여백 (Adaptive Spacing):** 모바일 환경(768px 미만)에서는 데스크톱(pt-32, mb-24 등) 대비 상하 여백을 **50% 수준**(`pt-16`, `mb-12` 등)으로 지능적으로 축소하여 좁은 화면의 해상도를 높여야 합니다. 모바일 마진은 최소 `px-6`를 보장합니다.
- **타이포그래피 반응성 (VW & nowrap):** 핵심 제목(Headline) 작성 시 의도치 않은 줄바꿈 방지를 위해 `whitespace-nowrap` 속성을 필수로 활용합니다. 뷰포트 너비 호환을 위해 `text-[min(12vw,6rem)]` 같은 동적 크기 단위를 적극 활용합니다.
- **모바일 인터랙션 (가로 스크롤 & 그리드):** 공간 효율 극대화를 위해 나열형 카드/필터는 모바일에서 가로 스크롤(`overflow-x-auto`)을 강제하거나 `grid-cols-2` 패턴을 사용합니다.
- **스크롤 강제화:** 모든 라우팅 페이지 상위 컴포넌트로 `ScrollToTop` 유틸리티를 감싸서 사용자 이동 페이지가 항상 최상단부터 노출되도록 해야 합니다.
