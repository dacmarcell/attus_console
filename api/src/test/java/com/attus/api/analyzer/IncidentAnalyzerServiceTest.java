package com.attus.api.analyzer;

import com.attus.api.entity.Incident;
import com.attus.api.entity.Log;
import com.attus.api.repository.IncidentRepository;
import com.attus.api.repository.LogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidentAnalyzerServiceTest {

    @Mock
    private LogRepository logRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @InjectMocks
    private IncidentAnalyzerService incidentAnalyzerService;

    @Test
    void analyze_whenOccurrencesBelowThreshold_doesNothing() {
        Log log = sampleLog("Connection timed out");

        when(logRepository.countByMessageAndCreatedAtAfter(eq(log.getMessage()), any(LocalDateTime.class)))
            .thenReturn(4L);

        incidentAnalyzerService.analyze(log);

        verify(incidentRepository, never()).findFirstByMessageAndCreatedAtAfterOrderByCreatedAtDesc(any(), any());
        verify(incidentRepository, never()).save(any());
    }

    @Test
    void analyze_whenThresholdReachedAndNoExistingIncident_createsIncident() {
        String message = "Connection timed out";
        Log log = sampleLog(message);

        when(logRepository.countByMessageAndCreatedAtAfter(eq(message), any(LocalDateTime.class)))
            .thenReturn(5L);
        when(incidentRepository.findFirstByMessageAndCreatedAtAfterOrderByCreatedAtDesc(eq(message), any(LocalDateTime.class)))
            .thenReturn(Optional.empty());

        incidentAnalyzerService.analyze(log);

        ArgumentCaptor<Incident> captor = ArgumentCaptor.forClass(Incident.class);
        verify(incidentRepository).save(captor.capture());

        Incident saved = captor.getValue();
        assertEquals("NETWORK_TIMEOUT", saved.getType());
        assertEquals("HIGH", saved.getSeverity());
        assertEquals(message, saved.getMessage());
        assertEquals(5, saved.getOccurrences());
    }

    @Test
    void analyze_whenThresholdReachedAndIncidentExists_updatesOccurrences() {
        String message = "Connection refused to database";
        Log log = sampleLog(message);
        Incident existing = new Incident(
            "DATABASE_FAILURE",
            "CRITICAL",
            message,
            5,
            "rec",
            "prev",
            LocalDateTime.now()
        );

        when(logRepository.countByMessageAndCreatedAtAfter(eq(message), any(LocalDateTime.class)))
            .thenReturn(7L);
        when(incidentRepository.findFirstByMessageAndCreatedAtAfterOrderByCreatedAtDesc(eq(message), any(LocalDateTime.class)))
            .thenReturn(Optional.of(existing));

        incidentAnalyzerService.analyze(log);

        assertEquals(7, existing.getOccurrences());
        verify(incidentRepository).save(existing);
    }

    @Test
    void analyze_memoryErrorMessage_classifiesAsMemoryLeak() {
        String message = "OutOfMemoryError: Java heap space";
        Log log = sampleLog(message);

        when(logRepository.countByMessageAndCreatedAtAfter(eq(message), any(LocalDateTime.class)))
            .thenReturn(5L);
        when(incidentRepository.findFirstByMessageAndCreatedAtAfterOrderByCreatedAtDesc(eq(message), any(LocalDateTime.class)))
            .thenReturn(Optional.empty());

        incidentAnalyzerService.analyze(log);

        ArgumentCaptor<Incident> captor = ArgumentCaptor.forClass(Incident.class);
        verify(incidentRepository).save(captor.capture());
        assertEquals("MEMORY_LEAK", captor.getValue().getType());
        assertEquals("CRITICAL", captor.getValue().getSeverity());
    }

    private static Log sampleLog(String message) {
        return new Log(
            "payment-api",
            "production",
            "ERROR",
            message,
            "stack",
            LocalDateTime.now()
        );
    }
}
