package com.coliving.common.voc.application.command;

import com.coliving.common.voc.model.VocAttachment;
import com.coliving.common.voc.model.VocCategory;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UpdateVocCommand {
    private final Long userId;
    private final Long vocId;
    private final VocCategory category;
    private final String title;
    private final String content;
    /** null이면 기존 DB 첨부를 유지한 뒤 {@link #newFileAttachments}만 병합합니다. */
    private final List<VocAttachment> retainedAttachments;
    private final List<VocAttachment> newFileAttachments;
}
