# [RSV-4.2] 예약/시설(Reservation) 예약 시설 조회 제공

> **담당**: 이영준
> **기간**: 2026-04-04 ~ 2026-04-06  
> **상태**: ✅ 완료
> **브랜치**: `feat/77` (GitHub Issue [#77](https://github.com/newlecture-ibm2/team1_cokkiri/issues/77), base: `feat/57`)

---

## 요약

RES-RSV-01: 예약 가능한 공용시설 목록 로드 로직 구현

입주자(RESIDENT) 및 관리자(ADMIN)가 예약 가능한 공용시설을 조회할 수 있는 API를 제공한다.
헥사고날 아키텍처에 따라 Controller → Service → Port → Adapter 계층으로 구성하였다.

---

## 생성 파일 목록

### 메인 코드

| # | 파일 | 경로 | 역할 |
|---|---|---|---|
| 1 | `ReservationStatus.java` | `reservation/model/` | 예약 상태 Enum |
| 2 | `ReservationEntity.java` | `reservation/adapter/out/jpa/` | 예약 JPA 엔티티 |
| 3 | `ReservationJpaRepository.java` | `reservation/adapter/out/jpa/` | 예약 JPA Repository |
| 4 | `ReservableFacilityResponse.java` | `reservation/adapter/out/dto/` | 시설 목록 응답 DTO |
| 5 | `FacilityDetailResponse.java` | `reservation/adapter/out/dto/` | 시설 상세 응답 DTO |
| 6 | `FacilityQueryPort.java` | `reservation/application/port/out/` | 시설 조회 Port (인터페이스) |
| 7 | `FacilityQueryAdapter.java` | `reservation/adapter/out/persistence/` | 시설 조회 Adapter (Native Query) |
| 8 | `FacilityQueryService.java` | `reservation/application/service/` | 시설 조회 Service |
| 9 | `FacilityController.java` | `reservation/adapter/in/web/` | REST Controller |

### 테스트 코드

| # | 파일 | 경로 | 역할 |
|---|---|---|---|
| 10 | `ReservationEntityTest.java` | `test/.../adapter/out/jpa/` | 엔티티 단위 테스트 (12건) |
| 11 | `ReservationJpaRepositoryTest.java` | `test/.../adapter/out/jpa/` | Repository 통합 테스트 (10건) |
| 12 | `FacilityQueryServiceTest.java` | `test/.../application/service/` | Service 단위 테스트 (4건) |
| 13 | `FacilityControllerTest.java` | `test/.../adapter/in/web/` | Controller 슬라이스 테스트 (4건) |
| 14 | `TestJpaConfig.java` | `test/.../config/` | 테스트용 JPA Auditing 설정 |
| 15 | `application.yml` | `test/resources/` | H2 인메모리 DB 테스트 설정 |

### 수정 파일

| # | 파일 | 변경 내용 |
|---|---|---|
| 16 | `build.gradle` | H2, 테스트 Lombok 의존성 추가 |

---

## API 명세

### GET /api/facilities — 예약 가능 공용시설 목록 조회

| 항목 | 값 |
|---|---|
| 접근 권한 | `RESIDENT`, `ADMIN` |
| 응답 형식 | `ApiResponse<List<ReservableFacilityResponse>>` |
| 정렬 | 시설 이름순 |

**필터 조건:**
- `space.type = 'COMMON'`
- `common_space_detail.is_reservable = true`
- `space.status != 'MAINTENANCE'`
- `space.deleted_at IS NULL`

**응답 필드:**
| 필드 | 테이블 | 설명 |
|---|---|---|
| `spaceId` | space | 시설 ID |
| `name` | space | 시설명 |
| `status` | space | 시설 상태 |
| `floor` | space | 층 |
| `area` | space | 면적 |
| `amenities` | space | 부대시설 (JSON) |
| `description` | space | 설명 |
| `maxCapacity` | common_space_detail | 최대 수용인원 |
| `operatingHours` | common_space_detail | 운영시간 |
| `usageFee` | common_space_detail | 이용료 |
| `thumbnailUrl` | space_image | 대표 이미지 URL |
| `images[]` | space_image | 전체 이미지 목록 |

### GET /api/facilities/{spaceId} — 공용시설 상세 조회

| 항목 | 값 |
|---|---|
| 접근 권한 | `RESIDENT`, `ADMIN` |
| 응답 형식 | `ApiResponse<FacilityDetailResponse>` |
| 에러 | 404 NOT_FOUND (시설 미존재) |

**추가 응답 필드:**
| 필드 | 설명 |
|---|---|
| `positionX`, `positionY` | 평면도 좌표 |
| `isReservable` | 예약 가능 여부 |
| `todayReservationCount` | 오늘 예약 건수 |

---

## 설계 결정 사항

### 1. 모듈 간 결합도 최소화 (A방식)

Space 모듈(`com.coliving.user.room`)의 엔티티에 직접 의존하지 않고,
**Native Query**로 space 테이블을 직접 조회한다.

```
Reservation 모듈                Space 모듈
┌─────────────────┐            ┌─────────────────┐
│ FacilityQuery    │            │ SpaceEntity     │
│ Port (interface) │            │ CommonSpace...  │
│        ↓         │     ✗     │                 │
│ FacilityQuery    │←─────────→│                 │
│ Adapter          │            │                 │
│ (Native Query)   │            │                 │
└─────────────────┘            └─────────────────┘
```

### 2. N+1 문제 방지

LEFT JOIN으로 space + common_space_detail + space_image를 한 번에 조회한 뒤,
Java에서 space_id 기준으로 그룹핑하여 이미지를 매핑한다.

### 3. 읽기 전용 트랜잭션

`@Transactional(readOnly = true)`를 적용하여 Hibernate의 dirty checking을 생략,
조회 성능을 최적화한다.

---

## 테스트 결과

> **실행일시**: 2026-04-03  
> **결과**: ✅ **30개 전체 통과 (failures: 0, errors: 0)**

### 테스트 실행 방법

```bash
# Reservation 모듈 테스트 전체 실행
./gradlew test --tests "com.coliving.reservation.*"

# 전체 테스트 실행
./gradlew test

# HTML 리포트 확인
open build/reports/tests/test/index.html
```

### 테스트 인프라

| 항목 | 설정 |
|---|---|
| DB | H2 인메모리 (Embedded) |
| DDL | `create-drop` (테스트 시 자동 생성/삭제) |
| Auditing | `TestJpaConfig` - OffsetDateTime용 DateTimeProvider |
| 의존성 추가 | `testRuntimeOnly 'com.h2database:h2'` |

### 1. 엔티티 단위 테스트 — 12건

| 테스트 그룹 | 건수 | 검증 항목 |
|---|---|---|
| Builder 생성 | 1 | PENDING 상태, userId/spaceId 매핑 |
| approve() 성공/예외 | 4 | PENDING→APPROVED, APPROVED/CANCELLED/COMPLETED에서 예외 |
| cancel() 성공/예외 | 4 | PENDING/APPROVED→CANCELLED, COMPLETED/CANCELLED에서 예외 |
| complete() 성공/예외 | 3 | APPROVED→COMPLETED, PENDING/CANCELLED에서 예외 |

### 2. Repository 통합 테스트 — 10건

| 테스트 그룹 | 건수 | 검증 항목 |
|---|---|---|
| 기본 CRUD | 1 | save() ID 자동 생성, PENDING 초기 상태 |
| 사용자별 조회 | 2 | 상태 필터, 최신순 정렬 |
| 시설별 조회 | 1 | APPROVED 필터 |
| 중복 예약 체크 | 3 | 시간 겹침, 경계값, PENDING 제외 |
| 활성 예약 확인 | 2 | 시간 범위 내/외 |
| 기간별 조회 | 1 | 날짜 범위 + 정렬 |

### 3. Service 단위 테스트 — 4건

| 테스트 그룹 | 건수 | 검증 항목 |
|---|---|---|
| 목록 조회 | 2 | 정상 반환, 빈 목록 |
| 상세 조회 | 2 | 정상 반환, NOT_FOUND 예외 |

### 4. Controller 슬라이스 테스트 — 4건

| 테스트 그룹 | 건수 | 검증 항목 |
|---|---|---|
| GET /api/facilities | 2 | 200 OK 목록, 200 OK 빈 배열 |
| GET /api/facilities/{id} | 2 | 200 OK 상세, 404 NOT_FOUND |

---

## ⚠️ 머지 시 수정 필요 항목

### RSV-4.1 코드 통합

RSV-4.1 브랜치의 Reservation 코드가 `infra/persistence/` 패키지에 있었으나,
이번 RSV-4.2에서 현재 프로젝트 아키텍처(헥사고날)에 맞게 `reservation/` 패키지로 재구성했습니다.
**RSV-4.1 브랜치의 코드는 이 브랜치에 포함되어 있으므로 별도 머지 불필요합니다.**

### User/Space 엔티티 연동

| 파일 | 현재 필드 | 변경 후 |
|---|---|---|
| `ReservationEntity.java` | `Long userId` | `@ManyToOne User user` |
| `ReservationEntity.java` | `Long spaceId` | `@ManyToOne SpaceEntity space` |
| `ReservationEntity.java` | `Long approvedBy` | `@ManyToOne User approvedByUser` |
| `FacilityQueryAdapter.java` | Native Query | SpaceEntity JPQL 또는 Port 호출 |

> 각 필드에 `// TODO` 주석이 달려 있으니 검색하면 바로 찾을 수 있습니다.
