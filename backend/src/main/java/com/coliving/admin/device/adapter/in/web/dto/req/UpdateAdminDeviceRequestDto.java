package com.coliving.admin.device.adapter.in.web.dto.req;

import com.coliving.admin.device.application.command.UpdateAdminDeviceCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 기기 수정 요청 DTO (ADM-DEV-05)
 * deviceTypeId 미포함 — 기기종류 변경불가(삭제후 재등록)
 */
public record UpdateAdminDeviceRequestDto(
        @NotBlank(message = "기기 이름은 필수입니다")
        @Size(min = 1, max = 100, message = "기기 이름은 100자 이내여야 합니다")
        String name,

        @NotNull(message = "공간 ID는 필수입니다")
        Long spaceId,

        @Size(max = 100, message = "모델명은 100자 이내여야 합니다")
        String modelName,

        @Size(max = 50, message = "MAC 주소는 50자 이내여야 합니다")
        String macAddress,

        String mockEndpoint
) {
    public UpdateAdminDeviceCommand toCommand(Long deviceId) {
        return new UpdateAdminDeviceCommand(
                deviceId, name, spaceId, modelName, macAddress, mockEndpoint);
    }
}
