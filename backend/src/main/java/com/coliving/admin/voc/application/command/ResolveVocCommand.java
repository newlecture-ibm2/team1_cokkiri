package com.coliving.admin.voc.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResolveVocCommand {
    private final Long vocId;
}
