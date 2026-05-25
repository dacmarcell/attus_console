package com.attus.api.repository;

import com.attus.api.entity.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface LogRepository extends JpaRepository<Log, UUID> {
    long countByMessageAndCreatedAtAfter(String message, LocalDateTime dateTime);
}
