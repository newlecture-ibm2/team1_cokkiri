package com.coliving.common.community.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.List;

@Getter
public class CreatePostRequestDto {

    @NotBlank
    private String category;

    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    private String content;

    private List<com.coliving.common.community.model.PostAttachment> attachments;

    private List<com.coliving.common.community.model.PostLink> links;
}

