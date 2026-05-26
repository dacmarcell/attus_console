package com.attus.api.controller;

import com.attus.api.entity.Incident;
import com.attus.api.repository.IncidentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = IncidentController.class)
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IncidentRepository incidentRepository;

    @Test
    void findAll_returnsIncidentsOrderedByCreatedAtDesc() throws Exception {
        Incident incident = new Incident(
            "NETWORK_TIMEOUT",
            "HIGH",
            "Connection timed out",
            5,
            "Verifique a conexão",
            "Use rede estável",
            LocalDateTime.now()
        );
        incident.setId(UUID.randomUUID());

        when(incidentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")))
            .thenReturn(List.of(incident));

        mockMvc.perform(get("/api/incidents"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].type").value("NETWORK_TIMEOUT"))
            .andExpect(jsonPath("$[0].severity").value("HIGH"))
            .andExpect(jsonPath("$[0].occurrences").value(5));
    }

    @Test
    void findAll_whenEmpty_returnsEmptyArray() throws Exception {
        when(incidentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")))
            .thenReturn(List.of());

        mockMvc.perform(get("/api/incidents"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }
}
