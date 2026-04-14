package com.coliving.user.room.adapter.in.web.dto;

import com.coliving.admin.space.adapter.out.jpa.RoomTypeEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoomTypeResponseDto {
    private Long roomTypeId;
    private String code;
    private String name;
    private Integer sortOrder;

    public static RoomTypeResponseDto from(RoomTypeEntity entity) {
        return RoomTypeResponseDto.builder()
                .roomTypeId(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .sortOrder(entity.getSortOrder())
                .build();
    }
}
