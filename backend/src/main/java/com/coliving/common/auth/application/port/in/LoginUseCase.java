package com.coliving.common.auth.application.port.in;

import com.coliving.common.auth.application.command.LoginCommand;
import com.coliving.common.auth.application.result.LoginResult;

public interface LoginUseCase {
    LoginResult login(LoginCommand command);
}
