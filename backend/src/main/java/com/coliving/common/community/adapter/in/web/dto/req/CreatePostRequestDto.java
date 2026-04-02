package com.coliving.common.community.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
public class CreatePostRequestDto {

    @NotBlank
    private String category;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private List<MultipartFile> files;

    private List<String> links;
}

