package com.coliving.admin.space.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateRoomTypeCommand {
    private String code;
    private String name;
}
