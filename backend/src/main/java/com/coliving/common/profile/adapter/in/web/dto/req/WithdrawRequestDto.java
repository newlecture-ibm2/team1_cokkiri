package com.coliving.common.profile.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawRequestDto {
    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}
