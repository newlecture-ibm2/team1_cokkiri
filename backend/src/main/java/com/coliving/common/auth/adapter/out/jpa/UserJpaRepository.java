package com.coliving.common.auth.adapter.out.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * USERS 테이블 JPA Repository
 */
public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {
    
    long countByRoleAndStatus(UserRole role, UserStatus status);


    /**
     * 공지 알림 등 역할·상태만으로 회원 목록을 가져올 때 사용합니다.
     * ({@link #findUsersWithFilters}는 name/loginId LIKE 때문에 일부 환경에서 바인딩 이슈가 날 수 있음)
     */
    List<UserEntity> findAllByRoleInAndStatus(Collection<UserRole> roles, UserStatus status);

    @Query("SELECT u FROM UserEntity u " +
           "WHERE (:role IS NULL OR u.role = :role) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "AND (:name IS NULL OR u.name LIKE %:name%) " +
           "AND (:loginId IS NULL OR u.loginId LIKE %:loginId%)")
    Page<UserEntity> findUsersWithFilters(@Param("role") UserRole role, 
                                          @Param("status") UserStatus status, 
                                          @Param("name") String name, 
                                          @Param("loginId") String loginId, 
                                          Pageable pageable);

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
