package com.coliving.admin.voc.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetAdminVocCommand {

    private final Long vocId;
}
