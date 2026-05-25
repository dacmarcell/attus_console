package com.attus.api.repository;

import com.attus.api.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    Optional<Incident> findFirstByMessageAndCreatedAtAfterOrderByCreatedAtDesc(String message, LocalDateTime dateTime);
}
