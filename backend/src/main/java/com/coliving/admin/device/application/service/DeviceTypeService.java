package com.coliving.admin.device.application.service;

import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.coliving.admin.device.adapter.out.jpa.DeviceTypeEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceTypeJpaRepository;
import com.coliving.admin.device.application.command.SaveDeviceTypeCommand;
import com.coliving.admin.device.application.port.in.DeviceTypeUseCase;
import com.coliving.admin.device.model.AdminDeviceType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceTypeService implements DeviceTypeUseCase {

    private final DeviceTypeJpaRepository deviceTypeJpaRepository;
    private final DeviceJpaRepository deviceJpaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdminDeviceType> getDeviceTypeList() {
        return deviceTypeJpaRepository.findAll().stream()
                .map(this::toModel)
                .toList();
    }

    @Override
    @Transactional
    public AdminDeviceType createDeviceType(SaveDeviceTypeCommand command) {
        // 코드 중복 검증
        if (deviceTypeJpaRepository.existsByCode(command.code())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "이미 존재하는 기기 종류 코드입니다: " + command.code());
        }

        DeviceTypeEntity entity = DeviceTypeEntity.builder()
                .code(command.code().toUpperCase())
                .name(command.name())
                .commands(command.commands() != null ? command.commands() : "[]")
                .uiType(command.uiType() != null ? command.uiType() : "toggle")
                .isSystemDefault(false)
                .build();

        DeviceTypeEntity saved = deviceTypeJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    @Transactional
    public AdminDeviceType updateDeviceType(SaveDeviceTypeCommand command) {
        DeviceTypeEntity entity = deviceTypeJpaRepository.findById(command.deviceTypeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기 종류를 찾을 수 없습니다"));

        // 코드 중복 검증 (자기 자신 제외)
        if (deviceTypeJpaRepository.existsByCodeAndDeviceTypeIdNot(command.code(), command.deviceTypeId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "이미 존재하는 기기 종류 코드입니다: " + command.code());
        }

        entity.update(command.code().toUpperCase(), command.name(), command.commands(), command.uiType());
        DeviceTypeEntity saved = deviceTypeJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    @Transactional
    public void deleteDeviceType(Long deviceTypeId) {
        DeviceTypeEntity entity = deviceTypeJpaRepository.findById(deviceTypeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "기기 종류를 찾을 수 없습니다"));

        // 해당 종류를 사용하는 기기가 있으면 삭제 불가
        if (!deviceJpaRepository.findByDeviceType_Code(entity.getCode()).isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "이 종류를 사용하는 기기가 존재합니다. 먼저 해당 기기를 삭제해 주세요.");
        }

        entity.softDelete();
        deviceTypeJpaRepository.save(entity);
    }

    private AdminDeviceType toModel(DeviceTypeEntity entity) {
        return new AdminDeviceType(
                entity.getDeviceTypeId(),
                entity.getCode(),
                entity.getName(),
                entity.getCommands(),
                entity.getUiType(),
                entity.getIsSystemDefault(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
