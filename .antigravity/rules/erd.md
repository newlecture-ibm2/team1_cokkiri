---
trigger: always_on
---

# ERD (압축본)
PostgreSQL 기준 | 21개 테이블 | PK:`{테이블}_id` | FK:참조PK명동일 | 모든테이블 soft delete(`deleted_at`)
v2.0: BOOKING+CONTRACT합병, SPACE상속패턴분리, JSONB통합(첨부/링크), PK/FK네이밍통일

## 1. 테이블 정의

> 섹션 제목 **`### 테이블명`** = DDL·`@Table(name = "...")` 에 쓰는 **소문자 복수형**. 도메인 개념(회원·공간)은 본문에서 병기한다.

### users
`@Table(name = "users")` | `user_id(PK), login_id(UK,4~50), password_hash(BCrypt), name, birth_date(YYMMDD), gender(MALE/FEMALE), nationality, phone, email, phone_verified_at(TIMESTAMPTZ,nullable), email_verified_at(TIMESTAMPTZ,nullable), role(USER/RESIDENT/ADMIN), status(ACTIVE/DEACTIVATED), profile_image, created_at, updated_at, deleted_at`

### ROOM_TYPE (동적관리)
`room_type_id(PK), code(UK: SINGLE,DOUBLE,STUDIO,SUITE 등), name, is_system_default, created_at, updated_at, deleted_at`

### ROOM_TYPE (동적관리)
`room_type_id(PK), code(UK: SINGLE,DOUBLE,STUDIO,SUITE 등), name, is_system_default, created_at, updated_at, deleted_at`

### PRIVATE_SPACE_DETAIL (1:1→SPACE)
`space_id(PK,FK), room_type_id(FK→ROOM_TYPE), room_count, bathroom_count, direction(남/북/동/서), deposit, monthly_rent, maintenance_fee, parking_available`

### private_space_details (1:1 → spaces)
`space_id(PK,FK→spaces), room_type(SINGLE/DOUBLE/STUDIO/SUITE), room_count, bathroom_count, direction(남/북/동/서), deposit, monthly_rent, maintenance_fee, parking_available`

### common_space_details (1:1 → spaces)
`space_id(PK,FK→spaces), max_capacity, operating_hours(예:06:00-23:00), is_reservable, usage_fee(시간당)`

### space_images
`space_image_id(PK), space_id(FK→spaces), image_url, image_type(PHOTO/FLOOR_PLAN), sort_order, is_thumbnail, created_at, updated_at, deleted_at`

### device_types
`device_type_id(PK), code(UK: DOOR_LOCK,LIGHT,AIR_CONDITIONER,WASHER,DRYER,CCTV,HEATER), name, commands(JSONB), ui_type(toggle/slider/button), is_system_default, created_at, updated_at, deleted_at`

### devices
`device_id(PK), space_id(FK→spaces), device_type_id(FK→device_types), name(1~100), model_name, mac_address(UK,50자), mock_endpoint(URL), status(ONLINE/OFFLINE/ERROR), current_state(JSONB: power,temperature,brightness등), is_active, installed_at, last_online_at, created_at, updated_at, deleted_at`

### contracts (BOOKING 합병)
`contract_id(PK), user_id(FK→users), space_id(FK→spaces), origin(USER_INITIATED/ADMIN_INITIATED), status(DRAFT/PENDING/APPROVED/REJECTED/CANCELLED/ACTIVE/EXPIRED/TERMINATED)` — **초안/제출 구분은 `status`만 사용**(별도 `is_draft` 컬럼 없음)
신청필드: `address, bank_account, desired_start_date, desired_duration_months, contract_language(KO/EN), privacy_agreed, request_note(500자)`
확정필드: `start_date, end_date, monthly_rent, deposit, special_terms, approved_by(FK→users), rejected_reason, contracted_at`
`created_at, updated_at, deleted_at`

### reservations
`reservation_id(PK), user_id(FK→users), space_id(FK→spaces, COMMON 행만), status(PENDING/APPROVED/CANCELLED/COMPLETED), reservation_date, start_time, end_time, approved_by(FK→users), created_at, updated_at, deleted_at`

### control_logs
`control_log_id(PK), device_id(FK→devices), user_id(FK→users), actor_type(RESIDENT/ADMIN), command(ON/OFF/SET_TEMP등), command_params(JSONB), result(SUCCESS/FAILURE), error_message, correlation_id, created_at, updated_at, deleted_at`

### payments
`payment_id(PK), contract_id(FK,nullable), reservation_id(FK,nullable), user_id(FK→users), type(RENT/MAINTENANCE/FACILITY), amount, status(UNPAID/PENDING/PAID), payment_method(CARD/TRANSFER/CASH), billing_date, paid_date, created_at, updated_at, deleted_at`
CHECK: contract_id와 reservation_id 중 하나만 NOT NULL

### posts
`post_id(PK), user_id(FK→users), category(NOTICE/QUESTION/SUGGESTION/MEETUP/FREE), title(100자), content, attachments(JSONB,5개), links(JSONB,3개), view_count, like_count, comment_count, created_at, updated_at, deleted_at`
JSONB형식: attachments=[{file_url,file_name,file_size}], links=[{url}]

### post_likes
`post_like_id(PK), post_id(FK→posts), user_id(FK→users), created_at, updated_at, deleted_at` — UK(post_id+user_id, WHERE deleted_at IS NULL)

### comments
`comment_id(PK), post_id(FK→posts), user_id(FK→users), content, created_at, updated_at, deleted_at`

### vocs — REST: 사용자 `POST/GET /api/vocs`, `GET /api/vocs/my`, 관리자 `GET /api/admin/vocs` … (`api-specification.md` §9·§14.4)
`voc_id(PK), user_id(FK→users), category(FACILITY/NOISE/DEVICE/OTHER), title, content, attachments(JSONB), status(OPEN/IN_PROGRESS/RESOLVED/CANCELLED), admin_reply, reply_user_id(FK→users), replied_at, created_at, updated_at, deleted_at`

### notifications — REST: `GET/PATCH /api/notifications` (`api-specification.md` §10, `functional-specification.md` §1.11)
`notification_id(PK), user_id(FK→users), type(CONTRACT_APPROVED/REJECTED/ACTIVATED/EXPIRED, RESERVATION_APPROVED, VOC_REPLIED), title, message, reference_type(CONTRACT/RESERVATION/VOC), reference_id, is_read, created_at, updated_at, deleted_at`

### role_change_logs
`role_change_log_id(PK), user_id(FK→users), old_role, new_role, reason(CONTRACT_ACTIVATED/EXPIRED등), contract_id(FK→contracts), changed_by(FK→users), created_at, updated_at, deleted_at`

### refresh_tokens
`refresh_token_id(PK), user_id(FK→users), token(UK), expires_at, is_revoked, created_at, updated_at, deleted_at`

### token_blacklists
`token_blacklist_id(PK), token_jti(UK), expires_at, reason, created_at, updated_at, deleted_at`

### floor_plans — 층별 배경 설계도 + 비공간 요소 (평면도 v2)
`floor_plan_id(PK), floor(UK,INTEGER), blueprint_url(VARCHAR,nullable), blueprint_opacity(NUMERIC(3,2) DEFAULT 0.30), annotations(JSONB DEFAULT '[]'), created_at, updated_at, deleted_at`
JSONB형식: annotations=[{label, icon_type(DOOR/STAIRS/GARDEN/ELEVATOR/RESTROOM/CUSTOM), position_x, position_y, position_w, position_h, color}]
> FK 없음. `spaces.floor` 정수값과 논리적 연결만 존재. 기존 JSONB 패턴(posts.attachments 등)과 동일한 설계.

---

## 2. 관계

USERS→1:N: CONTRACT, RESERVATION, POST, COMMENT, POST_LIKE, VOC, CONTROL_LOG, PAYMENT, ROLE_CHANGE_LOG, REFRESH_TOKEN, NOTIFICATION
SPACE→1:1: PRIVATE_SPACE_DETAIL, COMMON_SPACE_DETAIL | SPACE→1:N: SPACE_IMAGE, DEVICE, CONTRACT, RESERVATION
FLOOR_PLANS: FK 없음, `floor` 정수값으로 SPACE와 논리적 연결 (층당 1행, UK)
ROOM_TYPE→1:N: PRIVATE_SPACE_DETAIL
DEVICE_TYPE→1:N: DEVICE | DEVICE→1:N: CONTROL_LOG
CONTRACT→1:N: PAYMENT, ROLE_CHANGE_LOG | RESERVATION→1:N: PAYMENT
POST→1:N: COMMENT, POST_LIKE | USERS→1:N: VOC(문의자+답변자)

다중참조FK: contracts.approved_by→users, vocs.reply_user_id→users, role_change_logs.changed_by→users, reservations.approved_by→users

## 3. 관계 설명

### contracts 상태흐름
```
USER_INITIATED: DRAFT→PENDING→APPROVED→ACTIVE→EXPIRED/TERMINATED (또는 REJECTED/CANCELLED)
ADMIN_INITIATED: →ACTIVE→EXPIRED/TERMINATED (신청필드 NULL가능)
```

### 핵심 설계
- **spaces 상속**: spaces(부모)+private_space_details/common_space_details(1:1). 타 테이블은 space_id만 참조
- **사용자정보**: contracts.user_id FK로 users JOIN. address,bank_account는 신청 전용 필드로 contracts에 유지. 프론트→`GET /api/users/me`로 폼 자동입력
- **결제**: payments에 contract_id(RENT/MAINTENANCE) 또는 reservation_id(FACILITY) 중 하나만 값 보유(CHECK). usage_fee로 시설별 이용료 설정
- **JSONB통합**: posts.attachments/links, vocs.attachments → 별도 테이블 3개 제거
- **SoftDelete**: 모든 테이블 deleted_at. UNIQUE 인덱스=WHERE deleted_at IS NULL. 1:1 상세 테이블은 spaces 삭제 시 CASCADE
- **역할승격**: USER→(ACTIVE)→RESIDENT→(EXPIRED/TERMINATED)→USER. JWT에 contract_id,space_id 포함/제거

## 4. 핵심 비즈니스 규칙

1. PRIVATE spaces당 ACTIVE contracts 최대 1개 (Partial Unique Index)
2. RESIDENT는 반드시 ACTIVE contracts 보유
3. 계약 만료/해지→spaces=AVAILABLE, role=USER 복원
4. ACTIVE 전환 시 start_date,end_date,monthly_rent NOT NULL 필수
5. control_logs 이력 있는 devices 삭제 불가(비활성화만)
6. is_active=false+이력 없는 기기만 삭제 가능
7. NOTICE 게시글=ADMIN만 작성
8. 활성 계약/미납금 있으면 탈퇴 불가
9. COMMON 기기 제어=현재 시각 APPROVED 예약 필요
10. 동일 시설 APPROVED 예약 시간대 중복 불가
11. post_likes 중복 불가(Partial Unique)
12. spaces.name 고유(Partial Unique)
13. CCTV=ADMIN만 제어
14. DOOR_LOCK=PRIVATE 전용, 해당 호실 입주자만
15. payments=contract_id/reservation_id 중 하나만 NOT NULL
16. ADMIN_INITIATED contracts=신청 필드(desired_*,address 등) NULL 가능
17. like_count,comment_count=파생 속성, 앱에서 동기화

## 5. 인덱스 설계

| 테이블 | 인덱스 | 용도 |
|---|---|---|
| USERS | login_id(UK), role, email | 로그인,필터,중복확인 |
| ROOM_TYPE | code(UK) | 유형코드조회 |
| SPACE | type+status, floor | 유형/상태/층별조회 |
| CONTRACT | user_id+status, space_id+status, space_id(UK WHERE ACTIVE) | 현황조회,활성계약1개제한 |
| DEVICE | space_id+is_active, device_type_id, mac_address(UK) | 공간별기기,종류별,MAC중복방지 |
| RESERVATION | space_id+date+status, user_id+status | 시설별현황,사용자별 |
| CONTROL_LOG | user_id+created_at, device_id+created_at | 이력조회 |
| POST | user_id, category+created_at | 작성자별,유형별최신순 |
| COMMENT | post_id | 게시글별댓글 |
| POST_LIKE | post_id+user_id(UK) | 중복방지 |
| PAYMENT | contract_id+status, reservation_id+status, user_id+status | 미납확인,결제조회 |
| VOC | user_id+status | 사용자별민원 |
| NOTIFICATION | user_id+is_read+created_at | 미읽은알림 |
| REFRESH_TOKEN | user_id, token(UK) | 토큰조회 |
| TOKEN_BLACKLISTS | token_jti(UK), expires_at | 블랙리스트조회,정리 |
| FLOOR_PLANS | floor(UK) | 층별 1:1 조회 |
