package com.attus.api.dto;

import com.attus.api.validation.ProdutoConstraints;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProdutoRequestDTOValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void validPayload_hasNoViolations() {
        var dto = new ProdutoRequestDTO("Mouse", "Descrição curta", new BigDecimal("99.90"));

        Set<ConstraintViolation<ProdutoRequestDTO>> violations = validator.validate(dto);

        assertTrue(violations.isEmpty());
    }

    @Test
    void nameExceedsMaxLength_isRejected() {
        var dto = new ProdutoRequestDTO("a".repeat(ProdutoConstraints.NAME_MAX_LENGTH + 1), null, new BigDecimal("10"));

        Set<ConstraintViolation<ProdutoRequestDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> "name".equals(v.getPropertyPath().toString())));
    }

    @Test
    void descriptionExceedsMaxLength_isRejected() {
        var dto = new ProdutoRequestDTO(
            "Produto",
            "x".repeat(ProdutoConstraints.DESCRIPTION_MAX_LENGTH + 1),
            new BigDecimal("10")
        );

        Set<ConstraintViolation<ProdutoRequestDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> "description".equals(v.getPropertyPath().toString())));
    }

    @Test
    void blankName_isRejected() {
        var dto = new ProdutoRequestDTO("   ", null, new BigDecimal("10"));

        Set<ConstraintViolation<ProdutoRequestDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> "name".equals(v.getPropertyPath().toString())));
    }

    @Test
    void nonPositivePrice_isRejected() {
        var dto = new ProdutoRequestDTO("Produto", null, new BigDecimal("0"));

        Set<ConstraintViolation<ProdutoRequestDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> "price".equals(v.getPropertyPath().toString())));
    }

    @Test
    void priceExceedsDigits_isRejected() {
        var dto = new ProdutoRequestDTO("Produto", null, new BigDecimal("123456789.99"));

        Set<ConstraintViolation<ProdutoRequestDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> "price".equals(v.getPropertyPath().toString())));
    }
}
