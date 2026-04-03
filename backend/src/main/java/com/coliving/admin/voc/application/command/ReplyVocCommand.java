package com.coliving.admin.voc.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReplyVocCommand {
    private final Long vocId;
    private final Long adminUserId;
    private final String reply;
}
