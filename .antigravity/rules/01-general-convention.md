---
trigger: always_on
---

# 📜 [팀 공통] 명명 규칙 및 핵심 정책 (General Conventions & Workflow)

이 파일은 AI 에이전트와 우리 팀이 자율적으로 따를 **프로젝트 공통 코딩 스탠다드**입니다. 프롬프트 요청 없이도 이 규칙은 시스템 전체에 1순위로 강제 반영됩니다.

### 1. Naming Conventions (명명 규칙)
- **Database / SQL Schema:**
  - 철저한 `snake_case` 사용.
  - 물리 테이블명은 **복수형 `snake_case`** (예: `users`, `devices`, `posts`). JPA `@Table(name = "users")` 등 문서·스키마·`erd.md` §1 제목과 맞춘다.
- **Backend (Java/Spring Boot):**
  - 변수, 메서드, 파라미터는 `camelCase` 사용.
  - 클래스, 인터페이스는 `PascalCase` 사용.
- **Frontend (TypeScript/Next.js):**
  - 일반 함수 및 변수는 `camelCase`.
  - React **컴포넌트 및 Type/Interface**는 무조건 `PascalCase` 사용.
  - 파일 및 폴더 이름(URL 경로 포함)은 무조건 `kebab-case` 사용 (예: `/my-devices`, `contract-apply`).
- **REST API 엔드포인트 URL (백엔드 계약):**
  - Spring에 매핑되는 공개 API는 **`/api/...`** (문서·OpenAPI·`api-specification.md` 기준). **`/api/bff`는 백엔드 경로에 포함하지 않는다.**
  - **`/api/v1`** 등 버전 세그먼트는 사용하지 않는다.
  - 소문자 `kebab-case`, 리소스 세그먼트는 **복수형(Plural)** (예: `/api/posts`, `/api/vocs`, `/api/devices`).
  - 경로 변수는 명세와 동일하게 쓴다. 방 상세는 **`/api/rooms/{roomId}`** 처럼 `roomId` 사용(내부적으로 space id).

### 1-1. BFF (Next.js) — 프론트 호출면
- 브라우저·클라이언트 컴포넌트는 백엔드와 동일하게 **`/api/...`** 만 호출한다. 백엔드 호스트는 서버 전용 환경변수로만 둔다.
- **프록시 경로**는 백엔드와 **동일한 `/api/` 이하 세그먼트**와 1:1 대응하며, 미들웨어가 이를 가로채 포워딩한다(예: 브라우저 `GET /api/rooms` → Next Middleware → Spring `GET /api/rooms`). 역할 프리픽스 `/user/`, `/resident/` URL 삽입은 **필수 아님**(Spring Security·`@PreAuthorize`로 인가).
- 프론트엔드 코드 내에 수동으로 `/bff` 등을 추가할 필요가 없다.
- 문서 역할: 백엔드 스펙 = `api-specification.md` · 프록시·env = `initial-project-setup.md` §6.

### 2. Core Policies (핵심 데이터 규칙)
- **Soft Delete 지침 (BaseEntity 활용 강제):**
  - 시스템 내 모든 JPA 엔티티는 반드시 **`BaseEntity`**(`com.coliving.global.entity.BaseEntity`)를 상속(`extends`)받아 공통 필드(`created_at`, `updated_at`, `deleted_at`)를 상속받아야 합니다.
  - 데이터베이스의 어떤 테이블에서도 `DELETE` 쿼리 사용(물리 삭제)을 엄격히 금지합니다.
  - 데이터 삭제 시에는 영속성 상태의 엔티티 객체에서 **`softDelete()`** 메서드를 호출해 삭제 시간을 기록하고, 어댑터 계층에서 반드시 **`jpaRepository.save(entity)`를 명시적으로 호출**하여 더티 체킹에 의존하지 않습니다.
  - **§2는 소프트 삭제 절차를 강조한 항목**이다. **INSERT·일반 UPDATE·`softDelete()` 이후까지 포함한 `jpaRepository.save()` 명시 호출의 전 범위**는 `03-backend-architecture.md` §5가 마스터이며, §2는 그중 소프트 삭제 맥락을 설명한다.

### 3. Role & Permission (역할 통제) — 표기 C-1

| 구분 | 표기 | 예시 |
|------|------|------|
| **DB `users.role` 컬럼·JWT payload `role` 문자열** | 접두사 **없음** | `USER`, `RESIDENT`, `ADMIN` |
| **Spring Security 코드** | `hasRole("…")` — 인자에는 **`ROLE_` 없이** 역할명만 | `hasRole("ADMIN")`, `hasRole("RESIDENT")` (프레임워크가 `ROLE_ADMIN` 권한과 매핑) |
| **기획·명세·다이어그램(개념 설명)** | 가독성을 위해 **`ROLE_` 접두**를 쓸 수 있음 | `ROLE_USER`, `ROLE_ADMIN` — **저장 값이 아님** |

- **`ROLE_USER`, `ROLE_ADMIN` 등은 개념 문서용 표기일 뿐**이며, DB에는 **`USER` / `ADMIN` …** 처럼 접두사 없이 저장한다. 코드·쿼리에서 혼동하지 말 것.
- **게스트(비로그인):** 방·커뮤니티 글 **열람**, VoC **열람**(정책에 따라 제한 가능) 등 Public API.
- **`USER`:** 위 + 계약 신청·체결·내 정보·커뮤니티·VoC 작성 등 명세상 👤/🔑 구간.
- **`RESIDENT`:** IoT·예약·내 청구 등 🏠 구간.
- **`ADMIN`:** `/api/admin/**` 등 🔒 구간.
- 백엔드, 프론트엔드 작업 시 현재 요청하는 역할이 무엇인지 API와 뷰에서 상시 검증(Guard) 로직을 포함시켜야 합니다.
