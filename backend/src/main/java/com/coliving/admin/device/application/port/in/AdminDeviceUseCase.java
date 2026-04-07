package com.coliving.admin.device.application.port.in;

import com.coliving.admin.device.application.command.ControlAdminDeviceCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceActiveCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceCommand;
import com.coliving.admin.device.application.command.UpdateAdminDeviceStatusCommand;
import com.coliving.admin.device.application.command.DeleteAdminDeviceCommand;
import com.coliving.admin.device.application.result.ControlAdminDeviceResult;
import com.coliving.admin.device.model.AdminDevice;

import java.util.List;

/**
 * 기기 관리 UseCase (목록 조회, 수정, 상태 변경, 비활성화, 삭제, 제어)
 */
public interface AdminDeviceUseCase {

    List<AdminDevice> getDeviceList();

    /** 기기 수정 (ADM-DEV-05) — deviceType 변경 불가 */
    AdminDevice updateDevice(UpdateAdminDeviceCommand command);

    AdminDevice updateActive(UpdateAdminDeviceActiveCommand command);

    AdminDevice updateStatus(UpdateAdminDeviceStatusCommand command);

    void deleteDevice(DeleteAdminDeviceCommand command);

    /** 기기 제어 (ADM-DEV-04) — space_id 제한 없이 전체 접근 */
    ControlAdminDeviceResult controlDevice(ControlAdminDeviceCommand command);
}
