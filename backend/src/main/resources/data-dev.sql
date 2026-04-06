-- ============================================================
-- Space 도메인 시드 데이터 (data-dev.sql)
-- ============================================================
-- 동일 내용은 com.coliving.global.config.DataInitializer.seedSpacesFromDevDataset() 에서 적재합니다.
-- application-dev.yml 의 spring.sql.init 은 비활성화되어 있으며, 이 스크립트는 수동·참고용입니다.
-- Docker PostgreSQL 환경에서 수동 실행 시 테이블은 Hibernate ddl-auto 등으로 먼저 존재해야 합니다.
-- 테이블은 Hibernate ddl-auto: update 가 JPA Entity 기반으로 생성합니다.
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. 개인 공간 (PRIVATE) — 방 5개
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
-- 2. 공용 공간 (COMMON) — 시설 3개
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

-- ──────────────────────────────────────────────
-- 3. 공간 이미지 (SPACE_IMAGE)
-- ──────────────────────────────────────────────

-- 301호 이미지
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/room301a/800/600', 'PHOTO', 1, true, now(), now()
FROM spaces s WHERE s.name = '301호' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 1);

INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/room301b/800/600', 'PHOTO', 2, false, now(), now()
FROM spaces s WHERE s.name = '301호' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 2);

-- 302호 이미지
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/room302a/800/600', 'PHOTO', 1, true, now(), now()
FROM spaces s WHERE s.name = '302호' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 1);

-- 401호 이미지
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/room401a/800/600', 'PHOTO', 1, true, now(), now()
FROM spaces s WHERE s.name = '401호' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 1);

-- 402호 이미지
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/room402a/800/600', 'PHOTO', 1, true, now(), now()
FROM spaces s WHERE s.name = '402호' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 1);

-- 501호 이미지
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/room501a/800/600', 'PHOTO', 1, true, now(), now()
FROM spaces s WHERE s.name = '501호' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 1);

INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/room501b/800/600', 'PHOTO', 2, false, now(), now()
FROM spaces s WHERE s.name = '501호' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 2);

INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/room501fp/800/600', 'FLOOR_PLAN', 3, false, now(), now()
FROM spaces s WHERE s.name = '501호' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 3);

-- 메인 로비 미팅룸 이미지
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/lobby/800/600', 'PHOTO', 1, true, now(), now()
FROM spaces s WHERE s.name = '메인 로비 미팅룸' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 1);

-- 루프탑 파티룸 이미지
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/rooftop/800/600', 'PHOTO', 1, true, now(), now()
FROM spaces s WHERE s.name = '루프탑 파티룸' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 1);

-- B1 헬스장 이미지
INSERT INTO space_images (space_id, image_url, image_type, sort_order, is_thumbnail, created_at, updated_at)
SELECT s.space_id, 'https://picsum.photos/seed/gym/800/600', 'PHOTO', 1, true, now(), now()
FROM spaces s WHERE s.name = 'B1 헬스장' AND NOT EXISTS (SELECT 1 FROM space_images si WHERE si.space_id = s.space_id AND si.sort_order = 1);
