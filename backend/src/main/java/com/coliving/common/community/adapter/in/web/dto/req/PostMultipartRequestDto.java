package com.coliving.common.community.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class PostMultipartRequestDto {

    @NotBlank
    private String category;

    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    private String content;

    /** multipart 동일 필드명 links 반복 시 URL 문자열 목록으로 바인딩 */
    private List<String> links;

    private List<MultipartFile> files;
}
