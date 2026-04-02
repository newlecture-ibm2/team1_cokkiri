package com.coliving.common.community.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.util.List;

@Getter
public class CreatePostRequestDto {

    @NotBlank
    private String category;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private List<com.coliving.common.community.model.PostAttachment> attachments;

    private List<com.coliving.common.community.model.PostLink> links;
}

