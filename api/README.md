# Teste Técnico Attus - API RESTful (Back-end)

Esta é a API RESTful da solução do Teste Técnico Attus, desenvolvida em **Java 21** e **Spring Boot**. A API é integrada a um banco de dados **PostgreSQL** e gerencia tanto o cadastro tradicional de produtos quanto o monitoramento reativo de erros e análise de incidentes.

---

## ⚡ Funcionalidades Principais

1. **CRUD de Produtos**: Gerenciamento completo da entidade `Produto` (ID, Nome, Descrição, Preço e auditoria automática de criação/edição).
2. **Ingestão de Logs**: Ponto de entrada de telemetria e erros das aplicações clientes (incluindo capturas do navegador).
3. **Analisador de Incidentes em Tempo Real**: Monitora a frequência das falhas salvas nos últimos **5 minutos**. Se um mesmo erro atingir **5 ou mais ocorrências**, eleva o problema a um **Incidente de Produção** catalogado com gravidade e recomendações técnicas.

---

## 🔄 Fluxo de Ingestão & Geração de Incidentes

O processamento ocorre de forma reativa e sequencial através do seguinte fluxo:

1. **Ingestão**: O cliente dispara um log de erro via `POST /api/logs`.
2. **Persistência**: O log é gravado no banco de dados com carimbo de data/hora (`created_at`) e stack trace.
3. **Análise de Recorrência**: O `IncidentAnalyzerService` busca todos os logs idênticos (mesma mensagem) inseridos nos últimos **5 minutos**.
4. **Prevenção de Duplicidades**: Se a contagem de logs for `>= 5`, o analisador busca se já existe um incidente criado para essa **mesma mensagem** nos últimos **5 minutos**.
   - **Se existir**: Apenas incrementa as ocorrências (`occurrences`) no incidente existente para refletir a contagem atual, evitando poluir o banco e o painel.
   - **Se não existir**: Dispara as regras de assinatura e cria um novo incidente.

---

## 📋 Regras de Geração de Incidentes

- **Janela Temporal**: Logs gerados nos últimos **5 minutos** são considerados.
- **Frequência Mínima**: Requer **5 ou mais logs** idênticos para alertar um incidente.
- **Chave de Agrupamento**: Mensagem exata do erro (`message`).
- **Tipos Suportados por Keyword**:
  - `NETWORK_TIMEOUT` (Severidade: `HIGH`): Contém `timeout` ou `timed out`.
  - `DATABASE_FAILURE` (Severidade: `CRITICAL`): Contém `database`, `connection refused` ou `datasource`.
  - `MEMORY_LEAK` (Severidade: `CRITICAL`): Contém `outofmemory` ou `heap space`.
  - `APPLICATION_ERROR` (Severidade: `MEDIUM`): Mapeamento genérico para erros não catalogados.

---

## 🔌 Documentação dos Endpoints REST

A API responde no formato JSON (`application/json`) e roda por padrão na porta `8080`.

### 1. CRUD de Produtos

#### Listar Todos (`GET /api/produtos`)

- **Resposta (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Teclado Mecânico RGB",
      "description": "Switch Red ergonômico",
      "price": 289.9,
      "createdAt": "2026-05-25T14:09:03.123",
      "updatedAt": "2026-05-25T14:09:03.123"
    }
  ]
  ```

#### Criar Produto (`POST /api/produtos`)

- **Request Body:**
  ```json
  {
    "name": "Mouse Gamer",
    "description": "Mouse óptico de alta sensibilidade",
    "price": 149.9
  }
  ```
- **Resposta (201 Created):** Retorna o produto cadastrado com ID e carimbos de tempo.
- **Erro de Validação (400 Bad Request):** Nome vazio ou preço negativo/nulo.

#### Buscar por ID (`GET /api/produtos/{id}`)

- **Resposta (200 OK):** Detalhes do produto.
- **Erro (404 Not Found):** ID não existe.

#### Atualizar (`PUT /api/produtos/{id}`)

- **Request Body:** Mesma estrutura do POST.
- **Resposta (200 OK):** Produto com as novas informações e `updatedAt` modificado.

#### Excluir (`DELETE /api/produtos/{id}`)

- **Resposta (204 No Content):** Sem conteúdo.

---

### 2. Ingestão de Logs e Incidentes

#### Ingerir Log (`POST /api/logs`)

- **Request Body:**
  ```json
  {
    "application": "api",
    "environment": "production",
    "level": "ERROR",
    "message": "Connection timed out with gateway after 5000ms",
    "stackTrace": "java.net.SocketTimeoutException: Connect timed out"
  }
  ```
- **Resposta (201 Created):** Log gravado. Dispara imediatamente a rotina de incidentes.

#### Consultar Incidentes (`GET /api/incidents`)

- **Resposta (200 OK):** Retorna a lista de incidentes gerados por recorrências nos últimos 5 minutos, ordenados do mais recente.
  ```json
  [
    {
      "id": "5dc553a8-fa8e-4a67-8fbd-76c66cf17f7c",
      "type": "NETWORK_TIMEOUT",
      "severity": "HIGH",
      "message": "Connection timed out with gateway after 5000ms",
      "occurrences": 5,
      "recommendations": "Verificar conectividade; Aumentar timeout; Validar disponibilidade do serviço",
      "preventions": "Implementar retry; Adicionar monitoramento; Implementar circuit breaker",
      "createdAt": "2026-05-25T15:07:51.456"
    }
  ]
  ```

---

## 🛠️ Como Executar a API Localmente

### Pré-requisitos

- **Java Development Kit (JDK) 21**
- **PostgreSQL** ativo localmente (em `localhost:5432` com usuário `postgres` e senha `root`).
- Criar um banco de dados chamado `attus` (ou alterar as chaves de conexão no **application.properties**).

### Execução

Navegue até a pasta `api` e execute o comando usando o wrapper do Maven:

**No Windows (PowerShell/CMD):**

```powershell
.\mvnw.cmd spring-boot:run
```

**No macOS / Linux:**

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

A API estará ativa em **`http://localhost:8080`**.

---

## 🧪 Testes e Validação Rápida

Utilize a extensão **REST Client** do seu editor e execute os blocos de teste preparados diretamente do arquivo **requests.http**. Ele possui fluxos isolados e encadeados para validar a ingestão manual, erros de validação e a geração programática de incidentes.
