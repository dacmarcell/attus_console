package com.attus.api.controller;

import com.attus.api.dto.IncidentResponseDTO;
import com.attus.api.repository.IncidentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentRepository incidentRepository;

    public IncidentController(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponseDTO>> findAll() {
        List<IncidentResponseDTO> incidents = incidentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
            .stream()
            .map(IncidentResponseDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(incidents);
    }
}
