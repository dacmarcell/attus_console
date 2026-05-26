package com.attus.api.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleProdutoNotFound_returns404WithMessage() {
        ResponseEntity<Map<String, Object>> response =
            handler.handleProdutoNotFound(new ProdutoNotFoundException(42L));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().get("status"));
        assertTrue(response.getBody().get("message").toString().contains("42"));
    }

    @Test
    void handleValidationExceptions_returns400WithFieldErrors() throws NoSuchMethodException {
        var target = new Object() {
            @SuppressWarnings("unused")
            public void validate(String name) {
            }
        };
        BeanPropertyBindingResult bindingResult =
            new BeanPropertyBindingResult(target, "produtoRequest");
        bindingResult.addError(new FieldError("produtoRequest", "name", "O nome é obrigatório"));

        var exception = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidationExceptions(exception);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().get("status"));
        @SuppressWarnings("unchecked")
        Map<String, String> validationErrors = (Map<String, String>) response.getBody().get("validationErrors");
        assertEquals("O nome é obrigatório", validationErrors.get("name"));
    }

    @Test
    void handleGenericException_returns500() {
        ResponseEntity<Map<String, Object>> response =
            handler.handleGenericException(new RuntimeException("falha interna"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().get("status"));
        assertNotNull(response.getBody().get("message"));
    }
}
