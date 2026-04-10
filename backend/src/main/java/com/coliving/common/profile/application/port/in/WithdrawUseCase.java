package com.coliving.common.profile.application.port.in;

import com.coliving.common.profile.application.command.WithdrawCommand;

public interface WithdrawUseCase {
    void withdraw(Long userId, WithdrawCommand command);
}
