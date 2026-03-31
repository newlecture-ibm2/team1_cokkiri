# 🌿 COKKIRI UI/UX DESIGN GUIDELINES
**Concept: Moss & Aloe Editorial**
*Version: 1.0 (2026.04.01)*

이 가이드라인은 'Co-끼리(COKKIRI)' 고유의 프리미엄 에디토리얼 무드를 유지하고, 6인의 풀스택 팀이 AI와 협업하여 일관성 있는 화면을 개발하기 위해 작성되었습니다.

---

## 1. CORE BRAND IDENTITY
*   **Mission**: "Smart Living, Togetherness Redefined."
*   **Tone**: 지적이며(Intelligent), 대담하고(Bold), 차분한(Calm) 프리미엄 잡지 스타일의 레이아웃.
*   **Key Phrase**: "Sanctuary found."

---

## 2. COLOR SYSTEM (MOSS & ALOE)
모든 하드코딩된 색상을 지양하며, 아래의 컬러 팔레트와 CSS 변수(`theme.css`)를 사용합니다.

| Role | Hex Code | Tailwind Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Primary (Moss)** | `#2C3424` | `text-primary` / `bg-primary` | 메인 텍스트, 강조 버튼, 아이콘 |
| **Background (Aloe)** | `#DADED8` | `bg-background` | 모든 페이지의 바탕색 (순수 흰색 지양) |
| **Accent (Olive)** | `#768064` | `text-accent` / `bg-accent` | 호버 상태, 포인트 라벨, 체크 표시 |
| **Secondary (Cedar)** | `#959581` | `text-secondary` | 보조 텍스트, 필터 비활성 상태 |
| **Border (Cypress)** | `#2C3424/10` | `border-border` | 구분선, 카드 테두리 (투명도 적극 활용) |

---

## 3. TYPOGRAPHY RULES
서체는 **'Outfit'** 단일 서체를 사용하며, 굵기(Weight)와 자간(Tracking)으로 등급을 나눕니다.

### 🚩 Headers (H1 ~ H3)
*   **Style**: `font-black`, `tracking-tighter`, `uppercase`
*   **Rule**: 대문자 사용 시 반드시 `tracking-tighter` 혹은 `leading-none`을 사용해 시각적 파괴력을 줍니다.
*   **Example**: `<h1 className="text-8xl font-black tracking-tighter leading-[0.85]">`

### 🚩 Labels & Metadata
*   **Style**: `font-black`, `uppercase`, `tracking-[0.3em]`, `text-xs~sm`
*   **Rule**: 작은 글씨는 반드시 넓은 자간을 사용하여 브랜드명을 각인시킵니다.
*   **Example**: `<span className="text-xs font-black uppercase tracking-[0.3em] opacity-40">`

### 🚩 Body Text
*   **Style**: `font-medium`, `tracking-tight`, `text-base~lg`
*   **Rule**: 본문은 가독성을 위해 `tracking-tight`를 사용하며, 지나치게 연한 회색을 지양하고 Moss(#2C3424)의 투명도를 60% 이상 유지합니다.

---

## 4. LAYOUT & SPACING
'여백의 미'를 극대화하는 에디토리얼 레이아웃 규칙입니다.

*   **Global Padding**: `px-6 md:px-12 lg:px-24` (양옆 여백 통일)
*   **Section Top Padding**: `pt-48` (헤더와 콘텐츠 사이의 충분한 거리)
*   **Grid Gap**: `gap-x-12 gap-y-24` (가로보다 세로 간격을 2배 넓게 주어 가독성 확보)
*   **Container Width**: `max-w-[1400px]` (중앙 정렬 레이아웃)

---

## 5. COMPONENT STANDARDS

### 📦 ListingCard (공통 카드)
*   **Shadow**: 절대 사용 금지. (그림자 대신 미세한 보더와 여백으로 구분)
*   **Border**: `border-t border-[#2C3424]/10` (상단 구분선 강조)
*   **Info Mix**: 영어 타이틀(H3) + 한국어 메타데이터 (예: 개인 전용).

### 🔘 Buttons (공통 버튼)
*   **Primary**: `rounded-full`, `bg-[#2C3424]`, `text-[#DADED8]`, `font-black`, `tracking-[0.2em]`, `hover:bg-[#768064]`.
*   **Point**: `rounded-2xl`, `bg-[#768064]`, `text-white`, `shadow-lg shadow-[#768064]/20`.
*   **Rule**: 모든 버튼은 호버 시 `transition-all`과 `duration-500`을 사용합니다.

---

## 6. INTERACTIVE & MOTION (BY FRAMER MOTION)
정적인 웹이 아니라 '살아있는' 인터페이스를 지향합니다.

*   **Page Entrance**: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` (부드러운 상승 효과)
*   **Hover State**: `scale: 1.05` 또는 `x: 10` (사용자 흐름 유도)
*   **Scroll Parallax**: 주요 이미지 섹션에는 `useScroll`과 `useTransform`을 사용하여 시차 효과를 줍니다.

---

## 7. AI COLLABORATION TIP
AI에게 코딩을 요청할 때 다음 지시사항을 포함하세요:
> "우리 프로젝트는 **'Moss & Aloe Editorial'** 가이드를 따른다. 색상은 하드코딩하지 말고 `theme.css` 변수를 써라. 타이틀은 `font-black`에 `tracking-tighter`를 적용하고, 페이지 여백은 가이드의 `pt-48`과 `lg:px-24`를 지켜라. 모든 인터랙션은 `framer-motion`을 활용하라."

---
🌿 **COKKIRI — TOGETHERNESS REDEFINED.**
