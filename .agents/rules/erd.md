---
trigger: always_on
---

# ERD (압축본)
PostgreSQL 기준 | 20개 테이블 | PK:`{테이블}_id` | FK:참조PK명동일 | 모든테이블 soft delete(`deleted_at`)
v2.0: BOOKING+CONTRACT합병, SPACE상속패턴분리, JSONB통합(첨부/링크), PK/FK네이밍통일

## 1. 테이블 정의

### USERS
`user_id(PK), login_id(UK,4~50), password_hash(BCrypt), name, birth_date(YYMMDD), gender(MALE/FEMALE), nationality, phone, email, role(USER/RESIDENT/ADMIN), status(ACTIVE/DEACTIVATED), profile_image, created_at, updated_at, deleted_at`

### SPACE (부모)
`space_id(PK), name(UK,1~100), type(PRIVATE/COMMON), status(AVAILABLE/OCCUPIED/MAINTENANCE), floor, area(㎡), amenities(JSON), description, position_x, position_y, created_at, updated_at, deleted_at`

### ROOM_TYPE (동적관리)
`room_type_id(PK), code(UK: SINGLE,DOUBLE,STUDIO,SUITE 등), name, is_system_default, created_at, updated_at, deleted_at`

### PRIVATE_SPACE_DETAIL (1:1→SPACE)
`space_id(PK,FK), room_type_id(FK→ROOM_TYPE), room_count, bathroom_count, direction(남/북/동/서), deposit, monthly_rent, maintenance_fee, parking_available`

### COMMON_SPACE_DETAIL (1:1→SPACE)
`space_id(PK,FK), max_capacity, operating_hours(예:06:00-23:00), is_reservable, usage_fee(시간당)`

### SPACE_IMAGE
`space_image_id(PK), space_id(FK), image_url, image_type(PHOTO/FLOOR_PLAN), sort_order, is_thumbnail, created_at, updated_at, deleted_at`

### DEVICE_TYPE (동적관리)
`device_type_id(PK), code(UK: DOOR_LOCK,LIGHT,AIR_CONDITIONER,WASHER,DRYER,CCTV,HEATER), name, commands(JSONB), ui_type(toggle/slider/button), is_system_default, created_at, updated_at, deleted_at`

### DEVICE
`device_id(PK), space_id(FK), device_type_id(FK), name(1~100), model_name, mock_endpoint(URL), status(ONLINE/OFFLINE/ERROR), current_state(JSONB: power,temperature,brightness등), is_active, installed_at, last_online_at, created_at, updated_at, deleted_at`

### CONTRACT (BOOKING합병)
`contract_id(PK), user_id(FK→USERS), space_id(FK→SPACE), origin(USER_INITIATED/ADMIN_INITIATED), status(DRAFT/PENDING/APPROVED/REJECTED/CANCELLED/ACTIVE/EXPIRED/TERMINATED)`
신청필드: `address, bank_account, desired_start_date, desired_duration_months, contract_language(KO/EN), privacy_agreed, request_note(500자)`
확정필드: `start_date, end_date, monthly_rent, deposit, special_terms, approved_by(FK→USERS), rejected_reason, contracted_at`
`created_at, updated_at, deleted_at`

### RESERVATION
`reservation_id(PK), user_id(FK), space_id(FK→COMMON), status(PENDING/APPROVED/CANCELLED/COMPLETED), reservation_date, start_time, end_time, approved_by(FK→USERS), created_at, updated_at, deleted_at`

### CONTROL_LOG (감사)
`control_log_id(PK), device_id(FK), user_id(FK), actor_type(RESIDENT/ADMIN), command(TURN_ON/SET_TEMP등), command_params(JSONB), result(SUCCESS/FAILURE), error_message, correlation_id, created_at, updated_at, deleted_at`

### PAYMENT
`payment_id(PK), contract_id(FK,nullable), reservation_id(FK,nullable), user_id(FK), type(RENT/MAINTENANCE/FACILITY), amount, status(UNPAID/PENDING/PAID), payment_method(CARD/TRANSFER/CASH), billing_date, paid_date, created_at, updated_at, deleted_at`
CHECK: contract_id와 reservation_id 중 하나만 NOT NULL

### POST (커뮤니티)
`post_id(PK), user_id(FK), category(NOTICE/QUESTION/SUGGESTION/MEETUP/FREE), title(100자), content, attachments(JSONB,5개), links(JSONB,3개), view_count, like_count, comment_count, created_at, updated_at, deleted_at`
JSONB형식: attachments=[{file_url,file_name,file_size}], links=[{url}]

### POST_LIKE
`post_like_id(PK), post_id(FK), user_id(FK), created_at, updated_at, deleted_at` — UK(post_id+user_id, WHERE deleted_at IS NULL)

### COMMENT
`comment_id(PK), post_id(FK), user_id(FK), content, created_at, updated_at, deleted_at`

### VOC (민원)
`voc_id(PK), user_id(FK), category(FACILITY/NOISE/DEVICE/OTHER), title, content, attachments(JSONB), status(OPEN/IN_PROGRESS/RESOLVED/CANCELLED), admin_reply, reply_user_id(FK→USERS), replied_at, created_at, updated_at, deleted_at`

### NOTIFICATION
`notification_id(PK), user_id(FK), type(CONTRACT_APPROVED/REJECTED/ACTIVATED/EXPIRED, RESERVATION_APPROVED, VOC_REPLIED), title, message, reference_type(CONTRACT/RESERVATION/VOC), reference_id, is_read, created_at, updated_at, deleted_at`

### ROLE_CHANGE_LOG
`role_change_log_id(PK), user_id(FK), old_role, new_role, reason(CONTRACT_ACTIVATED/EXPIRED등), contract_id(FK), changed_by(FK→USERS), created_at, updated_at, deleted_at`

### REFRESH_TOKEN
`refresh_token_id(PK), user_id(FK), token(UK), expires_at, is_revoked, created_at, updated_at, deleted_at`

### TOKEN_BLACKLIST
`token_blacklist_id(PK), token_jti(UK), expires_at, reason, created_at, updated_at, deleted_at`

---

## 2. 관계

USERS→1:N: CONTRACT, RESERVATION, POST, COMMENT, POST_LIKE, VOC, CONTROL_LOG, PAYMENT, ROLE_CHANGE_LOG, REFRESH_TOKEN, NOTIFICATION
SPACE→1:1: PRIVATE_SPACE_DETAIL, COMMON_SPACE_DETAIL | SPACE→1:N: SPACE_IMAGE, DEVICE, CONTRACT, RESERVATION
ROOM_TYPE→1:N: PRIVATE_SPACE_DETAIL
DEVICE_TYPE→1:N: DEVICE | DEVICE→1:N: CONTROL_LOG
CONTRACT→1:N: PAYMENT, ROLE_CHANGE_LOG | RESERVATION→1:N: PAYMENT
POST→1:N: COMMENT, POST_LIKE | USERS→1:N: VOC(문의자+답변자)

다중참조FK: CONTRACT.approved_by→USERS, VOC.reply_user_id→USERS, ROLE_CHANGE_LOG.changed_by→USERS, RESERVATION.approved_by→USERS

## 3. 관계 설명

### CONTRACT 상태흐름
```
USER_INITIATED: DRAFT→PENDING→APPROVED→ACTIVE→EXPIRED/TERMINATED (또는 REJECTED/CANCELLED)
ADMIN_INITIATED: →ACTIVE→EXPIRED/TERMINATED (신청필드 NULL가능)
```

### 핵심 설계
- **SPACE상속**: SPACE(부모)+PRIVATE_SPACE_DETAIL/COMMON_SPACE_DETAIL(1:1). 타테이블은 space_id만 참조
- **사용자정보**: CONTRACT.user_id FK로 USERS JOIN조회. address,bank_account는 신청전용필드로 CONTRACT유지. 프론트→`GET /api/users/me`로 폼자동입력
- **결제**: PAYMENT에 contract_id(RENT/MAINTENANCE) 또는 reservation_id(FACILITY) 중 하나만 값보유(CHECK). usage_fee로 시설별이용료설정
- **JSONB통합**: POST.attachments/links, VOC.attachments → 별도테이블3개 제거
- **SoftDelete**: 모든테이블 deleted_at. UNIQUE인덱스=WHERE deleted_at IS NULL. 1:1상세테이블은 SPACE삭제시 CASCADE
- **역할승격**: USER→(ACTIVE)→RESIDENT→(EXPIRED/TERMINATED)→USER. JWT에 contract_id,space_id 포함/제거

## 4. 핵심 비즈니스 규칙

1. PRIVATE SPACE당 ACTIVE CONTRACT 최대1개 (Partial Unique Index)
2. RESIDENT는 반드시 ACTIVE CONTRACT 보유
3. 계약만료/해지→Space=AVAILABLE, role=USER 복원
4. ACTIVE 전환시 start_date,end_date,monthly_rent NOT NULL 필수
5. CONTROL_LOG이력있는 DEVICE 삭제불가(비활성화만)
6. is_active=false+이력없는 기기만 삭제가능
7. NOTICE 게시글=ADMIN만 작성
8. 활성계약/미납금 있으면 탈퇴불가
9. COMMON기기제어=현재시각 APPROVED예약 필요
10. 동일시설 APPROVED예약 시간대 중복불가
11. POST_LIKE 중복불가(Partial Unique)
12. SPACE.name 고유(Partial Unique)
13. CCTV=ADMIN만 제어
14. DOOR_LOCK=PRIVATE전용, 해당호실입주자만
15. PAYMENT=contract_id/reservation_id 중 하나만 NOT NULL
16. ADMIN_INITIATED CONTRACT=신청필드(desired_*,address등) NULL가능
17. like_count,comment_count=파생속성, 앱에서 동기화

## 5. 인덱스 설계

| 테이블 | 인덱스 | 용도 |
|---|---|---|
| USERS | login_id(UK), role, email | 로그인,필터,중복확인 |
| ROOM_TYPE | code(UK) | 유형코드조회 |
| SPACE | type+status, floor | 유형/상태/층별조회 |
| CONTRACT | user_id+status, space_id+status, space_id(UK WHERE ACTIVE) | 현황조회,활성계약1개제한 |
| DEVICE | space_id+is_active, device_type_id | 공간별기기,종류별 |
| RESERVATION | space_id+date+status, user_id+status | 시설별현황,사용자별 |
| CONTROL_LOG | user_id+created_at, device_id+created_at | 이력조회 |
| POST | user_id, category+created_at | 작성자별,유형별최신순 |
| COMMENT | post_id | 게시글별댓글 |
| POST_LIKE | post_id+user_id(UK) | 중복방지 |
| PAYMENT | contract_id+status, reservation_id+status, user_id+status | 미납확인,결제조회 |
| VOC | user_id+status | 사용자별민원 |
| NOTIFICATION | user_id+is_read+created_at | 미읽은알림 |
| REFRESH_TOKEN | user_id, token(UK) | 토큰조회 |
| TOKEN_BLACKLIST | token_jti(UK), expires_at | 블랙리스트조회,정리 |
