package com.coliving.admin.device.application.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 기기 등록 커맨드 (Service 입력 VO)
 *
 * macAddress: IoT 서버 기기의 MAC (연결 키)
 * name: 관리자가 부여하는 기기 이름
 * spaceId: 설치할 공간 ID
 * deviceTypeId: 기기 종류 ID
 */
public record CreateAdminDeviceCommand(
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
}
