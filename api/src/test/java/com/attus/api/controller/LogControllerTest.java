package com.attus.api.controller;

import com.attus.api.analyzer.IncidentAnalyzerService;
import com.attus.api.entity.Log;
import com.attus.api.repository.LogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = LogController.class)
class LogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LogRepository logRepository;

    @MockitoBean
    private IncidentAnalyzerService incidentAnalyzerService;

    @Test
    void ingest_validBody_returns201AndTriggersAnalysis() throws Exception {
        Log saved = new Log(
            "api",
            "production",
            "ERROR",
            "Connection timed out",
            "stack",
            LocalDateTime.now()
        );
        saved.setId(UUID.randomUUID());

        when(logRepository.save(any(Log.class))).thenReturn(saved);

        mockMvc.perform(post("/api/logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "application": "api",
                      "environment": "production",
                      "level": "ERROR",
                      "message": "Connection timed out",
                      "stackTrace": "java.net.SocketTimeoutException"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.message").value("Connection timed out"));

        verify(incidentAnalyzerService).analyze(saved);
    }

    @Test
    void ingest_missingRequiredFields_returns400() throws Exception {
        mockMvc.perform(post("/api/logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "application": "",
                      "environment": "production",
                      "level": "ERROR"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.validationErrors").exists());
    }
}
