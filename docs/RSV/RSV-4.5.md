# [RSV-4.5] 내 예약 조회 및 취소 롤백 로직

> **담당**: 이영준
> **기간**: 2026-04-03
> **상태**: ✅ 완료
> **브랜치**: `feat/77` (공통 Epic 브랜치)

---

## 요약

이슈 #81: 내 예약 조회 및 취소 롤백.
입주자가 자신이 등록한 예약 리스트를 최신순으로 조회할 수 있는 기능 및 등록된 예약을 취소(상태를 CANCELLED로 변경)할 수 있는 API를 구현하였다.

---

## 생성/수정 경로

| 파일 | 역할 |
|---|---|
| `UserReservationResponse.java` | 사용자의 개인 예약 리스트 응답 DTO |
| `ReservationQueryUseCase.java` | 내 예약 조회 Inbound Port |
| `ReservationQueryService.java` | 예약 조회 서비스 구현 (최신 예약일/시간 역순) |
| `ReservationCommandUseCase.java` | 취소(`cancelReservation`) 인터페이스 추가 |
| `ReservationCommandService.java` | 소유권 검증 후 Entity 빌트인 `.cancel()` 호출 및 Transaction 처리 |
| `ReservationController.java` | `GET /api/reservations`, `PATCH /api/reservations/{id}/cancel` 엔드포인트 연동 |
| `ReservationQueryServiceTest.java` | 조회 서비스 단위 테스트 추가 |
| `ReservationControllerTest.java` | 내역 조회 및 상태 변경 API 테스트 |

---

## API 명세

### 1. `GET /api/reservations` - 내 예약 목록 조회

**응답 (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "spaceId": 10,
      "status": "APPROVED",
      "reservationDate": "2026-05-01",
      "startTime": "14:00:00",
      "endTime": "16:00:00"
    }
  ]
}
```

### 2. `PATCH /api/reservations/{id}/cancel` - 공용시설 예약 취소

| 예외 (Conflict/Forbidden) | 조건 |
|---|---|
| 404 NOT FOUND | 해당 예약번호가 존재하지 않음 |
| 403 FORBIDDEN | 본인의 예약이 아님 |
| 409 CONFLICT | 이미 취소/완료된 상태로 취소할 수 없음 |

---

## 테스트 및 빌드 상태

- `ReservationQueryServiceTest` 및 `ReservationControllerTest` 추가 통과.
- `ReservationEntity` 자체 `status` 롤백 로직도 전체 테스트 검증 완료.
- 글로벌 예외 처리와 결합하여 예상치 못한 에러를 모두 반환하는지 체크 완료.
