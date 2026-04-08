package com.coliving.common.profile.adapter.out.persistence;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.adapter.out.jpa.UserJpaRepository;
import com.coliving.common.profile.adapter.in.web.dto.res.ProfileResponseDto;
import com.coliving.common.profile.application.port.out.ProfileRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProfilePersistenceAdapter implements ProfileRepositoryPort {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Optional<ProfileResponseDto> findByUserId(Long userId) {
        return userJpaRepository.findById(userId).map(this::toResponseDto);
    }

    private ProfileResponseDto toResponseDto(UserEntity user) {
        return ProfileResponseDto.builder()
                .id(user.getUserId())
                .loginId(user.getLoginId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .birthDate(user.getBirthDate())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .nationality(user.getNationality())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
