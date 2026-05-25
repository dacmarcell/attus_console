package com.attus.api.service;

import com.attus.api.dto.ProdutoRequestDTO;
import com.attus.api.dto.ProdutoResponseDTO;
import com.attus.api.exception.ProdutoNotFoundException;
import com.attus.api.model.Produto;
import com.attus.api.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    @Transactional
    public ProdutoResponseDTO create(ProdutoRequestDTO request) {
        Produto produto = new Produto(
            request.name(),
            request.description(),
            request.price()
        );
        Produto savedProduto = produtoRepository.save(produto);
        return ProdutoResponseDTO.fromEntity(savedProduto);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> findAll() {
        return produtoRepository.findAll()
            .stream()
            .map(ProdutoResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProdutoResponseDTO findById(Long id) {
        Produto produto = produtoRepository.findById(id)
            .orElseThrow(() -> new ProdutoNotFoundException(id));
        return ProdutoResponseDTO.fromEntity(produto);
    }

    @Transactional
    public ProdutoResponseDTO update(Long id, ProdutoRequestDTO request) {
        Produto produto = produtoRepository.findById(id)
            .orElseThrow(() -> new ProdutoNotFoundException(id));
        
        produto.setName(request.name());
        produto.setDescription(request.description());
        produto.setPrice(request.price());
        
        Produto updatedProduto = produtoRepository.save(produto);
        return ProdutoResponseDTO.fromEntity(updatedProduto);
    }

    @Transactional
    public void delete(Long id) {
        Produto produto = produtoRepository.findById(id)
            .orElseThrow(() -> new ProdutoNotFoundException(id));
        produtoRepository.delete(produto);
    }
}
