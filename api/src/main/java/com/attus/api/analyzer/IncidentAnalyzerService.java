package com.attus.api.analyzer;

import com.attus.api.entity.Incident;
import com.attus.api.entity.Log;
import com.attus.api.repository.IncidentRepository;
import com.attus.api.repository.LogRepository;
import com.attus.api.rules.IncidentClassificationRule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class IncidentAnalyzerService {

    private final LogRepository logRepository;
    private final IncidentRepository incidentRepository;

    public IncidentAnalyzerService(LogRepository logRepository, IncidentRepository incidentRepository) {
        this.logRepository = logRepository;
        this.incidentRepository = incidentRepository;
    }

    @Transactional
    public void analyze(Log ingestedLog) {
        String message = ingestedLog.getMessage();
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);

        // Count occurrences of this same message in the last 5 minutes
        long occurrences = logRepository.countByMessageAndCreatedAtAfter(message, fiveMinutesAgo);

        // If it occurs 5 times or more, check or generate incident
        if (occurrences >= 5) {
            // Check for duplicates (existing incident with exact same message created in the last 5 minutes)
            Optional<Incident> existingIncidentOpt = incidentRepository
                    .findFirstByMessageAndCreatedAtAfterOrderByCreatedAtDesc(message, fiveMinutesAgo);

            if (existingIncidentOpt.isPresent()) {
                // Duplicate prevention: Update occurrences of existing incident
                Incident existingIncident = existingIncidentOpt.get();
                existingIncident.setOccurrences((int) occurrences);
                incidentRepository.save(existingIncident);
            } else {
                // Generate a new incident
                IncidentClassificationRule classification = IncidentClassificationRule.classify(message);

                Incident newIncident = new Incident(
                    classification.getType(),
                    classification.getSeverity(),
                    message,
                    (int) occurrences,
                    classification.getRecommendations(),
                    classification.getPreventions(),
                    LocalDateTime.now()
                );

                incidentRepository.save(newIncident);
            }
        }
    }
}
