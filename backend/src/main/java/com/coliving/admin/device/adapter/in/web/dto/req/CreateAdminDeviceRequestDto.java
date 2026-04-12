package com.coliving.admin.device.adapter.in.web.dto.req;

import com.coliving.admin.device.application.command.CreateAdminDeviceCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 기기 등록 Request DTO
 *
 * macAddress: IoT 서버 기기 목록에서 선택된 기기의 MAC (자동)
 * name: 관리자가 부여하는 기기 이름
 * spaceId: 관리자가 선택하는 설치 공간
 * deviceTypeId: 관리자가 선택하는 기기 종류
 */
public record CreateAdminDeviceRequestDto(
        @NotBlank(message = "MAC 주소는 필수입니다")
        @Size(max = 50, message = "MAC 주소는 50자 이내여야 합니다")
        String macAddress,

        @NotBlank(message = "기기명은 필수입니다")
        @Size(min = 1, max = 100, message = "기기명은 1~100자여야 합니다")
        String name,

        @NotNull(message = "공간 ID는 필수입니다")
        Long spaceId,

        @NotNull(message = "기기 종류 ID는 필수입니다")
        Long deviceTypeId
) {
    public CreateAdminDeviceCommand toCommand() {
        return new CreateAdminDeviceCommand(macAddress, name, spaceId, deviceTypeId);
    }
}
