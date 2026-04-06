package com.coliving.common.comment.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UpdateCommentRequestDto {

    @NotBlank
    @Size(max = 2000)
    private String content;
}

