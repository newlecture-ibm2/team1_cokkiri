package com.coliving.admin.voc.application.result;

import com.coliving.common.voc.model.VocCategory;
import com.coliving.common.voc.model.VocStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class AdminVocListItemResult {
    private final Long vocId;
    private final Long userId;
    private final VocCategory category;
    private final String title;
    private final VocStatus status;
    private final OffsetDateTime createdAt;
}
