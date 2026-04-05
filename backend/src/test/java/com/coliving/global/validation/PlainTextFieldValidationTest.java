package com.coliving.global.validation;

import com.coliving.global.error.BusinessException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PlainTextFieldValidationTest {

    @Test
    void requireNonBlankTitleForSave_stripsHtmlAndReturnsPlain() {
        String out = PlainTextFieldValidation.requireNonBlankTitleForSave("  Hello <b>world</b> ");
        assertEquals("Hello world", out);
    }

    @Test
    void requireNonBlankTitleForSave_throwsWhenOnlyTags() {
        assertThrows(BusinessException.class, () -> PlainTextFieldValidation.requireNonBlankTitleForSave("<b></b>"));
    }

    @Test
    void requireNonBlankTitleForSave_throwsWhenWhitespaceOnly() {
        assertThrows(BusinessException.class, () -> PlainTextFieldValidation.requireNonBlankTitleForSave("   \n\t  "));
    }

    @Test
    void requireNonBlankPlainAfterSanitizedHtml_throwsWhenEmptyAfterStrip() {
        assertThrows(BusinessException.class,
                () -> PlainTextFieldValidation.requireNonBlankPlainAfterSanitizedHtml("<p></p>"));
    }

    @Test
    void requireNonBlankPlainAfterSanitizedHtml_acceptsVisibleText() {
        PlainTextFieldValidation.requireNonBlankPlainAfterSanitizedHtml("<p>ok</p>");
    }
}
