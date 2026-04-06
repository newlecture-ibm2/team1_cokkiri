---
trigger: always_on
---

# 🌿 COKKIRI UI/UX DESIGN GUIDELINES (Next.js 15 & Tailwind 4)
**Concept: Moss & Aloe Editorial**
*Version: 2.0 (2026.04.02)*

이 가이드라인은 'Co-끼리(COKKIRI)'의 프리미엄 에디토리얼 무드를 유지하고, 6인의 팀원이 각 도메별로 독립적으로 개발하되 하나의 서비스처럼 일관된 사용자 경험을 제공하기 위해 작성되었습니다.

### 📌 `02-frontend-architecture.md` 와의 역할 분담
- **본 문서(ui-guideline):** **디자인 스펙** — 팔레트 Hex, CSS 변수명(`--primary` 등), 타이포 크기·데코, 섹션 간격, Framer 모션, 에디토리얼 톤. 여기 적힌 색·수치를 **`src/styles/theme.css`** 에 반영하는 것이 단일 진실 공급원이다.
- **`02-frontend-architecture.md`:** **기술 아키텍처** — App Router 콜로케이션, `ui`/`layout` 폴더, BFF·`apiFetch`, “시맨틱 유틸만·Hex 금지” 같은 **구현 원칙(한 줄~짧은 단락)** 만 다룬다. 디자인 수치의 반복 서술은 하지 않는다.
- **연동:** 컴포넌트 코드에서는 **항상** theme에 매핑된 클래스(`text-primary`, `bg-background` …)만 쓰고, Hex·raw vw는 **theme/ui-guideline** 쪽에만 둔다.

---

## 🏗️ 1. ARCHITECTURE & COLLABORATION
6인의 개발자가 서로의 코드를 간섭하지 않으면서 일관성을 유지하는 폴더 구조 규칙입니다.

### 📂 폴더 구조 및 소유권 (m-2: `ui` vs `layout`)

| 폴더 | 대상 | 설명 | 예시 |
|------|------|------|------|
| **`components/ui/`** | **원자(Atomic) 컴포넌트** | props만으로 렌더링 가능한 **재사용 UI 조각**. 라우팅·인증에 묶이지 않음. | `Button`, `Input`, `Modal`, `Skeleton` |
| **`components/layout/`** | **전역·껍데기** | **라우팅·인증·내비게이션**과 함께 쓰이는 앱 뼈대. 여러 페이지에서 공통으로 감싼다. | `Header`, `Footer`, `Sidebar`, `NavBar`, `PageLayout`, `ScrollToTop` |

- 과거 `components/shared/` 명칭은 **`layout/`으로 통일**했다. 새 폴더로 `shared/`를 만들지 않는다.
- **`app/(domain)/`**: 각 팀원별 도메인 그룹 폴더 (예: `(auth)`, `(listings)`, `(community)`).
- **`lib/`**: 공통 유틸리티 및 API 클라이언트 설정.

### 🤝 작업 규칙
1. **Colocation**: 특정 페이지에서만 쓰이는 컴포넌트는 해당 페이지 폴더(`_components/`)에 두어 전역 폴더 오염을 방지합니다.
2. **Server First**: 모든 페이지와 컴포넌트는 기본적으로 **Server Component**로 작성합니다. 인터랙션(State, Event)이 필요한 경우에만 최소 단위로 분리하여 `'use client'`를 적용합니다.
3. **Domain Barrier**: 타 도메인의 내부 컴포넌트를 직접 참조하지 않습니다. 필요 시 `components/layout`(또는 진짜 공용일 때만 `components/ui`)로 격상 후 공유합니다.

---

## 🎨 2. DESIGN SYSTEM (MOSS & ALOE)
하드코딩을 지양하고 `src/styles/theme.css`에 정의된 변수를 사용합니다.

### 🎨 Color Palette
| Name | Variable | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Moss** | `--primary` | `#2C3424` | 메인 텍스트, 다크 배경, 강조 요소 |
| **Aloe** | `--background` | `#DADED8` | 기본 배경색 (고급스러운 미색) |
| **Olive** | `--accent` | `#768064` | 포인트 컬러, 호버 상태, 활성화 표시 |
| **Cypress** | `--muted` | `#4C583E` | 보조 텍스트, 비활성 아이콘 |
| **Cedar** | `--secondary` | `#959581` | 테두리, 구분선, 연한 배경 |

### 📐 Spacing Standard
박스 모델의 간격은 다음 수치를 사용하여 리듬감을 통일합니다.
- **Section Padding**: `py-24 md:py-32`
- **Global Page Margin**: `px-6 md:px-12 lg:px-24`
- **Content Gap**: `gap-12` (Vertical), `gap-6` (Horizontal)
- **Border Radius**: `rounded-[2rem]` (큰 카드), `rounded-xl` (버튼/입력창)

---

## ✍️ 3. TYPOGRAPHY & LAYOUT (EDITORIAL STYLE)
잡지(Magazine) 같은 대담하고 정돈된 스타일을 위한 규칙입니다.

### 🚩 Headline (H1 ~ H3)
- **Style**: `font-black`, `tracking-tighter`, `uppercase`, `leading-[0.85]`
- **Responsive**: 큰 제목은 `text-[12vw] md:text-[10vw]` 등 가변 단위를 사용하여 줄바꿈을 최소화합니다.
- **Decoration**: 강조 키워드에는 `underline underline-offset-[1vw] decoration-[#768064]`를 적용합니다.

### 🚩 Body & Metadata
- **Body**: `font-medium`, `tracking-tight`, `text-balance` (가독성을 위한 자동 줄바꿈 최적화)
- **Metadata**: `font-black`, `uppercase`, `tracking-[0.3em]`, `text-[10px]` (고급스러운 라벨 느낌)

---

## 🚀 4. INTERACTIVE & PERFORMANCE
Next.js 15 기능과 Framer Motion을 결합한 고성능 인터페이스 패턴입니다.

### ✨ Micro-animations (Framer Motion)
1. **Page Entrance**: 모든 루트 컴포넌트는 `initial={{ opacity: 0, y: 20 }}`로 부드럽게 등장합니다.
2. **Hover Feedback**: 버튼과 카드는 `whileHover={{ scale: 1.02 }}` 또는 `y: -8` 정도의 미세한 피드백을 반드시 포함합니다.
3. **Smart Links**: 외부 링크가 아닌 프로젝트 내 이동은 반드시 `next/link`를 사용하여 프리페칭(Prefetching) 혜택을 받습니다.

### ⏳ Loading & Error Handling
- **Loading**: `loading.tsx`를 활용하여 Skeleton UI를 제공합니다. (`components/ui/skeleton` 활용)
- **Empty States**: 데이터가 없을 경우 `Heart`나 `Search` 아이콘과 함께 "No spaces found" 식의 에디토리얼 메시지를 표시합니다.

---

## 🤖 5. AI COLLABORATION COMMAND
AI와 협업할 때 다음 프롬프트를 복사하여 프로젝트 문맥을 유지하세요:

> "우리는 **Next.js 15 App Router**와 **Tailwind 4** 기반의 **'Moss & Aloe Editorial'** 가이드를 따른다. 
> 1. 모든 색상은 `theme.css` 변수(`--primary`, `--background` 등)를 사용하라.
> 2. 레이아웃은 `max-w-[1400px]`와 `lg:px-24` 여백을 준수하라.
> 3. 타이포그래피는 `font-black`과 `tracking-tighter`로 대담하게 표현하라.
> 4. 상호작용이 필요한 경우에만 최소 단위로 `'use client'`를 분리하라."

---

🌿 **COKKIRI — TOGETHERNESS REDEFINED.**
