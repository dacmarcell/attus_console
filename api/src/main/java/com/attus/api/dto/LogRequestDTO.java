package com.attus.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LogRequestDTO(
    @NotBlank(message = "A aplicação é obrigatória")
    String application,

    @NotBlank(message = "O ambiente é obrigatório")
    String environment,

    @NotBlank(message = "O nível do log é obrigatório")
    String level,

    @NotBlank(message = "A mensagem é obrigatória")
    String message,

    String stackTrace
) {
}
