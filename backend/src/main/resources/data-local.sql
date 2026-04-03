-- 임시 시설 스키마 생성 (Space 파트 미구현으로 인한 로컬 프론트 테스트용)
CREATE TABLE IF NOT EXISTS space (
    space_id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50),
    status VARCHAR(50),
    floor INT,
    area DECIMAL(10,2),
    amenities VARCHAR(255),
    description VARCHAR(255),
    position_x INT,
    position_y INT,
    deleted_at TIMESTAMP
);

-- 임시 유저 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT PRIMARY KEY,
    login_id VARCHAR(50),
    name VARCHAR(50),
    password_hash VARCHAR(255),
    birth_date VARCHAR(6),
    gender VARCHAR(10),
    nationality VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    role VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common_space_detail (
    space_id BIGINT PRIMARY KEY,
    max_capacity INT,
    operating_hours VARCHAR(255),
    usage_fee DECIMAL(10,2),
    is_reservable BOOLEAN
);

CREATE TABLE IF NOT EXISTS space_image (
    space_image_id BIGINT PRIMARY KEY,
    space_id BIGINT,
    image_url VARCHAR(255),
    image_type VARCHAR(50),
    sort_order INT,
    is_thumbnail BOOLEAN,
    deleted_at TIMESTAMP
);

-- ====================================================

-- 데이터 삽입
-- 1. 테스트 유저
INSERT INTO users (user_id, login_id, name, password_hash, birth_date, gender, nationality, phone, email, role, status, created_at, updated_at)
VALUES (1, 'tester', '테스터', 'hash', '900101', 'MALE', 'KR', '010-1234-5678', 'test@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id) DO NOTHING;

-- 1. 메인 로비 미팅룸 (예약 가능)
INSERT INTO space (space_id, name, type, status, floor, area, description, position_x, position_y) 
VALUES (1, '메인 로비 미팅룸', 'COMMON', 'AVAILABLE', 1, 30.5, '공용 공간 로비에 위치한 회의실입니다.', 10, 20);

INSERT INTO common_space_detail (space_id, max_capacity, operating_hours, usage_fee, is_reservable) 
VALUES (1, 6, '09:00~22:00', 0, TRUE);

INSERT INTO space_image (space_image_id, space_id, image_url, image_type, sort_order, is_thumbnail) 
VALUES (1, 1, 'https://example.com/meeting1.jpg', 'PHOTO', 1, TRUE);

-- 2. 루프탑 파티룸 (예약 가능)
INSERT INTO space (space_id, name, type, status, floor, area, description, position_x, position_y) 
VALUES (2, '루프탑 파티룸', 'COMMON', 'AVAILABLE', 10, 100.0, '바비큐 및 루프탑 파티룸', 50, 50);

INSERT INTO common_space_detail (space_id, max_capacity, operating_hours, usage_fee, is_reservable) 
VALUES (2, 20, '12:00~23:00', 50000, TRUE);

-- 3. B1 헬스장 (예약 불가 예시용)
INSERT INTO space (space_id, name, type, status, floor, area, description, position_x, position_y) 
VALUES (3, 'B1 헬스장', 'COMMON', 'AVAILABLE', -1, 300.0, '24시간 무인 헬스장', 0, 0);

INSERT INTO common_space_detail (space_id, max_capacity, operating_hours, usage_fee, is_reservable) 
VALUES (3, 50, '00:00~24:00', 0, FALSE);
