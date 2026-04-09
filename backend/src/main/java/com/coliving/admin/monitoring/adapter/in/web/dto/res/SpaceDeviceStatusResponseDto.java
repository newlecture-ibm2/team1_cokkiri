package com.coliving.admin.monitoring.adapter.in.web.dto.res;

public record SpaceDeviceStatusResponseDto(
        String spaceName,
        String spaceType,
        String deviceTypeName,
        String status,
        long count
) {}
