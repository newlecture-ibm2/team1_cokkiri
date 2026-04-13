package com.coliving.common.auth.adapter.in.web.dto.req;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RegisterRequestDtoTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenPrivacyConsentIsFalse_thenValidationFails() {
        // given
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setLoginId("user123");
        dto.setPassword("Valid@Password1");
        dto.setPasswordConfirm("Valid@Password1");
        dto.setName("홍길동");
        dto.setBirthDate("900101");
        dto.setPhone("010-1234-5678");
        dto.setEmail("test@example.com");
        dto.setPrivacyConsent(false);
        dto.setTermsConsent(true);


        // when
        Set<ConstraintViolation<RegisterRequestDto>> violations = validator.validate(dto);

        // then
        assertThat(violations).isNotEmpty();
        boolean hasPrivacyConsentError = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("privacyConsent"));
        assertThat(hasPrivacyConsentError).isTrue();
    }

    @Test
    void whenTermsConsentIsFalse_thenValidationFails() {
        // given
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setLoginId("user123");
        dto.setPassword("Valid@Password1");
        dto.setPasswordConfirm("Valid@Password1");
        dto.setName("홍길동");
        dto.setBirthDate("900101");
        dto.setPhone("010-1234-5678");
        dto.setEmail("test@example.com");
        dto.setPrivacyConsent(true);
        dto.setTermsConsent(false);

        // when
        Set<ConstraintViolation<RegisterRequestDto>> violations = validator.validate(dto);

        // then
        assertThat(violations).isNotEmpty();
        boolean hasTermsConsentError = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("termsConsent"));
        assertThat(hasTermsConsentError).isTrue();
    }

    @Test
    void whenBothConsentsAreTrue_thenValidationSucceeds() {
        // given
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setLoginId("user123");
        dto.setPassword("Valid@Password1");
        dto.setPasswordConfirm("Valid@Password1");
        dto.setName("홍길동");
        dto.setBirthDate("900101");
        dto.setPhone("010-1234-5678");
        dto.setEmail("test@example.com");
        dto.setPrivacyConsent(true);
        dto.setTermsConsent(true);

        // when
        Set<ConstraintViolation<RegisterRequestDto>> violations = validator.validate(dto);

        // then
        assertThat(violations).isEmpty();
    }
}
