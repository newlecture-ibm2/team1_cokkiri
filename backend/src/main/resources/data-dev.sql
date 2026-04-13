-- ============================================================
-- Space 도메인 시드 데이터 (data-dev.sql)
-- ============================================================
-- 동일 내용은 com.coliving.global.config.DataInitializer.seedSpacesFromDevDataset() 에서 적재합니다.
-- application-dev.yml 의 spring.sql.init 은 비활성화되어 있으며, 이 스크립트는 수동·참고용입니다.
-- Docker PostgreSQL 환경에서 수동 실행 시 테이블은 Hibernate ddl-auto 등으로 먼저 존재해야 합니다.
-- 테이블은 Hibernate ddl-auto: update 가 JPA Entity 기반으로 생성합니다.
-- ============================================================

-- ──────────────────────────────────────────────
-- 0. 방 유형 마스터 데이터 (ROOM_TYPES)
-- ──────────────────────────────────────────────

INSERT INTO room_types (code, name, is_system_default, created_at, updated_at)
SELECT 'SINGLE', '싱글룸', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM room_types WHERE code = 'SINGLE');

INSERT INTO room_types (code, name, is_system_default, created_at, updated_at)
SELECT 'DOUBLE', '더블룸', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM room_types WHERE code = 'DOUBLE');

INSERT INTO room_types (code, name, is_system_default, created_at, updated_at)
SELECT 'STUDIO', '스튜디오', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM room_types WHERE code = 'STUDIO');

INSERT INTO room_types (code, name, is_system_default, created_at, updated_at)
SELECT 'SUITE', '스위트룸', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM room_types WHERE code = 'SUITE');

-- ──────────────────────────────────────────────
-- 0-1. 어노테이션 유형 마스터 데이터 (ANNOTATION_TYPES)
-- ──────────────────────────────────────────────

INSERT INTO annotation_types (code, name, icon_name, default_color, is_system_default, created_at, updated_at)
SELECT 'DOOR', '출입문', 'DoorOpen', 'primary', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM annotation_types WHERE code = 'DOOR');

INSERT INTO annotation_types (code, name, icon_name, default_color, is_system_default, created_at, updated_at)
SELECT 'STAIRS', '계단', 'ArrowUpDown', 'muted', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM annotation_types WHERE code = 'STAIRS');

INSERT INTO annotation_types (code, name, icon_name, default_color, is_system_default, created_at, updated_at)
SELECT 'ELEVATOR', '엘리베이터', 'ArrowUpSquare', 'accent', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM annotation_types WHERE code = 'ELEVATOR');

INSERT INTO annotation_types (code, name, icon_name, default_color, is_system_default, created_at, updated_at)
SELECT 'RESTROOM', '화장실', 'Bath', 'secondary', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM annotation_types WHERE code = 'RESTROOM');

INSERT INTO annotation_types (code, name, icon_name, default_color, is_system_default, created_at, updated_at)
SELECT 'GARDEN', '정원', 'TreePine', 'accent', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM annotation_types WHERE code = 'GARDEN');

INSERT INTO annotation_types (code, name, icon_name, default_color, is_system_default, created_at, updated_at)
SELECT 'CUSTOM', '기타', 'MapPin', 'primary', true, now(), now() WHERE NOT EXISTS (SELECT 1 FROM annotation_types WHERE code = 'CUSTOM');

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
INSERT INTO private_space_details (space_id, room_type_id, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, rt.room_type_id, 1, 1, '남향', 5000000, 500000, 50000, true, now(), now()
FROM spaces s 
JOIN room_types rt ON rt.code = 'SINGLE'
WHERE s.name = '301호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

INSERT INTO private_space_details (space_id, room_type_id, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, rt.room_type_id, 2, 1, '동향', 8000000, 700000, 60000, true, now(), now()
FROM spaces s 
JOIN room_types rt ON rt.code = 'DOUBLE'
WHERE s.name = '302호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

INSERT INTO private_space_details (space_id, room_type_id, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, rt.room_type_id, 1, 1, '서향', 3000000, 400000, 40000, false, now(), now()
FROM spaces s 
JOIN room_types rt ON rt.code = 'STUDIO'
WHERE s.name = '401호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

INSERT INTO private_space_details (space_id, room_type_id, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, rt.room_type_id, 1, 1, '남향', 6000000, 550000, 55000, true, now(), now()
FROM spaces s 
JOIN room_types rt ON rt.code = 'SINGLE'
WHERE s.name = '402호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

INSERT INTO private_space_details (space_id, room_type_id, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, rt.room_type_id, 2, 2, '남동향', 15000000, 1200000, 100000, true, now(), now()
FROM spaces s 
JOIN room_types rt ON rt.code = 'SUITE'
WHERE s.name = '501호' AND NOT EXISTS (SELECT 1 FROM private_space_details WHERE space_id = s.space_id);

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

-- ──────────────────────────────────────────────
-- 4. 커뮤니티/댓글/좋아요, VoC, 알림 시드
-- ──────────────────────────────────────────────
-- 주의:
-- - users 가 없으면 삽입되지 않습니다.
-- - 중복 실행해도 title 기준으로 중복 삽입을 피합니다.

-- 4-1) Community posts (posts)
INSERT INTO posts (user_id, category, title, content, attachments, links, view_count, like_count, comment_count, created_at, updated_at)
SELECT u.user_id,
       'NOTICE',
       '[시드] 공용 공간 이용 가이드',
       '<p>공용 공간 이용 시간과 정숙 규칙을 확인해 주세요.</p>',
       '[]'::jsonb,
       '[]'::jsonb,
       24,
       0,
       0,
       now() - interval '3 day',
       now() - interval '3 day'
FROM users u
WHERE u.role = 'ADMIN'
  AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.title = '[시드] 공용 공간 이용 가이드' AND p.deleted_at IS NULL)
LIMIT 1;

INSERT INTO posts (user_id, category, title, content, attachments, links, view_count, like_count, comment_count, created_at, updated_at)
SELECT u.user_id,
       'QUESTION',
       '[시드] 와이파이 비밀번호는 어디서 확인하나요?',
       '<p>입주 후 공용 와이파이 정보는 어디서 확인할 수 있나요?</p>',
       '[]'::jsonb,
       '["https://newlecture.com"]'::jsonb,
       12,
       1,
       1,
       now() - interval '2 day',
       now() - interval '2 day'
FROM users u
WHERE u.role IN ('USER', 'RESIDENT')
  AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.title = '[시드] 와이파이 비밀번호는 어디서 확인하나요?' AND p.deleted_at IS NULL)
LIMIT 1;

INSERT INTO posts (user_id, category, title, content, attachments, links, view_count, like_count, comment_count, created_at, updated_at)
SELECT u.user_id,
       'FREE',
       '[시드] 주말 보드게임 모임 하실 분?',
       '<p>이번 주말 라운지에서 가볍게 보드게임 하실 분 구합니다!</p>',
       '[]'::jsonb,
       '[]'::jsonb,
       7,
       1,
       1,
       now() - interval '1 day',
       now() - interval '1 day'
FROM users u
WHERE u.role IN ('USER', 'RESIDENT')
  AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.title = '[시드] 주말 보드게임 모임 하실 분?' AND p.deleted_at IS NULL)
LIMIT 1;

-- 4-2) Comments (comments)
INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT p.post_id,
       u.user_id,
       '저도 궁금했는데 감사합니다!',
       now() - interval '47 hour',
       now() - interval '47 hour'
FROM posts p
JOIN users u ON u.role IN ('USER', 'RESIDENT')
WHERE p.title = '[시드] 와이파이 비밀번호는 어디서 확인하나요?'
  AND NOT EXISTS (
      SELECT 1
      FROM comments c
      WHERE c.post_id = p.post_id
        AND c.content = '저도 궁금했는데 감사합니다!'
        AND c.deleted_at IS NULL
  )
LIMIT 1;

INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT p.post_id,
       u.user_id,
       '토요일 오후면 저도 참여 가능합니다.',
       now() - interval '20 hour',
       now() - interval '20 hour'
FROM posts p
JOIN users u ON u.role IN ('USER', 'RESIDENT')
WHERE p.title = '[시드] 주말 보드게임 모임 하실 분?'
  AND NOT EXISTS (
      SELECT 1
      FROM comments c
      WHERE c.post_id = p.post_id
        AND c.content = '토요일 오후면 저도 참여 가능합니다.'
        AND c.deleted_at IS NULL
  )
LIMIT 1;

-- 4-3) Likes (post_likes)
INSERT INTO post_likes (post_id, user_id, created_at, updated_at)
SELECT p.post_id, u.user_id, now() - interval '45 hour', now() - interval '45 hour'
FROM posts p
JOIN users u ON u.role IN ('USER', 'RESIDENT')
WHERE p.title = '[시드] 와이파이 비밀번호는 어디서 확인하나요?'
  AND NOT EXISTS (
      SELECT 1 FROM post_likes pl
      WHERE pl.post_id = p.post_id
        AND pl.user_id = u.user_id
        AND pl.deleted_at IS NULL
  )
LIMIT 1;

INSERT INTO post_likes (post_id, user_id, created_at, updated_at)
SELECT p.post_id, u.user_id, now() - interval '18 hour', now() - interval '18 hour'
FROM posts p
JOIN users u ON u.role IN ('USER', 'RESIDENT')
WHERE p.title = '[시드] 주말 보드게임 모임 하실 분?'
  AND NOT EXISTS (
      SELECT 1 FROM post_likes pl
      WHERE pl.post_id = p.post_id
        AND pl.user_id = u.user_id
        AND pl.deleted_at IS NULL
  )
LIMIT 1;

-- 4-4) comment_count / like_count 보정
UPDATE posts p
SET comment_count = c.cnt,
    updated_at = now()
FROM (
    SELECT post_id, COUNT(*)::int AS cnt
    FROM comments
    WHERE deleted_at IS NULL
    GROUP BY post_id
) c
WHERE p.post_id = c.post_id
  AND p.deleted_at IS NULL;

UPDATE posts p
SET like_count = l.cnt,
    updated_at = now()
FROM (
    SELECT post_id, COUNT(*)::int AS cnt
    FROM post_likes
    WHERE deleted_at IS NULL
    GROUP BY post_id
) l
WHERE p.post_id = l.post_id
  AND p.deleted_at IS NULL;

-- 4-5) VoC (vocs)
INSERT INTO vocs (user_id, category, title, content, attachments, status, admin_reply, reply_user_id, replied_at, created_at, updated_at)
SELECT u.user_id,
       'FACILITY',
       '[시드] 세탁실 건조기 점검 요청',
       '<p>3층 세탁실 건조기 한 대가 동작하지 않습니다. 점검 부탁드립니다.</p>',
       '[]'::jsonb,
       'OPEN',
       NULL,
       NULL,
       NULL,
       now() - interval '26 hour',
       now() - interval '26 hour'
FROM users u
WHERE u.role IN ('USER', 'RESIDENT')
  AND NOT EXISTS (SELECT 1 FROM vocs v WHERE v.title = '[시드] 세탁실 건조기 점검 요청' AND v.deleted_at IS NULL)
LIMIT 1;

INSERT INTO vocs (user_id, category, title, content, attachments, status, admin_reply, reply_user_id, replied_at, created_at, updated_at)
SELECT req.user_id,
       'NOISE',
       '[시드] 야간 소음 문의',
       '<p>심야 시간대 복도 소음이 있어 문의드립니다.</p>',
       '[]'::jsonb,
       'IN_PROGRESS',
       '관리자가 확인 중이며 금일 중 조치 예정입니다.',
       adm.user_id,
       now() - interval '10 hour',
       now() - interval '16 hour',
       now() - interval '10 hour'
FROM users req
JOIN users adm ON adm.role = 'ADMIN'
WHERE req.role IN ('USER', 'RESIDENT')
  AND NOT EXISTS (SELECT 1 FROM vocs v WHERE v.title = '[시드] 야간 소음 문의' AND v.deleted_at IS NULL)
LIMIT 1;

-- 4-6) Notifications (notifications)
INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id, is_read, created_at, updated_at)
SELECT v.user_id,
       'VOC_REPLIED',
       '민원 답변이 등록되었습니다.',
       '문의하신 민원에 관리자의 답변이 도착했습니다.',
       'VOC',
       v.voc_id,
       false,
       now() - interval '9 hour',
       now() - interval '9 hour'
FROM vocs v
WHERE v.title = '[시드] 야간 소음 문의'
  AND v.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM notifications n
      WHERE n.reference_type = 'VOC'
        AND n.reference_id = v.voc_id
        AND n.type = 'VOC_REPLIED'
        AND n.deleted_at IS NULL
  )
LIMIT 1;
