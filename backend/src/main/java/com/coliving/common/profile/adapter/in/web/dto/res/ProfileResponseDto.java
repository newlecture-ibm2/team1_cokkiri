package com.coliving.common.profile.adapter.in.web.dto.res;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProfileResponseDto {
    private Long id;
    private String loginId;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String birthDate;
    private String gender;
    private String nationality;
    private String profileImage;
    private String createdAt;
}
