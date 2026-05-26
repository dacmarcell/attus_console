# Attus Console — Front-end (Web)

SPA em **React 19**, **TypeScript** e **Vite** que consome a API Spring Boot (`http://localhost:8080/api`). O console oferece duas áreas principais: **monitoramento de incidentes** (ingestão e visualização de logs) e **gestão de produtos** (CRUD).

Para detalhes do back-end, consulte **api/README.md**.

---

## Pré-requisitos e execução

| Requisito | Versão sugerida             |
| --------- | --------------------------- |
| Node.js   | 18+                         |
| npm       | incluso com Node            |
| API Attus | rodando em `localhost:8080` |

```bash
cd web
npm install
npm run dev
```

Aplicação disponível em **`http://localhost:5173`** (API em `http://localhost:8080/api`).

### Docker (somente front-end)

Na pasta `web`, com a API já acessível:

```bash
docker build -t attus-web --build-arg VITE_API_BASE_URL=/api .
docker run -p 8081:80 --network attus_default attus-web
```

Recomendado: usar o **docker compose na raiz** do monorepo (ver README principal).

| Script            | Descrição                                 |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (HMR)         |
| `npm run build`   | Type-check + build de produção em `dist/` |
| `npm run preview` | Pré-visualização do build                 |
| `npm run lint`    | ESLint                                    |
| `npm run test`    | Vitest em modo watch                      |
| `npm run test:run`| Vitest (execução única, CI)                |

---

## Testes

Stack: **Vitest**, **Testing Library**, **jsdom**. A API é simulada com `vi.stubGlobal("fetch", ...)`.

```bash
cd web
npm run test:run
```

### Unitários

| Arquivo | Cenários |
| ------- | -------- |
| `utils/helpers.test.ts` | Formatação de data |
| `components/SeverityBadge.test.tsx` | Classes e texto da severidade |
| `components/ProductsView.test.tsx` | Listagem, busca, validações, criar/editar/excluir |
| `components/DashboardView.test.tsx` | Incidentes, filtros, simulação, log vazio |
| `context/AppUiContext.test.tsx` | Modal, toast, erro fora do provider |

### Integração

| Arquivo | Cenários |
| ------- | -------- |
| `pages/ProductsPage.integration.test.tsx` | GET produtos, POST com modal de sucesso, erro de rede |
| `pages/DashboardPage.integration.test.tsx` | GET incidentes, POST log, erro de listagem |
| `routes/AppRoutes.integration.test.tsx` | Redirect `/` → produtos, navegação sidebar |

Utilitários em `src/test/`: `test-utils.tsx` (provider + modal/toast), `fixtures.ts`, `product-form.ts`.

---

## Rotas

| Caminho       | Página          | Conteúdo                                |
| ------------- | --------------- | --------------------------------------- |
| `/`           | —               | Redireciona para `/produtos`            |
| `/incidentes` | `DashboardPage` | `DashboardPageHeader` + `DashboardView` |
| `/produtos`   | `ProductsPage`  | `ProductsPageHeader` + `ProductsView`   |

---

## Stack e ferramentas

- **React 19**
- **TypeScript**
- **Vite 8**
- **react-router-dom** — roteamento
- **Vitest** + **Testing Library** — testes

---

Requisições HTTP de exemplo para a API: **api/requests.http**.
