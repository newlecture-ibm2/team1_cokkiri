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

    @Override
    public String getPasswordHash(Long userId) {
        return userJpaRepository.findById(userId)
                .map(UserEntity::getPasswordHash)
                .orElseThrow(() -> new com.coliving.global.error.BusinessException(com.coliving.global.error.ErrorCode.ACCOUNT_NOT_FOUND));
    }

    @Override
    public void updatePassword(Long userId, String newPasswordHash) {
        UserEntity user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new com.coliving.global.error.BusinessException(com.coliving.global.error.ErrorCode.ACCOUNT_NOT_FOUND));
        user.updatePassword(newPasswordHash);
        userJpaRepository.save(user);
    }

    @Override
    public void withdrawUser(Long userId) {
        UserEntity user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new com.coliving.global.error.BusinessException(com.coliving.global.error.ErrorCode.ACCOUNT_NOT_FOUND));
        
        user.updateProfile("탈퇴한 사용자", "탈퇴한 사용자", "탈퇴한 사용자", null, null, null, null);
        user.deactivate();
        user.softDelete();
        userJpaRepository.save(user);
    }

    @Override
    public void updateProfile(Long userId, String name, String phone, String email, String birthDate, com.coliving.common.auth.model.Gender gender, String nationality) {
        UserEntity user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new com.coliving.global.error.BusinessException(com.coliving.global.error.ErrorCode.ACCOUNT_NOT_FOUND));
        
        user.updateProfile(name, phone, email, null, birthDate, gender, nationality);
        userJpaRepository.save(user);
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
