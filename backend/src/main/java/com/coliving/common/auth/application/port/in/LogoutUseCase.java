package com.coliving.common.auth.application.port.in;

public interface LogoutUseCase {
    void logout(String accessToken);
}
