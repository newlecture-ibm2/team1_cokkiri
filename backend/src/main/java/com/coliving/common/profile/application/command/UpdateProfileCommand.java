package com.coliving.common.profile.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateProfileCommand {
    private final String name;
    private final String phone;
    private final String email;
    private final String birthDate;
    private final com.coliving.common.auth.model.Gender gender;
    private final String emailVerificationToken;
    private final String nationality;
}
