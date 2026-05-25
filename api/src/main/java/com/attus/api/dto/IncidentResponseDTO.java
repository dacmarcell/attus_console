package com.attus.api.dto;

import com.attus.api.entity.Incident;
import java.time.LocalDateTime;
import java.util.UUID;

public record IncidentResponseDTO(
    UUID id,
    String type,
    String severity,
    String message,
    Integer occurrences,
    String recommendations,
    String preventions,
    LocalDateTime createdAt
) {
    public static IncidentResponseDTO fromEntity(Incident incident) {
        return new IncidentResponseDTO(
            incident.getId(),
            incident.getType(),
            incident.getSeverity(),
            incident.getMessage(),
            incident.getOccurrences(),
            incident.getRecommendations(),
            incident.getPreventions(),
            incident.getCreatedAt()
        );
    }
}
