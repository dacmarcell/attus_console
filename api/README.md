# Teste Técnico Attus - API de Produtos

Solução desenvolvida para o Teste Técnico da Attus, criada com Spring Boot.

---

## 🛠️ Tecnologias Utilizadas

### Back-end (API)

- **Linguagem:** Java 21
- **Framework:** Spring Boot
- **Persistência & ORM:** Spring Data JPA / Hibernate
- **Banco de Dados:** PostgreSQL
- **Gerenciador de Dependências:** Maven

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

- **JDK 21** instalado.
- **PostgreSQL** ativo e rodando localmente em sua porta padrão.

---

### Rodando a API

Navegue até a pasta `api` e execute o comando usando o wrapper do Maven:

**No Windows (PowerShell/CMD):**

```powershell
cd api
.\mvnw.cmd spring-boot:run
```

**No macOS / Linux:**

```bash
cd api
chmod +x mvnw
./mvnw spring-boot:run
```

A API estará disponível em: **`http://localhost:8080`**

---

## 📋 Documentação da API de Produtos

Todos os endpoints utilizam o formato **JSON** (`application/json`) tanto para requisição quanto para resposta.

### Resumo dos Endpoints

| Método   | Endpoint             | Ação                                    | Status Sucesso   |
| :------- | :------------------- | :-------------------------------------- | :--------------- |
| `POST`   | `/api/produtos`      | Cadastra um novo produto                | `201 Created`    |
| `GET`    | `/api/produtos`      | Lista todos os produtos cadastrados     | `200 OK`         |
| `GET`    | `/api/produtos/{id}` | Busca os detalhes de um produto pelo ID | `200 OK`         |
| `PUT`    | `/api/produtos/{id}` | Atualiza completamente um produto       | `200 OK`         |
| `DELETE` | `/api/produtos/{id}` | Exclui permanentemente um produto       | `204 No Content` |

---

### Detalhamento dos Endpoints

#### 1. Criar Produto (`POST /api/produtos`)

Cria um novo produto após validar os campos fornecidos.

- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Teclado Mecânico RGB",
    "description": "Switch Blue ABNT2",
    "price": 349.9
  }
  ```
- **Regras de Validação:**
  - `name`: Obrigatório, não pode estar em branco.
  - `price`: Obrigatório, não pode ser nulo e deve ser estritamente maior que zero.

- **Exemplo de Resposta de Sucesso (HTTP 201):**
  ```json
  {
    "id": 1,
    "name": "Teclado Mecânico RGB",
    "description": "Switch Blue ABNT2",
    "price": 349.9,
    "createdAt": "2026-05-25T14:09:03.123",
    "updatedAt": "2026-05-25T14:09:03.123"
  }
  ```

---

#### 2. Listar Todos (`GET /api/produtos`)

Recupera todos os registros de produtos salvos no banco.

- **Exemplo de Resposta de Sucesso (HTTP 200):**
  ```json
  [
    {
      "id": 1,
      "name": "Teclado Mecânico RGB",
      "description": "Switch Blue ABNT2",
      "price": 349.9,
      "createdAt": "2026-05-25T14:09:03.123",
      "updatedAt": "2026-05-25T14:09:03.123"
    }
  ]
  ```

---

#### 3. Buscar por ID (`GET /api/produtos/{id}`)

Retorna um único produto a partir do ID informado no caminho.

- **Exemplo de Resposta de Sucesso (HTTP 200):**
  ```json
  {
    "id": 1,
    "name": "Teclado Mecânico RGB",
    "description": "Switch Blue ABNT2",
    "price": 349.9,
    "createdAt": "2026-05-25T14:09:03.123",
    "updatedAt": "2026-05-25T14:09:03.123"
  }
  ```

---

#### 4. Atualizar por ID (`PUT /api/produtos/{id}`)

Atualiza completamente os dados de um produto existente.

- **Corpo da Requisição (JSON):**

  ```json
  {
    "name": "Teclado Mecânico RGB Premium",
    "description": "Edição especial switch Brown",
    "price": 399.9
  }
  ```

- **Exemplo de Resposta de Sucesso (HTTP 200):**
  ```json
  {
    "id": 1,
    "name": "Teclado Mecânico RGB Premium",
    "description": "Edição especial switch Brown",
    "price": 399.9,
    "createdAt": "2026-05-25T14:09:03.123",
    "updatedAt": "2026-05-25T14:14:10.789"
  }
  ```

---

#### 5. Excluir por ID (`DELETE /api/produtos/{id}`)

Remove o registro do produto especificado.

- **Exemplo de Resposta de Sucesso (HTTP 204):**
  _Sem corpo de resposta._

---

## 🛡️ Tratamento de Erros e Padrão de Resposta

A API implementa tratamento global de exceções, retornando respostas padronizadas e limpas para os clientes.

### Erro de Validação (HTTP 400 - Bad Request)

Ocorre quando os dados de entrada violam as regras descritas no DTO de requisição (ex: preço negativo).

```json
{
  "timestamp": "2026-05-25T14:10:00.456",
  "status": 400,
  "error": "Bad Request",
  "validationErrors": {
    "price": "O preço do produto deve ser maior que zero"
  }
}
```

### Recurso Não Encontrado (HTTP 404 - Not Found)

Ocorre ao tentar consultar, atualizar ou excluir um produto por um ID que não existe na base.

```json
{
  "timestamp": "2026-05-25T14:12:15.101",
  "status": 404,
  "error": "Not Found",
  "message": "Produto não encontrado com o ID: 999"
}
```
