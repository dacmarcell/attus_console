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

Aplicação disponível em **`http://localhost:5173`**.

| Script            | Descrição                                 |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (HMR)         |
| `npm run build`   | Type-check + build de produção em `dist/` |
| `npm run preview` | Pré-visualização do build                 |
| `npm run lint`    | ESLint                                    |

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

---

Requisições HTTP de exemplo para a API: **api/requests.http**.
