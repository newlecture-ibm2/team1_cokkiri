package com.coliving.admin.space.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateRoomTypeCommand {
    private Long roomTypeId;
    private String name;
}
