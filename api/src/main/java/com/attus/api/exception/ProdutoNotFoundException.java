package com.attus.api.exception;

public class ProdutoNotFoundException extends RuntimeException {
    public ProdutoNotFoundException(Long id) {
        super("Produto não encontrado com o ID: " + id);
    }
}
