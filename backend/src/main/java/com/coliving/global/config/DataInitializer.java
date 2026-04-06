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
import com.coliving.user.room.adapter.out.jpa.CommonSpaceDetailEntity;
import com.coliving.user.room.adapter.out.jpa.CommonSpaceDetailJpaRepository;
import com.coliving.user.room.adapter.out.jpa.PrivateSpaceDetailEntity;
import com.coliving.user.room.adapter.out.jpa.PrivateSpaceDetailJpaRepository;
import com.coliving.user.room.adapter.out.jpa.SpaceEntity;
import com.coliving.user.room.adapter.out.jpa.SpaceImageEntity;
import com.coliving.user.room.adapter.out.jpa.SpaceImageJpaRepository;
import com.coliving.user.room.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.user.room.model.ImageType;
import com.coliving.user.room.adapter.out.jpa.RoomTypeEntity;
import com.coliving.user.room.adapter.out.jpa.RoomTypeJpaRepository;
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
    private final CommonSpaceDetailJpaRepository commonSpaceDetailJpaRepository;
    private final RoomTypeJpaRepository roomTypeJpaRepository;
    private final SpaceImageJpaRepository spaceImageJpaRepository;
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

        SpaceEntity deviceHostSpace = seedSpacesFromDevDataset();

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
                .spaceId(deviceHostSpace.getSpaceId())
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

    /** {@code data-dev.sql} 과 동일한 공간·상세·이미지 시드. IoT 데모 기기 부착용으로 301호를 반환합니다. */
    private SpaceEntity seedSpacesFromDevDataset() {
        RoomTypeEntity singleType = roomTypeJpaRepository.save(RoomTypeEntity.builder().code("SINGLE").name("싱글룸").isSystemDefault(true).build());
        RoomTypeEntity doubleType = roomTypeJpaRepository.save(RoomTypeEntity.builder().code("DOUBLE").name("더블룸").isSystemDefault(true).build());
        RoomTypeEntity studioType = roomTypeJpaRepository.save(RoomTypeEntity.builder().code("STUDIO").name("스튜디오").isSystemDefault(true).build());
        RoomTypeEntity suiteType = roomTypeJpaRepository.save(RoomTypeEntity.builder().code("SUITE").name("스위트").isSystemDefault(true).build());

        SpaceEntity s301 = savePrivateSpace(
                "301호", 3, new BigDecimal("25.00"), "[\"에어컨\",\"냉장고\"]", "남향 채광 좋은 싱글룸",
                singleType, 1, 1, "남향",
                new BigDecimal("5000000"), new BigDecimal("500000"), new BigDecimal("50000"), true);
        saveSpaceImage(s301, "https://picsum.photos/seed/room301a/800/600", ImageType.PHOTO, 1, true);
        saveSpaceImage(s301, "https://picsum.photos/seed/room301b/800/600", ImageType.PHOTO, 2, false);

        SpaceEntity s302 = savePrivateSpace(
                "302호", 3, new BigDecimal("30.00"), "[\"에어컨\",\"세탁기\",\"냉장고\"]", "복층 구조 더블룸",
                doubleType, 2, 1, "동향",
                new BigDecimal("8000000"), new BigDecimal("700000"), new BigDecimal("60000"), true);
        saveSpaceImage(s302, "https://picsum.photos/seed/room302a/800/600", ImageType.PHOTO, 1, true);

        SpaceEntity s401 = savePrivateSpace(
                "401호", 4, new BigDecimal("20.00"), "[\"에어컨\"]", "깔끔한 스튜디오",
                studioType, 1, 1, "서향",
                new BigDecimal("3000000"), new BigDecimal("400000"), new BigDecimal("40000"), false);
        saveSpaceImage(s401, "https://picsum.photos/seed/room401a/800/600", ImageType.PHOTO, 1, true);

        SpaceEntity s402 = savePrivateSpace(
                "402호", 4, new BigDecimal("28.00"), "[\"에어컨\",\"냉장고\",\"Wi-Fi\"]", "현재 입주 중인 방",
                SpaceStatus.OCCUPIED,
                singleType, 1, 1, "남향",
                new BigDecimal("6000000"), new BigDecimal("550000"), new BigDecimal("55000"), true);
        saveSpaceImage(s402, "https://picsum.photos/seed/room402a/800/600", ImageType.PHOTO, 1, true);

        SpaceEntity s501 = savePrivateSpace(
                "501호", 5, new BigDecimal("35.00"), "[\"에어컨\",\"세탁기\",\"냉장고\",\"TV\",\"주차\"]", "프리미엄 스위트룸",
                suiteType, 2, 2, "남동향",
                new BigDecimal("15000000"), new BigDecimal("1200000"), new BigDecimal("100000"), true);
        saveSpaceImage(s501, "https://picsum.photos/seed/room501a/800/600", ImageType.PHOTO, 1, true);
        saveSpaceImage(s501, "https://picsum.photos/seed/room501b/800/600", ImageType.PHOTO, 2, false);
        saveSpaceImage(s501, "https://picsum.photos/seed/room501fp/800/600", ImageType.FLOOR_PLAN, 3, false);

        SpaceEntity lobby = saveCommonSpace(
                "메인 로비 미팅룸", 1, new BigDecimal("30.50"), "[\"Wi-Fi\",\"TV\"]", "공용 로비에 위치한 6인 회의실",
                6, "09:00~22:00", true, BigDecimal.ZERO);
        saveSpaceImage(lobby, "https://picsum.photos/seed/lobby/800/600", ImageType.PHOTO, 1, true);

        SpaceEntity rooftop = saveCommonSpace(
                "루프탑 파티룸", 10, new BigDecimal("100.00"), "[]", "바비큐 및 파티 가능한 루프탑",
                20, "12:00~23:00", true, new BigDecimal("50000"));
        saveSpaceImage(rooftop, "https://picsum.photos/seed/rooftop/800/600", ImageType.PHOTO, 1, true);

        SpaceEntity gym = saveCommonSpace(
                "B1 헬스장", -1, new BigDecimal("300.00"), "[]", "24시간 무인 헬스장",
                50, "00:00~24:00", false, BigDecimal.ZERO);
        saveSpaceImage(gym, "https://picsum.photos/seed/gym/800/600", ImageType.PHOTO, 1, true);

        return s301;
    }

    private SpaceEntity savePrivateSpace(
            String name,
            int floor,
            BigDecimal area,
            String amenities,
            String description,
            RoomTypeEntity roomType,
            int roomCount,
            int bathroomCount,
            String direction,
            BigDecimal deposit,
            BigDecimal monthlyRent,
            BigDecimal maintenanceFee,
            boolean parkingAvailable) {
        return savePrivateSpace(
                name, floor, area, amenities, description, SpaceStatus.AVAILABLE,
                roomType, roomCount, bathroomCount, direction,
                deposit, monthlyRent, maintenanceFee, parkingAvailable);
    }

    private SpaceEntity savePrivateSpace(
            String name,
            int floor,
            BigDecimal area,
            String amenities,
            String description,
            SpaceStatus status,
            RoomTypeEntity roomType,
            int roomCount,
            int bathroomCount,
            String direction,
            BigDecimal deposit,
            BigDecimal monthlyRent,
            BigDecimal maintenanceFee,
            boolean parkingAvailable) {
        SpaceEntity space = spaceJpaRepository.save(SpaceEntity.builder()
                .name(name)
                .type(SpaceType.PRIVATE)
                .status(status)
                .floor(floor)
                .area(area)
                .amenities(amenities)
                .description(description)
                .positionX(0)
                .positionY(0)
                .build());
        privateSpaceDetailJpaRepository.save(PrivateSpaceDetailEntity.builder()
                .space(space)
                .roomType(roomType)
                .roomCount(roomCount)
                .bathroomCount(bathroomCount)
                .direction(direction)
                .deposit(deposit)
                .monthlyRent(monthlyRent)
                .maintenanceFee(maintenanceFee)
                .parkingAvailable(parkingAvailable)
                .build());
        return space;
    }

    private SpaceEntity saveCommonSpace(
            String name,
            int floor,
            BigDecimal area,
            String amenities,
            String description,
            int maxCapacity,
            String operatingHours,
            boolean reservable,
            BigDecimal usageFee) {
        SpaceEntity space = spaceJpaRepository.save(SpaceEntity.builder()
                .name(name)
                .type(SpaceType.COMMON)
                .status(SpaceStatus.AVAILABLE)
                .floor(floor)
                .area(area)
                .amenities(amenities)
                .description(description)
                .positionX(0)
                .positionY(0)
                .build());
        commonSpaceDetailJpaRepository.save(CommonSpaceDetailEntity.builder()
                .space(space)
                .maxCapacity(maxCapacity)
                .operatingHours(operatingHours)
                .isReservable(reservable)
                .usageFee(usageFee)
                .build());
        return space;
    }

    private void saveSpaceImage(
            SpaceEntity space, String imageUrl, ImageType imageType, int sortOrder, boolean thumbnail) {
        spaceImageJpaRepository.save(SpaceImageEntity.builder()
                .space(space)
                .imageUrl(imageUrl)
                .imageType(imageType)
                .sortOrder(sortOrder)
                .isThumbnail(thumbnail)
                .build());
    }
}
