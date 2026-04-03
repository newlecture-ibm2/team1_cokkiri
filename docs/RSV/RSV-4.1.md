# [RSV-4.1] 예약/시설(Reservation) DB 및 엔티티 구현

> **담당**: 이영준
> **기간**: 2026-04-01 ~ 2026-04-03  
> **상태**: ✅ 완료

---

## 생성 파일 목록

| # | 파일 | 경로 | 역할 |
|---|---|---|---|
| 1 | `ReservationStatus.java` | `global/entity/` | 예약 상태 Enum |
| 2 | `Reservation.java` | `infra/persistence/entity/` | 예약 JPA 엔티티 |
| 3 | `ReservationRepository.java` | `infra/persistence/repository/` | Spring Data JPA Repository |
| 4 | `ReservationTest.java` | `test/.../entity/` | 엔티티 단위 테스트 |
| 5 | `ReservationRepositoryTest.java` | `test/.../repository/` | Repository 통합 테스트 |
| 6 | `TestJpaConfig.java` | `test/.../repository/` | 테스트용 JPA Auditing 설정 |
| 7 | `application.yml` | `test/resources/` | H2 인메모리 DB 테스트 설정 |

---

## 설계 결정 사항

### 1. FK 매핑 방식: `Long` 타입 사용

User/Space 엔티티가 아직 구현되지 않았으므로, `@ManyToOne` 대신 `@Column`으로 Long 타입 FK를 선언했습니다.

```java
// ── 현재 (Long FK) ──
@Column(name = "user_id", nullable = false)
private Long userId;

// ── 추후 변경 (User 엔티티 완성 후) ──
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```

### 2. Soft Delete 지원

`BaseEntity` 상속 + `@SQLRestriction("deleted_at IS NULL")` 적용으로 논리 삭제를 자동 필터링합니다.

### 3. 상태 전환 비즈니스 메서드

엔티티 내부에 상태 전환 로직을 캡슐화하여, 잘못된 상태 전환을 방지합니다.

| 메서드 | 허용 상태 | 결과 상태 |
|---|---|---|
| `approve(adminId)` | PENDING → | APPROVED |
| `cancel()` | PENDING / APPROVED → | CANCELLED |
| `complete()` | APPROVED → | COMPLETED |

---

## Repository 주요 쿼리

| 메서드 | 용도 | 관련 규칙 |
|---|---|---|
| `existsOverlappingReservation()` | 동일 시설/날짜의 시간대 중복 예약 방지 | ERD 비즈니스 규칙 #10 |
| `hasActiveReservation()` | 공용 기기 제어 권한 확인 (현재 시각 기준) | ERD 비즈니스 규칙 #9 |
| `findBySpaceIdAndDateRange()` | 주단위 타임테이블 조회 | RSV-4.3 UI 연동용 |
| `findByUserIdAndStatusIn()` | 사용자별 예약 목록 필터 조회 | RSV-4.2 예약 시설 조회 |

---

## 테스트 결과

> **실행일시**: 2026-04-02  
> **결과**: ✅ **22개 전체 통과 (failures: 0, errors: 0)**

### 테스트 실행 방법

```bash
# Reservation 관련 테스트만 실행
./gradlew test --tests "com.coliving.infra.persistence.*"

# 전체 테스트 실행
./gradlew test

# HTML 리포트 확인
open build/reports/tests/test/index.html
```

### 테스트 인프라

| 항목 | 설정 |
|---|---|
| DB | H2 인메모리 (PostgreSQL 호환 모드) |
| DDL | `create-drop` (테스트 시 자동 생성/삭제) |
| Auditing | `TestJpaConfig` - `OffsetDateTime`용 `DateTimeProvider` 등록 |
| 의존성 추가 | `testRuntimeOnly 'com.h2database:h2'` (`build.gradle`) |

### 1. 엔티티 단위 테스트 (`ReservationTest`) — 12건

DB 없이 순수 Java 로직만 검증합니다.

| 테스트 그룹 | 건수 | 검증 항목 |
|---|---|---|
| Builder 생성 | 1 | 생성 시 PENDING 상태, userId/spaceId 매핑, approvedBy null |
| `approve()` 성공 | 1 | PENDING → APPROVED, approvedBy 설정 |
| `approve()` 예외 | 3 | APPROVED/CANCELLED/COMPLETED 에서 승인 시 `IllegalStateException` |
| `cancel()` 성공 | 2 | PENDING → CANCELLED, APPROVED → CANCELLED |
| `cancel()` 예외 | 2 | COMPLETED/CANCELLED 에서 취소 시 `IllegalStateException` |
| `complete()` 성공 | 1 | APPROVED → COMPLETED |
| `complete()` 예외 | 2 | PENDING/CANCELLED 에서 완료 시 `IllegalStateException` |

### 2. Repository 통합 테스트 (`ReservationRepositoryTest`) — 10건

H2 인메모리 DB + `@DataJpaTest`로 JPA 쿼리를 검증합니다.

| 테스트 그룹 | 건수 | 검증 항목 |
|---|---|---|
| 기본 CRUD | 1 | `save()` 시 ID 자동 생성, 초기 상태 PENDING |
| 사용자별 조회 | 2 | `findByUserIdAndStatusIn()` 상태 필터, `findByUserId...Desc()` 정렬 |
| 시설별 조회 | 1 | `findBySpaceIdAndReservationDateAndStatus()` APPROVED 필터 |
| 중복 예약 체크 | 3 | 시간 겹침 → `true`, 경계값 → `false`, PENDING 무시 → `false` |
| 활성 예약 확인 | 2 | 시간 범위 내 → `true`, 범위 외 → `false` |
| 기간별 조회 | 1 | `findBySpaceIdAndDateRange()` 날짜 범위 필터 + 정렬 |

---

## ⚠️ 머지 시 수정 필요 항목

User(팀원1) / Space(팀원2) 엔티티가 완성되면 아래 3개 필드를 `@ManyToOne`으로 변경해야 합니다.

| 파일 | 현재 필드 | 변경 후 |
|---|---|---|
| `Reservation.java` | `Long userId` | `@ManyToOne User user` |
| `Reservation.java` | `Long spaceId` | `@ManyToOne Space space` |
| `Reservation.java` | `Long approvedBy` | `@ManyToOne User approvedByUser` |
| `ReservationRepository.java` | 쿼리 메서드 파라미터 | 엔티티 참조 방식으로 검토 |

> 각 필드에 `// TODO` 주석이 달려 있으니 검색하면 바로 찾을 수 있습니다.
