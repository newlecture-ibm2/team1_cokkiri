package com.coliving.admin.device.application.port.in;

import com.coliving.admin.device.application.command.SaveDeviceTypeCommand;
import com.coliving.admin.device.model.AdminDeviceType;

import java.util.List;

/**
 * 기기 종류 관리 UseCase (목록 조회, 등록, 수정, 삭제)
 */
public interface DeviceTypeUseCase {

    List<AdminDeviceType> getDeviceTypeList();

    AdminDeviceType createDeviceType(SaveDeviceTypeCommand command);

    AdminDeviceType updateDeviceType(SaveDeviceTypeCommand command);

    void deleteDeviceType(Long deviceTypeId);
}
