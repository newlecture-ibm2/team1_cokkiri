package com.coliving.admin.space.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateRoomTypeRequestDto {
    @NotBlank(message = "코드는 필수입니다")
    private String code;

    @NotBlank(message = "이름은 필수입니다")
    private String name;
}
