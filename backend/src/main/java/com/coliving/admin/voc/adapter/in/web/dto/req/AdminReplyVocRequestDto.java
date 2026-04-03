package com.coliving.admin.voc.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class AdminReplyVocRequestDto {

    @NotBlank
    private String reply;
}
