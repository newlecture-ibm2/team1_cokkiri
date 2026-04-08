---
trigger: always_on
---

## 2. Global Response Standard (전역 응답 규격 정규화)

- **API 응답 통합:** 모든 JSON 응답은 `ApiResponse<T>` 객체로 통일합니다.
  - `success`: boolean (`true`/`false`)
  - `data`: 실제 데이터(T) 페이로드 또는 null
  - `message`: 클라이언트 지향적인 문자열 정보 또는 null
  - `errorCode`: 에러 코드 문자열 (실패 시에만 포함)
- **Global Error Handling:** Service에서 `try-catch`로 HTTP 응답을 뱉지 않습니다. 도메인 예외를 던지면(`BusinessException`) `GlobalExceptionHandler`가 일관된 `ApiResponse`와 올바른 HTTP Status 코드로 자동 포장합니다.

---

## 3. Mock IoT Server 연동 (매우 중요)

- 기기 제어 요청은 `http://mock-iot:8000` (도커 컨테이너)으로 `RestTemplate` 또는 `WebClient` HTTP 통신. 백엔드 자체 메모리에 가짜 데이터/제어 상태 저장 금지.
- **확장성:** `IotAdapter` 추상 인터페이스 → `MockIotAdapter` 구현체에서만 HTTP 통신. 추후 SmartThings 교체 시 구현체만 교체 (OCP).
- **내결함성:** Timeout 5초. Mock 서버 지연 시 백엔드 미영향.

---

## 4. JSON 직렬화 전략 (camelCase 통일)

- **프론트-백엔드 camelCase 일치:** `userId`, `createdAt` 등 REST API JSON에도 100% camelCase 적용.
- `application.yml`에서 `spring.jackson.property-naming-strategy` snake_case 설정 제거 → 기본값(`LOWER_CAMEL_CASE`) 사용.
- DTO에 `@JsonProperty`로 snake_case 강제 변환 **엄격 금지**.

---

## 5. 트랜잭션 및 JPA 영속화 룰 (마스터) — C-2

이 절은 **`jpaRepository.save(entity)` 명시 호출**의 **단일 기준**이다. `01-general-convention.md` §2는 **소프트 삭제** 맥락에서의 `save()`를 강조하며, **생성·수정·소프트 삭제 전 구간**의 공통 원칙은 **본 §5**에 따른다.

- **Service 계층:** 생성/변경/Soft Delete Service 메서드에 반드시 **`@Transactional`** 명시. (영속성 컨텍스트 보장)
- **Persistence Adapter:** 더티 체킹에만 의존 금지. **신규 INSERT·필드 변경 UPDATE·`softDelete()` 후** 모두 **`jpaRepository.save(entity)`를 명시적으로 호출**한다. 어댑터가 포트 요청을 DB에 반영했음을 코드로 명확히 한다.
- **팀 DTO 표준:** Web 계층 요청/응답은 **`XxxRequestDto` / `XxxResponseDto`** 접미사를 기본으로 한다(§1-7 표와 함께 적용).

### 5.1 탈퇴 유저(Soft Delete) 조회 지침
- `@SQLRestriction("deleted_at IS NULL")`에 의해 JPA 자동 조인 시 탈퇴 유저는 필터링됩니다.
- 관리자의 **통계나 감사 이력 조회** 등 탈퇴 유저 정보가 반드시 필요한 쿼리에서는, **`LEFT JOIN` + Native Query (`nativeQuery = true`)** 를 사용하여 `@SQLRestriction`을 우회하여 조회합니다.
- 조회를 뚫고 나온 탈퇴 유저 정보는 프론트엔드에서 "탈퇴한 사용자" 등으로 안전하게 마스킹 처리합니다.

### 5.2 내 활동 이력 API
- `user/history/` 등 **GET `/api/users/me/history`** 구현 시, 타 도메인은 **식별자·조회 전용 포트**로만 연동하고, 타 도메인 **Service를 직접 호출해 쓰기**하지 않는다(도메인 협업 룰과 일치).