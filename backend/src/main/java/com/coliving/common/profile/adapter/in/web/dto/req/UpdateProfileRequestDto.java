package com.coliving.common.profile.adapter.in.web.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AccessLevel;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UpdateProfileRequestDto {

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(min = 2, max = 50, message = "이름은 2자 이상 50자 이하여야 합니다.")
    private String name;

    @NotBlank(message = "휴대폰 번호를 입력해주세요.")
    @Pattern(regexp = "^(010(-\\d{4}-\\d{4})|010\\d{8})$", message = "휴대폰 번호 형식이 올바르지 않습니다.")
    private String phone;

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    private String email;

    @Pattern(regexp = "^\\d{6}$", message = "생년월일은 YYMMDD 형식의 6자리 숫자여야 합니다.")
    private String birthDate;

    private com.coliving.common.auth.model.Gender gender;

    @Size(max = 50, message = "국적은 50자 이하여야 합니다.")
    private String nationality;

    private String emailVerificationToken;
}
