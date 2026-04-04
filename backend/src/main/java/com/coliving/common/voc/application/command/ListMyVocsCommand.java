package com.coliving.common.voc.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListMyVocsCommand {
    private final Long userId;
    private final int page;
    private final int size;
    private final String sort;
}
