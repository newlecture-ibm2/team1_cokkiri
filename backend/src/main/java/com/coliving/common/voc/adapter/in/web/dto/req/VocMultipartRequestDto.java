package com.coliving.common.voc.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class VocMultipartRequestDto {

    @NotBlank
    private String category;

    /** UTF-16 코드 유닛 기준. */
    @NotBlank
    @Size(max = 200)
    private String title;

    /** UTF-16 코드 유닛 기준. */
    @NotBlank
    @Size(max = 65535)
    private String content;

    private List<MultipartFile> files;
}
