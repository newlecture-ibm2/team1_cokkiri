package com.coliving.admin.space.application.command;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UpdateSpaceLayoutCommand {

    private final List<SpacePositionItem> positions;

    @Getter
    @Builder
    public static class SpacePositionItem {
        private final Long spaceId;
        private final Integer positionX;
        private final Integer positionY;
    }
}
