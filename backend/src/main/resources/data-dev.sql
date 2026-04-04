-- ============================================================
-- CoLiving 개발환경 시드 데이터 (data-dev.sql)
-- ============================================================
-- Docker PostgreSQL 환경(SPRING_PROFILES_ACTIVE=dev)에서 Spring이 자동 실행합니다.
-- 테이블은 Hibernate ddl-auto: update 가 JPA Entity 기반으로 생성합니다.
-- 이 파일은 운영 데이터가 아닌 개발/테스트 편의용 데이터만 포함합니다.
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. 시스템 필수 데이터 (배포 시에도 필요)
-- ──────────────────────────────────────────────

-- 관리자 기본 계정 (비밀번호: admin123!)
INSERT INTO users (login_id, password_hash, name, birth_date, gender, nationality, phone, email, role, status)
SELECT 'admin', '$2a$10$x8KrJqhWEzJSQ5UH2FE0CeZvJmME7qHK3DECP3QnOsW4Yv5YVkqKa',
       '관리자', '900101', 'MALE', '대한민국', '010-0000-0000', 'admin@coliving.com', 'ADMIN', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE login_id = 'admin');

-- 기기 타입 기본값
INSERT INTO device_type (code, name, commands, ui_type, is_system_default)
SELECT v.code, v.name, v.commands::jsonb, v.ui_type, TRUE
FROM (VALUES
    ('DOOR_LOCK',       '스마트도어락',   '["LOCK", "UNLOCK"]',                              'toggle'),
    ('WASHER',          '스마트세탁기',   '["START", "STOP"]',                               'button'),
    ('DRYER',           '스마트건조기',   '["START", "STOP"]',                               'button'),
    ('LIGHT',           '스마트조명',     '["TURN_ON", "TURN_OFF", "SET_BRIGHTNESS"]',        'toggle_slider'),
    ('AIR_CONDITIONER', '스마트에어컨',   '["TURN_ON", "TURN_OFF", "SET_TEMP", "SET_MODE"]', 'toggle_slider_select'),
    ('HEATER',          '스마트난방',     '["TURN_ON", "TURN_OFF", "SET_TEMP"]',             'toggle_slider'),
    ('CCTV',            '스마트CCTV',     '["TURN_ON", "TURN_OFF"]',                         'toggle')
) AS v(code, name, commands, ui_type)
WHERE NOT EXISTS (SELECT 1 FROM device_type WHERE code = v.code);

-- ──────────────────────────────────────────────
-- 2. 테스트용 입주자 계정
-- ──────────────────────────────────────────────

-- 입주자1 (비밀번호: user1234!)
INSERT INTO users (login_id, password_hash, name, birth_date, gender, nationality, phone, email, role, status)
SELECT 'resident01', '$2a$10$x8KrJqhWEzJSQ5UH2FE0CeZvJmME7qHK3DECP3QnOsW4Yv5YVkqKa',
       '김입주', '950315', 'MALE', '대한민국', '010-1111-2222', 'resident01@coliving.com', 'RESIDENT', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE login_id = 'resident01');

-- 입주자2
INSERT INTO users (login_id, password_hash, name, birth_date, gender, nationality, phone, email, role, status)
SELECT 'resident02', '$2a$10$x8KrJqhWEzJSQ5UH2FE0CeZvJmME7qHK3DECP3QnOsW4Yv5YVkqKa',
       '이거주', '980720', 'FEMALE', '대한민국', '010-3333-4444', 'resident02@coliving.com', 'RESIDENT', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE login_id = 'resident02');

-- ──────────────────────────────────────────────
-- 3. 개인 공간 (PRIVATE) — 방 5개
-- ──────────────────────────────────────────────

INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at)
SELECT '301호', 'PRIVATE', 'AVAILABLE', 3, 25.0, '["에어컨","냉장고"]', '남향 채광 좋은 싱글룸', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE name = '301호');

INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at)
SELECT '302호', 'PRIVATE', 'AVAILABLE', 3, 30.0, '["에어컨","세탁기","냉장고"]', '복층 구조 더블룸', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE name = '302호');

INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at)
SELECT '401호', 'PRIVATE', 'AVAILABLE', 4, 20.0, '["에어컨"]', '깔끔한 스튜디오', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE name = '401호');

INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at)
SELECT '402호', 'PRIVATE', 'OCCUPIED', 4, 28.0, '["에어컨","냉장고","Wi-Fi"]', '현재 입주 중인 방', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE name = '402호');

INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at)
SELECT '501호', 'PRIVATE', 'AVAILABLE', 5, 35.0, '["에어컨","세탁기","냉장고","TV","주차"]', '프리미엄 스위트룸', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE name = '501호');

-- 개인 공간 상세
INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'SINGLE', 1, 1, '남향', 5000000, 500000, 50000, true, now(), now()
FROM spaces s WHERE s.name = '301호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'DOUBLE', 2, 1, '동향', 8000000, 700000, 60000, true, now(), now()
FROM spaces s WHERE s.name = '302호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'STUDIO', 1, 1, '서향', 3000000, 400000, 40000, false, now(), now()
FROM spaces s WHERE s.name = '401호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'SINGLE', 1, 1, '남향', 6000000, 550000, 55000, true, now(), now()
FROM spaces s WHERE s.name = '402호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'SUITE', 2, 2, '남동향', 15000000, 1200000, 100000, true, now(), now()
FROM spaces s WHERE s.name = '501호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

-- ──────────────────────────────────────────────
-- 4. 공용 공간 (COMMON) — 시설 3개
-- ──────────────────────────────────────────────

INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at)
SELECT '메인 로비 미팅룸', 'COMMON', 'AVAILABLE', 1, 30.5, '["Wi-Fi","TV"]', '공용 로비에 위치한 6인 회의실', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE name = '메인 로비 미팅룸');

INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at)
SELECT '루프탑 파티룸', 'COMMON', 'AVAILABLE', 10, 100.0, '[]', '바비큐 및 파티 가능한 루프탑', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE name = '루프탑 파티룸');

INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at)
SELECT 'B1 헬스장', 'COMMON', 'AVAILABLE', -1, 300.0, '[]', '24시간 무인 헬스장', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE name = 'B1 헬스장');

-- 공용 공간 상세
INSERT INTO common_space_details (space_id, max_capacity, operating_hours, is_reservable, usage_fee, created_at, updated_at)
SELECT s.space_id, 6, '09:00~22:00', true, 0, now(), now()
FROM spaces s WHERE s.name = '메인 로비 미팅룸' AND NOT EXISTS (SELECT 1 FROM common_space_details WHERE space_id = s.space_id);

INSERT INTO common_space_details (space_id, max_capacity, operating_hours, is_reservable, usage_fee, created_at, updated_at)
SELECT s.space_id, 20, '12:00~23:00', true, 50000, now(), now()
FROM spaces s WHERE s.name = '루프탑 파티룸' AND NOT EXISTS (SELECT 1 FROM common_space_details WHERE space_id = s.space_id);

INSERT INTO common_space_details (space_id, max_capacity, operating_hours, is_reservable, usage_fee, created_at, updated_at)
SELECT s.space_id, 50, '00:00~24:00', false, 0, now(), now()
FROM spaces s WHERE s.name = 'B1 헬스장' AND NOT EXISTS (SELECT 1 FROM common_space_details WHERE space_id = s.space_id);
