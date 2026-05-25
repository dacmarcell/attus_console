package com.attus.api.rules;

public enum IncidentClassificationRule {
    TIMEOUT(
        "NETWORK_TIMEOUT",
        "HIGH",
        new String[]{"Verifique sua conexão com a internet", "Tente novamente em alguns minutos", "Evite atualizar a página repetidamente"},
        new String[]{"Mantenha uma conexão estável", "Evite múltiplas requisições simultâneas", "Utilize redes confiáveis"}
    ),
    DATABASE(
        "DATABASE_FAILURE",
        "CRITICAL",
        new String[]{"O sistema está temporariamente indisponível", "Tente acessar novamente mais tarde", "Caso o problema persista, entre em contato com o suporte"},
        new String[]{"Evite múltiplas tentativas consecutivas", "Salve suas informações antes de reenviar dados", "Acompanhe notificações de manutenção do sistema"}
    ),
    MEMORY(
        "MEMORY_LEAK",
        "CRITICAL",
        new String[]{"Feche outras abas ou aplicativos abertos", "Atualize a página", "Reinicie o aplicativo caso o problema continue"},
        new String[]{"Mantenha o aplicativo atualizado", "Evite executar muitas tarefas simultaneamente", "Limpe cache e dados temporários periodicamente"}
    ),
    DEFAULT(
        "APPLICATION_ERROR",
        "MEDIUM",
        new String[]{"Ocorreu um erro inesperado",
        "Tente novamente em instantes",
        "Se o erro persistir, contate o suporte"},
        new String[]{"Mantenha o aplicativo atualizado", "Verifique sua conexão", "Evite interromper operações em andamento"}
    );

    private final String type;
    private final String severity;
    private final String[] recommendations;
    private final String[] preventions;

    IncidentClassificationRule(String type, String severity, String[] recommendations, String[] preventions) {
        this.type = type;
        this.severity = severity;
        this.recommendations = recommendations;
        this.preventions = preventions;
    }

    public String getType() {
        return type;
    }

    public String getSeverity() {
        return severity;
    }

    public String getRecommendations() {
        return String.join("; ", recommendations);
    }

    public String getPreventions() {
        return String.join("; ", preventions);
    }

    public static IncidentClassificationRule classify(String message) {
        if (message == null) {
            return DEFAULT;
        }
        String lowerMessage = message.toLowerCase();
        if (lowerMessage.contains("timeout") || lowerMessage.contains("timed out")) {
            return TIMEOUT;
        }
        if (lowerMessage.contains("database") || lowerMessage.contains("connection refused") || lowerMessage.contains("datasource")) {
            return DATABASE;
        }
        if (lowerMessage.contains("outofmemory") || lowerMessage.contains("heap space")) {
            return MEMORY;
        }
        return DEFAULT;
    }
}
