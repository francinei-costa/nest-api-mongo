# Nest Api Mongo

API REST em NestJS para cadastro, autenticação e consulta de usuários com autenticação via JWT.

## Visão geral

Este projeto implementa um fluxo simples de signin/signup com:

- cadastro de usuário
- hash de senha com bcrypt
- geração de token JWT
- autenticação por bearer token
- persistência em MongoDB com Mongoose
- validação de entrada com class-validator

O projeto foi estruturado em módulos para separar responsabilidades entre autenticação e usuários.

## Stack tecnológica

- NestJS
- TypeScript
- MongoDB + Mongoose
- Passport + JWT
- bcrypt
- class-validator / class-transformer
- Jest

## Estrutura do projeto

```text
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── models/
│   │   └── jwt-payload.model.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/
│   ├── dto/
│   │   ├── signin.dto.ts
│   │   └── signup.dto.ts
│   ├── models/
│   │   └── users.model.ts
│   ├── schemas/
│   │   └── users.schema.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
```

## Fluxo de autenticação

1. O cliente faz uma requisição para `POST /users/signup` com nome, email e senha.
2. O usuário é salvo no MongoDB e a senha é hasheada antes de persistir.
3. O cliente envia credenciais para `POST /users/signin`.
4. A aplicação valida o email e compara a senha com o hash salvo.
5. Se correto, gera um token JWT com `userId` e retorna para o cliente.
6. As rotas protegidas usam o `JwtStrategy` para validar o bearer token informado no header `Authorization`.

## Requisitos

- Node.js 20+
- npm
- MongoDB em execução

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
MONGO_URI=mongodb://127.0.0.1:27017/nest-signin
JWT_SECRET=sua-chave-secreta-muito-forte
PORT=3001
```

> Em ambientes reais, use uma secret forte e nunca comite valores sensíveis no controle de versão.

## Instalação

```bash
npm install
```

## Execução

```bash
# iniciar em modo normal
npm run start

# modo watch
npm run start:dev

# build da aplicação
npm run build
```

## Testes

```bash
npm test
npm run test:e2e
```

## Endpoints

### POST /users/signup

Cria um novo usuário.

Body:

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

Resposta: retorna o documento do usuário salvo.

### POST /users/signin

Realiza autenticação e retorna o token JWT.

Body:

```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

Resposta esperada:

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /users

Lista usuários cadastrados.

Requer autenticação:

```http
Authorization: Bearer <token>
```

## Observações de segurança e qualidade

- A senha é salva em formato hashado com bcrypt.
- O token JWT expira em 1 dia.
- As rotas sensíveis exigem autenticação do tipo bearer token.
- O `ValidationPipe` é ativado globalmente para validar DTOs automaticamente.
- O código foi ajustado para evitar erros de configuração do TypeScript e melhorar a robustez do JWT e do MongoDB.

## Melhorias futuras

- separar respostas de login em payload mais descritivo
- adicionar refresh token
- incluir paginação na listagem de usuários
- adicionar testes unitários para auth e users
- criar documentação de Swagger/OpenAPI
- configurar ambientes de produção com variáveis seguras e autenticação de banco adequada

## Autor

Francinei Costa
