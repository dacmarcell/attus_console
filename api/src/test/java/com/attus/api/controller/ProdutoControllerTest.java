package com.attus.api.controller;

import com.attus.api.dto.ProdutoRequestDTO;
import com.attus.api.dto.ProdutoResponseDTO;
import com.attus.api.exception.ProdutoNotFoundException;
import com.attus.api.service.ProdutoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProdutoController.class)
class ProdutoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProdutoService produtoService;

    @Test
    void create_validBody_returns201() throws Exception {
        var response = sampleResponse(1L, "Mouse", new BigDecimal("99.90"));
        when(produtoService.create(any(ProdutoRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/produtos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Mouse",
                      "description": "Gamer",
                      "price": 99.90
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Mouse"));
    }

    @Test
    void create_invalidBody_returns400() throws Exception {
        mockMvc.perform(post("/api/produtos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "",
                      "price": -1
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.validationErrors").exists());
    }

    @Test
    void findAll_returns200WithList() throws Exception {
        when(produtoService.findAll()).thenReturn(List.of(sampleResponse(1L, "A", new BigDecimal("10"))));

        mockMvc.perform(get("/api/produtos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("A"));
    }

    @Test
    void findById_whenExists_returns200() throws Exception {
        when(produtoService.findById(1L)).thenReturn(sampleResponse(1L, "A", new BigDecimal("10")));

        mockMvc.perform(get("/api/produtos/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void findById_whenMissing_returns404() throws Exception {
        when(produtoService.findById(99L)).thenThrow(new ProdutoNotFoundException(99L));

        mockMvc.perform(get("/api/produtos/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Produto não encontrado com o ID: 99"));
    }

    @Test
    void update_validBody_returns200() throws Exception {
        var response = sampleResponse(2L, "Atualizado", new BigDecimal("50"));
        when(produtoService.update(eq(2L), any(ProdutoRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/produtos/2")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Atualizado",
                      "description": "Novo",
                      "price": 50
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Atualizado"));
    }

    @Test
    void delete_whenExists_returns204() throws Exception {
        doNothing().when(produtoService).delete(3L);

        mockMvc.perform(delete("/api/produtos/3"))
            .andExpect(status().isNoContent());
    }

    @Test
    void delete_whenMissing_returns404() throws Exception {
        doThrow(new ProdutoNotFoundException(99L)).when(produtoService).delete(99L);

        mockMvc.perform(delete("/api/produtos/99"))
            .andExpect(status().isNotFound());
    }

    private static ProdutoResponseDTO sampleResponse(Long id, String name, BigDecimal price) {
        LocalDateTime now = LocalDateTime.now();
        return new ProdutoResponseDTO(id, name, "desc", price, now, now);
    }
}
