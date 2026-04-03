package com.coliving.admin.voc.application.port.in;

import com.coliving.admin.voc.application.command.ListAdminVocsCommand;
import com.coliving.admin.voc.application.command.ReplyVocCommand;
import com.coliving.admin.voc.application.command.ResolveVocCommand;
import com.coliving.admin.voc.application.result.AdminVocListResult;
import com.coliving.common.voc.application.result.VocResult;

public interface AdminVocUseCase {

    AdminVocListResult listVocs(ListAdminVocsCommand command);

    VocResult replyToVoc(ReplyVocCommand command);

    VocResult resolveVoc(ResolveVocCommand command);
}
