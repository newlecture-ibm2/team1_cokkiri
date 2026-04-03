package com.coliving.common.community.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class UpdateCommentRequestDto {
    @NotBlank
    private String content;
}

