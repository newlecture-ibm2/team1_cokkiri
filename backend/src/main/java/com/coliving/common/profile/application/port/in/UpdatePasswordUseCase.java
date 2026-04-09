package com.coliving.common.profile.application.port.in;

import com.coliving.common.profile.application.command.UpdatePasswordCommand;

public interface UpdatePasswordUseCase {
    void updatePassword(Long userId, UpdatePasswordCommand command);
}
