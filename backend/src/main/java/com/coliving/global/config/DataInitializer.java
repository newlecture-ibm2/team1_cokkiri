package com.coliving.global.config;

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
import com.coliving.admin.payment.adapter.out.jpa.PaymentEntity;
import com.coliving.admin.payment.adapter.out.jpa.PaymentJpaRepository;
import com.coliving.admin.payment.model.PaymentMethod;
import com.coliving.admin.payment.model.PaymentStatus;
import com.coliving.admin.payment.model.PaymentType;
import com.coliving.user.contract.model.ContractLanguage;
import com.coliving.user.contract.model.ContractOrigin;
import com.coliving.user.contract.model.ContractStatus;
import com.coliving.admin.space.adapter.out.jpa.CommonSpaceDetailEntity;
import com.coliving.admin.space.adapter.out.jpa.CommonSpaceDetailJpaRepository;
import com.coliving.admin.space.adapter.out.jpa.PrivateSpaceDetailEntity;
import com.coliving.admin.space.adapter.out.jpa.PrivateSpaceDetailJpaRepository;
import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.admin.space.adapter.out.jpa.RoomTypeEntity;
import com.coliving.admin.space.adapter.out.jpa.RoomTypeJpaRepository;
import com.coliving.admin.space.adapter.out.jpa.AnnotationTypeEntity;
import com.coliving.admin.space.adapter.out.jpa.AnnotationTypeJpaRepository;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;
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
@Profile({"local", "dev"})
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
    private final AnnotationTypeJpaRepository annotationTypeJpaRepository;

    private final PostLikeJpaRepository postLikeJpaRepository;
    private final PostJpaRepository postJpaRepository;
    private final CommentJpaRepository commentJpaRepository;
    private final VocJpaRepository vocJpaRepository;
    private final NotificationJpaRepository notificationJpaRepository;
    private final ContractJpaRepository contractJpaRepository;
    private final PaymentJpaRepository paymentJpaRepository;
    private final ObjectMapper objectMapper;
    @Value("${app.demo-data.seed-content-on-existing-users:true}")
    private boolean seedContentOnExistingUsers;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        UserEntity admin = getOrCreateDemoAdmin();
        UserEntity user = getOrCreateDemoUser();
        UserEntity user2 = getOrCreateUser("user2", "김민지", "980315", Gender.FEMALE, "010-1234-5678", "minji@cokkiri.local", UserRole.USER);
        UserEntity user3 = getOrCreateUser("user3", "이준호", "970820", Gender.MALE, "010-2345-6789", "junho@cokkiri.local", UserRole.USER);
        UserEntity user4 = getOrCreateUser("user4", "박서연", "000112", Gender.FEMALE, "010-3456-7890", "seoyeon@cokkiri.local", UserRole.RESIDENT);

        // ── 인프라 시드 (항상 idempotent 실행) ──
        seedDefaultAnnotationTypes();
        seedSpacesFromDevDataset();

        // ── 콘텐츠 시드 (조건부) ──
        if (seedContentOnExistingUsers) {
            seedCommunityVocNotification(admin, user);
            seedContracts(admin, user, user2, user3, user4);
            seedPayments(admin, user, user2, user3, user4);
            log.info("[DataInitializer] 시드 완료 (로그인: admin / demo / user2~4, 비밀번호: {})", DEMO_PASSWORD);
        } else {
            log.info("[DataInitializer] seed-content-on-existing-users=false: 콘텐츠 시드 생략");
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
                                        Gender gender, String phone, String email, UserRole role) {
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
                        .role(role)
                        .status(UserStatus.ACTIVE)
                        .build()));
    }

    private Optional<UserEntity> findFirstByRole(UserRole role) {
        return userJpaRepository.findAll().stream()
                .filter(u -> u.getRole() == role)
                .findFirst();
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
                admin.getUserId(), LocalDate.of(2026, 4, 8), LocalDate.of(2026, 5, 1),
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
        // findByUserIdAndSpaceId는 Optional 반환 → 동일 userId+spaceId의 다중 계약(상태 다름) 존재 시
        // NonUniqueResultException 발생 방지를 위해 List 기반 중복 체크
        boolean exists = contractJpaRepository.findByUserIdAndStatus(userId, status)
                .stream().anyMatch(c -> c.getSpaceId().equals(spaceId));
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
        boolean exists = contractJpaRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().anyMatch(c -> c.getSpaceId().equals(spaceId) && c.getStatus() == ContractStatus.REJECTED);
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

    /**
     * 공간·상세·이미지 시드 (idempotent).
     * 이름 기준으로 이미 존재하면 skip, 없으면 INSERT.
     */
    private void seedSpacesFromDevDataset() {
        RoomTypeEntity singleType = getOrCreateRoomType("SINGLE", "싱글룸");
        RoomTypeEntity doubleType = getOrCreateRoomType("DOUBLE", "더블룸");
        RoomTypeEntity suiteType = getOrCreateRoomType("SUITE", "스위트");

        // ═══════════ 1층 (101~103호) ═══════════
        getOrCreatePrivateSpace(
                "101호", 1, new BigDecimal("18.00"), "[\"에어컨\"]", "1층 코너 위치 소형 싱글룸",
                singleType, 1, 1, "북향",
                new BigDecimal("3000000"), new BigDecimal("350000"), new BigDecimal("35000"), false);
        getOrCreatePrivateSpace(
                "102호", 1, new BigDecimal("26.00"), "[\"에어컨\",\"냉장고\",\"세탁기\"]", "1층 넓은 더블룸",
                doubleType, 2, 1, "남향",
                new BigDecimal("6000000"), new BigDecimal("580000"), new BigDecimal("50000"), true);


        // ═══════════ 2층 (201~203호) ═══════════
        getOrCreatePrivateSpace(
                "201호", 2, new BigDecimal("19.00"), "[\"에어컨\",\"냉장고\"]", "2층 조용한 싱글룸",
                singleType, 1, 1, "북동향",
                new BigDecimal("3500000"), new BigDecimal("380000"), new BigDecimal("36000"), false);
        getOrCreatePrivateSpace(
                "202호", 2, new BigDecimal("24.00"), "[\"에어컨\",\"냉장고\",\"Wi-Fi\"]", "2층 채광 좋은 더블룸",
                doubleType, 2, 1, "남향",
                new BigDecimal("5500000"), new BigDecimal("520000"), new BigDecimal("48000"), true);
        getOrCreatePrivateSpace(
                "203호", 2, new BigDecimal("35.00"), "[\"에어컨\",\"냉장고\",\"세탁기\",\"TV\",\"주차\"]", "2층 스위트룸",
                suiteType, 2, 2, "남향",
                new BigDecimal("10000000"), new BigDecimal("900000"), new BigDecimal("80000"), true);

        // ═══════════ 3층 (301~303호) ═══════════
        getOrCreatePrivateSpace(
                "301호", 3, new BigDecimal("25.00"), "[\"에어컨\",\"냉장고\"]", "남향 채광 좋은 싱글룸",
                singleType, 1, 1, "남향",
                new BigDecimal("5000000"), new BigDecimal("500000"), new BigDecimal("50000"), true);
        getOrCreatePrivateSpace(
                "302호", 3, new BigDecimal("30.00"), "[\"에어컨\",\"세탁기\",\"냉장고\"]", "복층 구조 더블룸",
                doubleType, 2, 1, "동향",
                new BigDecimal("8000000"), new BigDecimal("700000"), new BigDecimal("60000"), true);


        // ═══════════ 4층 (401~403호) ═══════════
        getOrCreatePrivateSpace(
                "401호", 4, new BigDecimal("20.00"), "[\"에어컨\"]", "깔끔한 싱글룸",
                singleType, 1, 1, "서향",
                new BigDecimal("3000000"), new BigDecimal("400000"), new BigDecimal("40000"), false);
        getOrCreatePrivateSpace(
                "402호", 4, new BigDecimal("28.00"), "[\"에어컨\",\"냉장고\",\"Wi-Fi\"]", "현재 입주 중인 방",
                SpaceStatus.OCCUPIED,
                singleType, 1, 1, "남향",
                new BigDecimal("6000000"), new BigDecimal("550000"), new BigDecimal("55000"), true);
        getOrCreatePrivateSpace(
                "403호", 4, new BigDecimal("38.00"), "[\"에어컨\",\"냉장고\",\"세탁기\",\"TV\",\"주차\",\"Wi-Fi\"]", "4층 최고급 스위트룸",
                suiteType, 2, 2, "남동향",
                new BigDecimal("13000000"), new BigDecimal("1100000"), new BigDecimal("95000"), true);

        // ═══════════ 5층 (501~503호) ═══════════
        getOrCreatePrivateSpace(
                "501호", 5, new BigDecimal("35.00"), "[\"에어컨\",\"세탁기\",\"냉장고\",\"TV\",\"주차\"]", "프리미엄 스위트룸",
                suiteType, 2, 2, "남동향",
                new BigDecimal("15000000"), new BigDecimal("1200000"), new BigDecimal("100000"), true);
        getOrCreatePrivateSpace(
                "502호", 5, new BigDecimal("26.00"), "[\"에어컨\",\"냉장고\",\"Wi-Fi\"]", "5층 고층 싱글룸 (전망 우수)",
                singleType, 1, 1, "남향",
                new BigDecimal("5500000"), new BigDecimal("530000"), new BigDecimal("52000"), true);
        getOrCreatePrivateSpace(
                "503호", 5, new BigDecimal("30.00"), "[\"에어컨\",\"냉장고\",\"세탁기\"]", "5층 더블룸 (탁 트인 조망)",
                doubleType, 2, 1, "동향",
                new BigDecimal("8000000"), new BigDecimal("720000"), new BigDecimal("62000"), true);

        SpaceEntity lobby = getOrCreateCommonSpace(
                "메인 로비 회의실", 1, new BigDecimal("30.50"), "[\"Wi-Fi\",\"TV\"]", "공용 로비에 위치한 6인 회의실",
                6, "09:00~22:00", true, BigDecimal.ZERO);

        SpaceEntity rooftop = getOrCreateCommonSpace(
                "파티룸", 5, new BigDecimal("100.00"), "[]", "바비큐 및 파티 가능한 루프탑",
                20, "12:00~23:00", true, new BigDecimal("50000"));

        SpaceEntity gym = getOrCreateCommonSpace(
                "헬스장", -1, new BigDecimal("300.00"), "[]", "24시간 무인 헬스장",
                50, "00:00~24:00", false, BigDecimal.ZERO);

        SpaceEntity laundry = getOrCreateCommonSpace(
                "1층 세탁실", 1, new BigDecimal("40.00"), "[\"세탁기\",\"건조기\"]", "코인형 세탁기·건조기 완비 세탁실",
                10, "06:00~23:00", false, BigDecimal.ZERO);

        SpaceEntity library = getOrCreateCommonSpace(
                "2층 도서관", 2, new BigDecimal("80.00"), "[\"Wi-Fi\",\"데스크\",\"콘센트\"]", "독서 및 자율학습을 위한 정숙 공간",
                20, "07:00~24:00", false, BigDecimal.ZERO);

        SpaceEntity meetingRoom = getOrCreateCommonSpace(
                "3층 화상 회의실", 3, new BigDecimal("20.00"), "[\"Wi-Fi\",\"대형 모니터\",\"화이트보드\",\"콘센트\"]", "팀 프로젝트 및 화상 회의를 위한 방음 미팅룸 (예약 필수)",
                6, "09:00~22:00", true, new BigDecimal("10000"));

        log.info("[DataInitializer] 공간 시드 적재 완료 (idempotent)");
    }

    // ── idempotent 공간 생성 헬퍼 (이름 기준 중복 방지) ──

    private SpaceEntity getOrCreatePrivateSpace(
            String name, int floor, BigDecimal area, String amenities, String description,
            RoomTypeEntity roomType, int roomCount, int bathroomCount, String direction,
            BigDecimal deposit, BigDecimal monthlyRent, BigDecimal maintenanceFee, boolean parkingAvailable) {
        return getOrCreatePrivateSpace(name, floor, area, amenities, description, SpaceStatus.AVAILABLE,
                roomType, roomCount, bathroomCount, direction, deposit, monthlyRent, maintenanceFee, parkingAvailable);
    }

    private SpaceEntity getOrCreatePrivateSpace(
            String name, int floor, BigDecimal area, String amenities, String description,
            SpaceStatus status, RoomTypeEntity roomType, int roomCount, int bathroomCount, String direction,
            BigDecimal deposit, BigDecimal monthlyRent, BigDecimal maintenanceFee, boolean parkingAvailable) {
        return spaceJpaRepository.findByName(name).orElseGet(() -> {
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
        });
    }

    private SpaceEntity getOrCreateCommonSpace(
            String name, int floor, BigDecimal area, String amenities, String description,
            int maxCapacity, String operatingHours, boolean reservable, BigDecimal usageFee) {
        return spaceJpaRepository.findByName(name).orElseGet(() -> {
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
        });
    }



    private void seedDefaultAnnotationTypes() {
        getOrCreateAnnotationType("DOOR", "출입문", "DoorOpen", "primary");
        getOrCreateAnnotationType("STAIRS", "계단", "ArrowUpDown", "muted");
        getOrCreateAnnotationType("ELEVATOR", "엘리베이터", "ArrowUpSquare", "accent");
        getOrCreateAnnotationType("RESTROOM", "화장실", "Bath", "secondary");
        getOrCreateAnnotationType("GARDEN", "정원", "TreePine", "accent");
        getOrCreateAnnotationType("CUSTOM", "기타", "MapPin", "primary");
        log.info("[DataInitializer] 어노테이션 유형 시드 데이터 적재 완료 (6종)");
    }

    private AnnotationTypeEntity getOrCreateAnnotationType(String code, String name, String iconName, String defaultColor) {
        return annotationTypeJpaRepository.findByCode(code)
                .orElseGet(() -> annotationTypeJpaRepository.save(
                        AnnotationTypeEntity.builder()
                                .code(code)
                                .name(name)
                                .iconName(iconName)
                                .defaultColor(defaultColor)
                                .isSystemDefault(false)
                                .build()));
    }

    private RoomTypeEntity getOrCreateRoomType(String code, String name) {
        return roomTypeJpaRepository.findByCode(code)
                .orElseGet(() -> roomTypeJpaRepository.save(
                        RoomTypeEntity.builder()
                                .code(code)
                                .name(name)
                                .isSystemDefault(false)
                                .sortOrder((int) roomTypeJpaRepository.count())
                                .build()));
    }

    private void seedPayments(UserEntity admin, UserEntity user, UserEntity user2, UserEntity user3, UserEntity user4) {
        List<ContractEntity> activeContracts = contractJpaRepository.findAll().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .toList();

        if (activeContracts.isEmpty()) {
            log.warn("[DataInitializer] ACTIVE 계약이 없어서 결제 시드 생략");
            return;
        }

        ContractEntity activeContract = activeContracts.get(0); // user4의 402호 계약

        // ───────── user4 (402호 입주자) — 월세 3개월분 ─────────

        // 1) 월세 — 1월 (PAID, 계좌이체)
        ensurePayment(activeContract, activeContract.getUserId(),
                PaymentType.RENT, new BigDecimal("550000"), PaymentStatus.PAID,
                PaymentMethod.TRANSFER, LocalDate.now().minusMonths(3), LocalDate.now().minusMonths(3).plusDays(1));

        // 2) 월세 — 2월 (PAID, 카드)
        ensurePayment(activeContract, activeContract.getUserId(),
                PaymentType.RENT, new BigDecimal("550000"), PaymentStatus.PAID,
                PaymentMethod.CARD, LocalDate.now().minusMonths(2), LocalDate.now().minusMonths(2).plusDays(2));

        // 3) 월세 — 3월 (PAID, 계좌이체)
        ensurePayment(activeContract, activeContract.getUserId(),
                PaymentType.RENT, new BigDecimal("550000"), PaymentStatus.PAID,
                PaymentMethod.TRANSFER, LocalDate.now().minusMonths(1), LocalDate.now().minusMonths(1));

        // 4) 월세 — 이번달 (UNPAID, 미납)
        ensurePayment(activeContract, activeContract.getUserId(),
                PaymentType.RENT, new BigDecimal("550000"), PaymentStatus.UNPAID,
                null, LocalDate.now(), null);

        // ───────── user4 — 관리비 3개월분 ─────────

        // 5) 관리비 — 1월 (PAID)
        ensurePayment(activeContract, activeContract.getUserId(),
                PaymentType.MAINTENANCE, new BigDecimal("55000"), PaymentStatus.PAID,
                PaymentMethod.TRANSFER, LocalDate.now().minusMonths(3), LocalDate.now().minusMonths(3).plusDays(1));

        // 6) 관리비 — 2월 (PAID)
        ensurePayment(activeContract, activeContract.getUserId(),
                PaymentType.MAINTENANCE, new BigDecimal("55000"), PaymentStatus.PAID,
                PaymentMethod.TRANSFER, LocalDate.now().minusMonths(2), LocalDate.now().minusMonths(2).plusDays(2));

        // 7) 관리비 — 3월 (PAID)
        ensurePayment(activeContract, activeContract.getUserId(),
                PaymentType.MAINTENANCE, new BigDecimal("55000"), PaymentStatus.PAID,
                PaymentMethod.CARD, LocalDate.now().minusMonths(1), LocalDate.now().minusMonths(1).plusDays(1));

        // 8) 관리비 — 이번달 (UNPAID, 미납)
        ensurePayment(activeContract, activeContract.getUserId(),
                PaymentType.MAINTENANCE, new BigDecimal("55000"), PaymentStatus.UNPAID,
                null, LocalDate.now(), null);

        // ───────── user4 — 시설이용료 (루프탑 예약) ─────────

        // 9) 시설이용료 (PAID, 카드, 지난달)
        ensurePayment(null, activeContract.getUserId(),
                PaymentType.FACILITY, new BigDecimal("50000"), PaymentStatus.PAID,
                PaymentMethod.CARD, LocalDate.now().minusDays(20), LocalDate.now().minusDays(20));

        // 10) 시설이용료 (PENDING, 이번달)
        ensurePayment(null, activeContract.getUserId(),
                PaymentType.FACILITY, new BigDecimal("50000"), PaymentStatus.PENDING,
                PaymentMethod.CARD, LocalDate.now().plusDays(3), null);

        // ───────── user2 결제 (PENDING 상태의 계약에 대한 선불금 시뮬레이션) ─────────

        contractJpaRepository.findAll().stream()
                .filter(c -> c.getUserId().equals(user2.getUserId()))
                .findFirst()
                .ifPresent(c -> {
                    // 11) user2 월세 — PENDING (승인 대기)
                    ensurePayment(c, user2.getUserId(),
                            PaymentType.RENT, new BigDecimal("700000"), PaymentStatus.PENDING,
                            PaymentMethod.CARD, LocalDate.now().plusDays(10), null);
                });

        // ───────── user3 결제 (APPROVED 상태 계약, 보증금 선납) ─────────

        contractJpaRepository.findAll().stream()
                .filter(c -> c.getUserId().equals(user3.getUserId()) && c.getStatus() == ContractStatus.APPROVED)
                .findFirst()
                .ifPresent(c -> {
                    // 12) user3 월세 — UNPAID (체결 전이라 미납 상태)
                    ensurePayment(c, user3.getUserId(),
                            PaymentType.RENT, new BigDecimal("400000"), PaymentStatus.UNPAID,
                            null, LocalDate.now().plusDays(7), null);
                });

        log.info("[DataInitializer] 결제 시드 데이터 적재 완료 (user4: 월세4+관리비4+시설2, user2: 1, user3: 1 = 총 12건)");
    }

    private void ensurePayment(ContractEntity contract, Long userId, PaymentType type, BigDecimal amount,
                               PaymentStatus status, PaymentMethod method, LocalDate billingDate, LocalDate paidDate) {
        boolean exists = paymentJpaRepository.findAll().stream()
                .anyMatch(p -> p.getUserId().equals(userId) && p.getType() == type && p.getBillingDate().equals(billingDate));

        if (exists) return;

        PaymentEntity.PaymentEntityBuilder builder = PaymentEntity.builder()
                .userId(userId)
                .type(type)
                .amount(amount)
                .status(status)
                .paymentMethod(method)
                .billingDate(billingDate)
                .paidDate(paidDate);

        if (contract != null) {
            builder.contract(contract);
        }

        paymentJpaRepository.save(builder.build());
    }
}
