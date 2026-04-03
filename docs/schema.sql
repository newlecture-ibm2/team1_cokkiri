-- ============================================================
-- CoLiving IoT 플랫폼 — PostgreSQL DDL (schema.sql v2.1)
-- ============================================================
-- 기획안 및 ERD v2.0(erd.md), API 명세서 기반으로 작성되었습니다.
-- PostgreSQL 14+ 기준으로 작성되었습니다.
-- DrawSQL 호환성 및 Soft Delete, PK/FK 네이밍 통일을 반영했습니다.
-- v2.1: ERD §6 권장 인덱스 추가, CHECK 제약 보완, Seed Data 개선
-- ============================================================

-- ──────────────────────────────────────────────
-- 0. 초기화
-- ──────────────────────────────────────────────

-- 확장 모듈 (예약 시간대 중복 방지용)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 기존 테이블 삭제 (의존성 순서 고려)
DROP TABLE IF EXISTS token_blacklist CASCADE;
DROP TABLE IF EXISTS refresh_token CASCADE;
DROP TABLE IF EXISTS role_change_log CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS voc CASCADE;
DROP TABLE IF EXISTS comment CASCADE;
DROP TABLE IF EXISTS post_like CASCADE;
DROP TABLE IF EXISTS post CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS control_log CASCADE;
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS contract CASCADE;
DROP TABLE IF EXISTS device CASCADE;
DROP TABLE IF EXISTS device_type CASCADE;
DROP TABLE IF EXISTS space_image CASCADE;
DROP TABLE IF EXISTS common_space_detail CASCADE;
DROP TABLE IF EXISTS private_space_detail CASCADE;
DROP TABLE IF EXISTS space CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ──────────────────────────────────────────────
-- 1. 사용자 (USERS)
-- ──────────────────────────────────────────────

CREATE TABLE users (
    user_id         BIGSERIAL       PRIMARY KEY,
    login_id        VARCHAR(50)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    name            VARCHAR(50)     NOT NULL,
    birth_date      VARCHAR(6)      NOT NULL,
    gender          VARCHAR(10)     NOT NULL CHECK (gender IN ('MALE', 'FEMALE')),
    nationality     VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'RESIDENT', 'ADMIN')),
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEACTIVATED')),
    profile_image   VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- Soft Delete 인식 유니크 인덱스
CREATE UNIQUE INDEX uq_users_login_id ON users (login_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_email ON users (email) WHERE deleted_at IS NULL;

-- ──────────────────────────────────────────────
-- 2. 공간 부모 (SPACE)
-- ──────────────────────────────────────────────

CREATE TABLE space (
    space_id        BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    type            VARCHAR(10)     NOT NULL CHECK (type IN ('PRIVATE', 'COMMON')),
    status          VARCHAR(15)     NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
    floor           INTEGER,
    area            NUMERIC(10, 2),
    amenities       JSONB           DEFAULT '[]',
    description     TEXT,
    position_x      INTEGER,
    position_y      INTEGER,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_space_name ON space (name) WHERE deleted_at IS NULL;
CREATE INDEX idx_space_type_status ON space (type, status);
CREATE INDEX idx_space_floor ON space (floor);

-- ──────────────────────────────────────────────
-- 2-1. 개인 공간 상세 (PRIVATE_SPACE_DETAIL)
-- ──────────────────────────────────────────────

CREATE TABLE private_space_detail (
    space_id            BIGINT          PRIMARY KEY REFERENCES space(space_id) ON DELETE CASCADE,
    room_type           VARCHAR(20)     CHECK (room_type IN ('SINGLE', 'DOUBLE', 'STUDIO', 'SUITE')),
    room_count          INTEGER,
    bathroom_count      INTEGER,
    direction           VARCHAR(10),
    deposit             NUMERIC(15, 0),
    monthly_rent        NUMERIC(15, 0),
    maintenance_fee     NUMERIC(15, 0),
    parking_available   BOOLEAN         DEFAULT FALSE
);

-- ──────────────────────────────────────────────
-- 2-2. 공용 공간 상세 (COMMON_SPACE_DETAIL)
-- ──────────────────────────────────────────────

CREATE TABLE common_space_detail (
    space_id            BIGINT          PRIMARY KEY REFERENCES space(space_id) ON DELETE CASCADE,
    max_capacity        INTEGER,
    operating_hours     VARCHAR(50),
    is_reservable       BOOLEAN         DEFAULT FALSE,
    usage_fee           NUMERIC(15, 0)  DEFAULT 0
);

-- ──────────────────────────────────────────────
-- 3. 공간 이미지 (SPACE_IMAGE)
-- ──────────────────────────────────────────────

CREATE TABLE space_image (
    space_image_id  BIGSERIAL       PRIMARY KEY,
    space_id        BIGINT          NOT NULL REFERENCES space(space_id),
    image_url       VARCHAR(500)    NOT NULL,
    image_type      VARCHAR(15)     NOT NULL CHECK (image_type IN ('PHOTO', 'FLOOR_PLAN')),
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_thumbnail    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- ──────────────────────────────────────────────
-- 4. 기기 종류 (DEVICE_TYPE)
-- ──────────────────────────────────────────────

CREATE TABLE device_type (
    device_type_id      BIGSERIAL       PRIMARY KEY,
    code                VARCHAR(30)     NOT NULL,
    name                VARCHAR(50)     NOT NULL,
    commands            JSONB           NOT NULL DEFAULT '[]',
    ui_type             VARCHAR(30),
    is_system_default   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_device_type_code ON device_type (code) WHERE deleted_at IS NULL;

-- ──────────────────────────────────────────────
-- 5. IoT 기기 (DEVICE)
-- ──────────────────────────────────────────────

CREATE TABLE device (
    device_id       BIGSERIAL       PRIMARY KEY,
    space_id        BIGINT          NOT NULL REFERENCES space(space_id),
    device_type_id  BIGINT          NOT NULL REFERENCES device_type(device_type_id),
    name            VARCHAR(100)    NOT NULL,
    model_name      VARCHAR(100),
    mock_endpoint   VARCHAR(500),
    status          VARCHAR(15)     NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'ERROR')),
    current_state   JSONB           DEFAULT '{}',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    installed_at    TIMESTAMPTZ,
    last_online_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_device_space_active ON device (space_id, is_active);
CREATE INDEX idx_device_type ON device (device_type_id);

-- ──────────────────────────────────────────────
-- 6. 계약 (CONTRACT) - BOOKING 합병
-- ──────────────────────────────────────────────

CREATE TABLE contract (
    contract_id     BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(user_id),
    space_id        BIGINT          NOT NULL REFERENCES space(space_id),
    origin          VARCHAR(20)     NOT NULL CHECK (origin IN ('USER_INITIATED', 'ADMIN_INITIATED')),
    status          VARCHAR(15)     NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ACTIVE', 'EXPIRED', 'TERMINATED')),
    
    -- 신청 정보 (유저 신청 시)
    address         VARCHAR(500),
    bank_account    VARCHAR(100),
    desired_start_date      DATE,
    desired_duration_months INTEGER,
    contract_language       VARCHAR(5)      DEFAULT 'KO' CHECK (contract_language IN ('KO', 'EN')),
    privacy_agreed          BOOLEAN         DEFAULT FALSE,
    request_note            TEXT,
    
    -- 최종 계약 정보
    start_date      DATE,
    end_date        DATE,
    monthly_rent    NUMERIC(15, 0),
    deposit         NUMERIC(15, 0),
    special_terms   TEXT,
    
    approved_by     BIGINT          REFERENCES users(user_id),
    rejected_reason TEXT,
    contracted_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- Partial Unique Index: 한 호실에 하나의 ACTIVE 계약만 가능
CREATE UNIQUE INDEX uq_active_contract_per_space ON contract (space_id) 
    WHERE status = 'ACTIVE' AND deleted_at IS NULL;

CREATE INDEX idx_contract_user_status ON contract (user_id, status);
CREATE INDEX idx_contract_space_status ON contract (space_id, status);

-- ──────────────────────────────────────────────
-- 7. 시설 예약 (RESERVATION)
-- ──────────────────────────────────────────────

CREATE TABLE reservation (
    reservation_id      BIGSERIAL       PRIMARY KEY,
    user_id             BIGINT          NOT NULL REFERENCES users(user_id),
    space_id            BIGINT          NOT NULL REFERENCES space(space_id),
    status              VARCHAR(15)     NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'CANCELLED', 'COMPLETED')),
    reservation_date    DATE            NOT NULL,
    start_time          TIME            NOT NULL,
    end_time            TIME            NOT NULL,
    approved_by         BIGINT          REFERENCES users(user_id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT chk_reservation_time CHECK (end_time > start_time)
);

-- 예약 시간대 중복 방지 (ERD §7 비즈니스 규칙 #10)
-- 동일 시설, 동일 날짜에 APPROVED 상태인 예약의 시간대가 겹칠 수 없음
ALTER TABLE reservation ADD CONSTRAINT excl_reservation_overlap
    EXCLUDE USING gist (
        space_id WITH =,
        reservation_date WITH =,
        tsrange(
            ('2000-01-01'::date + start_time)::timestamp,
            ('2000-01-01'::date + end_time)::timestamp
        ) WITH &&
    ) WHERE (status = 'APPROVED' AND deleted_at IS NULL);

CREATE INDEX idx_reservation_space_date_status ON reservation (space_id, reservation_date, status);
CREATE INDEX idx_reservation_user_status ON reservation (user_id, status);

-- ──────────────────────────────────────────────
-- 8. IoT 제어 이력 (CONTROL_LOG)
-- ──────────────────────────────────────────────

CREATE TABLE control_log (
    control_log_id  BIGSERIAL       PRIMARY KEY,
    device_id       BIGINT          NOT NULL REFERENCES device(device_id),
    user_id         BIGINT          NOT NULL REFERENCES users(user_id),
    actor_type      VARCHAR(10)     NOT NULL CHECK (actor_type IN ('RESIDENT', 'ADMIN')),
    command         VARCHAR(50)     NOT NULL,
    command_params  JSONB           DEFAULT '{}',
    result          VARCHAR(10)     NOT NULL CHECK (result IN ('SUCCESS', 'FAILURE')),
    error_message   TEXT,
    correlation_id  VARCHAR(100),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_control_log_user_created ON control_log (user_id, created_at);
CREATE INDEX idx_control_log_device_created ON control_log (device_id, created_at);

-- ──────────────────────────────────────────────
-- 9. 결제 (PAYMENT)
-- ──────────────────────────────────────────────

CREATE TABLE payment (
    payment_id      BIGSERIAL       PRIMARY KEY,
    contract_id     BIGINT          REFERENCES contract(contract_id),
    reservation_id  BIGINT          REFERENCES reservation(reservation_id),
    user_id         BIGINT          NOT NULL REFERENCES users(user_id),
    type            VARCHAR(15)     NOT NULL CHECK (type IN ('RENT', 'MAINTENANCE', 'FACILITY')),
    amount          NUMERIC(15, 0)  NOT NULL,
    status          VARCHAR(10)     NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PENDING', 'PAID')),
    payment_method  VARCHAR(20)     CHECK (payment_method IN ('CARD', 'TRANSFER', 'CASH')),
    billing_date    DATE            NOT NULL,
    paid_date       DATE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    
    -- contract_id 또는 reservation_id 중 하나는 있어야 함
    CONSTRAINT chk_payment_ref CHECK (
        (type IN ('RENT', 'MAINTENANCE') AND contract_id IS NOT NULL) OR
        (type = 'FACILITY' AND reservation_id IS NOT NULL)
    )
);

CREATE INDEX idx_payment_contract_status ON payment (contract_id, status);
CREATE INDEX idx_payment_reservation_status ON payment (reservation_id, status);
CREATE INDEX idx_payment_user_status ON payment (user_id, status);

-- ──────────────────────────────────────────────
-- 10. 커뮤니티 게시글 (POST)
-- ──────────────────────────────────────────────

CREATE TABLE post (
    post_id         BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(user_id),
    category        VARCHAR(15)     NOT NULL CHECK (category IN ('NOTICE', 'QUESTION', 'SUGGESTION', 'MEETUP', 'FREE')),
    title           VARCHAR(100)    NOT NULL,
    content         TEXT            NOT NULL,
    attachments     JSONB           DEFAULT '[]',
    links           JSONB           DEFAULT '[]',
    view_count      INTEGER         NOT NULL DEFAULT 0,
    like_count      INTEGER         NOT NULL DEFAULT 0,
    comment_count   INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_post_user ON post (user_id);
CREATE INDEX idx_post_category_created ON post (category, created_at);

-- ──────────────────────────────────────────────
-- 11. 게시글 좋아요 (POST_LIKE)
-- ──────────────────────────────────────────────

CREATE TABLE post_like (
    post_like_id    BIGSERIAL       PRIMARY KEY,
    post_id         BIGINT          NOT NULL REFERENCES post(post_id),
    user_id         BIGINT          NOT NULL REFERENCES users(user_id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_post_like ON post_like (post_id, user_id) WHERE deleted_at IS NULL;

-- ──────────────────────────────────────────────
-- 12. 댓글 (COMMENT)
-- ──────────────────────────────────────────────

CREATE TABLE comment (
    comment_id      BIGSERIAL       PRIMARY KEY,
    post_id         BIGINT          NOT NULL REFERENCES post(post_id),
    user_id         BIGINT          NOT NULL REFERENCES users(user_id),
    content         TEXT            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_comment_post ON comment (post_id);

-- ──────────────────────────────────────────────
-- 13. 민원 / VoC (VOC)
-- ──────────────────────────────────────────────

CREATE TABLE voc (
    voc_id          BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(user_id),
    category        VARCHAR(20)     NOT NULL CHECK (category IN ('FACILITY', 'NOISE', 'DEVICE', 'OTHER')),
    title           VARCHAR(200)    NOT NULL,
    content         TEXT            NOT NULL,
    attachments     JSONB           DEFAULT '[]',
    status          VARCHAR(15)     NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
    admin_reply     TEXT,
    reply_user_id   BIGINT          REFERENCES users(user_id),
    replied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_voc_user_status ON voc (user_id, status);

-- ──────────────────────────────────────────────
-- 14. 알림 (NOTIFICATION)
-- ──────────────────────────────────────────────

CREATE TABLE notification (
    notification_id BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(user_id),
    type            VARCHAR(30)     NOT NULL CHECK (type IN (
                        'CONTRACT_APPROVED', 'CONTRACT_REJECTED', 'CONTRACT_ACTIVATED',
                        'CONTRACT_EXPIRED', 'RESERVATION_APPROVED', 'VOC_REPLIED'
                    )),
    title           VARCHAR(200)    NOT NULL,
    message         TEXT            NOT NULL,
    reference_type  VARCHAR(20)     CHECK (reference_type IN ('CONTRACT', 'RESERVATION', 'VOC')),
    reference_id    BIGINT,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_notification_user_read_created ON notification (user_id, is_read, created_at);

-- ──────────────────────────────────────────────
-- 15. 역할 변경 이력 (ROLE_CHANGE_LOG)
-- ──────────────────────────────────────────────

CREATE TABLE role_change_log (
    role_change_log_id BIGSERIAL       PRIMARY KEY,
    user_id            BIGINT          NOT NULL REFERENCES users(user_id),
    old_role           VARCHAR(20)     NOT NULL CHECK (old_role IN ('USER', 'RESIDENT', 'ADMIN')),
    new_role           VARCHAR(20)     NOT NULL CHECK (new_role IN ('USER', 'RESIDENT', 'ADMIN')),
    reason             VARCHAR(255),
    contract_id        BIGINT          REFERENCES contract(contract_id),
    changed_by         BIGINT          REFERENCES users(user_id),
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);

-- ──────────────────────────────────────────────
-- 16. 리프레시 토큰 (REFRESH_TOKEN)
-- ──────────────────────────────────────────────

CREATE TABLE refresh_token (
    refresh_token_id  BIGSERIAL       PRIMARY KEY,
    user_id           BIGINT          NOT NULL REFERENCES users(user_id),
    token             VARCHAR(500)    NOT NULL,
    expires_at        TIMESTAMPTZ     NOT NULL,
    is_revoked        BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_refresh_token ON refresh_token (token) WHERE deleted_at IS NULL;
CREATE INDEX idx_refresh_token_user ON refresh_token (user_id);

-- ──────────────────────────────────────────────
-- 17. 토큰 블랙리스트 (TOKEN_BLACKLIST)
-- ──────────────────────────────────────────────

CREATE TABLE token_blacklist (
    token_blacklist_id  BIGSERIAL       PRIMARY KEY,
    token_jti           VARCHAR(255)    NOT NULL,
    expires_at          TIMESTAMPTZ     NOT NULL,
    reason              VARCHAR(255),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_token_blacklist_jti ON token_blacklist (token_jti) WHERE deleted_at IS NULL;
CREATE INDEX idx_token_blacklist_expires ON token_blacklist (expires_at);

-- ============================================================
-- 초기 데이터 (Seed Data)
-- ============================================================

-- 기기 종류 기본값
INSERT INTO device_type (code, name, commands, ui_type, is_system_default) VALUES
    ('DOOR_LOCK',       '스마트도어락',   '["LOCK", "UNLOCK"]'::jsonb,                                    'toggle',               TRUE),
    ('WASHER',          '스마트세탁기',   '["START", "STOP"]'::jsonb,                                     'button',               TRUE),
    ('DRYER',           '스마트건조기',   '["START", "STOP"]'::jsonb,                                     'button',               TRUE),
    ('LIGHT',           '스마트조명',     '["TURN_ON", "TURN_OFF", "SET_BRIGHTNESS"]'::jsonb,              'toggle_slider',        TRUE),
    ('AIR_CONDITIONER', '스마트에어컨',   '["TURN_ON", "TURN_OFF", "SET_TEMP", "SET_MODE"]'::jsonb,       'toggle_slider_select', TRUE),
    ('HEATER',          '스마트난방',     '["TURN_ON", "TURN_OFF", "SET_TEMP"]'::jsonb,                   'toggle_slider',        TRUE),
    ('CCTV',            '스마트CCTV',     '["TURN_ON", "TURN_OFF"]'::jsonb,                               'toggle',               TRUE);

-- 관리자 기본 계정 (비밀번호: admin123!)
-- BCrypt 해시: https://bcrypt-generator.com/ 등으로 생성
INSERT INTO users (login_id, password_hash, name, birth_date, gender, nationality, phone, email, role, status)
VALUES ('admin', '$2a$10$x8KrJqhWEzJSQ5UH2FE0CeZvJmME7qHK3DECP3QnOsW4Yv5YVkqKa', '관리자', '900101', 'MALE', '대한민국', '010-0000-0000', 'admin@coliving.com', 'ADMIN', 'ACTIVE');

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

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;
