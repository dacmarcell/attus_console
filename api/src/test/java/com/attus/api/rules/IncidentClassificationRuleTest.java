package com.attus.api.rules;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class IncidentClassificationRuleTest {

    @Test
    void classify_nullMessage_returnsDefault() {
        IncidentClassificationRule rule = IncidentClassificationRule.classify(null);

        assertEquals(IncidentClassificationRule.DEFAULT, rule);
        assertEquals("APPLICATION_ERROR", rule.getType());
        assertEquals("MEDIUM", rule.getSeverity());
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "Gateway Timeout after 5000ms",
        "Connection timed out",
        "REQUEST TIMEOUT"
    })
    void classify_timeoutKeywords_returnsTimeout(String message) {
        IncidentClassificationRule rule = IncidentClassificationRule.classify(message);

        assertEquals(IncidentClassificationRule.TIMEOUT, rule);
        assertEquals("NETWORK_TIMEOUT", rule.getType());
        assertEquals("HIGH", rule.getSeverity());
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "Could not connect to database",
        "Connection refused on postgres",
        "Hikari datasource unavailable"
    })
    void classify_databaseKeywords_returnsDatabase(String message) {
        IncidentClassificationRule rule = IncidentClassificationRule.classify(message);

        assertEquals(IncidentClassificationRule.DATABASE, rule);
        assertEquals("DATABASE_FAILURE", rule.getType());
        assertEquals("CRITICAL", rule.getSeverity());
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "java.lang.OutOfMemoryError",
        "Java heap space exhausted"
    })
    void classify_memoryKeywords_returnsMemory(String message) {
        IncidentClassificationRule rule = IncidentClassificationRule.classify(message);

        assertEquals(IncidentClassificationRule.MEMORY, rule);
        assertEquals("MEMORY_LEAK", rule.getType());
        assertEquals("CRITICAL", rule.getSeverity());
    }

    @Test
    void classify_unknownMessage_returnsDefault() {
        IncidentClassificationRule rule = IncidentClassificationRule.classify("Unexpected null pointer");

        assertEquals(IncidentClassificationRule.DEFAULT, rule);
    }

    @Test
    void getRecommendations_joinsWithSemicolon() {
        String recommendations = IncidentClassificationRule.TIMEOUT.getRecommendations();

        assertTrue(recommendations.contains(";"));
    }
}
