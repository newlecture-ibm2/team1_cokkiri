# CoLiving IoT 플랫폼 — API 명세서

> [!NOTE]
> 기획안, 기능 명세서(functional_specification.md), ERD(v2.0), 프로젝트 초기 세팅 기반으로 작성된 REST API 명세서입니다.
> Base URL: `/api` | 인증: JWT Bearer Token | 응답: `ApiResponse<T>` 통일 포맷

---

## 공통 사항

### 응답 포맷

**성공:**
```json
{ "success": true, "data": { ... }, "message": null }
```

**실패:**
```json
{ "success": false, "data": null, "message": "에러 메시지", "error_code": "ERROR_CODE" }
```

### 페이지네이션 (목록 API 공통)

```json
{
  "content": [ ... ],
  "page": 0,
  "size": 20,
  "total_elements": 150,
  "total_pages": 8
}
```

Query: `?page=0&size=20&sort=created_at,desc`

### 인증 레벨

| 표기 | 설명 |
|---|---|
| 🔓 Public | 인증 불필요 |
| 🔑 Auth | 로그인 필수 (전 역할) |
| 👤 USER+ | USER, RESIDENT, ADMIN |
| 🏠 RESIDENT+ | RESIDENT, ADMIN |
| 🔒 ADMIN | ADMIN만 |

### 공통 에러 코드

| HTTP | 코드 | 설명 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 유효성 검증 실패 |
| 401 | `UNAUTHORIZED` | 인증 실패 / 토큰 만료 |
| 403 | `FORBIDDEN` | 권한 부족 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 비즈니스 규칙 충돌 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

---

## 1. 인증 (Auth) — CMN-AUTH

### 1.1 회원가입

| 항목 | 내용 |
|---|---|
| **ID** | CMN-AUTH-00 |
| **우선순위** | Must |
| **Endpoint** | `POST /api/auth/register` |
| **인증** | 🔓 Public |

**Request Body:**
```json
{
  "login_id": "user01",
  "password": "Password1!",
  "password_confirm": "Password1!",
  "name": "홍길동",
  "birth_date": "990115",
  "gender": "MALE",
  "nationality": "대한민국",
  "phone": "010-1234-5678",
  "email": "hong@example.com"
}
```

| 필드 | 필수 | 규칙 |
|---|---|---|
| login_id | ✅ | 4~50자, 영문+숫자, 중복 불가 |
| password | ✅ | 8자 이상, 영문+숫자+특수문자 |
| password_confirm | ✅ | password와 일치 |
| name | ✅ | 2~50자 |
| birth_date | ✅ | 6자리 숫자 (YYMMDD) |
| gender | ✅ | MALE / FEMALE |
| phone | ✅ | 000-0000-0000 또는 11자리 |
| email | ✅ | 이메일 형식 |

**Response (201):**
```json
{
  "success": true,
  "data": { "user_id": 1, "login_id": "user01", "role": "USER" },
  "message": "회원가입이 완료되었습니다."
}
```

| 에러 HTTP | 코드 | 상황 |
|---|---|---|
| 409 | DUPLICATE_LOGIN_ID | 이미 사용 중인 ID |
| 400 | VALIDATION_ERROR | 필수 필드 누락/형식 불일치 |

---

### 1.2 로그인

| 항목 | 내용 |
|---|---|
| **ID** | CMN-AUTH-01 |
| **우선순위** | Must |
| **Endpoint** | `POST /api/auth/login` |
| **인증** | 🔓 Public |

**Request Body:**
```json
{ "login_id": "user01", "password": "Password1!" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "token_type": "Bearer",
    "expires_in": 1800,
    "user": {
      "user_id": 1,
      "login_id": "user01",
      "name": "홍길동",
      "role": "RESIDENT",
      "contract_id": 5,
      "space_id": 3
    }
  }
}
```

| 에러 HTTP | 코드 | 상황 |
|---|---|---|
| 401 | INVALID_CREDENTIALS | 아이디/비밀번호 불일치 |
| 401 | ACCOUNT_DEACTIVATED | 탈퇴한 계정 |

---

### 1.3 로그아웃

| 항목 | 내용 |
|---|---|
| **ID** | CMN-AUTH-02 |
| **우선순위** | Must |
| **Endpoint** | `POST /api/auth/logout` |
| **인증** | 🔑 Auth |

**Response (200):**
```json
{ "success": true, "data": null, "message": "로그아웃되었습니다." }
```

---

### 1.4 토큰 갱신

| 항목 | 내용 |
|---|---|
| **ID** | CMN-AUTH-03 |
| **우선순위** | Must |
| **Endpoint** | `POST /api/auth/refresh` |
| **인증** | 🔓 Public (Refresh Token 필요) |

**Request Body:**
```json
{ "refresh_token": "eyJhbG..." }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...(new)",
    "refresh_token": "eyJhbG...(new)",
    "token_type": "Bearer",
    "expires_in": 1800
  }
}
```

> [!NOTE]
> RESIDENT의 경우, 갱신 시 계약 상태를 재확인합니다. 만료/해지된 계약이면 role=USER로 변경된 토큰이 발급됩니다.

---

## 2. 프로필 (Profile) — CMN-PRF

### 2.1 내 정보 조회

| **ID** | CMN-PRF-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/users/me` | **인증** | 🔑 Auth |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "login_id": "user01",
    "name": "홍길동",
    "birth_date": "990115",
    "gender": "MALE",
    "nationality": "대한민국",
    "phone": "010-1234-5678",
    "email": "hong@example.com",
    "role": "RESIDENT",
    "profile_image": "/uploads/profiles/user01.jpg",
    "created_at": "2026-03-01T09:00:00+09:00",
    "contract_summary": { "space_name": "301호", "status": "ACTIVE" },
    "reservation_count": 2
  }
}
```

---

### 2.2 내 정보 수정

| **ID** | CMN-PRF-02 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `PUT /api/users/me` | **인증** | 🔑 Auth |

**Request Body:**
```json
{ "name": "홍길동", "phone": "010-9876-5432", "email": "new@example.com" }
```

---

### 2.3 비밀번호 변경

| **ID** | CMN-PRF-03 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `PUT /api/users/me/password` | **인증** | 🔑 Auth |

**Request Body:**
```json
{
  "current_password": "Password1!",
  "new_password": "NewPassword2@",
  "new_password_confirm": "NewPassword2@"
}
```

| 에러 HTTP | 코드 | 상황 |
|---|---|---|
| 401 | INVALID_PASSWORD | 현재 비밀번호 불일치 |
| 400 | SAME_PASSWORD | 현재와 동일한 비밀번호 |

---

### 2.4 회원 탈퇴

| **ID** | CMN-PRF-04 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `DELETE /api/users/me` | **인증** | 🔑 Auth |

**Request Body:**
```json
{ "password": "Password1!" }
```

| 에러 HTTP | 코드 | 상황 |
|---|---|---|
| 409 | ACTIVE_CONTRACT_EXISTS | 활성 계약 존재 |
| 409 | UNPAID_PAYMENT_EXISTS | 미납금 존재 |

---

## 3. 방 둘러보기 (Rooms) — USR-ROM

### 3.1 방 목록 조회

| **ID** | USR-ROM-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/rooms` | **인증** | 🔓 Public |

**Query Parameters:**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| room_type | String | SINGLE/DOUBLE/STUDIO/SUITE |
| min_rent | Number | 최소 월 임대료 |
| max_rent | Number | 최대 월 임대료 |
| floor | Integer | 층 |
| page, size | Integer | 페이지네이션 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "space_id": 1,
        "name": "301호",
        "floor": 3,
        "area": 25.0,
        "status": "AVAILABLE",
        "thumbnail_url": "/uploads/spaces/301_thumb.jpg",
        "room_type": "SINGLE",
        "monthly_rent": 500000,
        "deposit": 5000000,
        "direction": "남향"
      }
    ],
    "page": 0, "size": 20, "total_elements": 8, "total_pages": 1
  }
}
```

> [!NOTE]
> SPACE(부모) JOIN PRIVATE_SPACE_DETAIL(자식)로 조회합니다. type=PRIVATE, status=AVAILABLE, deleted_at IS NULL 조건.

---

### 3.2 방 상세 조회

| **ID** | USR-ROM-02 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/rooms/{spaceId}` | **인증** | 🔓 Public |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "space_id": 1,
    "name": "301호",
    "floor": 3,
    "area": 25.0,
    "status": "AVAILABLE",
    "description": "남향 원룸, 넓은 창문과 붙박이장 완비",
    "amenities": ["에어컨", "냉장고", "세탁기", "인터넷"],
    "room_type": "SINGLE",
    "room_count": 1,
    "bathroom_count": 1,
    "direction": "남향",
    "deposit": 5000000,
    "monthly_rent": 500000,
    "maintenance_fee": 50000,
    "parking_available": true,
    "images": [
      { "image_url": "/uploads/spaces/301_01.jpg", "image_type": "PHOTO", "is_thumbnail": true },
      { "image_url": "/uploads/spaces/301_floor.jpg", "image_type": "FLOOR_PLAN", "is_thumbnail": false }
    ]
  }
}
```

---

## 4. 계약 (Contract) — USR-CTR

### 4.1 계약 신청 (임시저장/제출)

| **ID** | USR-CTR-00 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/contracts` | **인증** | 👤 USER+ |

**Request Body:**
```json
{
  "space_id": 1,
  "address": "서울시 강남구 테헤란로 123",
  "bank_account": "국민은행 123-456-789012",
  "desired_start_date": "2026-05-01",
  "desired_duration_months": 6,
  "contract_language": "KO",
  "privacy_agreed": true,
  "request_note": "반려동물 가능 여부 확인 부탁드립니다.",
  "is_draft": false
}
```

| 파라미터 | 설명 |
|---|---|
| is_draft=true | 임시저장 (status=DRAFT, 유효성 검증 완화) |
| is_draft=false | 최종 제출 (status=PENDING, 모든 검증 수행) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "contract_id": 10,
    "status": "PENDING",
    "origin": "USER_INITIATED",
    "space_name": "301호",
    "created_at": "2026-03-31T12:00:00+09:00"
  },
  "message": "계약 신청이 완료되었습니다."
}
```

| 에러 HTTP | 코드 | 상황 |
|---|---|---|
| 409 | SPACE_NOT_AVAILABLE | 해당 호실 AVAILABLE 아님 |
| 409 | APPLICATION_EXISTS | 이미 진행 중인 신청 존재 |

---

### 4.2 임시저장 수정

| **ID** | USR-CTR-00 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `PUT /api/contracts/{contractId}` | **인증** | 👤 USER+ (본인) |

> DRAFT 상태의 신청만 수정 가능. Request Body는 4.1과 동일.

---

### 4.3 임시저장 → 제출

| **ID** | USR-CTR-00 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/contracts/{contractId}/submit` | **인증** | 👤 USER+ (본인) |

> DRAFT → PENDING. 모든 필수 필드 검증 수행.

---

### 4.4 내 신청 현황 조회

| **ID** | USR-CTR-00-1 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/contracts/my-applications` | **인증** | 👤 USER+ |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "contract_id": 10,
      "space_name": "301호",
      "status": "PENDING",
      "desired_start_date": "2026-05-01",
      "desired_duration_months": 6,
      "created_at": "2026-03-31T12:00:00+09:00"
    }
  ]
}
```

---

### 4.5 신청 취소

| **ID** | USR-CTR-00-1 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/contracts/{contractId}/cancel` | **인증** | 👤 USER+ (본인) |

> DRAFT 또는 PENDING 상태만 취소 가능. → status=CANCELLED

---

### 4.6 승인된 계약 조건 확인

| **ID** | USR-CTR-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/contracts/{contractId}/terms` | **인증** | 👤 USER+ (본인) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "contract_id": 10,
    "space_name": "301호",
    "floor": 3,
    "area": 25.0,
    "start_date": "2026-05-01",
    "end_date": "2026-10-31",
    "monthly_rent": 500000,
    "deposit": 5000000,
    "special_terms": "반려동물 불가",
    "status": "APPROVED"
  }
}
```

---

### 4.7 계약 체결 (동의)

| **ID** | USR-CTR-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/contracts/{contractId}/sign` | **인증** | 👤 USER+ (본인) |

**Request Body:**
```json
{ "terms_agreed": true, "policy_agreed": true }
```

**처리 로직:**
1. APPROVED 상태 확인
2. Space.status → OCCUPIED
3. Contract.status → ACTIVE, contracted_at 기록
4. User.role → RESIDENT
5. ROLE_CHANGE_LOG 기록
6. NOTIFICATION 생성

**Response (200):**
```json
{
  "success": true,
  "data": {
    "contract_id": 10,
    "status": "ACTIVE",
    "new_role": "RESIDENT",
    "contracted_at": "2026-03-31T14:00:00+09:00"
  },
  "message": "계약이 체결되었습니다."
}
```

---

### 4.8 내 계약 조회

| **ID** | USR-CTR-02, RES-CTR-01~02 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `GET /api/contracts/my` | **인증** | 👤 USER+ |

**Query:** `status` (ACTIVE / EXPIRED / TERMINATED / ALL)

---

## 5. 기기 제어 (Device) — RES-DEV

### 5.1 내 기기 목록 조회

| **ID** | RES-DEV-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/devices/my` | **인증** | 🏠 RESIDENT+ |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "private_devices": [
      {
        "device_id": 1,
        "name": "거실 조명",
        "device_type": {
          "code": "LIGHT",
          "name": "스마트조명",
          "commands": ["TURN_ON", "TURN_OFF", "SET_BRIGHTNESS"],
          "ui_type": "slider"
        },
        "space_name": "301호",
        "space_type": "PRIVATE",
        "status": "ONLINE",
        "is_active": true
      }
    ],
    "common_devices": [
      {
        "device_id": 10,
        "name": "세탁기 #1",
        "device_type": {
          "code": "WASHER",
          "name": "스마트세탁기",
          "commands": ["START", "STOP"],
          "ui_type": "button"
        },
        "space_name": "공용 세탁실",
        "space_type": "COMMON",
        "status": "ONLINE",
        "is_active": true,
        "has_active_reservation": true
      }
    ]
  }
}
```

> [!NOTE]
> CCTV 타입 기기는 입주자 목록에서 제외됩니다.
> 공용 기기의 `has_active_reservation`은 현재 시각 기준 APPROVED 예약 여부입니다.

---

### 5.2 기기 제어

| **ID** | RES-DEV-02 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/devices/{deviceId}/control` | **인증** | 🏠 RESIDENT+ |

**Request Body:**
```json
{
  "command": "SET_TEMP",
  "params": { "temperature": 24, "mode": "COOL" }
}
```

**권한 검증:**
1. JWT에서 role 확인 (RESIDENT / ADMIN)
2. RESIDENT — 개인 기기: JWT.space_id == device.space_id
3. RESIDENT — 공용 기기: 현재 시각에 APPROVED 예약 존재
4. ADMIN: 제한 없음

**Response (200):**
```json
{
  "success": true,
  "data": {
    "device_id": 1,
    "command": "SET_TEMP",
    "result": "SUCCESS",
    "control_log_id": 42,
    "executed_at": "2026-03-31T14:30:00+09:00"
  }
}
```

| 에러 HTTP | 코드 | 상황 |
|---|---|---|
| 403 | SPACE_MISMATCH | 본인 공간의 기기가 아님 |
| 403 | NO_ACTIVE_RESERVATION | 공용 기기, 유효한 예약 없음 |
| 403 | CCTV_ADMIN_ONLY | CCTV는 ADMIN만 제어 |
| 422 | DEVICE_OFFLINE | 기기 오프라인 |
| 422 | DEVICE_INACTIVE | 기기 비활성화 |
| 502 | IOT_COMMUNICATION_FAIL | Mock IoT 서버 통신 실패 |

---

## 6. 시설 예약 (Reservation) — RES-RSV

### 6.1 예약 가능 시설 조회

| **ID** | RES-RSV-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/facilities` | **인증** | 🏠 RESIDENT+ |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "space_id": 11,
      "name": "공용 회의실",
      "floor": 2,
      "operating_hours": "06:00-23:00",
      "max_capacity": 10,
      "usage_fee": 5000,
      "status": "AVAILABLE"
    }
  ]
}
```

> [!NOTE]
> SPACE JOIN COMMON_SPACE_DETAIL, is_reservable=true, type=COMMON, deleted_at IS NULL 조건.

---

### 6.2 타임 슬롯 조회

| **ID** | RES-RSV-02 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/facilities/{spaceId}/slots` | **인증** | 🏠 RESIDENT+ |

**Query:** `week_start` (Date, 기본: 이번 주 월요일)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "space_id": 11,
    "space_name": "공용 회의실",
    "operating_hours": "06:00-23:00",
    "slots": [
      {
        "date": "2026-04-01",
        "time_slots": [
          { "start_time": "06:00", "end_time": "07:00", "status": "AVAILABLE" },
          { "start_time": "07:00", "end_time": "08:00", "status": "RESERVED_BY_OTHERS" },
          { "start_time": "14:00", "end_time": "16:00", "status": "MY_RESERVATION", "reservation_id": 5 }
        ]
      }
    ]
  }
}
```

---

### 6.3 예약 신청

| **ID** | RES-RSV-03 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/reservations` | **인증** | 🏠 RESIDENT+ |

**Request Body:**
```json
{
  "space_id": 11,
  "reservation_date": "2026-04-01",
  "start_time": "10:00",
  "end_time": "12:00"
}
```

| 에러 HTTP | 코드 | 상황 |
|---|---|---|
| 409 | TIME_SLOT_CONFLICT | 해당 시간대 이미 예약됨 |
| 409 | NO_ACTIVE_CONTRACT | 활성 계약 없음 |

---

### 6.4 내 예약 조회

| **ID** | RES-RSV-04 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/reservations/my` | **인증** | 🏠 RESIDENT+ |

**Query:** `status` (PENDING / APPROVED / CANCELLED / COMPLETED)

---

### 6.5 예약 취소

| **ID** | RES-RSV-04 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/reservations/{reservationId}/cancel` | **인증** | 🏠 RESIDENT+ (본인) |

> PENDING 또는 APPROVED 상태만 취소 가능.

---

## 7. 입주자 이력 — RES-LOG

### 7.1 기기 사용 기록

| **ID** | RES-LOG-01 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `GET /api/control-logs/my` | **인증** | 🏠 RESIDENT+ |

**Query:** `start_date`, `end_date`, `space_type`, `device_type_code`, `result`, `page`, `size`

---

### 7.2 시설 예약 이력

| **ID** | RES-LOG-02 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `GET /api/reservations/my/history` | **인증** | 🏠 RESIDENT+ |

---

### 7.3 내 활동 이력

| **ID** | USR-HST-01 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `GET /api/users/me/history` | **인증** | 👤 USER+ |

---

## 8. 커뮤니티 (Community) — CMN-CMT

### 8.1 게시글 목록

| **ID** | CMN-CMT-01 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `GET /api/posts` | **인증** | 🔑 Auth |

**Query:** `category`, `page`, `size`, `sort`

---

### 8.2 게시글 상세

| **ID** | CMN-CMT-01 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `GET /api/posts/{postId}` | **인증** | 🔑 Auth |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "post_id": 1,
    "category": "FREE",
    "title": "이사 인사드립니다",
    "content": "안녕하세요, 301호에 입주한 홍길동입니다.",
    "attachments": [
      { "file_url": "/uploads/posts/img1.jpg", "file_name": "사진.jpg", "file_size": 102400 }
    ],
    "links": [{ "url": "https://example.com" }],
    "view_count": 42,
    "like_count": 5,
    "comment_count": 3,
    "is_liked_by_me": true,
    "author": { "user_id": 1, "name": "홍길동", "profile_image": "/uploads/profiles/user01.jpg" },
    "comments": [
      {
        "comment_id": 1,
        "content": "환영합니다!",
        "author": { "user_id": 2, "name": "김철수" },
        "created_at": "2026-03-31T15:00:00+09:00"
      }
    ],
    "created_at": "2026-03-31T12:00:00+09:00"
  }
}
```

> [!NOTE]
> POST.attachments와 POST.links는 JSONB 컬럼이므로, JOIN 없이 단일 쿼리로 조회됩니다.

---

### 8.3 게시글 작성

| **ID** | CMN-CMT-02 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `POST /api/posts` | **인증** | 🔑 Auth |

**Request:** `multipart/form-data`

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| category | String | ✅ | NOTICE/QUESTION/SUGGESTION/MEETUP/FREE (NOTICE는 ADMIN만) |
| title | String | ✅ | 최대 100자 |
| content | String | ✅ | 본문 |
| files | File[] | | 최대 5개, 10MB/개 |
| links | String[] | | URL 최대 3개 |

---

### 8.4 게시글 수정

| **Endpoint** | `PUT /api/posts/{postId}` | **인증** | 🔑 Auth (본인 또는 ADMIN) |
|---|---|---|---|

### 8.5 게시글 삭제

| **Endpoint** | `DELETE /api/posts/{postId}` | **인증** | 🔑 Auth (본인 또는 ADMIN) |
|---|---|---|---|

> soft delete (deleted_at 기록). like_count, comment_count는 파생 데이터이므로 연관 데이터 정리 불필요.

### 8.6 좋아요 토글

| **Endpoint** | `POST /api/posts/{postId}/like` | **인증** | 🔑 Auth |
|---|---|---|---|

> 좋아요가 없으면 추가(POST_LIKE 생성), 있으면 취소(soft delete). POST.like_count 동기화.

### 8.7 댓글 작성

| **Endpoint** | `POST /api/posts/{postId}/comments` | **인증** | 🔑 Auth |
|---|---|---|---|

**Request Body:**
```json
{ "content": "환영합니다!" }
```

### 8.8 댓글 삭제

| **Endpoint** | `DELETE /api/comments/{commentId}` | **인증** | 🔑 Auth (본인 또는 ADMIN) |
|---|---|---|---|

---

## 9. 민원 VoC (유저/입주자용)

### 9.1 민원 등록

| **Endpoint** | `POST /api/voc` | **인증** | 🔑 Auth |
|---|---|---|---|

**Request:** `multipart/form-data`

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| category | String | ✅ | FACILITY/NOISE/DEVICE/OTHER |
| title | String | ✅ | 제목 |
| content | String | ✅ | 문의 내용 |
| files | File[] | | 첨부파일 → VOC.attachments(JSONB)에 저장 |

### 9.2 내 민원 조회

| **Endpoint** | `GET /api/voc/my` | **인증** | 🔑 Auth |
|---|---|---|---|

### 9.3 민원 수정

| **Endpoint** | `PUT /api/voc/{vocId}` | **인증** | 🔑 Auth (본인, OPEN만) |
|---|---|---|---|

### 9.4 민원 취소

| **Endpoint** | `POST /api/voc/{vocId}/cancel` | **인증** | 🔑 Auth (본인, OPEN만) |
|---|---|---|---|

---

## 10. 알림 (Notification)

### 10.1 내 알림 목록

| **Endpoint** | `GET /api/notifications` | **인증** | 🔑 Auth |
|---|---|---|---|

**Query:** `is_read` (true/false), `page`, `size`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "notification_id": 1,
        "type": "CONTRACT_APPROVED",
        "title": "계약 신청이 승인되었습니다",
        "message": "301호 계약 신청이 승인되었습니다. 계약 조건을 확인해주세요.",
        "reference_type": "CONTRACT",
        "reference_id": 10,
        "is_read": false,
        "created_at": "2026-03-31T12:00:00+09:00"
      }
    ]
  }
}
```

### 10.2 알림 읽음 처리

| **Endpoint** | `PATCH /api/notifications/{notificationId}/read` | **인증** | 🔑 Auth (본인) |
|---|---|---|---|

---

## 11. 관리자 — 공간 관리 (ADM-SPC)

### 11.1 공간 목록 조회

| **ID** | ADM-SPC-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/admin/spaces` | **인증** | 🔒 ADMIN |

**Query:** `type`, `status`, `floor`, `page`, `size`

> [!NOTE]
> SPACE LEFT JOIN PRIVATE_SPACE_DETAIL LEFT JOIN COMMON_SPACE_DETAIL로 전체 공간 조회.

---

### 11.2 공간 등록

| **ID** | ADM-SPC-02 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/admin/spaces` | **인증** | 🔒 ADMIN |

**Request Body (PRIVATE):**
```json
{
  "name": "301호",
  "type": "PRIVATE",
  "floor": 3,
  "area": 25.0,
  "description": "남향 원룸",
  "amenities": ["에어컨", "냉장고"],
  "private_detail": {
    "room_type": "SINGLE",
    "room_count": 1,
    "bathroom_count": 1,
    "direction": "남향",
    "deposit": 5000000,
    "monthly_rent": 500000,
    "maintenance_fee": 50000,
    "parking_available": true
  }
}
```

**Request Body (COMMON):**
```json
{
  "name": "공용 회의실",
  "type": "COMMON",
  "floor": 2,
  "area": 40.0,
  "description": "화이트보드, 프로젝터 완비",
  "common_detail": {
    "max_capacity": 10,
    "operating_hours": "06:00-23:00",
    "is_reservable": true,
    "usage_fee": 5000
  }
}
```

> SPACE 부모 테이블 + 자식 테이블(PRIVATE_SPACE_DETAIL 또는 COMMON_SPACE_DETAIL)에 동시 INSERT.

---

### 11.3 공간 수정

| **ID** | ADM-SPC-03 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `PUT /api/admin/spaces/{spaceId}` | **인증** | 🔒 ADMIN |

### 11.4 공간 배치 대시보드 조회

| **ID** | ADM-SPC-00 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `GET /api/admin/spaces/layout` | **인증** | 🔒 ADMIN |

**Query:** `floor`

### 11.5 공간 배치 좌표 저장

| **ID** | ADM-SPC-00 | **우선순위** | Should |
|---|---|---|---|
| **Endpoint** | `PUT /api/admin/spaces/layout` | **인증** | 🔒 ADMIN |

**Request Body:**
```json
{
  "positions": [
    { "space_id": 1, "position_x": 100, "position_y": 200 },
    { "space_id": 2, "position_x": 300, "position_y": 200 }
  ]
}
```

---

## 12. 관리자 — 기기 관리 (ADM-DEV)

### 12.1 기기 목록 조회

| **ID** | ADM-DEV-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/admin/devices` | **인증** | 🔒 ADMIN |

**Query:** `space_id`, `device_type_id`, `status`, `is_active`, `page`, `size`

### 12.2 기기 등록

| **ID** | ADM-DEV-02 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/admin/devices` | **인증** | 🔒 ADMIN |

**Request Body:**
```json
{
  "space_id": 1,
  "device_type_id": 4,
  "name": "거실 천장 조명",
  "model_name": "LG LED 시스템 조명 55W",
  "mock_endpoint": "http://mock-iot:8081/devices/light-01"
}
```

### 12.3 기기 수정

| **ID** | ADM-DEV-05 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `PUT /api/admin/devices/{deviceId}` | **인증** | 🔒 ADMIN |

> device_type_id는 등록 후 변경 불가.

### 12.4 기기 활성화/비활성화

| **ID** | ADM-DEV-03 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `PATCH /api/admin/devices/{deviceId}/active` | **인증** | 🔒 ADMIN |

**Request Body:**
```json
{ "is_active": false }
```

### 12.5 기기 삭제

| **ID** | ADM-DEV-06 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `DELETE /api/admin/devices/{deviceId}` | **인증** | 🔒 ADMIN |

| 에러 HTTP | 코드 | 상황 |
|---|---|---|
| 409 | DEVICE_ACTIVE | 활성화 상태 (먼저 비활성화 필요) |
| 409 | CONTROL_LOG_EXISTS | 제어 이력 존재 (삭제 불가, 비활성화로 관리) |

### 12.6 기기 제어 (관리자)

| **ID** | ADM-DEV-04 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/admin/devices/{deviceId}/control` | **인증** | 🔒 ADMIN |

> 섹션 5.2와 동일 형식. actor_type=ADMIN으로 CONTROL_LOG에 기록.

---

## 13. 관리자 — 계약 관리 (ADM-CTR, ADM-BKG)

### 13.1 계약 목록 (전체)

| **ID** | ADM-CTR-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/admin/contracts` | **인증** | 🔒 ADMIN |

**Query:** `status`, `origin`, `space_name`, `user_name`, `page`, `size`

### 13.2 계약 직접 등록 (관리자 주도)

| **ID** | ADM-CTR-02 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/admin/contracts` | **인증** | 🔒 ADMIN |

**Request Body:**
```json
{
  "user_id": 2,
  "space_id": 3,
  "start_date": "2026-04-01",
  "end_date": "2027-03-31",
  "monthly_rent": 600000,
  "deposit": 6000000,
  "special_terms": "1년 계약 할인 적용"
}
```

> origin=ADMIN_INITIATED, status=ACTIVE 직접 생성. User.role→RESIDENT 자동 승격.

### 13.3 계약 수정

| **ID** | ADM-CTR-03 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `PUT /api/admin/contracts/{contractId}` | **인증** | 🔒 ADMIN |

### 13.4 계약 만료 처리

| **ID** | ADM-CTR-04 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/admin/contracts/{contractId}/expire` | **인증** | 🔒 ADMIN |

> status→EXPIRED, Space→AVAILABLE, User.role→USER (다른 ACTIVE 계약 없으면)

### 13.5 계약 해지 처리

| **ID** | ADM-CTR-04 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/admin/contracts/{contractId}/terminate` | **인증** | 🔒 ADMIN |

### 13.6 신청 목록

| **ID** | ADM-BKG-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `GET /api/admin/contracts/applications` | **인증** | 🔒 ADMIN |

**Query:** `status` (기본: PENDING)

### 13.7 신청 승인

| **ID** | ADM-BKG-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/admin/contracts/{contractId}/approve` | **인증** | 🔒 ADMIN |

**Request Body (계약 조건 확정):**
```json
{
  "start_date": "2026-05-01",
  "end_date": "2026-10-31",
  "monthly_rent": 500000,
  "deposit": 5000000,
  "special_terms": ""
}
```

> status→APPROVED, approved_by 기록, 유저에게 NOTIFICATION 발송.

### 13.8 신청 거절

| **ID** | ADM-BKG-01 | **우선순위** | Must |
|---|---|---|---|
| **Endpoint** | `POST /api/admin/contracts/{contractId}/reject` | **인증** | 🔒 ADMIN |

**Request Body:**
```json
{ "rejected_reason": "해당 호실은 현재 리모델링 예정입니다." }
```

---

## 14. 관리자 — 예약/결제/모니터링/VoC

### 14.1 예약 현황 조회

| **ID** | ADM-RSV-01 | **Endpoint** | `GET /api/admin/reservations` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

### 14.2 예약 승인

| **ID** | ADM-RSV-02 | **Endpoint** | `POST /api/admin/reservations/{reservationId}/approve` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

### 14.3 예약 취소 (관리자)

| **ID** | ADM-RSV-02 | **Endpoint** | `POST /api/admin/reservations/{reservationId}/cancel` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

### 14.4 결제 목록

| **ID** | ADM-BIL-01 | **Endpoint** | `GET /api/admin/payments` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

### 14.5 결제 승인

| **ID** | ADM-BIL-01 | **Endpoint** | `POST /api/admin/payments/{paymentId}/approve` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

### 14.6 장애 기기 모니터링

| **ID** | ADM-MON-01 | **Endpoint** | `GET /api/admin/monitoring/errors` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

### 14.7 에너지 사용량 통계

| **ID** | ADM-MON-02 | **Endpoint** | `GET /api/admin/monitoring/energy` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

**Query:** `period` (DAILY/WEEKLY/MONTHLY), `space_id`, `device_type_id`

### 14.8 대시보드 홈

| **ID** | ADM-DSH-01 | **Endpoint** | `GET /api/admin/dashboard` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

**Response (200):**
```json
{
  "success": true,
  "data": {
    "occupancy": { "total": 10, "occupied": 7, "available": 2, "maintenance": 1 },
    "devices": { "total": 20, "online": 17, "offline": 2, "error": 1 },
    "today_reservations": { "total": 5, "pending_approval": 2 },
    "recent_voc": [
      { "voc_id": 1, "title": "세탁기 고장 신고", "status": "OPEN", "created_at": "..." }
    ]
  }
}
```

### 14.9 민원 목록 (관리자)

| **ID** | ADM-VOC-01 | **Endpoint** | `GET /api/admin/voc` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

### 14.10 민원 답변

| **ID** | ADM-VOC-01 | **Endpoint** | `POST /api/admin/voc/{vocId}/reply` | **인증** | 🔒 ADMIN |
|---|---|---|---|---|---|

**Request Body:**
```json
{ "reply": "세탁기 수리 기사가 내일 오전 방문 예정입니다." }
```

> VOC.admin_reply, reply_user_id, replied_at 업데이트. status→IN_PROGRESS 또는 RESOLVED. NOTIFICATION 발송.

---

## API 요약

| 도메인 | Must | Should | 합계 |
|---|---|---|---|
| 인증 (Auth) | 4 | 0 | 4 |
| 프로필 (Profile) | 3 | 1 | 4 |
| 방 둘러보기 (Rooms) | 2 | 0 | 2 |
| 계약 (Contract) — 유저 | 7 | 1 | 8 |
| 기기 제어 (Device) | 2 | 0 | 2 |
| 시설 예약 (Reservation) | 5 | 0 | 5 |
| 입주자 이력 (Logs) | 0 | 3 | 3 |
| 커뮤니티 (Community) | 0 | 8 | 8 |
| 민원 VoC (유저) | 0 | 4 | 4 |
| 알림 (Notification) | 0 | 2 | 2 |
| 관리자 — 공간 | 3 | 2 | 5 |
| 관리자 — 기기 | 6 | 0 | 6 |
| 관리자 — 계약 | 8 | 0 | 8 |
| 관리자 — 예약/결제/모니터링/VoC | 0 | 10 | 10 |
| **합계** | **40** | **31** | **71** |
