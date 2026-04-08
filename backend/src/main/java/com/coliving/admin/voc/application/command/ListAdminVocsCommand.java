package com.coliving.admin.voc.application.command;

import com.coliving.common.voc.model.VocStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListAdminVocsCommand {
    private final VocStatus status;
    /** true면 OPEN·IN_PROGRESS만(미처리 큐), status 필터는 무시 */
    private final boolean pendingOnly;
    private final int page;
    private final int size;
    private final String sort;
}
