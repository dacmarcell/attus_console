package com.attus.api.controller;

import com.attus.api.analyzer.IncidentAnalyzerService;
import com.attus.api.dto.LogRequestDTO;
import com.attus.api.entity.Log;
import com.attus.api.repository.LogRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class LogController {

    private final LogRepository logRepository;
    private final IncidentAnalyzerService incidentAnalyzerService;

    public LogController(LogRepository logRepository, IncidentAnalyzerService incidentAnalyzerService) {
        this.logRepository = logRepository;
        this.incidentAnalyzerService = incidentAnalyzerService;
    }

    @PostMapping
    public ResponseEntity<Log> ingest(@Valid @RequestBody LogRequestDTO request) {
        Log log = new Log(
            request.application(),
            request.environment(),
            request.level(),
            request.message(),
            request.stackTrace(),
            LocalDateTime.now()
        );

        Log savedLog = logRepository.save(log);

        // Run incident analysis
        incidentAnalyzerService.analyze(savedLog);

        return new ResponseEntity<>(savedLog, HttpStatus.CREATED);
    }
}
