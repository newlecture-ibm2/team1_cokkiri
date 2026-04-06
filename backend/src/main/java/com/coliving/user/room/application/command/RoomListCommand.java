package com.coliving.user.room.application.command;



import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class RoomListCommand {

    private Long roomTypeId;
    private BigDecimal minRent;
    private BigDecimal maxRent;
    private Integer floor;
}
