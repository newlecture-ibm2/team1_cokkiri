-- ============================================================
-- 예약(Reservation) 모듈 로컬 테스트 시드 데이터 (수정본)
-- 변경: created_at/updated_at 명시 삽입, reservation 테이블명 동적 처리
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. 기존 구 테이블 정리
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS space_image CASCADE;
DROP TABLE IF EXISTS common_space_detail CASCADE;
DROP TABLE IF EXISTS space CASCADE;

-- ────────────────────────────────────────────────────────────
-- 1. USERS — created_at, updated_at 명시적 삽입
-- ────────────────────────────────────────────────────────────
INSERT INTO users (login_id, password_hash, name, birth_date, gender, nationality, phone, email, role, status, created_at, updated_at)
VALUES
    ('admin01',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자김철수', '900101', 'MALE',   'Korean', '010-0000-0001', 'admin@coliving.com',     'ADMIN',    'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('resident01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '입주자이영희', '950315', 'FEMALE', 'Korean', '010-1111-2222', 'resident01@coliving.com','RESIDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('resident02', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '입주자박민준', '920720', 'MALE',   'Korean', '010-3333-4444', 'resident02@coliving.com','RESIDENT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user01',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '일반유저홍길동','000101', 'MALE',   'Korean', '010-5555-6666', 'user01@coliving.com',    'USER',     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (login_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. SPACES — created_at, updated_at 명시적 삽입
-- ────────────────────────────────────────────────────────────
INSERT INTO spaces (name, type, status, floor, area, amenities, description, position_x, position_y, created_at, updated_at)
VALUES
    ('스터디룸 A',   'COMMON', 'AVAILABLE',   2,  25.0, '{"wifi":true,"projector":true,"whiteboard":true}', '최대 6인 수용 가능한 스터디룸. 화이트보드, 빔프로젝터 완비.', 10, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('세미나룸 B',   'COMMON', 'AVAILABLE',   3,  40.0, '{"wifi":true,"projector":true,"tv":true}',         '최대 10인 수용 세미나룸. 대형 스크린 및 화상회의 장비 구비.', 30, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('루프탑 라운지', 'COMMON', 'AVAILABLE',  10, 120.0, '{"wifi":true,"bbq":true,"outdoor_seating":true}', '옥상 라운지. 바비큐 시설 구비. 자유 이용 공간.',              50, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('B1 헬스장',    'COMMON', 'MAINTENANCE', -1, 200.0, '{"gym_equipment":true,"shower":true}',            '지하 1층 헬스장. 현재 장비 점검 중.',                         0,  0,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 3. COMMON_SPACE_DETAILS
-- ────────────────────────────────────────────────────────────
INSERT INTO common_space_details (space_id, max_capacity, operating_hours, is_reservable, usage_fee, created_at, updated_at)
SELECT space_id, 6,  '09:00-22:00', true,  0,     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM spaces WHERE name = '스터디룸 A'    ON CONFLICT DO NOTHING;
INSERT INTO common_space_details (space_id, max_capacity, operating_hours, is_reservable, usage_fee, created_at, updated_at)
SELECT space_id, 10, '09:00-22:00', true,  10000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM spaces WHERE name = '세미나룸 B'    ON CONFLICT DO NOTHING;
INSERT INTO common_space_details (space_id, max_capacity, operating_hours, is_reservable, usage_fee, created_at, updated_at)
SELECT space_id, 30, '00:00-24:00', false, 0,     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM spaces WHERE name = '루프탑 라운지'  ON CONFLICT DO NOTHING;
INSERT INTO common_space_details (space_id, max_capacity, operating_hours, is_reservable, usage_fee, created_at, updated_at)
SELECT space_id, 50, '06:00-23:00', false, 0,     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM spaces WHERE name = 'B1 헬스장'      ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 4. SPACE_IMAGES — created_at, updated_at 명시적 삽입
-- ────────────────────────────────────────────────────────────
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT space_id, 'https://picsum.photos/seed/studyA1/800/600',  'PHOTO', 1, true,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM spaces WHERE name = '스터디룸 A'   ON CONFLICT DO NOTHING;
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT space_id, 'https://picsum.photos/seed/studyA2/800/600',  'PHOTO', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM spaces WHERE name = '스터디룸 A'   ON CONFLICT DO NOTHING;
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT space_id, 'https://picsum.photos/seed/semB1/800/600',    'PHOTO', 1, true,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM spaces WHERE name = '세미나룸 B'   ON CONFLICT DO NOTHING;
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT space_id, 'https://picsum.photos/seed/rooftop1/800/600', 'PHOTO', 1, true,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM spaces WHERE name = '루프탑 라운지' ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 5. RESERVATIONS
-- ⚠️ 이 테이블은 Spring Boot 앱 기동 시 JPA가 자동 생성합니다.
--    앱을 먼저 실행한 뒤 아래 INSERT를 실행하세요.
-- ────────────────────────────────────────────────────────────

-- [오늘] 스터디룸 A 10:00-12:00 / resident01 → APPROVED (관리자 admin01 승인)
INSERT INTO reservation (user_id, space_id, status, reservation_date, start_time, end_time, approved_by, created_at, updated_at)
SELECT u.user_id, s.space_id, 'APPROVED', CURRENT_DATE, '10:00', '12:00', a.user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u, spaces s, users a
WHERE u.login_id = 'resident01' AND s.name = '스터디룸 A' AND a.login_id = 'admin01';

-- [오늘] 스터디룸 A 14:00-16:00 / resident02 → PENDING (충돌 테스트: 다른 시간대라 OK)
INSERT INTO reservation (user_id, space_id, status, reservation_date, start_time, end_time, created_at, updated_at)
SELECT u.user_id, s.space_id, 'PENDING', CURRENT_DATE, '14:00', '16:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u, spaces s
WHERE u.login_id = 'resident02' AND s.name = '스터디룸 A';

-- [오늘] 세미나룸 B 10:00-12:00 / resident01 → APPROVED
INSERT INTO reservation (user_id, space_id, status, reservation_date, start_time, end_time, approved_by, created_at, updated_at)
SELECT u.user_id, s.space_id, 'APPROVED', CURRENT_DATE, '10:00', '12:00', a.user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u, spaces s, users a
WHERE u.login_id = 'resident01' AND s.name = '세미나룸 B' AND a.login_id = 'admin01';

-- [어제] 스터디룸 A 09:00-11:00 / resident01 → CANCELLED
INSERT INTO reservation (user_id, space_id, status, reservation_date, start_time, end_time, created_at, updated_at)
SELECT u.user_id, s.space_id, 'CANCELLED', CURRENT_DATE - INTERVAL '1 day', '09:00', '11:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u, spaces s
WHERE u.login_id = 'resident01' AND s.name = '스터디룸 A';

-- [3일 전] 세미나룸 B 13:00-15:00 / resident02 → COMPLETED
INSERT INTO reservation (user_id, space_id, status, reservation_date, start_time, end_time, approved_by, created_at, updated_at)
SELECT u.user_id, s.space_id, 'COMPLETED', CURRENT_DATE - INTERVAL '3 days', '13:00', '15:00', a.user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u, spaces s, users a
WHERE u.login_id = 'resident02' AND s.name = '세미나룸 B' AND a.login_id = 'admin01';

-- [D+2일] 스터디룸 A 15:00-17:00 / resident01 → PENDING (미래 예약)
INSERT INTO reservation (user_id, space_id, status, reservation_date, start_time, end_time, created_at, updated_at)
SELECT u.user_id, s.space_id, 'PENDING', CURRENT_DATE + INTERVAL '2 days', '15:00', '17:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u, spaces s
WHERE u.login_id = 'resident01' AND s.name = '스터디룸 A';

-- ────────────────────────────────────────────────────────────
-- 확인 쿼리
-- ────────────────────────────────────────────────────────────
-- SELECT u.login_id, u.role, s.name, r.status, r.reservation_date, r.start_time, r.end_time
-- FROM reservations r
-- JOIN users u ON r.user_id = u.user_id
-- JOIN spaces s ON r.space_id = s.space_id
-- ORDER BY r.reservation_date, r.start_time;
