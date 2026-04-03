package com.coliving.common.voc.adapter.in.web.dto.req;

import com.coliving.common.voc.model.VocAttachment;
import com.coliving.common.voc.model.VocCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.List;

@Getter
public class UpdateVocRequestDto {

    @NotNull
    private VocCategory category;

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String content;

    private List<VocAttachment> attachments;
}
