package com.coliving.admin.monitoring.adapter.in.web.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ControlFrequencyResponseDto {
    private String label;
    private Long count;
}
