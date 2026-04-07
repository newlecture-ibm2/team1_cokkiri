---
trigger: always_on
---

# 💻 [프론트엔드] 아키텍처 및 코드 규칙 (Next.js & Tailwind CSS v4)

프론트엔드를 스캐폴딩하거나 페이지를 생성할 때 AI가 반영해야 하는 **디렉터리 구조·데이터 패치·코드 컨벤션**이다. **색·타이포·에디토리얼 스펙은 `ui-guideline.md` 전용** — 이 파일에는 디자인 토큰 표나 Hex·vw 수치를 늘리지 않는다.

### 문서 역할 분리
| 문서 | 담당 |
|------|------|
| **`ui-guideline.md`** | Moss & Aloe **디자인 시스템**(팔레트 Hex→CSS 변수, 타이포, 간격, 모션, AI 협업 문구) |
| **본 문서 (`02-frontend-architecture.md`)** | App Router 콜로케이션, **BFF**, Tailwind **기술 규칙**(시맨틱 유틸만—원칙 한 줄), 레이아웃 폴더(`layout`/`ui`) |

구현 시: **`theme.css`에 ui-guideline의 값을 변수로 올려 두고**, 컴포넌트에서는 **`bg-background`, `text-primary` 등 시맨틱 클래스만** 사용한다(임의 Hex·`text-[#...]` 금지). 상세 수치·예시는 ui-guideline을 본다.

### 1. App Router Co-location (콜로케이션 방식 필수 준수)
- **도메인 캡슐화:** 특정 페이지(예: 관리자의 기기 목록)에서만 사용되는 컴포넌트, 훅, API 로직은 절대 글로벌 `components/` 폴더에 생성하지 않습니다.
- **내부 폴더 분리:** 반드시 해당 페이지 도메인 폴더 내부(예: `app/(admin)/devices/`)에 `_components`, `_hooks`, `_api`, `_types` 라는 언더스코어 폴더를 만들어 라우팅을 우회하고 로직을 숨깁니다.
- **글로벌 컴포넌트 위치:** 원자 UI(Button, Modal, Input 등)는 `src/components/ui`. 헤더·푸터·사이드바·PageLayout·ScrollToTop 등은 **`src/components/layout`** 만 사용한다(`ui-guideline.md` §1과 동일).

### 2. 스타일링 (기술 규칙만)
- **하드코딩 색 금지:** 컴포넌트에 임의 Hex·임의 `text-[#...]` 를 넣지 않는다. **시맨틱 유틸**(`text-primary`, `bg-background`, `border-border` …)만 사용한다 — 토큰 정의·매핑 표는 `ui-guideline.md` §2.
- **유틸 병합:** `clsx` + `tailwind-merge`(shadcn 패턴) 허용.
- **반응형·타이포·여백의 구체 수치**(예: 12vw, py-24)는 **ui-guideline**을 따른다. 본 문서에서는 “가이드라인과 theme 변수 준수”로만 명시한다.

### 3. Data Fetching (BFF Pattern)

#### 3-1. 프록시 경로 규칙 (`middleware.ts` 기반)
| 호출 주체 | URL 패턴 | 설명 |
|-----------|----------|------|
| **브라우저** | `/api/{...}` | 클라이언트·`apiFetch`는 백엔드와 동일하게 `/api/` 리소스 경로를 직접 호출한다. |
| **Spring (백엔드)** | `/api/{...}` | Next Middleware가 **`/api/...` → 백엔드 `INTERNAL_BACKEND_URL` + `/api/...`** 로 원본 경로 그대로 넘긴다. |

- **변환 규칙:** 브라우저가 호출한 `/api/` 하위 경로를 Next Middleware가 가로채어 백엔드로 바로 포워딩(동일 경로)한다. 
- **예시:** `GET /api/admin/reservations` 호출 시 → 프록시 → **`GET /api/admin/reservations`** (관리자 API도 동일 규칙).
- **수정사항 공고:** 프론트엔드 코드 내에 수동으로 `/bff` 세그먼트를 덧붙이는 행위는 더 이상 사용하지 않으며, 백엔드 라우팅명세와 100% 동일하게 호출한다.

#### 3-2. 명세·구현과의 대응
- 브라우저 클라이언트(`"use client"`)에서 Spring Boot 백엔드 호스트로 호스트 주소를 명시하여 직접 `fetch`하는 것을 금지한다. 클라이언트는 앞단의 프로토콜/호스트를 생략한 `/api/...` 경로를 찔러야 한다.
- **`api-specification.md`:** 백엔드 계약과 프론트엔드 요청 경로는 1:1로 완벽히 동일하다.
- `lib/api.ts` 의 `apiFetch` 등: `BASE_URL`(예: `/api`) + 프록시 리소스 세그먼트(예: `/rooms`, `/admin/reservations`), `credentials: 'include'` 로 httpOnly 쿠키 전달. 이후 미들웨어가 JWT를 분석하여 백엔드로 분배한다.
- Server Component에서는 `INTERNAL_BACKEND_URL` 로 서버 전용 호출 가능하되, 브라우저에 백엔드 URL이 노출되면 안 된다. 상세는 `initial-project-setup.md` §6 · `01-general-convention.md` §1-1.

### 4. 기타 공통
- 라우트 전환 시 상단 스크롤 등 **공통 UX**는 `layout`의 ScrollToTop 등으로 처리한다(세부는 ui-guideline·기존 컴포넌트에 맞춤).
- 관리자 커뮤니티 화면은 `src/app/admin/community/` 하위에 콜로케이션(`_components`, `_api`, `_types`)을 적용하고, API 호출은 `admin` 영역 규칙대로 `/api/admin/...`만 사용한다.
