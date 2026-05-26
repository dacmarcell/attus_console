# Teste Técnico Attus

Este é o repositório principal contendo a solução desenvolvida para o Teste Técnico da Attus. O projeto está estruturado em formato de monorepo dividido em duas aplicações principais:

- 📁 **api/**: Aplicação Back-end RESTful desenvolvida em **Java 21** e **Spring Boot** com banco de dados **PostgreSQL**.
- 📁 **web/**: Aplicação Front-end SPA moderna em **React**, **TypeScript** e **Vite**.

---

## 🚀 Como Executar o Repositório

### Opção 1: Docker Compose (recomendado)

**Pré-requisito:** [Docker](https://docs.docker.com/get-docker/) e Docker Compose.

Na raiz do repositório:

```bash
docker compose up --build
```

| Serviço        | URL                       | Descrição                                     |
| -------------- | ------------------------- | --------------------------------------------- |
| **Web**        | http://localhost:80       | Front-end (Nginx + proxy `/api` → API)        |
| **API**        | http://localhost:8080/api | Back-end Spring Boot                          |
| **PostgreSQL** | `localhost:5432`          | Banco `attus` (user `postgres`, senha `root`) |

Comandos úteis:

```bash
docker compose up --build -d    # em segundo plano
docker compose down             # parar e remover containers
docker compose down -v          # parar e apagar volume do banco
```

---

### Opção 2: Execução local (desenvolvimento)

**Pré-requisitos**

- **Java Development Kit (JDK) 21** instalado.
- **Node.js 18+** e **npm** instalados.
- **PostgreSQL** ativo e rodando localmente (padrão em `localhost:5432` com usuário `postgres` e senha `root`).

---

### 1. Inicializando o Back-end (API)

Acesse a pasta `/api` e inicie o Spring Boot utilizando o Maven Wrapper:

```bash
cd api

# No Windows:
.\mvnw.cmd spring-boot:run

# No macOS / Linux:
chmod +x mvnw
./mvnw spring-boot:run
```

- Para ver detalhes de modelagem, diagramas da arquitetura de incidentes, regras de negócio e documentação completa de endpoints do CRUD de produtos e logs, acesse:
  📖 **api/README.md**

---

### 2. Inicializando o Front-end (Web)

Acesse a pasta `/web`, instale as dependências de pacotes e rode o servidor de desenvolvimento Vite:

```bash
cd web
npm install
npm run dev
```

O front-end estará disponível em: **`http://localhost:5173`**. Para ver detalhes do front-end, acesse: **📖 web/README.md**

---

## 🧪 Testes Rápidos da API

Dispare as rotas de teste preparadas utilizando a extensão **REST Client** de dentro do arquivo:
📄 **api/requests.http**

---

## Nota Técnica — Decisões, Trade-offs e Melhorias Futuras

- **Decisões principais**:
  - _API_: adotei **Java 21 + Spring Boot** pela maturidade do ecossistema, familiaridade e requisito da vaga.
  - _Web_: escolhi **React** para desenvolvimento rápido e familiaridade com a lib.

- **Trade-offs**:
  - O sistema de análise de incidentes utiliza classificação baseada em logica mais simples, ao invés de mecanismos de correlação ou IA. A decisão reduz complexidade, facilita manutenção e torna a lógica mais transparente, mas aumenta a possibilidade de falsos positivos em cenários complexos.
  - A geração de incidentes ocorre logo após a inserção do log, sem o uso de filas. A abordagem simplifica a arquitetura e reduz dependências externas, porém pode impactar escalabilidade e tempo de resposta em cenários de alto volume de eventos.
  - A identificação de recorrência utiliza agrupamento por mensagem exata do log, porém não realiza normalização semântica ou aproximação textual, podendo tratar mensagens similares como incidentes distintos.

- **Melhorias futuras recomendadas**:
  - _API_: adicionar autenticação e autorização, paginação, métricas e observabilidade, políticas de retry e CI. Considerar otimizações de imagens de container.
  - _Web_: implementar lazy loading, PWA, auditoria de acessibilidade e testes E2E.
  - _Infra_: externalizar secrets, configurar pipelines de CI/CD, backups e redundancia do banco, deploy em VPS e adicionar monitoramento e alertas.
