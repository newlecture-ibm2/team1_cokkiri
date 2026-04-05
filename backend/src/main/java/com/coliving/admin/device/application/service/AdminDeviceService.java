package com.coliving.admin.device.application.service;

import com.coliving.admin.device.application.command.CreateAdminDeviceCommand;
import com.coliving.admin.device.application.port.in.CreateAdminDeviceUseCase;
import com.coliving.admin.device.application.port.out.AdminDeviceRepositoryPort;
import com.coliving.admin.device.application.result.CreateAdminDeviceResult;
import com.coliving.admin.device.model.AdminDevice;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDeviceService implements CreateAdminDeviceUseCase {

    private final AdminDeviceRepositoryPort adminDeviceRepositoryPort;

    @Override
    @Transactional
    public CreateAdminDeviceResult execute(CreateAdminDeviceCommand command) {
        // MAC 주소 중복 검증
        if (command.macAddress() != null && !command.macAddress().isBlank()) {
            if (adminDeviceRepositoryPort.existsByMacAddress(command.macAddress())) {
                throw new BusinessException(ErrorCode.DUPLICATE_MAC_ADDRESS);
            }
        }

        AdminDevice device = new AdminDevice(
                null,    // deviceId (신규)
                command.spaceId(),
                command.deviceTypeId(),
                null,    // deviceTypeCode (PersistenceAdapter에서 조회)
                null,    // deviceTypeName
                command.name(),
                command.modelName(),
                command.macAddress(),
                command.mockEndpoint(),
                "OFFLINE",
                "{}",
                true,
                null,    // installedAt (PersistenceAdapter에서 설정)
                null,    // lastOnlineAt
                null     // createdAt (BaseEntity)
        );

        AdminDevice saved = adminDeviceRepositoryPort.save(device);
        return CreateAdminDeviceResult.from(saved);
    }
}
