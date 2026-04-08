package com.coliving.common.auth.application.port.in;

import com.coliving.common.auth.application.command.RegisterCommand;

public interface RegisterUseCase {
    void register(RegisterCommand command);
}
