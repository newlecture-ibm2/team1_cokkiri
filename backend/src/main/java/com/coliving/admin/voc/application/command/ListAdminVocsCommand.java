package com.coliving.admin.voc.application.command;

import com.coliving.common.voc.model.VocStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListAdminVocsCommand {
    private final VocStatus status;
    private final int page;
    private final int size;
    private final String sort;
}
