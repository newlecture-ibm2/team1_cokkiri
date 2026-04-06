package com.coliving.global.config;

import com.coliving.admin.device.adapter.out.jpa.DeviceEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.coliving.admin.device.adapter.out.jpa.DeviceStatus;
import com.coliving.admin.device.adapter.out.jpa.DeviceTypeEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceTypeJpaRepository;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.model.Gender;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.common.comment.adapter.out.jpa.CommentEntity;
import com.coliving.common.comment.adapter.out.jpa.CommentJpaRepository;
import com.coliving.common.community.adapter.out.jpa.PostEntity;
import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import com.coliving.common.community.model.PostCategory;
import com.coliving.common.notification.adapter.out.jpa.NotificationEntity;
import com.coliving.common.notification.adapter.out.jpa.NotificationJpaRepository;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.common.voc.adapter.out.jpa.VocEntity;
import com.coliving.common.voc.adapter.out.jpa.VocJpaRepository;
import com.coliving.common.voc.model.VocCategory;
import com.coliving.common.voc.model.VocStatus;
import com.coliving.user.room.adapter.out.jpa.PrivateSpaceDetailEntity;
import com.coliving.user.room.adapter.out.jpa.PrivateSpaceDetailJpaRepository;
import com.coliving.user.room.adapter.out.jpa.SpaceEntity;
import com.coliving.user.room.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.user.room.model.RoomType;
import com.coliving.user.room.model.SpaceStatus;
import com.coliving.user.room.model.SpaceType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * {@code app.demo-data.enabled=true} 이고 프로필이 {@code local}, {@code dev}, {@code prod} 중 하나일 때
 * 데모용 기본 데이터를 한 번만 적재합니다.
 * <p>
 * 이미 {@code users} 테이블에 행이 있으면 전체 시드를 건너뜁니다.
 * 운영 환경에서는 {@code APP_DEMO_DATA_ENABLED=false} 등으로 끄는 것을 권장합니다.
 * </p>
 */
@Slf4j
@Component
@Profile({"local", "dev", "prod"})
@ConditionalOnProperty(name = "app.demo-data.enabled", havingValue = "true")
@Order(100)
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private static final String DEMO_PASSWORD = "Passw0rd!";

    private final UserJpaRepository userJpaRepository;
    private final PasswordEncoder passwordEncoder;
    private final SpaceJpaRepository spaceJpaRepository;
    private final PrivateSpaceDetailJpaRepository privateSpaceDetailJpaRepository;
    private final DeviceTypeJpaRepository deviceTypeJpaRepository;
    private final DeviceJpaRepository deviceJpaRepository;
    private final PostJpaRepository postJpaRepository;
    private final CommentJpaRepository commentJpaRepository;
    private final VocJpaRepository vocJpaRepository;
    private final NotificationJpaRepository notificationJpaRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userJpaRepository.count() > 0) {
            log.info("[DataInitializer] 기존 사용자 데이터가 있어 시드 생략");
            return;
        }

        String hash = passwordEncoder.encode(DEMO_PASSWORD);

        UserEntity admin = userJpaRepository.save(UserEntity.builder()
                .loginId("admin")
                .passwordHash(hash)
                .name("관리자")
                .birthDate("900101")
                .gender(Gender.MALE)
                .nationality("KR")
                .phone("010-0000-0001")
                .email("admin@cokkiri.local")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        UserEntity user = userJpaRepository.save(UserEntity.builder()
                .loginId("demo")
                .passwordHash(hash)
                .name("데모유저")
                .birthDate("950505")
                .gender(Gender.FEMALE)
                .nationality("KR")
                .phone("010-0000-0002")
                .email("demo@cokkiri.local")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build());

        SpaceEntity space = spaceJpaRepository.save(SpaceEntity.builder()
                .name("코끼리 스튜디오 101")
                .type(SpaceType.PRIVATE)
                .status(SpaceStatus.AVAILABLE)
                .floor(10)
                .area(new BigDecimal("28.50"))
                .amenities("[\"wifi\",\"desk\"]")
                .description("남향, 조용한 업무용 스튜디오")
                .positionX(0)
                .positionY(0)
                .build());

        privateSpaceDetailJpaRepository.save(PrivateSpaceDetailEntity.builder()
                .space(space)
                .roomType(RoomType.STUDIO)
                .roomCount(1)
                .bathroomCount(1)
                .direction("남")
                .deposit(new BigDecimal("5000000"))
                .monthlyRent(new BigDecimal("850000"))
                .maintenanceFee(new BigDecimal("80000"))
                .parkingAvailable(true)
                .build());

        DeviceTypeEntity lightType = deviceTypeJpaRepository.save(DeviceTypeEntity.builder()
                .code("LIGHT")
                .name("조명")
                .commands("{\"ON\":{},\"OFF\":{}}")
                .uiType("toggle")
                .isSystemDefault(true)
                .build());

        deviceTypeJpaRepository.save(DeviceTypeEntity.builder()
                .code("DOOR_LOCK")
                .name("도어락")
                .commands("{\"LOCK\":{},\"UNLOCK\":{}}")
                .uiType("toggle")
                .isSystemDefault(true)
                .build());

        deviceJpaRepository.save(DeviceEntity.builder()
                .spaceId(space.getSpaceId())
                .deviceType(lightType)
                .name("거실 메인 조명")
                .modelName("Mock-L1")
                .mockEndpoint("http://mock-iot:8000/devices/1")
                .status(DeviceStatus.ONLINE)
                .currentState("{\"power\":\"ON\"}")
                .isActive(true)
                .installedAt(OffsetDateTime.now())
                .build());

        PostEntity notice = new PostEntity();
        notice.setUserId(admin.getUserId());
        notice.setCategory(PostCategory.NOTICE.name());
        notice.setTitle("입주자 공지 · 공용 세탁실 점검 안내");
        notice.setContent("<p>다음 주 화요일 10:00~12:00 세탁실 점검이 있습니다.</p>");
        notice.setAttachments(objectMapper.createArrayNode());
        notice.setLinks(objectMapper.createArrayNode());
        notice = postJpaRepository.save(notice);

        PostEntity question = new PostEntity();
        question.setUserId(user.getUserId());
        question.setCategory(PostCategory.QUESTION.name());
        question.setTitle("주차 등록은 어디서 하나요?");
        question.setContent("앱에서 가능한지 알려주세요.");
        question.setAttachments(objectMapper.createArrayNode());
        question.setLinks(objectMapper.createArrayNode());
        question = postJpaRepository.save(question);

        CommentEntity comment = new CommentEntity();
        comment.setPost(question);
        comment.setUserId(admin.getUserId());
        comment.setContent("로비 태블릿 또는 관리사무소에 문의 부탁드립니다.");
        commentJpaRepository.save(comment);
        question.setCommentCount(1);
        postJpaRepository.save(question);

        VocEntity voc = new VocEntity();
        voc.setUserId(user.getUserId());
        voc.setCategory(VocCategory.FACILITY);
        voc.setTitle("엘리베이터 소음 문의");
        voc.setContent("야간에 소음이 커서 민원 드립니다.");
        voc.setAttachments(null);
        voc.setStatus(VocStatus.RESOLVED);
        voc.setAdminReply("점검 후 베어링 교체 완료했습니다.");
        voc.setReplyUserId(admin.getUserId());
        voc.setRepliedAt(OffsetDateTime.now());
        voc = vocJpaRepository.save(voc);

        NotificationEntity n = new NotificationEntity();
        n.setUserId(user.getUserId());
        n.setType(NotificationType.VOC_REPLIED);
        n.setTitle("민원 답변 등록");
        n.setMessage("등록하신 민원에 답변이 등록되었습니다.");
        n.setReferenceType(ReferenceType.VOC);
        n.setReferenceId(voc.getVocId());
        n.setRead(false);
        notificationJpaRepository.save(n);

        log.info("[DataInitializer] 데모 시드 완료 (로그인: admin / demo, 비밀번호: {})", DEMO_PASSWORD);
    }
}
