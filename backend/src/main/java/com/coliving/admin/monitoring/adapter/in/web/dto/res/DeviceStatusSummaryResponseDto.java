package com.coliving.admin.monitoring.adapter.in.web.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DeviceStatusSummaryResponseDto {
    private long totalDevices;
    private long onlineCount;
    private long offlineCount;
    private long errorCount;
}
