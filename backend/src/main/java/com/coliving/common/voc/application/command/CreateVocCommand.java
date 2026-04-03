package com.coliving.common.voc.application.command;

import com.coliving.common.voc.model.VocAttachment;
import com.coliving.common.voc.model.VocCategory;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CreateVocCommand {
    private final Long userId;
    private final VocCategory category;
    private final String title;
    private final String content;
    private final List<VocAttachment> attachments;
}
