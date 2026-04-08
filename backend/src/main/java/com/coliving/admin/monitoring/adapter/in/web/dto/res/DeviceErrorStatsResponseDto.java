package com.coliving.admin.monitoring.adapter.in.web.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DeviceErrorStatsResponseDto {
    private Long deviceId;
    private String deviceName;
    private String deviceTypeCode;
    private String deviceTypeName;
    private String spaceName;
    private String status;
    private Long errorCount;
    private String lastOnlineAt;
}
