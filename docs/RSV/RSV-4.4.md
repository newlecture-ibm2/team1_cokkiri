# [RSV-4.4] 예약 동시성 차단 신청 로직

> **담당**: 이영준
> **기간**: 2026-04-03
> **상태**: ✅ 완료
> **브랜치**: `feat/77` (공통 Epic 브랜치)

---

## 요약

이슈 #80: 예약 동시성 차단 신청 로직
입주자가 예약 가능한 공용시설에 예약을 신청할 때, 이미 확정된 다른 예약과 겹치는지 확인하여 동시성 충돌을 방지하는 로직을 구현하였다.

---

## 생성 파일 목록

| # | 파일 | 경로 | 역할 |
|---|---|---|---|
| 1 | `ReservationCreateRequest.java` | `adapter/in/web/dto/` | 예약 생성 요청 DTO (Valid 체킹) |
| 2 | `ReservationCommandUseCase.java` | `application/port/in/` | 예약 생성 Inbound Port |
| 3 | `ReservationCommandService.java` | `application/service/` | 동시성 체크 및 예약 생성 로직 |
| 4 | `ReservationController.java` | `adapter/in/web/` | `POST /api/reservations` REST API |
| 5 | `ReservationOverlapException.java` | `exception/` | 중복 예약 발생 시 `BusinessException` 처리 |
| 6 | `ReservationCommandServiceTest.java` | `test/.../service/` | 예약 서비스 단위 테스트 |
| 7 | `ReservationControllerTest.java` | `test/.../web/` | 예약 컨트롤러 409 Conflict 테스트 |

---

## API 명세

### `POST /api/reservations` - 시설 예약 신청

| 항목 | 설명 |
|---|---|
| 접근 권한 | `RESIDENT` |
| 헤더 | `X-User-Id` (인증 연동 전 임시) |

**요청 (Request Body):**
```json
{
  "spaceId": 1,
  "reservationDate": "2026-05-01",
  "startTime": "14:00:00",
  "endTime": "16:00:00"
}
```

**정상 응답 (200 OK):**
```json
{
  "success": true,
  "data": {
    "reservationId": 999
  }
}
```

**충돌 실패 리턴 (409 Conflict):**
```json
{
  "success": false,
  "message": "해당 시간대는 이미 예약되었습니다",
  "errorCode": "TIME_SLOT_CONFLICT"
}
```

---

## 설계 및 동시성 제어 방식

### 동시성 필터링 1단계 (DB Row 검사)
- `ReservationJpaRepository.existsOverlappingReservation()` 사용
- `reservationDate`, `spaceId`가 동일하고 상태가 `APPROVED` 인 예약 중 시간이 겹치는지 카운트.

### 동시성 2단계 제어 (추후 도입 요망)
- 현재는 DB `SELECT COUNT > 0` 후 `INSERT` 하는 구조.
- 한순간에 동시에 두 트랜잭션이 요청을 보내면 레이스 컨디션(Race Condition)이 발생할 수 있음 (Phantom Read).
- **해결 방안 제언:** 향후 데이터베이스 락(Pessimistic Write) 적용이나 Redisson 기반 분산 락, 혹은 복합 유니크 제약 스키마 적용을 권장. 
  - (현재는 기본 `@Transactional` 내에서 유효성 체크를 수행하도록 1차 보안 구현)

---

## 테스트
✅ `ReservationCommandServiceTest` (성공, Range 오류, 충돌 예외 확인 완료)
✅ `ReservationControllerTest` (200 OK, 409 Conflict MVC 응답 검증 완료)
전역 `BUILD SUCCESSFUL` 확인 완료.
