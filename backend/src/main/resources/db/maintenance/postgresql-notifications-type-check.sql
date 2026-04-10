-- notifications.type CHECK 제약이 애플리케이션 NotificationType enum 과 불일치하면
-- (예: VOC_CREATED 미포함) 민원 등록 시 관리자 알림 INSERT가 실패하고 전체 트랜잭션이 롤백될 수 있습니다.
-- 배포 DB에서 한 번 실행하세요.

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
