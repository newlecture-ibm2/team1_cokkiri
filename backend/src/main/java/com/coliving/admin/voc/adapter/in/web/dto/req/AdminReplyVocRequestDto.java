package com.coliving.admin.voc.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class AdminReplyVocRequestDto {

    /** UTF-16 코드 유닛 기준. */
    @NotBlank
    @Size(max = 65535)
    private String reply;
}
