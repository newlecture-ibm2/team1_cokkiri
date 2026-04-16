package com.coliving.admin.space.application.command;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreatePriceRangeCommand {
    private final String label;
    private final Integer minRent;
    private final Integer maxRent;
    private final Boolean isActive;
}
