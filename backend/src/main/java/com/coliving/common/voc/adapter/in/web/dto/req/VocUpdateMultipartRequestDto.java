package com.coliving.common.voc.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class VocUpdateMultipartRequestDto {

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

    /**
     * 유지할 기존 첨부(JSON 배열, {@code VocAttachment}). 비우면(null/공백) 서버는 DB에 있던 첨부를
     * 기준으로 두고 새 {@code files}만 뒤에 붙입니다. 편집 화면에서는 항상 현재 목록을 JSON으로 보냅니다.
     */
    private String attachmentsJson;
}
