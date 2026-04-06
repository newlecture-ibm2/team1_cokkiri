package com.coliving.admin.device.application.port.in;

import com.coliving.admin.device.application.command.CreateAdminDeviceCommand;
import com.coliving.admin.device.application.result.CreateAdminDeviceResult;

/**
 * 기기 등록 UseCase 인터페이스
 */
public interface CreateAdminDeviceUseCase {

    CreateAdminDeviceResult execute(CreateAdminDeviceCommand command);
}
