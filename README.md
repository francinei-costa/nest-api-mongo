# Nest Api Mongo

API REST em NestJS para cadastro, autenticação e consulta de usuários com autenticação via JWT.

## Visão geral

Este projeto implementa um fluxo simples de signin/signup com:

- cadastro de usuário
- hash de senha com bcrypt
- geração de token JWT
- geração e rotação de refresh token
- autenticação por bearer token
- persistência em MongoDB com Mongoose
- validação de entrada com class-validator
- documentação da API com Swagger

O projeto foi estruturado em módulos para separar responsabilidades entre autenticação e usuários.

## Stack tecnológica

- NestJS
- TypeScript
- MongoDB + Mongoose
- Passport + JWT
- Swagger / OpenAPI
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
├── config/
│   └── env.validation.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── models/
│   │   └── jwt-payload.model.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/
│   ├── dto/
│   │   ├── refresh-token.dto.ts
│   │   ├── signin.dto.ts
│   │   ├── signin-response.dto.ts
│   │   ├── signup.dto.ts
│   │   ├── users-query.dto.ts
│   │   └── users-response.dto.ts
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
5. Se correto, gera um access token JWT com `userId` e um refresh token.
6. Quando o access token expira, o cliente envia o refresh token para `POST /users/refresh`.
7. A aplicação valida o refresh token e gera um novo par de tokens por rotação.
8. As rotas protegidas usam o `JwtStrategy` para validar o bearer token informado no header `Authorization`.

## Requisitos

- Node.js 20+
- npm
- MongoDB em execução

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
MONGO_URI=mongodb://127.0.0.1:27017/nest-signin
JWT_SECRET=sua-chave-secreta-muito-forte
JWT_REFRESH_SECRET=outra-chave-secreta-muito-forte
NODE_ENV=development
PORT=3001
```

Em desenvolvimento, a aplicação usa valores padrão para `MONGO_URI`, `JWT_SECRET` e `JWT_REFRESH_SECRET` quando eles não são informados. Em produção (`NODE_ENV=production`), `MONGO_URI`, `JWT_SECRET` e `JWT_REFRESH_SECRET` são obrigatórias.

Use um mecanismo de secrets do provedor de hospedagem e uma URI MongoDB com autenticação, por exemplo `mongodb://usuario:senha@host:27017/banco?authSource=admin`. Nunca comite valores sensíveis no controle de versão.

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

### Swagger

Com a aplicação em execução, acesse a documentação interativa em:

```text
http://localhost:3001/api/docs
```

Se a variável `PORT` estiver configurada com outra porta, substitua `3001` na URL. Para testar os endpoints protegidos, use o botão `Authorize` e informe `Bearer <token>`.

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

Realiza autenticação e retorna os dados do usuário autenticado, o access token e o refresh token.

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
  "user": {
    "id": "65f1a2b3c4d5e6f789012345",
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### POST /users/refresh

Renova o access token usando um refresh token válido.

Body:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Resposta esperada:

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /users

Lista usuários cadastrados de forma paginada. Os parâmetros opcionais `page` (padrão `1`) e `limit` (padrão `10`, máximo `100`) controlam a página retornada.

Requer autenticação:

```http
Authorization: Bearer <token>
```

Exemplo: `GET /users?page=2&limit=10`.

Resposta esperada:

```json
{
  "data": [],
  "page": 2,
  "limit": 10,
  "total": 42,
  "totalPages": 5
}
```

## Observações de segurança e qualidade

- A senha é salva em formato hashado com bcrypt.
- O access token JWT expira em 1 hora.
- O refresh token expira em 7 dias e um novo par de tokens é emitido a cada renovação.
- As rotas sensíveis exigem autenticação do tipo bearer token.
- O `ValidationPipe` é ativado globalmente para validar DTOs automaticamente.
- A documentação interativa está disponível em `GET /api/docs`.

## Melhorias aplicadas

- resposta de login organizada com usuário, tokens, tipo e tempo de expiração
- paginação na listagem de usuários com metadados de total
- validação de variáveis obrigatórias em produção e suporte a URI MongoDB autenticada

## Autor

Francinei Costa
