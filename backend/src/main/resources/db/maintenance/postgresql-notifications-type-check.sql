-- notifications 테이블 CHECK 제약을 Java NotificationType / ReferenceType enum 과 맞춥니다.
-- 배포 DB에서 한 번 실행하세요.

-- reference_type: 댓글·공지 알림은 COMMUNITY (기존 스키마는 CONTRACT/RESERVATION/VOC 만 허용하는 경우가 많음)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_reference_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_reference_type_check CHECK (
    reference_type IS NULL OR reference_type IN (
        'CONTRACT',
        'RESERVATION',
        'VOC',
        'COMMUNITY',
        'PAYMENT'
    )
);

-- type
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
    'CONTRACT_APPROVED',
    'CONTRACT_REJECTED',
    'CONTRACT_ACTIVATED',
    'CONTRACT_EXPIRED',
    'RESERVATION_APPROVED',
    'RESERVATION_PENDING',
    'RESERVATION_REJECTED',
    'VOC_CREATED',
    'VOC_REPLIED',
    'VOC_RESOLVED',
    'COMMUNITY_NOTICE',
    'COMMUNITY_COMMENT',
    'PAYMENT_SUCCESS'
));
