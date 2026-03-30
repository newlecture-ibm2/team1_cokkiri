-- ============================================================
-- CoLiving IoT 플랫폼 — PostgreSQL DDL (schema.sql)
-- ============================================================
-- 기획안(CoLiving-기획안.md) 및 기능 명세서(functional_specification.md)
-- 기반으로 도출한 데이터베이스 스키마입니다.
-- PostgreSQL 14+ 기준으로 작성되었습니다.
-- ============================================================

-- ──────────────────────────────────────────────
-- 0. 스키마 초기화 (개발 환경용, 주의: 데이터 삭제됨)
-- ──────────────────────────────────────────────

DROP TABLE IF EXISTS token_blacklist CASCADE;
DROP TABLE IF EXISTS refresh_token CASCADE;
DROP TABLE IF EXISTS role_change_log CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS voc_attachment CASCADE;
DROP TABLE IF EXISTS voc CASCADE;
DROP TABLE IF EXISTS post_like CASCADE;
DROP TABLE IF EXISTS post_link CASCADE;
DROP TABLE IF EXISTS post_attachment CASCADE;
DROP TABLE IF EXISTS comment CASCADE;
DROP TABLE IF EXISTS post CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS control_log CASCADE;
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS contract CASCADE;
DROP TABLE IF EXISTS booking CASCADE;
DROP TABLE IF EXISTS device CASCADE;
DROP TABLE IF EXISTS device_type CASCADE;
DROP TABLE IF EXISTS space_image CASCADE;
DROP TABLE IF EXISTS space CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ──────────────────────────────────────────────
-- 1. 사용자 (USERS)
-- ──────────────────────────────────────────────
-- PostgreSQL 예약어 'user' 충돌을 피하기 위해 'users' 사용

CREATE TABLE users (
    id              BIGSERIAL       PRIMARY KEY,
    login_id        VARCHAR(50)     NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    name            VARCHAR(50)     NOT NULL,
    birth_date      VARCHAR(6)      NOT NULL,
    gender          VARCHAR(10)     NOT NULL
                        CHECK (gender IN ('MALE', 'FEMALE')),
    nationality     VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'USER'
                        CHECK (role IN ('USER', 'RESIDENT', 'ADMIN')),
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'DEACTIVATED')),
    profile_image   VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_email ON users (email);

COMMENT ON TABLE users IS '사용자 (USER / RESIDENT / ADMIN)';
COMMENT ON COLUMN users.login_id IS '로그인 ID (4~50자, 영문+숫자, 중복 불가)';
COMMENT ON COLUMN users.birth_date IS '생년월일 (YYMMDD 6자리)';
COMMENT ON COLUMN users.role IS '역할: USER(기본) / RESIDENT(입주자) / ADMIN(관리자)';
COMMENT ON COLUMN users.status IS '계정 상태: ACTIVE / DEACTIVATED(탈퇴)';


-- ──────────────────────────────────────────────
-- 2. 공간 (SPACE)
-- ──────────────────────────────────────────────

CREATE TABLE space (
    id                  BIGSERIAL       PRIMARY KEY,
    name                VARCHAR(100)    NOT NULL UNIQUE,
    type                VARCHAR(10)     NOT NULL
                            CHECK (type IN ('PRIVATE', 'COMMON')),
    status              VARCHAR(15)     NOT NULL DEFAULT 'AVAILABLE'
                            CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
    floor               INTEGER,
    area                NUMERIC(10, 2),

    -- PRIVATE 전용 필드
    room_type           VARCHAR(20)
                            CHECK (room_type IN ('SINGLE', 'DOUBLE', 'STUDIO', 'SUITE') OR room_type IS NULL),
    room_count          INTEGER,
    bathroom_count      INTEGER,
    direction           VARCHAR(10),
    deposit             NUMERIC(15, 0),
    monthly_rent        NUMERIC(15, 0),
    maintenance_fee     NUMERIC(15, 0),
    parking_available   BOOLEAN         DEFAULT FALSE,

    -- COMMON 전용 필드
    max_capacity        INTEGER,
    operating_hours     VARCHAR(20),
    is_reservable       BOOLEAN         DEFAULT FALSE,

    -- 공통 필드
    amenities           TEXT,
    description         TEXT,
    position_x          INTEGER,
    position_y          INTEGER,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_space_type_status ON space (type, status);
CREATE INDEX idx_space_floor ON space (floor);

COMMENT ON TABLE space IS '공간 (개인 호실 PRIVATE / 공용 시설 COMMON)';
COMMENT ON COLUMN space.type IS '유형: PRIVATE(개인 주거공간) / COMMON(공용 시설)';
COMMENT ON COLUMN space.status IS '상태: AVAILABLE / OCCUPIED / MAINTENANCE';
COMMENT ON COLUMN space.room_type IS '방 유형 (PRIVATE 전용): SINGLE / DOUBLE / STUDIO / SUITE';
COMMENT ON COLUMN space.is_reservable IS '예약 가능 여부 (COMMON만 true 가능)';


-- ──────────────────────────────────────────────
-- 3. 공간 이미지 (SPACE_IMAGE)
-- ──────────────────────────────────────────────

CREATE TABLE space_image (
    id              BIGSERIAL       PRIMARY KEY,
    space_id        BIGINT          NOT NULL REFERENCES space(id) ON DELETE CASCADE,
    image_url       VARCHAR(500)    NOT NULL,
    image_type      VARCHAR(15)     NOT NULL
                        CHECK (image_type IN ('PHOTO', 'FLOOR_PLAN')),
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_thumbnail    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_space_image_space_id ON space_image (space_id);

COMMENT ON TABLE space_image IS '공간 이미지 (사진, 평면도)';
COMMENT ON COLUMN space_image.image_type IS '유형: PHOTO(사진) / FLOOR_PLAN(평면도)';


-- ──────────────────────────────────────────────
-- 4. 기기 종류 (DEVICE_TYPE)
-- ──────────────────────────────────────────────

CREATE TABLE device_type (
    id                  BIGSERIAL       PRIMARY KEY,
    code                VARCHAR(30)     NOT NULL UNIQUE,
    name                VARCHAR(50)     NOT NULL,
    commands            JSONB           NOT NULL DEFAULT '[]',
    ui_type             VARCHAR(30),
    is_system_default   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE device_type IS 'IoT 기기 종류 (관리자가 동적으로 추가 가능)';
COMMENT ON COLUMN device_type.code IS '코드: DOOR_LOCK, WASHER, DRYER, LIGHT, AIR_CONDITIONER, HEATER, CCTV';
COMMENT ON COLUMN device_type.commands IS '지원 명령 목록 (JSON 배열)';


-- ──────────────────────────────────────────────
-- 5. IoT 기기 (DEVICE)
-- ──────────────────────────────────────────────

CREATE TABLE device (
    id              BIGSERIAL       PRIMARY KEY,
    space_id        BIGINT          NOT NULL REFERENCES space(id),
    device_type_id  BIGINT          NOT NULL REFERENCES device_type(id),
    name            VARCHAR(100)    NOT NULL,
    model_name      VARCHAR(100),
    mock_endpoint   VARCHAR(500),
    status          VARCHAR(10)     NOT NULL DEFAULT 'OFFLINE'
                        CHECK (status IN ('ONLINE', 'OFFLINE', 'ERROR')),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    installed_at    TIMESTAMPTZ,
    last_online_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_space_id_active ON device (space_id, is_active);
CREATE INDEX idx_device_type_id ON device (device_type_id);
CREATE INDEX idx_device_status ON device (status);

COMMENT ON TABLE device IS 'IoT 기기 인스턴스';
COMMENT ON COLUMN device.name IS '관리자가 지정하는 기기명 (예: 거실 천장 조명)';
COMMENT ON COLUMN device.model_name IS '제조사 실제 모델명 (예: LG 휘센 FX24KN)';
COMMENT ON COLUMN device.status IS '연결 상태: ONLINE / OFFLINE / ERROR';


-- ──────────────────────────────────────────────
-- 6. 계약 신청 (BOOKING)
-- ──────────────────────────────────────────────

CREATE TABLE booking (
    id                      BIGSERIAL       PRIMARY KEY,
    user_id                 BIGINT          NOT NULL REFERENCES users(id),
    space_id                BIGINT          NOT NULL REFERENCES space(id),
    status                  VARCHAR(15)     NOT NULL DEFAULT 'DRAFT'
                                CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONTRACTED')),

    -- 신청자 정보
    applicant_name          VARCHAR(50)     NOT NULL,
    birth_date              VARCHAR(6)      NOT NULL,
    gender                  VARCHAR(10)     NOT NULL
                                CHECK (gender IN ('MALE', 'FEMALE')),
    nationality             VARCHAR(100)    NOT NULL,
    phone                   VARCHAR(20)     NOT NULL,
    address                 VARCHAR(500)    NOT NULL,
    email                   VARCHAR(255)    NOT NULL,
    bank_account            VARCHAR(100)    NOT NULL,

    -- 신청 조건
    desired_start_date      DATE            NOT NULL,
    desired_duration_months INTEGER         NOT NULL,
    contract_language       VARCHAR(5)      NOT NULL DEFAULT 'KO'
                                CHECK (contract_language IN ('KO', 'EN')),
    privacy_agreed          BOOLEAN         NOT NULL DEFAULT FALSE,
    request_note            VARCHAR(500),

    -- 관리자 승인 시 확정 조건
    confirmed_rent          NUMERIC(15, 0),
    confirmed_deposit       NUMERIC(15, 0),
    confirmed_start_date    DATE,
    confirmed_end_date      DATE,
    special_terms           TEXT,

    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_user_status ON booking (user_id, status);
CREATE INDEX idx_booking_space_status ON booking (space_id, status);

COMMENT ON TABLE booking IS '계약 신청 (유저 주도)';
COMMENT ON COLUMN booking.status IS '상태: DRAFT / PENDING / APPROVED / REJECTED / CANCELLED / CONTRACTED';


-- ──────────────────────────────────────────────
-- 7. 계약 (CONTRACT)
-- ──────────────────────────────────────────────

CREATE TABLE contract (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    space_id        BIGINT          NOT NULL REFERENCES space(id),
    booking_id      BIGINT          REFERENCES booking(id),
    status          VARCHAR(15)     NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'EXPIRED', 'TERMINATED')),
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    monthly_rent    NUMERIC(15, 0)  NOT NULL,
    deposit         NUMERIC(15, 0),
    special_terms   TEXT,
    contracted_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Partial unique index: ACTIVE 상태 계약에 대해서만 space_id 유니크
CREATE UNIQUE INDEX uq_active_contract_per_space
    ON contract (space_id)
    WHERE status = 'ACTIVE';

CREATE INDEX idx_contract_user_status ON contract (user_id, status);
CREATE INDEX idx_contract_space_status ON contract (space_id, status);

COMMENT ON TABLE contract IS '임대차 계약';
COMMENT ON COLUMN contract.status IS '상태: ACTIVE(활성) / EXPIRED(만료) / TERMINATED(해지)';
COMMENT ON COLUMN contract.booking_id IS '유저 주도 계약 시 연결된 BOOKING ID, 관리자 주도 시 NULL';


-- ──────────────────────────────────────────────
-- 8. 시설 예약 (RESERVATION)
-- ──────────────────────────────────────────────

CREATE TABLE reservation (
    id                  BIGSERIAL       PRIMARY KEY,
    user_id             BIGINT          NOT NULL REFERENCES users(id),
    space_id            BIGINT          NOT NULL REFERENCES space(id),
    status              VARCHAR(15)     NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'APPROVED', 'CANCELLED', 'COMPLETED')),
    reservation_date    DATE            NOT NULL,
    start_time          TIME            NOT NULL,
    end_time            TIME            NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_reservation_time CHECK (end_time > start_time)
);

CREATE INDEX idx_reservation_space_date ON reservation (space_id, reservation_date, status);
CREATE INDEX idx_reservation_user_status ON reservation (user_id, status);

COMMENT ON TABLE reservation IS '공용 시설 예약 (RESIDENT만 이용 가능)';
COMMENT ON COLUMN reservation.status IS '상태: PENDING / APPROVED / CANCELLED / COMPLETED';


-- ──────────────────────────────────────────────
-- 9. IoT 제어 이력 (CONTROL_LOG)
-- ──────────────────────────────────────────────

CREATE TABLE control_log (
    id              BIGSERIAL       PRIMARY KEY,
    device_id       BIGINT          NOT NULL REFERENCES device(id),
    actor_id        BIGINT          NOT NULL REFERENCES users(id),
    actor_type      VARCHAR(10)     NOT NULL
                        CHECK (actor_type IN ('RESIDENT', 'ADMIN')),
    command         VARCHAR(50)     NOT NULL,
    command_params  JSONB,
    result          VARCHAR(10)     NOT NULL
                        CHECK (result IN ('SUCCESS', 'FAILURE')),
    error_message   TEXT,
    correlation_id  VARCHAR(100),
    executed_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_control_log_actor ON control_log (actor_id, executed_at);
CREATE INDEX idx_control_log_device ON control_log (device_id, executed_at);
CREATE INDEX idx_control_log_executed_at ON control_log (executed_at);

COMMENT ON TABLE control_log IS 'IoT 기기 제어 이력 (감사 로그)';
COMMENT ON COLUMN control_log.actor_type IS '수행자 유형: RESIDENT / ADMIN';
COMMENT ON COLUMN control_log.command IS '제어 명령: TURN_ON, TURN_OFF, SET_TEMP, SET_BRIGHTNESS, LOCK, UNLOCK, START, STOP, SET_MODE';
COMMENT ON COLUMN control_log.correlation_id IS '요청 추적 ID (게이트웨이에서 부여)';


-- ──────────────────────────────────────────────
-- 10. 결제 (PAYMENT)
-- ──────────────────────────────────────────────

CREATE TABLE payment (
    id              BIGSERIAL       PRIMARY KEY,
    contract_id     BIGINT          NOT NULL REFERENCES contract(id),
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    type            VARCHAR(15)     NOT NULL
                        CHECK (type IN ('RENT', 'MAINTENANCE', 'FACILITY')),
    amount          NUMERIC(15, 0)  NOT NULL,
    status          VARCHAR(10)     NOT NULL DEFAULT 'UNPAID'
                        CHECK (status IN ('UNPAID', 'PENDING', 'PAID')),
    billing_date    DATE            NOT NULL,
    paid_date       DATE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_contract_status ON payment (contract_id, status);
CREATE INDEX idx_payment_user_status ON payment (user_id, status);

COMMENT ON TABLE payment IS '결제 / 정산 (MVP: PG 연동 없이 상태 변경만)';
COMMENT ON COLUMN payment.type IS '유형: RENT(월세) / MAINTENANCE(관리비) / FACILITY(시설이용료)';
COMMENT ON COLUMN payment.status IS '상태: UNPAID(미납) / PENDING(결제대기) / PAID(완료)';


-- ──────────────────────────────────────────────
-- 11. 커뮤니티 게시글 (POST)
-- ──────────────────────────────────────────────

CREATE TABLE post (
    id              BIGSERIAL       PRIMARY KEY,
    author_id       BIGINT          NOT NULL REFERENCES users(id),
    category        VARCHAR(15)     NOT NULL
                        CHECK (category IN ('NOTICE', 'QUESTION', 'SUGGESTION', 'MEETUP', 'FREE')),
    title           VARCHAR(100)    NOT NULL,
    content         TEXT            NOT NULL,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    like_count      INTEGER         NOT NULL DEFAULT 0,
    comment_count   INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_author ON post (author_id);
CREATE INDEX idx_post_category_created ON post (category, created_at DESC);
CREATE INDEX idx_post_created_at ON post (created_at DESC);

COMMENT ON TABLE post IS '커뮤니티 게시글 (모든 역할 이용 가능)';
COMMENT ON COLUMN post.category IS '유형: NOTICE(공지, ADMIN만) / QUESTION / SUGGESTION / MEETUP / FREE';


-- ──────────────────────────────────────────────
-- 12. 게시글 첨부파일 (POST_ATTACHMENT)
-- ──────────────────────────────────────────────

CREATE TABLE post_attachment (
    id              BIGSERIAL       PRIMARY KEY,
    post_id         BIGINT          NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    file_url        VARCHAR(500)    NOT NULL,
    file_name       VARCHAR(255)    NOT NULL,
    file_size       BIGINT          NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_attachment_post ON post_attachment (post_id);

COMMENT ON TABLE post_attachment IS '게시글 첨부파일 (최대 5개, 파일당 10MB 이하)';


-- ──────────────────────────────────────────────
-- 13. 게시글 링크 (POST_LINK)
-- ──────────────────────────────────────────────

CREATE TABLE post_link (
    id              BIGSERIAL       PRIMARY KEY,
    post_id         BIGINT          NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    url             VARCHAR(2000)   NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_link_post ON post_link (post_id);

COMMENT ON TABLE post_link IS '게시글 URL 링크 (최대 3개)';


-- ──────────────────────────────────────────────
-- 14. 게시글 좋아요 (POST_LIKE)
-- ──────────────────────────────────────────────

CREATE TABLE post_like (
    id              BIGSERIAL       PRIMARY KEY,
    post_id         BIGINT          NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_post_like UNIQUE (post_id, user_id)
);

COMMENT ON TABLE post_like IS '게시글 좋아요 (사용자당 1개)';


-- ──────────────────────────────────────────────
-- 15. 댓글 (COMMENT)
-- ──────────────────────────────────────────────

CREATE TABLE comment (
    id              BIGSERIAL       PRIMARY KEY,
    post_id         BIGINT          NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    author_id       BIGINT          NOT NULL REFERENCES users(id),
    content         TEXT            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comment_post ON comment (post_id);
CREATE INDEX idx_comment_author ON comment (author_id);

COMMENT ON TABLE comment IS '댓글 (줄바꿈 보존 필요)';


-- ──────────────────────────────────────────────
-- 16. 민원 / VoC (VOC)
-- ──────────────────────────────────────────────

CREATE TABLE voc (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    title           VARCHAR(200)    NOT NULL,
    content         TEXT            NOT NULL,
    status          VARCHAR(15)     NOT NULL DEFAULT 'OPEN'
                        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
    admin_reply     TEXT,
    replied_by      BIGINT          REFERENCES users(id),
    replied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_voc_user_status ON voc (user_id, status);
CREATE INDEX idx_voc_status ON voc (status);

COMMENT ON TABLE voc IS '민원 / 문의 (VoC)';
COMMENT ON COLUMN voc.status IS '상태: OPEN / IN_PROGRESS / RESOLVED / CANCELLED';


-- ──────────────────────────────────────────────
-- 17. 민원 첨부파일 (VOC_ATTACHMENT)
-- ──────────────────────────────────────────────

CREATE TABLE voc_attachment (
    id              BIGSERIAL       PRIMARY KEY,
    voc_id          BIGINT          NOT NULL REFERENCES voc(id) ON DELETE CASCADE,
    file_url        VARCHAR(500)    NOT NULL,
    file_name       VARCHAR(255)    NOT NULL,
    file_size       BIGINT          NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_voc_attachment_voc ON voc_attachment (voc_id);

COMMENT ON TABLE voc_attachment IS '민원 첨부파일';


-- ──────────────────────────────────────────────
-- 18. 알림 (NOTIFICATION)
-- ──────────────────────────────────────────────

CREATE TABLE notification (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    type            VARCHAR(30)     NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    message         TEXT            NOT NULL,
    reference_type  VARCHAR(20),
    reference_id    BIGINT,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_user_read ON notification (user_id, is_read, created_at DESC);

COMMENT ON TABLE notification IS '알림 (계약 승인/거절, 예약 승인 등)';
COMMENT ON COLUMN notification.type IS '유형: BOOKING_APPROVED / BOOKING_REJECTED / CONTRACT_CREATED / CONTRACT_EXPIRED / RESERVATION_APPROVED / VOC_REPLIED';
COMMENT ON COLUMN notification.reference_type IS '참조 엔터티: BOOKING / CONTRACT / RESERVATION / VOC';


-- ──────────────────────────────────────────────
-- 19. 역할 변경 이력 (ROLE_CHANGE_LOG)
-- ──────────────────────────────────────────────

CREATE TABLE role_change_log (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    old_role        VARCHAR(20)     NOT NULL
                        CHECK (old_role IN ('USER', 'RESIDENT', 'ADMIN')),
    new_role        VARCHAR(20)     NOT NULL
                        CHECK (new_role IN ('USER', 'RESIDENT', 'ADMIN')),
    reason          VARCHAR(255),
    contract_id     BIGINT          REFERENCES contract(id),
    changed_by      BIGINT,
    changed_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_role_change_user ON role_change_log (user_id);

COMMENT ON TABLE role_change_log IS '역할 변경 이력 (USER ↔ RESIDENT 전환 추적)';


-- ──────────────────────────────────────────────
-- 20. 리프레시 토큰 (REFRESH_TOKEN)
-- ──────────────────────────────────────────────

CREATE TABLE refresh_token (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id),
    token           VARCHAR(500)    NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ     NOT NULL,
    is_revoked      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_token_user ON refresh_token (user_id);

COMMENT ON TABLE refresh_token IS 'JWT Refresh Token 관리';


-- ──────────────────────────────────────────────
-- 21. 토큰 블랙리스트 (TOKEN_BLACKLIST)
-- ──────────────────────────────────────────────

CREATE TABLE token_blacklist (
    id              BIGSERIAL       PRIMARY KEY,
    token_jti       VARCHAR(255)    NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ     NOT NULL,
    reason          VARCHAR(255),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token_blacklist_expires ON token_blacklist (expires_at);

COMMENT ON TABLE token_blacklist IS '무효화된 JWT Access Token 관리 (로그아웃, 계약 해지 등)';


-- ============================================================
-- 초기 데이터 (Seed Data)
-- ============================================================

-- 기기 종류 기본값 (MVP 7종)
INSERT INTO device_type (code, name, commands, ui_type, is_system_default) VALUES
    ('DOOR_LOCK',       '스마트도어락',   '["LOCK", "UNLOCK"]',                                    'toggle',               TRUE),
    ('WASHER',          '스마트세탁기',   '["START", "STOP"]',                                     'button',               TRUE),
    ('DRYER',           '스마트건조기',   '["START", "STOP"]',                                     'button',               TRUE),
    ('LIGHT',           '스마트조명',     '["TURN_ON", "TURN_OFF", "SET_BRIGHTNESS"]',              'toggle_slider',        TRUE),
    ('AIR_CONDITIONER', '스마트에어컨',   '["TURN_ON", "TURN_OFF", "SET_TEMP", "SET_MODE"]',       'toggle_slider_select', TRUE),
    ('HEATER',          '스마트난방',     '["TURN_ON", "TURN_OFF", "SET_TEMP"]',                   'toggle_slider',        TRUE),
    ('CCTV',            '스마트CCTV',     '["TURN_ON", "TURN_OFF"]',                               'toggle',               TRUE);

-- 관리자 기본 계정 (비밀번호: Admin1234! — BCrypt 해시로 교체 필요)
INSERT INTO users (login_id, password_hash, name, birth_date, gender, nationality, phone, email, role, status)
VALUES (
    'admin',
    '$2a$10$dummyhashvaluefordevpurposesonlynotreal',
    '관리자',
    '900101',
    'MALE',
    '대한민국',
    '010-0000-0000',
    'admin@coliving.com',
    'ADMIN',
    'ACTIVE'
);

-- 공용 공간 기본값 (MVP 4종)
INSERT INTO space (name, type, status, floor, max_capacity, operating_hours, is_reservable, description) VALUES
    ('공용 세탁실', 'COMMON', 'AVAILABLE', 1, 10, '06:00-23:00', FALSE, '세탁기, 건조기 등이 구비된 공용 세탁실'),
    ('공용 라운지', 'COMMON', 'AVAILABLE', 1, 20, '00:00-24:00', FALSE, '소파, 테이블, TV 등이 구비된 휴게 공간'),
    ('공용 회의실', 'COMMON', 'AVAILABLE', 2,  8, '09:00-22:00', TRUE,  '테이블, 의자, 화이트보드 등이 구비된 회의 공간'),
    ('공용 헬스장', 'COMMON', 'AVAILABLE', 1, 15, '06:00-23:00', FALSE, '런닝머신, 사이클, 웨이트 기구 등이 구비된 운동 공간');


-- ============================================================
-- 유틸리티: updated_at 자동 갱신 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at       BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_space_updated_at        BEFORE UPDATE ON space        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_device_type_updated_at  BEFORE UPDATE ON device_type  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_device_updated_at       BEFORE UPDATE ON device       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_booking_updated_at      BEFORE UPDATE ON booking      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_contract_updated_at     BEFORE UPDATE ON contract     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reservation_updated_at  BEFORE UPDATE ON reservation  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payment_updated_at      BEFORE UPDATE ON payment      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_post_updated_at         BEFORE UPDATE ON post         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_comment_updated_at      BEFORE UPDATE ON comment      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_voc_updated_at          BEFORE UPDATE ON voc          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 완료: 총 21개 테이블
-- ============================================================
-- USERS, SPACE, SPACE_IMAGE, DEVICE_TYPE, DEVICE,
-- BOOKING, CONTRACT, RESERVATION, CONTROL_LOG, PAYMENT,
-- POST, POST_ATTACHMENT, POST_LINK, POST_LIKE, COMMENT,
-- VOC, VOC_ATTACHMENT, NOTIFICATION, ROLE_CHANGE_LOG,
-- REFRESH_TOKEN, TOKEN_BLACKLIST
-- ============================================================
