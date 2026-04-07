package com.coliving.global.config;

import com.coliving.admin.device.adapter.out.jpa.DeviceEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.coliving.admin.device.model.DeviceStatus;
import com.coliving.admin.device.adapter.out.jpa.DeviceTypeEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceTypeJpaRepository;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.model.Gender;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import com.coliving.common.comment.adapter.out.jpa.CommentEntity;
import com.coliving.common.comment.adapter.out.jpa.CommentJpaRepository;
import com.coliving.common.community.adapter.out.jpa.PostLikeEntity;
import com.coliving.common.community.adapter.out.jpa.PostLikeJpaRepository;
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
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractLanguage;
import com.coliving.user.contract.model.ContractOrigin;
import com.coliving.user.contract.model.ContractStatus;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * {@code app.demo-data.enabled=true} 이고 프로필이 {@code local}, {@code dev}, {@code prod} 중 하나일 때
 * 데모용 기본 데이터를 적재합니다.
 * <p>
 * 최초 기동(USERS 비어 있음)에는 공간/기기/커뮤니티/VoC/알림 전체를 적재하고,
 * 기존 사용자 데이터가 있어도 {@code app.demo-data.seed-content-on-existing-users=true}면
 * 커뮤니티/댓글/좋아요/VoC/알림 콘텐츠 시드를 idempotent 하게 보강합니다.
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
    private final PostLikeJpaRepository postLikeJpaRepository;
    private final PostJpaRepository postJpaRepository;
    private final CommentJpaRepository commentJpaRepository;
    private final VocJpaRepository vocJpaRepository;
    private final NotificationJpaRepository notificationJpaRepository;
    private final ContractJpaRepository contractJpaRepository;
    private final ObjectMapper objectMapper;
    @Value("${app.demo-data.seed-content-on-existing-users:true}")
    private boolean seedContentOnExistingUsers;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        long userCount = userJpaRepository.count();
        UserEntity admin = getOrCreateDemoAdmin();
        UserEntity user = getOrCreateDemoUser();
        UserEntity user2 = getOrCreateUser("user2", "김민지", "980315", Gender.FEMALE, "010-1234-5678", "minji@cokkiri.local");
        UserEntity user3 = getOrCreateUser("user3", "이준호", "970820", Gender.MALE, "010-2345-6789", "junho@cokkiri.local");
        UserEntity user4 = getOrCreateUser("user4", "박서연", "000112", Gender.FEMALE, "010-3456-7890", "seoyeon@cokkiri.local");

        if (userCount == 0) {
            SpaceEntity deviceHostSpace = seedSpacesFromDevDataset();
            seedDefaultDeviceTypesAndDevice(deviceHostSpace);
            seedCommunityVocNotification(admin, user);
            seedContracts(admin, user, user2, user3, user4);
            log.info("[DataInitializer] 초기 전체 시드 완료 (로그인: admin / demo / user2~4, 비밀번호: {})", DEMO_PASSWORD);
            return;
        }

        if (seedContentOnExistingUsers) {
            seedCommunityVocNotification(admin, user);
            seedContracts(admin, user, user2, user3, user4);
            log.info("[DataInitializer] 기존 USERS 존재: 콘텐츠 시드만 보강 완료");
        } else {
            log.info("[DataInitializer] 기존 USERS 존재 + seed-content-on-existing-users=false: 시드 생략");
        }
    }

    private UserEntity getOrCreateDemoAdmin() {
        return userJpaRepository.findByLoginId("admin")
                .or(() -> findFirstByRole(UserRole.ADMIN))
                .orElseGet(() -> userJpaRepository.save(UserEntity.builder()
                        .loginId("admin")
                        .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                        .name("관리자")
                        .birthDate("900101")
                        .gender(Gender.MALE)
                        .nationality("KR")
                        .phone("010-0000-0001")
                        .email("admin@cokkiri.local")
                        .role(UserRole.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .build()));
    }

    private UserEntity getOrCreateDemoUser() {
        return userJpaRepository.findByLoginId("demo")
                .or(() -> findFirstByRole(UserRole.USER))
                .orElseGet(() -> userJpaRepository.save(UserEntity.builder()
                        .loginId("demo")
                        .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                        .name("데모유저")
                        .birthDate("950505")
                        .gender(Gender.FEMALE)
                        .nationality("KR")
                        .phone("010-0000-0002")
                        .email("demo@cokkiri.local")
                        .role(UserRole.USER)
                        .status(UserStatus.ACTIVE)
                        .build()));
    }

    private UserEntity getOrCreateUser(String loginId, String name, String birthDate,
                                        Gender gender, String phone, String email) {
        return userJpaRepository.findByLoginId(loginId)
                .orElseGet(() -> userJpaRepository.save(UserEntity.builder()
                        .loginId(loginId)
                        .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                        .name(name)
                        .birthDate(birthDate)
                        .gender(gender)
                        .nationality("KR")
                        .phone(phone)
                        .email(email)
                        .role(UserRole.USER)
                        .status(UserStatus.ACTIVE)
                        .build()));
    }

    private Optional<UserEntity> findFirstByRole(UserRole role) {
        return userJpaRepository.findAll().stream()
                .filter(u -> u.getRole() == role)
                .findFirst();
    }

    private void seedDefaultDeviceTypesAndDevice(SpaceEntity deviceHostSpace) {
        DeviceTypeEntity lightType = deviceTypeJpaRepository.findAll().stream()
                .filter(t -> "LIGHT".equals(t.getCode()))
                .findFirst()
                .orElseGet(() -> deviceTypeJpaRepository.save(DeviceTypeEntity.builder()
                        .code("LIGHT")
                        .name("조명")
                        .commands("{\"ON\":{},\"OFF\":{}}")
                        .uiType("toggle")
                        .isSystemDefault(true)
                        .build()));

        if (deviceTypeJpaRepository.findAll().stream().noneMatch(t -> "DOOR_LOCK".equals(t.getCode()))) {
            deviceTypeJpaRepository.save(DeviceTypeEntity.builder()
                    .code("DOOR_LOCK")
                    .name("도어락")
                    .commands("{\"LOCK\":{},\"UNLOCK\":{}}")
                    .uiType("toggle")
                    .isSystemDefault(true)
                    .build());
        }

        boolean deviceExists = deviceJpaRepository.findAll().stream()
                .anyMatch(d -> d.getSpaceId().equals(deviceHostSpace.getSpaceId()) && "거실 메인 조명".equals(d.getName()));
        if (!deviceExists) {
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
        }
    }

    private void seedCommunityVocNotification(UserEntity admin, UserEntity user) {
        PostEntity notice = findPostByTitle("[시드] 공용 공간 이용 가이드")
                .orElseGet(() -> {
                    PostEntity p = new PostEntity();
                    p.setUserId(admin.getUserId());
                    p.setCategory(PostCategory.NOTICE.name());
                    p.setTitle("[시드] 공용 공간 이용 가이드");
                    p.setContent("<p>공용 공간 이용 시간과 정숙 규칙을 확인해 주세요.</p>");
                    p.setAttachments(objectMapper.createArrayNode());
                    p.setLinks(objectMapper.createArrayNode());
                    p.setLikeCount(0);
                    p.setCommentCount(0);
                    return postJpaRepository.save(p);
                });

        PostEntity question = findPostByTitle("[시드] 와이파이 비밀번호는 어디서 확인하나요?")
                .orElseGet(() -> {
                    PostEntity p = new PostEntity();
                    p.setUserId(user.getUserId());
                    p.setCategory(PostCategory.QUESTION.name());
                    p.setTitle("[시드] 와이파이 비밀번호는 어디서 확인하나요?");
                    p.setContent("<p>입주 후 공용 와이파이 정보는 어디서 확인할 수 있나요?</p>");
                    p.setAttachments(objectMapper.createArrayNode());
                    p.setLinks(objectMapper.createArrayNode().add("https://newlecture.com"));
                    p.setLikeCount(0);
                    p.setCommentCount(0);
                    return postJpaRepository.save(p);
                });

        PostEntity meetup = findPostByTitle("[시드] 주말 보드게임 모임 하실 분?")
                .orElseGet(() -> {
                    PostEntity p = new PostEntity();
                    p.setUserId(user.getUserId());
                    p.setCategory(PostCategory.FREE.name());
                    p.setTitle("[시드] 주말 보드게임 모임 하실 분?");
                    p.setContent("<p>이번 주말 라운지에서 가볍게 보드게임 하실 분 구합니다!</p>");
                    p.setAttachments(objectMapper.createArrayNode());
                    p.setLinks(objectMapper.createArrayNode());
                    p.setLikeCount(0);
                    p.setCommentCount(0);
                    return postJpaRepository.save(p);
                });

        ensureComment(question, user.getUserId(), "저도 궁금했는데 감사합니다!");
        ensureComment(meetup, user.getUserId(), "토요일 오후면 저도 참여 가능합니다.");
        ensureLike(question, user.getUserId());
        ensureLike(meetup, user.getUserId());

        notice.setCommentCount(commentJpaRepository.findByPost_PostId(notice.getPostId()).size());
        question.setCommentCount(commentJpaRepository.findByPost_PostId(question.getPostId()).size());
        meetup.setCommentCount(commentJpaRepository.findByPost_PostId(meetup.getPostId()).size());
        notice.setLikeCount((int) postLikeJpaRepository.findAll().stream().filter(pl -> pl.getPostId().equals(notice.getPostId())).count());
        question.setLikeCount((int) postLikeJpaRepository.findAll().stream().filter(pl -> pl.getPostId().equals(question.getPostId())).count());
        meetup.setLikeCount((int) postLikeJpaRepository.findAll().stream().filter(pl -> pl.getPostId().equals(meetup.getPostId())).count());
        postJpaRepository.save(notice);
        postJpaRepository.save(question);
        postJpaRepository.save(meetup);

        findVocByTitle("[시드] 세탁실 건조기 점검 요청")
                .orElseGet(() -> {
                    VocEntity v = new VocEntity();
                    v.setUserId(user.getUserId());
                    v.setCategory(VocCategory.FACILITY);
                    v.setTitle("[시드] 세탁실 건조기 점검 요청");
                    v.setContent("<p>3층 세탁실 건조기 한 대가 동작하지 않습니다. 점검 부탁드립니다.</p>");
                    v.setAttachments(objectMapper.createArrayNode());
                    v.setStatus(VocStatus.OPEN);
                    return vocJpaRepository.save(v);
                });

        VocEntity repliedVoc = findVocByTitle("[시드] 야간 소음 문의")
                .orElseGet(() -> {
                    VocEntity v = new VocEntity();
                    v.setUserId(user.getUserId());
                    v.setCategory(VocCategory.NOISE);
                    v.setTitle("[시드] 야간 소음 문의");
                    v.setContent("<p>심야 시간대 복도 소음이 있어 문의드립니다.</p>");
                    v.setAttachments(objectMapper.createArrayNode());
                    v.setStatus(VocStatus.IN_PROGRESS);
                    v.setAdminReply("관리자가 확인 중이며 금일 중 조치 예정입니다.");
                    v.setReplyUserId(admin.getUserId());
                    v.setRepliedAt(OffsetDateTime.now().minusHours(9));
                    return vocJpaRepository.save(v);
                });

        boolean alreadyNotified = notificationJpaRepository.findByReferenceTypeAndReferenceId(ReferenceType.VOC, repliedVoc.getVocId())
                .stream()
                .anyMatch(n -> n.getType() == NotificationType.VOC_REPLIED);
        if (!alreadyNotified) {
            NotificationEntity n = new NotificationEntity();
            n.setUserId(repliedVoc.getUserId());
            n.setType(NotificationType.VOC_REPLIED);
            n.setTitle("민원 답변이 등록되었습니다.");
            n.setMessage("문의하신 민원에 관리자의 답변이 도착했습니다.");
            n.setReferenceType(ReferenceType.VOC);
            n.setReferenceId(repliedVoc.getVocId());
            n.setRead(false);
            notificationJpaRepository.save(n);
        }
    }

    private Optional<PostEntity> findPostByTitle(String title) {
        return postJpaRepository.findAll().stream()
                .filter(p -> title.equals(p.getTitle()))
                .findFirst();
    }

    private Optional<VocEntity> findVocByTitle(String title) {
        return vocJpaRepository.findAll().stream()
                .filter(v -> title.equals(v.getTitle()))
                .findFirst();
    }

    private void ensureComment(PostEntity post, Long userId, String content) {
        boolean exists = commentJpaRepository.findByPost_PostId(post.getPostId()).stream()
                .anyMatch(c -> content.equals(c.getContent()) && userId.equals(c.getUserId()));
        if (exists) {
            return;
        }
        CommentEntity c = new CommentEntity();
        c.setPost(post);
        c.setUserId(userId);
        c.setContent(content);
        commentJpaRepository.save(c);
    }

    /**
     * 계약 시드 데이터 — 다양한 상태의 계약을 생성합니다.
     * idempotent: 동일 userId+spaceId 조합이 이미 있으면 건너뜁니다.
     */
    private void seedContracts(UserEntity admin, UserEntity user,
                               UserEntity user2, UserEntity user3, UserEntity user4) {
        List<SpaceEntity> privateSpaces = spaceJpaRepository.findAll().stream()
                .filter(s -> s.getType() == SpaceType.PRIVATE)
                .toList();

        if (privateSpaces.size() < 4) {
            log.warn("[DataInitializer] PRIVATE 공간이 4개 미만이어서 계약 시드 생략");
            return;
        }

        // 1) DRAFT — demo 유저가 301호에 임시저장
        SpaceEntity s301 = privateSpaces.stream().filter(s -> s.getName().contains("301")).findFirst().orElse(privateSpaces.get(0));
        ensureContract(user.getUserId(), s301.getSpaceId(), ContractStatus.DRAFT, ContractOrigin.USER_INITIATED,
                "서울시 강남구 삼성동 123", "110-123-456789",
                LocalDate.now().plusMonths(1), 6,
                "재택근무 목적", "조용한 환경 희망합니다.",
                null, null, null, null, null, null, null);

        // 2) PENDING — user2가 302호에 신청 제출
        SpaceEntity s302 = privateSpaces.stream().filter(s -> s.getName().contains("302")).findFirst().orElse(privateSpaces.get(1));
        ensureContract(user2.getUserId(), s302.getSpaceId(), ContractStatus.PENDING, ContractOrigin.USER_INITIATED,
                "서울시 마포구 합정동 456", "333-456-789012",
                LocalDate.now().plusWeeks(2), 12,
                "대학원 통학", "2인실 가능한 방으로 부탁드립니다.",
                null, null, null, null, null, null, null);

        // 3) APPROVED — user3이 401호 승인됨 (체결 대기)
        SpaceEntity s401 = privateSpaces.stream().filter(s -> s.getName().contains("401")).findFirst().orElse(privateSpaces.get(2));
        ensureContract(user3.getUserId(), s401.getSpaceId(), ContractStatus.APPROVED, ContractOrigin.USER_INITIATED,
                "서울시 서초구 반포동 789", "222-789-012345",
                LocalDate.now().plusDays(7), 3,
                "단기 거주", null,
                admin.getUserId(), LocalDate.now().plusDays(7), LocalDate.now().plusMonths(3).plusDays(7),
                new BigDecimal("400000"), new BigDecimal("3000000"), "반려동물 불가", null);

        // 4) ACTIVE — 관리자 직접 등록으로 402호 입주 중
        SpaceEntity s402 = privateSpaces.stream().filter(s -> s.getName().contains("402")).findFirst().orElse(privateSpaces.get(3));
        ensureContract(user4.getUserId(), s402.getSpaceId(), ContractStatus.ACTIVE, ContractOrigin.ADMIN_INITIATED,
                null, null, null, null, null, null,
                admin.getUserId(), LocalDate.now().minusMonths(3), LocalDate.now().plusMonths(9),
                new BigDecimal("550000"), new BigDecimal("6000000"), null, OffsetDateTime.now().minusMonths(3));

        // 5) REJECTED — demo 유저가 501호에 신청했다가 거절됨
        SpaceEntity s501 = privateSpaces.stream().filter(s -> s.getName().contains("501")).findFirst().orElse(privateSpaces.get(0));
        ensureContractRejected(user.getUserId(), s501.getSpaceId(),
                "서울시 강남구 삼성동 123", "110-123-456789",
                LocalDate.now().plusMonths(1), 12,
                "프리미엄 방 입주 희망", null,
                admin.getUserId(), "현재 해당 호실은 리모델링 예정으로 입주가 어렵습니다.");

        // 6) PENDING — user3이 301호에 추가 신청 (중복 신청 시나리오 테스트용)
        ensureContract(user3.getUserId(), s301.getSpaceId(), ContractStatus.PENDING, ContractOrigin.USER_INITIATED,
                "서울시 서초구 방배동 555", "555-555-555555",
                LocalDate.now().plusMonths(2), 24,
                "직장 근처 이사", "채광이 중요합니다.",
                null, null, null, null, null, null, null);

        // 7) APPROVED — user4가 302호 승인됨 (체결 대기 시나리오)
        ensureContract(user4.getUserId(), s302.getSpaceId(), ContractStatus.APPROVED, ContractOrigin.USER_INITIATED,
                "경기도 성남시 분당구 111", "111-111-111111",
                LocalDate.now().plusWeeks(3), 12,
                "신규 입사", "깔끔한 방 부탁드려요.",
                admin.getUserId(), LocalDate.now().plusWeeks(3), LocalDate.now().plusMonths(12).plusWeeks(3),
                new BigDecimal("700000"), new BigDecimal("10000000"), "특약 사항 없음", null);

        log.info("[DataInitializer] 계약 시드 데이터 적재 완료 (DRAFT/PENDING/APPROVED/ACTIVE/REJECTED)");
    }

    private void ensureContract(Long userId, Long spaceId, ContractStatus status, ContractOrigin origin,
                                String address, String bankAccount,
                                LocalDate desiredStartDate, Integer desiredDurationMonths,
                                String usagePurpose, String requestNote,
                                Long approvedBy, LocalDate startDate, LocalDate endDate,
                                BigDecimal monthlyRent, BigDecimal deposit, String specialTerms,
                                OffsetDateTime contractedAt) {
        boolean exists = contractJpaRepository.findByUserIdAndSpaceId(userId, spaceId).isPresent();
        if (exists) return;

        ContractEntity.ContractEntityBuilder builder = ContractEntity.builder()
                .userId(userId)
                .spaceId(spaceId)
                .origin(origin)
                .status(status)
                .address(address)
                .bankAccount(bankAccount)
                .desiredStartDate(desiredStartDate)
                .desiredDurationMonths(desiredDurationMonths)
                .contractLanguage(ContractLanguage.KO)
                .privacyAgreed(true)
                .usagePurpose(usagePurpose)
                .requestNote(requestNote)
                .approvedBy(approvedBy)
                .startDate(startDate)
                .endDate(endDate)
                .monthlyRent(monthlyRent)
                .deposit(deposit)
                .specialTerms(specialTerms)
                .contractedAt(contractedAt);

        contractJpaRepository.save(builder.build());
    }

    private void ensureContractRejected(Long userId, Long spaceId,
                                        String address, String bankAccount,
                                        LocalDate desiredStartDate, Integer desiredDurationMonths,
                                        String usagePurpose, String requestNote,
                                        Long approvedBy, String rejectedReason) {
        boolean exists = contractJpaRepository.findByUserIdAndSpaceId(userId, spaceId).isPresent();
        if (exists) return;

        ContractEntity contract = ContractEntity.builder()
                .userId(userId)
                .spaceId(spaceId)
                .origin(ContractOrigin.USER_INITIATED)
                .status(ContractStatus.REJECTED)
                .address(address)
                .bankAccount(bankAccount)
                .desiredStartDate(desiredStartDate)
                .desiredDurationMonths(desiredDurationMonths)
                .contractLanguage(ContractLanguage.KO)
                .privacyAgreed(true)
                .usagePurpose(usagePurpose)
                .requestNote(requestNote)
                .approvedBy(approvedBy)
                .rejectedReason(rejectedReason)
                .build();

        contractJpaRepository.save(contract);
    }

    private void ensureLike(PostEntity post, Long userId) {
        if (postLikeJpaRepository.findByPost_PostIdAndUserId(post.getPostId(), userId).isPresent()) {
            return;
        }
        PostLikeEntity like = new PostLikeEntity();
        like.setPost(post);
        like.setUserId(userId);
        postLikeJpaRepository.save(like);
    }

    /** {@code data-dev.sql} 과 동일한 공간·상세·이미지 시드. IoT 데모 기기 부착용으로 301호를 반환합니다. */
    private SpaceEntity seedSpacesFromDevDataset() {
        RoomTypeEntity singleType = getOrCreateRoomType("SINGLE", "싱글룸");
        RoomTypeEntity doubleType = getOrCreateRoomType("DOUBLE", "더블룸");
        RoomTypeEntity studioType = getOrCreateRoomType("STUDIO", "스튜디오");
        RoomTypeEntity suiteType = getOrCreateRoomType("SUITE", "스위트");

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

    private RoomTypeEntity getOrCreateRoomType(String code, String name) {
        return roomTypeJpaRepository.findByCode(code)
                .orElseGet(() -> roomTypeJpaRepository.save(
                        RoomTypeEntity.builder()
                                .code(code)
                                .name(name)
                                .isSystemDefault(true)
                                .build()));
    }
}
