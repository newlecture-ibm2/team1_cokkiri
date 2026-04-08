package com.coliving.common.auth.application.command;

import com.coliving.common.auth.model.Gender;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegisterCommand {
    private final String loginId;
    private final String password;
    private final String passwordConfirm;
    private final String name;
    private final String birthDate;
    private final Gender gender;
    private final String nationality;
    private final String phone;
    private final String email;
}
