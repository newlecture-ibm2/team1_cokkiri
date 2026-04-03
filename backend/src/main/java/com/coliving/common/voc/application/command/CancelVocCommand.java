package com.coliving.common.voc.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CancelVocCommand {
    private final Long userId;
    private final Long vocId;
}
