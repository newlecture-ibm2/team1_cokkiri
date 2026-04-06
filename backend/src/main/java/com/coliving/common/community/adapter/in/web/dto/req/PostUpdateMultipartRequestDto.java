package com.coliving.common.community.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class PostUpdateMultipartRequestDto {

    @NotBlank
    private String category;

    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    @Size(max = 65535)
    private String content;

    private List<String> links;

    private List<MultipartFile> files;

    /**
     * 유지할 기존 첨부(JSON 배열, {@code PostAttachment}). null/공백이면 DB 첨부 유지 후 새 {@code files}만 추가.
     */
    private String attachmentsJson;
}
