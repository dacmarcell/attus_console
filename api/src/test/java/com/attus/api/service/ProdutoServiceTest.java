package com.attus.api.service;

import com.attus.api.dto.ProdutoRequestDTO;
import com.attus.api.dto.ProdutoResponseDTO;
import com.attus.api.exception.ProdutoNotFoundException;
import com.attus.api.model.Produto;
import com.attus.api.repository.ProdutoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    @Test
    void create_persistsAndReturnsDto() {
        var request = new ProdutoRequestDTO("Teclado", "Mecânico", new BigDecimal("299.90"));
        var saved = produtoWithId(1L, "Teclado", "Mecânico", new BigDecimal("299.90"));

        when(produtoRepository.save(any(Produto.class))).thenReturn(saved);

        ProdutoResponseDTO result = produtoService.create(request);

        assertEquals(1L, result.id());
        assertEquals("Teclado", result.name());
        assertEquals(new BigDecimal("299.90"), result.price());

        ArgumentCaptor<Produto> captor = ArgumentCaptor.forClass(Produto.class);
        verify(produtoRepository).save(captor.capture());
        assertEquals("Teclado", captor.getValue().getName());
    }

    @Test
    void findAll_mapsEntitiesToDto() {
        var produto = produtoWithId(2L, "Mouse", null, new BigDecimal("99.00"));
        when(produtoRepository.findAll()).thenReturn(List.of(produto));

        List<ProdutoResponseDTO> result = produtoService.findAll();

        assertEquals(1, result.size());
        assertEquals("Mouse", result.getFirst().name());
    }

    @Test
    void findById_whenExists_returnsDto() {
        var produto = produtoWithId(3L, "Monitor", "4K", new BigDecimal("1500.00"));
        when(produtoRepository.findById(3L)).thenReturn(Optional.of(produto));

        ProdutoResponseDTO result = produtoService.findById(3L);

        assertEquals(3L, result.id());
        assertEquals("Monitor", result.name());
    }

    @Test
    void findById_whenMissing_throwsProdutoNotFound() {
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ProdutoNotFoundException.class, () -> produtoService.findById(99L));
    }

    @Test
    void update_whenExists_updatesFields() {
        var existing = produtoWithId(4L, "Antigo", "Desc", new BigDecimal("10.00"));
        var request = new ProdutoRequestDTO("Novo", "Nova desc", new BigDecimal("20.00"));
        var updated = produtoWithId(4L, "Novo", "Nova desc", new BigDecimal("20.00"));

        when(produtoRepository.findById(4L)).thenReturn(Optional.of(existing));
        when(produtoRepository.save(existing)).thenReturn(updated);

        ProdutoResponseDTO result = produtoService.update(4L, request);

        assertEquals("Novo", result.name());
        assertEquals(new BigDecimal("20.00"), result.price());
        verify(produtoRepository).save(existing);
    }

    @Test
    void update_whenMissing_throwsProdutoNotFound() {
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        var request = new ProdutoRequestDTO("X", null, new BigDecimal("1.00"));

        assertThrows(ProdutoNotFoundException.class, () -> produtoService.update(99L, request));
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void delete_whenExists_removesEntity() {
        var produto = produtoWithId(5L, "Remover", null, new BigDecimal("5.00"));
        when(produtoRepository.findById(5L)).thenReturn(Optional.of(produto));

        produtoService.delete(5L);

        verify(produtoRepository).delete(produto);
    }

    @Test
    void delete_whenMissing_throwsProdutoNotFound() {
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ProdutoNotFoundException.class, () -> produtoService.delete(99L));
        verify(produtoRepository, never()).delete(any());
    }

    private static Produto produtoWithId(Long id, String name, String description, BigDecimal price) {
        Produto produto = new Produto(name, description, price);
        produto.setId(id);
        LocalDateTime now = LocalDateTime.now();
        produto.setCreatedAt(now);
        produto.setUpdatedAt(now);
        return produto;
    }
}
