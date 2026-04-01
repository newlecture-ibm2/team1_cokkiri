# 💻 [프론트엔드] 아키텍처 및 디자인 룰 (Next.js & Tailwind CSS v4)

프론트엔드를 스캐폴딩하거나 페이지를 생성할 때 AI가 무조건 반영해야 하는 아키텍처 및 스타일 규칙입니다.

### 1. App Router Co-location (콜로케이션 방식 필수 준수)
- **도메인 캡슐화:** 특정 페이지(예: 관리자의 기기 목록)에서만 사용되는 컴포넌트, 훅, API 로직은 절대 글로벌 `components/` 폴더에 생성하지 않습니다. 
- **내부 폴더 분리:** 반드시 해당 페이지 도메인 폴더 내부(예: `app/(admin)/devices/`)에 `_components`, `_hooks`, `_api`, `_types` 라는 껌딱지(언더스코어) 폴더를 만들어 라우팅을 우회하고 로직을 숨깁니다.
- **예외 (글로벌 UI):** 여러 도메인에서 재사용 가능한 '껍데기 컴포넌트(Button, Modal, Input, Layout 등)'는 오직 `src/components/ui` 폴더에서만 관리합니다. 

### 2. Tailwind CSS v4 Strict Guidelines (스타일링 룰)
- **Hex 코드 및 하드코딩 절대 금지:** 컴포넌트를 만들 때 임의의 색상 값(예: `text-[#2c3424]`, `bg-[#4c583e]`)을 강제로 주입하지 않습니다.
- **Theme 연동:** 이미 프로젝트 루트의 `styles/theme.css` 내부에 `@theme inline`으로 디자인 가이드(Moss & Aloe 등)의 모든 컬러 토큰이 예약되어 있습니다.
- 따라서 반드시 `bg-background`, `text-primary`, `border-border`, `bg-muted` 같은 **시맨틱 유틸리티 클래스만 사용**하여 테마 일관성을 강제합니다.
- 복잡한 클래스 조합 시 `clsx`와 `tailwind-merge`를 섞어쓰는 shadcn/ui의 기본 원칙을 따릅니다.

### 3. Data Fetching (BFF Pattern)
- 브라우저 클라이언트(`"use client"`)에서 Spring Boot 백엔드 서버 주소(`http://backend:8080`)로 직접 `fetch`를 날리는 것을 엄격히 금지합니다.
- 반드시 Next.js 내부 API Routes (`/api/bff/[...path]`)를 거치거나 Server Component(RSC) 환경에서 우회 통신(Proxy)하여 브라우저에서 서버 IP가 노출되지 않도록 설계합니다.
