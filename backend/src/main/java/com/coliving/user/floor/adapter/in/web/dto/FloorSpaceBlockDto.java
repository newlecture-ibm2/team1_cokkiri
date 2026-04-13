package com.coliving.user.floor.adapter.in.web.dto;

import com.coliving.user.floor.model.FloorView;
import lombok.Builder;
import lombok.Getter;

/**
 * 사용자용 공간 블록 DTO (민감 정보 제외).
 * deposit, monthlyRent, maintenanceFee, hasDeviceError 등은 포함하지 않는다.
 */
@Getter
@Builder
public class FloorSpaceBlockDto {

    private Long spaceId;
    private String name;
    private String type;
    private String status;
    private String roomTypeName;
    private Integer positionX;
    private Integer positionY;
    private Integer positionW;
    private Integer positionH;

    public static FloorSpaceBlockDto from(FloorView.SpaceBlock block) {
        return FloorSpaceBlockDto.builder()
                .spaceId(block.getSpaceId())
                .name(block.getName())
                .type(block.getType())
                .status(block.getStatus())
                .roomTypeName(block.getRoomTypeName())
                .positionX(block.getPositionX())
                .positionY(block.getPositionY())
                .positionW(block.getPositionW())
                .positionH(block.getPositionH())
                .build();
    }
}
