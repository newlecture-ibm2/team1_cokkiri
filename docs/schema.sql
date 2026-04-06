-- PostgreSQL 기준 DDL 스크립트 (schema.sql)
-- CoLiving IoT 플랫폼 v2.0
-- .antigravity/rules/erd.md 기반

-- 기존 테이블 삭제 (외래 키 제약 조건 무시)
DROP TABLE IF EXISTS TOKEN_BLACKLIST CASCADE;
DROP TABLE IF EXISTS REFRESH_TOKEN CASCADE;
DROP TABLE IF EXISTS ROLE_CHANGE_LOG CASCADE;
DROP TABLE IF EXISTS NOTIFICATION CASCADE;
DROP TABLE IF EXISTS VOC CASCADE;
DROP TABLE IF EXISTS COMMENT CASCADE;
DROP TABLE IF EXISTS POST_LIKE CASCADE;
DROP TABLE IF EXISTS POST CASCADE;
DROP TABLE IF EXISTS PAYMENT CASCADE;
DROP TABLE IF EXISTS CONTROL_LOG CASCADE;
DROP TABLE IF EXISTS RESERVATION CASCADE;
DROP TABLE IF EXISTS CONTRACT CASCADE;
DROP TABLE IF EXISTS DEVICE CASCADE;
DROP TABLE IF EXISTS DEVICE_TYPE CASCADE;
DROP TABLE IF EXISTS SPACE_IMAGE CASCADE;
DROP TABLE IF EXISTS COMMON_SPACE_DETAIL CASCADE;
DROP TABLE IF EXISTS PRIVATE_SPACE_DETAIL CASCADE;
DROP TABLE IF EXISTS SPACE CASCADE;
DROP TABLE IF EXISTS USERS CASCADE;

-- 사용자 (USERS)
CREATE TABLE USERS (
    user_id BIGSERIAL PRIMARY KEY,
    login_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    birth_date VARCHAR(6) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE')),
    nationality VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'RESIDENT', 'ADMIN')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'DEACTIVATED')),
    profile_image VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_users_login_id ON USERS (login_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON USERS (role);
CREATE INDEX idx_users_email ON USERS (email);

-- 공간 부모 테이블 (SPACE)
CREATE TABLE SPACE (
    space_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PRIVATE', 'COMMON')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
    floor INTEGER NOT NULL,
    area NUMERIC(10,2) NOT NULL,
    amenities JSONB,
    description TEXT,
    position_x INTEGER,
    position_y INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_space_name ON SPACE (name) WHERE deleted_at IS NULL;
CREATE INDEX idx_space_type_status ON SPACE (type, status);
CREATE INDEX idx_space_floor ON SPACE (floor);

-- 개인 공간 상세 (PRIVATE_SPACE_DETAIL)
CREATE TABLE PRIVATE_SPACE_DETAIL (
    space_id BIGINT PRIMARY KEY REFERENCES SPACE(space_id) ON DELETE CASCADE,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('SINGLE', 'DOUBLE', 'STUDIO', 'SUITE')),
    room_count INTEGER NOT NULL,
    bathroom_count INTEGER NOT NULL,
    direction VARCHAR(20),
    deposit NUMERIC(12,0) NOT NULL,
    monthly_rent NUMERIC(12,0) NOT NULL,
    maintenance_fee NUMERIC(12,0) NOT NULL,
    parking_available BOOLEAN NOT NULL DEFAULT false
);

-- 공용 공간 상세 (COMMON_SPACE_DETAIL)
CREATE TABLE COMMON_SPACE_DETAIL (
    space_id BIGINT PRIMARY KEY REFERENCES SPACE(space_id) ON DELETE CASCADE,
    max_capacity INTEGER NOT NULL,
    operating_hours VARCHAR(50) NOT NULL,
    is_reservable BOOLEAN NOT NULL DEFAULT false,
    usage_fee NUMERIC(10,0) NOT NULL DEFAULT 0
);

-- 공간 이미지 (SPACE_IMAGE)
CREATE TABLE SPACE_IMAGE (
    space_image_id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES SPACE(space_id),
    image_url VARCHAR(255) NOT NULL,
    image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('PHOTO', 'FLOOR_PLAN')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_thumbnail BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 기기 종류 (DEVICE_TYPE)
CREATE TABLE DEVICE_TYPE (
    device_type_id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    commands JSONB NOT NULL,
    ui_type VARCHAR(50) NOT NULL,
    is_system_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- IoT 기기 (DEVICE)
CREATE TABLE DEVICE (
    device_id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES SPACE(space_id),
    device_type_id BIGINT NOT NULL REFERENCES DEVICE_TYPE(device_type_id),
    name VARCHAR(100) NOT NULL,
    model_name VARCHAR(100),
    mac_address VARCHAR(50),
    mock_endpoint VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ONLINE', 'OFFLINE', 'ERROR')),
    current_state JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    installed_at TIMESTAMPTZ,
    last_online_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_device_space_id_is_active ON DEVICE (space_id, is_active);
CREATE INDEX idx_device_device_type_id ON DEVICE (device_type_id);
CREATE UNIQUE INDEX uk_device_mac_address ON DEVICE (mac_address) WHERE deleted_at IS NULL AND mac_address IS NOT NULL;

-- 계약 (CONTRACT)
CREATE TABLE CONTRACT (
    contract_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    space_id BIGINT NOT NULL REFERENCES SPACE(space_id),
    origin VARCHAR(20) NOT NULL CHECK (origin IN ('USER_INITIATED', 'ADMIN_INITIATED')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ACTIVE', 'EXPIRED', 'TERMINATED')),
    address VARCHAR(255),
    bank_account VARCHAR(100),
    desired_start_date DATE,
    desired_duration_months INTEGER,
    contract_language VARCHAR(10) CHECK (contract_language IN ('KO', 'EN')),
    privacy_agreed BOOLEAN,
    request_note TEXT,
    start_date DATE,
    end_date DATE,
    monthly_rent NUMERIC(12,0),
    deposit NUMERIC(12,0),
    special_terms TEXT,
    approved_by BIGINT REFERENCES USERS(user_id),
    rejected_reason TEXT,
    contracted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_contract_user_id_status ON CONTRACT (user_id, status);
CREATE INDEX idx_contract_space_id_status ON CONTRACT (space_id, status);
CREATE UNIQUE INDEX idx_contract_active_space ON CONTRACT (space_id) WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- 시설 예약 (RESERVATION)
CREATE TABLE RESERVATION (
    reservation_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    space_id BIGINT NOT NULL REFERENCES SPACE(space_id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'CANCELLED', 'COMPLETED')),
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    approved_by BIGINT REFERENCES USERS(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_reservation_space_date_status ON RESERVATION (space_id, reservation_date, status);
CREATE INDEX idx_reservation_user_status ON RESERVATION (user_id, status);

-- IoT 제어 이력 (CONTROL_LOG)
CREATE TABLE CONTROL_LOG (
    control_log_id BIGSERIAL PRIMARY KEY,
    device_id BIGINT NOT NULL REFERENCES DEVICE(device_id),
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('RESIDENT', 'ADMIN')),
    command VARCHAR(50) NOT NULL,
    command_params JSONB,
    result VARCHAR(20) NOT NULL CHECK (result IN ('SUCCESS', 'FAILURE')),
    error_message TEXT,
    correlation_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_control_log_user_id_created_at ON CONTROL_LOG (user_id, created_at);
CREATE INDEX idx_control_log_device_id_created_at ON CONTROL_LOG (device_id, created_at);

-- 결제 (PAYMENT)
CREATE TABLE PAYMENT (
    payment_id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT REFERENCES CONTRACT(contract_id),
    reservation_id BIGINT REFERENCES RESERVATION(reservation_id),
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('RENT', 'MAINTENANCE', 'FACILITY')),
    amount NUMERIC(12,0) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('UNPAID', 'PENDING', 'PAID')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('CARD', 'TRANSFER', 'CASH')),
    billing_date DATE,
    paid_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_payment_reference CHECK (
        (type IN ('RENT', 'MAINTENANCE') AND contract_id IS NOT NULL AND reservation_id IS NULL) OR
        (type = 'FACILITY' AND reservation_id IS NOT NULL AND contract_id IS NULL)
    )
);
CREATE INDEX idx_payment_contract_status ON PAYMENT (contract_id, status);
CREATE INDEX idx_payment_reservation_status ON PAYMENT (reservation_id, status);
CREATE INDEX idx_payment_user_status ON PAYMENT (user_id, status);

-- 커뮤니티 게시글 (POST)
CREATE TABLE POST (
    post_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    category VARCHAR(20) NOT NULL CHECK (category IN ('NOTICE', 'QUESTION', 'SUGGESTION', 'MEETUP', 'FREE')),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB,
    links JSONB,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_post_user_id ON POST (user_id);
CREATE INDEX idx_post_category_created_at ON POST (category, created_at);

-- 게시글 좋아요 (POST_LIKE)
CREATE TABLE POST_LIKE (
    post_like_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES POST(post_id),
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_post_like_dup ON POST_LIKE (post_id, user_id) WHERE deleted_at IS NULL;

-- 댓글 (COMMENT)
CREATE TABLE COMMENT (
    comment_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES POST(post_id),
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_comment_post_id ON COMMENT (post_id);

-- 민원 / VoC (VOC)
CREATE TABLE VOC (
    voc_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    category VARCHAR(20) NOT NULL CHECK (category IN ('FACILITY', 'NOISE', 'DEVICE', 'OTHER')),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB,
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
    admin_reply TEXT,
    reply_user_id BIGINT REFERENCES USERS(user_id),
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_voc_user_id_status ON VOC (user_id, status);

-- 알림 (NOTIFICATION)
CREATE TABLE NOTIFICATION (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('CONTRACT_APPROVED', 'CONTRACT_REJECTED', 'CONTRACT_ACTIVATED', 'CONTRACT_EXPIRED', 'RESERVATION_APPROVED', 'VOC_REPLIED')),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('CONTRACT', 'RESERVATION', 'VOC')),
    reference_id BIGINT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_notification_user_is_read_created ON NOTIFICATION (user_id, is_read, created_at);

-- 역할 변경 이력 (ROLE_CHANGE_LOG)
CREATE TABLE ROLE_CHANGE_LOG (
    role_change_log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    old_role VARCHAR(20) NOT NULL,
    new_role VARCHAR(20) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    contract_id BIGINT REFERENCES CONTRACT(contract_id),
    changed_by BIGINT REFERENCES USERS(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 리프레시 토큰 (REFRESH_TOKEN)
CREATE TABLE REFRESH_TOKEN (
    refresh_token_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES USERS(user_id),
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_refresh_token_user_id ON REFRESH_TOKEN (user_id);
CREATE UNIQUE INDEX idx_refresh_token_token ON REFRESH_TOKEN (token) WHERE deleted_at IS NULL;

-- 토큰 블랙리스트 (TOKEN_BLACKLIST)
CREATE TABLE TOKEN_BLACKLIST (
    token_blacklist_id BIGSERIAL PRIMARY KEY,
    token_jti VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_token_blacklist_token_jti ON TOKEN_BLACKLIST (token_jti) WHERE deleted_at IS NULL;
CREATE INDEX idx_token_blacklist_expires_at ON TOKEN_BLACKLIST (expires_at);
