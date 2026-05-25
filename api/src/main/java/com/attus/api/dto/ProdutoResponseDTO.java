package com.attus.api.dto;

import com.attus.api.model.Produto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProdutoResponseDTO(
    Long id,
    String name,
    String description,
    BigDecimal price,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ProdutoResponseDTO fromEntity(Produto produto) {
        return new ProdutoResponseDTO(
            produto.getId(),
            produto.getName(),
            produto.getDescription(),
            produto.getPrice(),
            produto.getCreatedAt(),
            produto.getUpdatedAt()
        );
    }
}
