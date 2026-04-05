package com.coliving.global.validation;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.html.PlainTextHtmlSanitizer;

/**
 * 정제 후에도 비어 있으면 안 되는 평문 필드(제목, 답변 미리보기 등) 검증.
 * {@link PlainTextHtmlSanitizer}는 순수 정제만 담당합니다.
 */
public final class PlainTextFieldValidation {

    private PlainTextFieldValidation() {
    }

    public static String requireNonBlankTitleForSave(String raw) {
        String t = PlainTextHtmlSanitizer.sanitizeTitle(raw);
        if (t.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        return t;
    }

    /** VoC 관리자 답변 등: HTML 정제 후에도 보이는 텍스트가 없으면 거절합니다. */
    public static void requireNonBlankPlainAfterSanitizedHtml(String sanitizedHtml) {
        if (PlainTextHtmlSanitizer.stripToPlain(sanitizedHtml).isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
    }
}
