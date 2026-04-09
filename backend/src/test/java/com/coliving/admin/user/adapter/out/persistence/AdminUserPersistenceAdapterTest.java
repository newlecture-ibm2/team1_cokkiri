package com.coliving.admin.user.adapter.out.persistence;

import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminUserPersistenceAdapterTest {

    @Mock
    private UserJpaRepository userJpaRepository;

    @InjectMocks
    private AdminUserPersistenceAdapter adapter;

    @Test
    @DisplayName("findUsers 호출 시 String status가 일치하는 UserStatus Enum으로 변환되어 findUsersWithFilters를 호출해야 한다.")
    void findUsers_calls_findUsersWithFilters_with_proper_mapped_UserStatus() {
        // given
        UserRole role = UserRole.ADMIN;
        String statusStr = "ACTIVE";
        String name = "Test Name";
        String loginId = "testAdmin";
        Pageable pageable = PageRequest.of(0, 10);

        UserEntity userEntity = UserEntity.builder()
                .userId(1L)
                .loginId(loginId)
                .name(name)
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        Page<UserEntity> mockPage = new PageImpl<>(List.of(userEntity));

        given(userJpaRepository.findUsersWithFilters(role, UserStatus.ACTIVE, name, loginId, pageable))
                .willReturn(mockPage);

        // when
        Page<AdminUserResult> result = adapter.findUsers(role, statusStr, name, loginId, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        AdminUserResult adminUserResult = result.getContent().get(0);
        assertThat(adminUserResult.getLoginId()).isEqualTo(loginId);
        assertThat(adminUserResult.getRole()).isEqualTo(role);
        assertThat(adminUserResult.getStatus()).isEqualTo(UserStatus.ACTIVE);

        verify(userJpaRepository).findUsersWithFilters(role, UserStatus.ACTIVE, name, loginId, pageable);
    }
    
    @Test
    @DisplayName("status 파라미터가 null이거나 빈 값이면 null로 변환되어 전달되어야 한다.")
    void findUsers_passes_null_if_status_is_blank() {
        // given
        Pageable pageable = PageRequest.of(0, 10);
        given(userJpaRepository.findUsersWithFilters(null, null, null, null, pageable))
                .willReturn(new PageImpl<>(List.of()));

        // when
        adapter.findUsers(null, "", null, null, pageable);

        // then
        verify(userJpaRepository).findUsersWithFilters(null, null, null, null, pageable);
    }
}
