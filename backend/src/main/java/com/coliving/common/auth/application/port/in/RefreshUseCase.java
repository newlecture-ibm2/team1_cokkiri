package com.coliving.common.auth.application.port.in;

import com.coliving.common.auth.application.command.RefreshCommand;
import com.coliving.common.auth.application.result.RefreshResult;

public interface RefreshUseCase {
    RefreshResult refresh(RefreshCommand command);
}
