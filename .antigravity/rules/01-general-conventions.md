# 📜 [팀 공통] 명명 규칙 및 핵심 정책 (General Conventions & Workflow)

이 파일은 AI 에이전트와 우리 팀이 자율적으로 따를 **프로젝트 공통 코딩 스탠다드**입니다. 프롬프트 요청 없이도 이 규칙은 시스템 전체에 1순위로 강제 반영됩니다.

### 1. Naming Conventions (명명 규칙)
- **Database / SQL Schema:** 
  - 철저한 `snake_case` 사용.
  - 테이블명은 복수를 사용 (예: `users` ⭕, `devices` ⭕, `posts` ⭕, `comments` ⭕). JPA `@Table(name = "...")` 및 `docs/schema.sql`과 동일하게 맞춘다.
- **Backend (Java/Spring Boot):**
  - 변수, 메서드, 파라미터는 `camelCase` 사용.
  - 클래스, 인터페이스는 `PascalCase` 사용.
- **Frontend (TypeScript/Next.js):**
  - 일반 함수 및 변수는 `camelCase`.
  - React **컴포넌트 및 Type/Interface**는 무조건 `PascalCase` 사용.
  - 파일 및 폴더 이름(URL 경로 포함)은 무조건 `kebab-case` 사용 (예: `/my-devices`, `contract-apply`).
- **REST API 엔드포인트 URL:** 
  - 접두는 **`/api`** 만 사용한다 (`/api/v1` 등 버전 세그먼트는 두지 않음).
  - 소문자 `kebab-case` 및 **복수형(Plural) 리소스** 원칙 (예: `/api/posts`, `/api/vocs`, `/api/devices`, `/api/contracts`).

### 2. Core Policies (핵심 데이터 규칙)
- **Soft Delete 지침 (BaseEntity 활용 강제):**
  - 시스템 내 모든 JPA 엔티티는 반드시 **`BaseEntity`**(`com.coliving.global.entity.BaseEntity`)를 상속(`extends`)받아 공통 필드(`created_at`, `updated_at`, `deleted_at`)를 상속받아야 합니다.
  - 데이터베이스의 어떤 테이블에서도 `DELETE` 쿼리 사용(물리 삭제)을 엄격히 금지합니다.
  - 데이터 삭제 시에는 영속성 상태의 엔티티 객체에서 **`softDelete()`** 메서드를 호출해 삭제 시간을 기록하고, 어댑터 계층에서 반드시 **`jpaRepository.save(entity)`를 명시적으로 호출**하여 더티 체킹에 의존하지 않습니다.
  - 모든 엔티티 클래스 선언부 상단에는 `@SQLRestriction("deleted_at IS NULL")` 어노테이션을 달아, 이후의 모든 쿼리에서 삭제된 데이터가 자동으로 필터링되게끔 강제합니다.

### 3. Role & Permission (역할 통제)
- 시스템에 접근하는 모든 사용자는 다음 3가지 역할(Role) 중 하나를 갖습니다.
  - `ROLE_USER`: 게스트 및 입주 신청자 (열람만 가능)
  - `ROLE_RESIDENT`: 입주가 확정된 실계약자 (기기 제어 및 커뮤니티 권한 획득)
  - `ROLE_ADMIN`: 운영 및 시스템 관리자 (모든 데이터 CRUD 허용)
- 백엔드, 프론트엔드 작업 시 현재 요청하는 역할이 무엇인지 API와 뷰에서 상시 검증(Guard) 로직을 포함시켜야 합니다.
