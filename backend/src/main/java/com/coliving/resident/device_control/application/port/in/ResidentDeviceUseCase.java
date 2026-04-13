package com.coliving.resident.device_control.application.port.in;

import com.coliving.resident.device_control.application.command.ControlDeviceCommand;
import com.coliving.resident.device_control.application.result.ControlDeviceResult;
import com.coliving.resident.device_control.model.ResidentDevice;

import java.util.List;

/**
 * 입주자 기기 조회 및 제어 UseCase
 */
public interface ResidentDeviceUseCase {

    /** RESIDENT의 space_id 기반 개인 기기 목록 조회 */
    List<ResidentDevice> getMyDevices(Long spaceId);

    /** 기기 제어 (권한 검증 포함) */
    ControlDeviceResult controlDevice(ControlDeviceCommand command);

    /** 해당 유저가 특정 공용 공간에 현재시각 기준 APPROVED 예약을 보유하고 있는지 확인 */
    boolean hasApprovedReservationNow(Long userId, Long spaceId);
}
