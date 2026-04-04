package com.coliving.common.voc.application.port.in;

import com.coliving.common.voc.application.command.CancelVocCommand;
import com.coliving.common.voc.application.command.CreateVocCommand;
import com.coliving.common.voc.application.command.GetMyVocCommand;
import com.coliving.common.voc.application.command.ListMyVocsCommand;
import com.coliving.common.voc.application.command.UpdateVocCommand;
import com.coliving.common.voc.application.result.VocListResult;
import com.coliving.common.voc.application.result.VocResult;

public interface VocUseCase {

    VocResult createVoc(CreateVocCommand command);

    VocListResult listMyVocs(ListMyVocsCommand command);

    VocResult getMyVoc(GetMyVocCommand command);

    VocResult updateVoc(UpdateVocCommand command);

    VocResult cancelVoc(CancelVocCommand command);
}
