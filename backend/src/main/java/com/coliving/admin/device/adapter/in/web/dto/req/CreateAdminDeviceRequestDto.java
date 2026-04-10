package com.coliving.admin.device.adapter.in.web.dto.req;

import com.coliving.admin.device.application.command.CreateAdminDeviceCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 기기 등록 Request DTO
 */
public record CreateAdminDeviceRequestDto(
        @NotNull(message = "공간 ID는 필수입니다")
        Long spaceId,

        @NotNull(message = "기기 종류 ID는 필수입니다")
        Long deviceTypeId,

        @NotBlank(message = "기기명은 필수입니다")
        @Size(min = 1, max = 100, message = "기기명은 1~100자여야 합니다")
        String name,

        @NotBlank(message = "모델명은 필수입니다")
        @Size(max = 100, message = "모델명은 100자 이내여야 합니다")
        String modelName,

        @NotBlank(message = "MAC 주소는 필수입니다")
        @Size(max = 50, message = "MAC 주소는 50자 이내여야 합니다")
        String macAddress,

        String mockEndpoint,

        /** 초기 기기 상태 JSON (선택, 예: {"power":"OFF","temperature":22}) */
        String currentState
) {
    public CreateAdminDeviceCommand toCommand() {
        return new CreateAdminDeviceCommand(
                spaceId, deviceTypeId, name, modelName, macAddress, mockEndpoint, currentState
        );
    }
}
