# [RSV-4.6] 관리자 모든 예약 조회 및 승인/반려 제어 로직

> **담당**: 이영준
> **기간**: 2026-04-03
> **상태**: ✅ 완료
> **브랜치**: `feat/77` (공통 Epic 브랜치)

---

## 요약

이슈 #82: 관리자 모든 예약 조회
이슈 #83: 관리자 수동 승인/반려 (처리 제어 도구)

관리자가 모든 입주자의 예약 현황(대기/승인/취소 등)을 조회하고 관리할 수 있도록 DTO와 관리자 전용 인터페이스 Controller를 추가하였다. `ReservationEntity`에 기 구현되었던 `approve()` 및 `cancel()` 메서드를 적극 활용해 비즈니스 로직을 연결하였다.

---

## 생성/수정 경로

| 파일 | 역할 |
|---|---|
| `AdminReservationResponse.java` | 관리자용 예약 목록 응답 DTO(예약자의 `userId`와 승인자 정보 포함) |
| `ReservationJpaRepository.java` | 최신순으로 모든 예약을 조회하는 `findAllByOrderByReservationDateDescStartTimeDesc` 쿼리 메서드 추가 |
| `ReservationQueryUseCase.java` | `getAllReservations` (전체 조회) Port 추가 |
| `ReservationQueryService.java` | 관리자용 예약 전체조회 구현 |
| `ReservationCommandUseCase.java` | `approveReservation`, `rejectReservation` Port 추가 (관리자용 명령) |
| `ReservationCommandService.java` | `approve`, `reject` 명령시 예약상태를 업데이트하고 로깅 처리 구현 |
| `AdminReservationController.java` | `GET /api/admin/reservations`, `PATCH /api/admin/reservations/{id}/approve`, `PATCH /api/admin/reservations/{id}/reject` 엔드포인트 구현 |
| `AdminReservationControllerTest.java` | 관리자용 API 컨트롤러 슬라이스 테스트 구현 |

---

## API 명세

### 1. `GET /api/admin/reservations` - (관리자) 예약 목록 조회

**응답 (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "userId": 1,
      "spaceId": 10,
      "status": "PENDING",
      "reservationDate": "2026-05-01",
      "startTime": "14:00:00",
      "endTime": "16:00:00",
      "approvedBy": null
    }
  ]
}
```

### 2. `PATCH /api/admin/reservations/{id}/approve` - (관리자) 예약 승인

| 파라미터 | 유형 | 설명 |
|---|---|---|
| `X-Admin-Id` | Header | 현재 작업중인 관리자 ID |
| `id` | PathVariable | 대상 예약 ID |

해당 예약의 상태가 `PENDING`이면 `APPROVED`로 변경된다.

### 3. `PATCH /api/admin/reservations/{id}/reject` - (관리자) 예약 반려

| 파라미터 | 유형 | 설명 |
|---|---|---|
| `X-Admin-Id` | Header | 현재 작업중인 관리자 ID |
| `id` | PathVariable | 대상 예약 ID |

해당 예약의 상태가 `PENDING` 또는 `APPROVED`이면 `CANCELLED`로 변경된다.

---

## 특이사항 (Next Steps 제안)
- 현재 `X-Admin-Id` 헤더를 통해 관리자를 식별하지만, 향후 Global / Security 모듈 연동 시 인증 기반 권한 확인 로직 (`@PreAuthorize("hasRole('ADMIN')")` 등) 반영이 필요함.
- 페이징(Paging) 및 필터링 기능이 필요할 경우 Controller/Repository 단에 QueryDSL 추가 도입 고려.
