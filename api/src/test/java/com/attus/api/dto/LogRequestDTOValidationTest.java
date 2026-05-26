package com.attus.api.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LogRequestDTOValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void validPayload_hasNoViolations() {
        var dto = new LogRequestDTO(
            "api",
            "production",
            "ERROR",
            "Connection timed out",
            "stack trace"
        );

        Set<ConstraintViolation<LogRequestDTO>> violations = validator.validate(dto);

        assertTrue(violations.isEmpty());
    }

    @Test
    void blankMessage_isRejected() {
        var dto = new LogRequestDTO("api", "production", "ERROR", "  ", null);

        Set<ConstraintViolation<LogRequestDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> "message".equals(v.getPropertyPath().toString())));
    }

    @Test
    void blankApplication_isRejected() {
        var dto = new LogRequestDTO("", "production", "ERROR", "Erro", null);

        Set<ConstraintViolation<LogRequestDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> "application".equals(v.getPropertyPath().toString())));
    }
}
