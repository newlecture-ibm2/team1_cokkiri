package com.coliving.common.profile.application.result;

import lombok.Builder;

@Builder
public record NationalityListResult(
        String code,
        String nameKo,
        String nameEn,
        String nameNative
) {
}
