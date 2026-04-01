# 📜 [팀 공통] 명명 규칙 및 핵심 정책 (General Conventions & Workflow)

이 파일은 AI 에이전트와 우리 팀이 자율적으로 따를 **프로젝트 공통 코딩 스탠다드**입니다. 프롬프트 요청 없이도 이 규칙은 시스템 전체에 1순위로 강제 반영됩니다.

### 1. Naming Conventions (명명 규칙)
- **Database / SQL Schema:** 
  - 철저한 `snake_case` 사용.
  - 테이블명은 단수를 사용 (예: `users` ❌ -> `user` ⭕, `devices` ❌ -> `device` ⭕).
- **Backend (Java/Spring Boot):**
  - 변수, 메서드, 파라미터는 `camelCase` 사용.
  - 클래스, 인터페이스는 `PascalCase` 사용.
- **Frontend (TypeScript/Next.js):**
  - 일반 함수 및 변수는 `camelCase`.
  - React **컴포넌트 및 Type/Interface**는 무조건 `PascalCase` 사용.
  - 파일 및 폴더 이름(URL 경로 포함)은 무조건 `kebab-case` 사용 (예: `/my-devices`, `contract-apply`).
- **REST API 엔드포인트 URL:** 
  - 소문자 `kebab-case` 및 복수형(Plural) 명사 사용 원칙 (예: `/api/v1/devices`, `/api/v1/contracts`).

### 2. Core Policies (핵심 데이터 규칙)
- **Soft Delete (물리 삭제 절대 불가):**
  - 데이터베이스의 어떤 테이블에서도 `DELETE` 쿼리 사용을 금지합니다.
  - 대신 각 테이블 생성 시 `deleted_at (TIMESTAMP)` 컬럼을 활용하여 논리적으로만 삭제 처리합니다.
  - Spring Boot JPA에서는 `@SQLRestriction("deleted_at IS NULL")` 등의 어노테이션으로 응용 단위에서 물리 삭제된 것처럼 보장합니다.

### 3. Role & Permission (역할 통제)
- 시스템에 접근하는 모든 사용자는 다음 3가지 역할(Role) 중 하나를 갖습니다.
  - `ROLE_USER`: 게스트 및 입주 신청자 (열람만 가능)
  - `ROLE_RESIDENT`: 입주가 확정된 실계약자 (기기 제어 및 커뮤니티 권한 획득)
  - `ROLE_ADMIN`: 운영 및 시스템 관리자 (모든 데이터 CRUD 허용)
- 백엔드, 프론트엔드 작업 시 현재 요청하는 역할이 무엇인지 API와 뷰에서 상시 검증(Guard) 로직을 포함시켜야 합니다.
