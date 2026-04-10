package com.coliving.user.floor.adapter.in.web.dto;

import com.coliving.user.floor.model.FloorView;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * 층별 평면도 응답 DTO (사용자용 Public).
 */
@Getter
@Builder
public class FloorViewResponseDto {

    private Integer floor;
    private String blueprintUrl;
    private BigDecimal blueprintOpacity;
    private List<FloorSpaceBlockDto> spaces;
    private List<FloorAnnotationDto> annotations;

    public static FloorViewResponseDto from(FloorView view) {
        return FloorViewResponseDto.builder()
                .floor(view.getFloor())
                .blueprintUrl(view.getBlueprintUrl())
                .blueprintOpacity(view.getBlueprintOpacity())
                .spaces(view.getSpaces().stream()
                        .map(FloorSpaceBlockDto::from)
                        .toList())
                .annotations(view.getAnnotations().stream()
                        .map(FloorAnnotationDto::from)
                        .toList())
                .build();
    }
}
