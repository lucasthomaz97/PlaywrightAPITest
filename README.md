# Playwright API Test Suite

[🇬🇧 English](#english) · [🇧🇷 Português](#portugues)

---

## English <a id="english"></a>

This project is first and foremost a **study on API testing with Playwright**. The API itself is intentionally minimal — a basic Express + PostgreSQL scaffold built solely to give the tests something to run against. The real focus is the test suite, not the API.

The API lives in the `api/` directory — see its [README](api/README.md) for setup and endpoint details.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally
- API server running on `http://localhost:3000`

## Setup

```bash
npm install
```

Configure the database via `.env` (see `.env.example`), then start the server:

```bash
npm run server
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests by endpoint
npm run test:get-products
npm run test:post-product
npm run test:put-product
npm run test:delete-product
npm run test:get-user
npm run test:post-user
npm run test:put-user
npm run test:delete-user
```

## Project Structure

```
tests/api/
├── clients/          # API request wrappers (ProductsClient, UsersClient)
├── helpers/          # Assertion helpers (response, user, product)
├── models/           # TypeScript interfaces (Product, User)
└── tests/            # Test specs (products.spec.ts, users.spec.ts)
```

## Test Coverage

The test suite covers **CRUD operations** for two resources:

### Products (`/products`)
- **GET** — list all products, get by ID (including error cases: invalid ID, non-existent, negative, decimal)
- **POST** — create product (validation: missing fields, non-string name, invalid price, negative price, non-string description)
- **PUT** — update product (partial updates, validation errors, non-existent ID)
- **DELETE** — delete product (idempotency, invalid IDs)

### Users (`/users`)
- **GET** — get user by ID (error cases: non-existent, invalid, negative, decimal)
- **POST** — create user (validation: missing fields, empty fields, invalid email, duplicate email)
- **PUT** — update user (partial updates, duplicate email, validation errors)
- **DELETE** — delete user (idempotency, invalid IDs)

Each test validates:
- HTTP status code
- Response body structure and types
- Response time (< 1000ms)
- `Content-Type: application/json` header

## Test Architecture

- **Clients** (`tests/api/clients/`) — wrap Playwright's `APIRequestContext` for each resource, providing typed methods and response time tracking
- **Helpers** (`tests/api/helpers/`) — reusable assertions for responses, users, and products
- **Models** (`tests/api/models/`) — TypeScript interfaces for `Product` and `User`
- **Tests** (`tests/api/tests/`) — Playwright test specs organized by HTTP method

---

## Português <a id="portugues"></a>

Este projeto é, antes de tudo, um **estudo sobre testes de API com Playwright**. A API é intencionalmente mínima — um scaffold básico com Express + PostgreSQL criado apenas para dar aos testes algo onde rodar. O foco real é a suíte de testes, não a API.

A API está no diretório `api/` — veja o [README](api/README.md) para detalhes de configuração e endpoints.

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando
- Servidor da API rodando em `http://localhost:3000`

## Configuração

```bash
npm install
```

Configure o banco via `.env` (veja `.env.example`), então inicie o servidor:

```bash
npm run server
```

## Executando os Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes por endpoint
npm run test:get-products
npm run test:post-product
npm run test:put-product
npm run test:delete-product
npm run test:get-user
npm run test:post-user
npm run test:put-user
npm run test:delete-user
```

## Estrutura do Projeto

```
tests/api/
├── clients/          # Wrappers de requisição (ProductsClient, UsersClient)
├── helpers/          # Asserções reutilizáveis (response, user, product)
├── models/           # Interfaces TypeScript (Product, User)
└── tests/            # Specs de teste (products.spec.ts, users.spec.ts)
```

## Cobertura de Testes

### Produtos (`/products`)
- **GET** — listar todos, buscar por ID (casos de erro: ID inválido, inexistente, negativo, decimal)
- **POST** — criar produto (validação: campos ausentes, nome não-string, preço inválido, preço negativo, descrição não-string)
- **PUT** — atualizar produto (atualização parcial, validação de campos, ID inexistente)
- **DELETE** — excluir produto (idempotência, IDs inválidos)

### Usuários (`/users`)
- **GET** — buscar por ID (casos de erro: ID inválido, inexistente, negativo, decimal)
- **POST** — criar usuário (validação: campos vazios/ausentes, email inválido, email duplicado)
- **PUT** — atualizar usuário (atualização parcial, email duplicado, validação de campos)
- **DELETE** — excluir usuário (idempotência, IDs inválidos)

Cada teste valida:
- Código de status HTTP
- Estrutura e tipos do corpo da resposta
- Tempo de resposta (< 1000ms)
- Cabeçalho `Content-Type: application/json`

## Arquitetura dos Testes

- **Clients** (`tests/api/clients/`) — encapsulam o `APIRequestContext` do Playwright para cada recurso, com métodos tipados e medição de tempo de resposta
- **Helpers** (`tests/api/helpers/`) — asserções reutilizáveis para respostas, usuários e produtos
- **Models** (`tests/api/models/`) — interfaces TypeScript para `Product` e `User`
- **Tests** (`tests/api/tests/`) — specs do Playwright organizados por método HTTP