package com.coliving.admin.space.adapter.in.web.dto.res;

import com.coliving.admin.space.application.result.AdminRoomTypeResult;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminRoomTypeResponseDto {
    private Long roomTypeId;
    private String code;
    private String name;
    private Boolean isSystemDefault;
    private Integer sortOrder;

    public static AdminRoomTypeResponseDto from(AdminRoomTypeResult result) {
        return AdminRoomTypeResponseDto.builder()
                .roomTypeId(result.getRoomTypeId())
                .code(result.getCode())
                .name(result.getName())
                .isSystemDefault(result.getIsSystemDefault())
                .sortOrder(result.getSortOrder())
                .build();
    }
}
