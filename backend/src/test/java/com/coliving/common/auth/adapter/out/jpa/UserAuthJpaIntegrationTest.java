package com.coliving.common.auth.adapter.out.jpa;

import com.coliving.common.auth.model.Gender;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import com.coliving.global.config.JpaConfig;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaConfig.class)
@ActiveProfiles("test")
class UserAuthJpaIntegrationTest {

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private RefreshTokenJpaRepository refreshTokenJpaRepository;

    @Autowired
    private RoleChangeLogJpaRepository roleChangeLogJpaRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("UserEntity 단건 저장 및 조회 테스트")
    void saveAndFindUser() {
        // given
        UserEntity user = UserEntity.builder()
                .loginId("testuser")
                .passwordHash("hash")
                .name("Test User")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        // when
        UserEntity savedUser = userJpaRepository.save(user);
        entityManager.flush();
        entityManager.clear();

        // then
        UserEntity foundUser = userJpaRepository.findById(savedUser.getUserId()).orElseThrow();
        assertThat(foundUser.getLoginId()).isEqualTo("testuser");
        assertThat(foundUser.getRole()).isEqualTo(UserRole.USER);
        assertThat(foundUser.getCreatedAt()).isNotNull(); // Auditing check
    }

    @Test
    @DisplayName("UserEntity 다건 저장 및 조회 테스트")
    void saveAndFindMultipleUsers() {
        // given
        UserEntity user1 = UserEntity.builder()
                .loginId("testuser1")
                .passwordHash("hash1")
                .name("User 1")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        UserEntity user2 = UserEntity.builder()
                .loginId("testuser2")
                .passwordHash("hash2")
                .name("User 2")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        // when
        userJpaRepository.saveAll(List.of(user1, user2));
        entityManager.flush();
        entityManager.clear();

        // then
        List<UserEntity> users = userJpaRepository.findAll();
        assertThat(users.size()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("RefreshToken과 User의 관계 매핑 및 LAZY 페치 전략 테스트")
    void refreshTokenAndUserMapping_LazyFetch() {
        // given
        UserEntity user = UserEntity.builder()
                .loginId("lazytest")
                .passwordHash("hash")
                .name("Lazy Test")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
        userJpaRepository.save(user);

        RefreshTokenEntity token = RefreshTokenEntity.builder()
                .user(user)
                .token("sample-token")
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .isRevoked(false)
                .build();
        refreshTokenJpaRepository.save(token);

        entityManager.flush();
        entityManager.clear();

        // when
        RefreshTokenEntity foundToken = refreshTokenJpaRepository.findById(token.getRefreshTokenId()).orElseThrow();

        // then
        // LAZY 페치인지 확인 (Proxy)
        assertThat(entityManager.getEntityManagerFactory().getPersistenceUnitUtil().isLoaded(foundToken.getUser())).isFalse();
        
        // 해당 필드 접근 시 데이터 로드
        assertThat(foundToken.getUser().getLoginId()).isEqualTo("lazytest");
        assertThat(entityManager.getEntityManagerFactory().getPersistenceUnitUtil().isLoaded(foundToken.getUser())).isTrue();
    }

    @Test
    @DisplayName("Soft Delete 로직 검증")
    void softDeleteTest() {
        // given
        UserEntity user = UserEntity.builder()
                .loginId("deletetest")
                .passwordHash("hash")
                .name("Delete Test")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
        userJpaRepository.save(user);

        entityManager.flush();
        entityManager.clear();

        Long id = user.getUserId();

        // when
        userJpaRepository.deleteById(id);
        entityManager.flush();
        entityManager.clear();

        // then
        assertThat(userJpaRepository.findById(id)).isEmpty();

        // Native 쿼리를 통해 실제로 행이 삭제되지 않았고, deleted_at만 업데이트 되었는지 확인
        Number count = (Number) entityManager.createNativeQuery("SELECT count(*) FROM \"user\" WHERE user_id = :id AND deleted_at IS NOT NULL")
                .setParameter("id", id)
                .getSingleResult();
        assertThat(count.intValue()).isEqualTo(1);
    }
}
