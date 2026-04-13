package com.coliving.admin.space.application.result;

import com.coliving.admin.space.model.AdminRoomType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminRoomTypeResult {
    private Long roomTypeId;
    private String code;
    private String name;
    private Boolean isSystemDefault;
    private Integer sortOrder;

    public static AdminRoomTypeResult from(AdminRoomType model) {
        return AdminRoomTypeResult.builder()
                .roomTypeId(model.getRoomTypeId())
                .code(model.getCode())
                .name(model.getName())
                .isSystemDefault(model.getIsSystemDefault())
                .sortOrder(model.getSortOrder())
                .build();
    }
}
