package com.attus.api.dto;

import com.attus.api.validation.ProdutoConstraints;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProdutoRequestDTO(
    @NotBlank(message = "O nome do produto é obrigatório")
    @Size(
        max = ProdutoConstraints.NAME_MAX_LENGTH,
        message = "O nome do produto deve ter no máximo {max} caracteres"
    )
    String name,

    @Size(
        max = ProdutoConstraints.DESCRIPTION_MAX_LENGTH,
        message = "A descrição do produto deve ter no máximo {max} caracteres"
    )
    String description,

    @NotNull(message = "O preço do produto é obrigatório")
    @Positive(message = "O preço do produto deve ser maior que zero")
    @Digits(
        integer = ProdutoConstraints.PRICE_INTEGER_DIGITS,
        fraction = ProdutoConstraints.PRICE_FRACTION_DIGITS,
        message = "O preço deve ter no máximo "
            + ProdutoConstraints.PRICE_INTEGER_DIGITS
            + " dígitos inteiros e "
            + ProdutoConstraints.PRICE_FRACTION_DIGITS
            + " casas decimais"
    )
    BigDecimal price
) {
}
