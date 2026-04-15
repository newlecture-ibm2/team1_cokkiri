package com.coliving.common.profile.adapter.in.web.dto.res;

import lombok.Builder;

@Builder
public record NationalityResponseDto(
        String code,
        String nameKo,
        String nameEn,
        String nameNative
) {
}
