package com.coliving.common.auth.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * USERS 테이블 JPA Repository
 */
public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {

    /**
     * 로그인 ID로 사용자 조회
     */
    Optional<UserEntity> findByLoginId(String loginId);

    /**
     * 로그인 ID 존재 여부 확인
     */
    boolean existsByLoginId(String loginId);

    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);
}
