package com.coliving.user.room.application.command;

import com.coliving.user.room.model.RoomType;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class RoomListCommand {

    private RoomType roomType;
    private BigDecimal minRent;
    private BigDecimal maxRent;
    private Integer floor;
}
