package com.coliving.admin.space.adapter.in.web.dto.req;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class UpdateSpaceLayoutRequestDto {

    @NotEmpty(message = "positions 배열은 비어 있을 수 없습니다.")
    @Valid
    private List<SpacePosition> positions;

    @Getter
    @NoArgsConstructor
    public static class SpacePosition {

        @NotNull(message = "spaceId는 필수입니다.")
        private Long spaceId;

        @NotNull(message = "positionX는 필수입니다.")
        private Integer positionX;

        @NotNull(message = "positionY는 필수입니다.")
        private Integer positionY;
    }
}
