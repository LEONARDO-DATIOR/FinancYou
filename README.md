# FinancYou

Aplicação simples para consultar e cadastrar rendas, com API em Node.js/Express, interface em React e banco PostgreSQL no Supabase.

## Requisitos

- Node.js 20.19+ ou 22.12+
- Um projeto no [Supabase](https://supabase.com/)

## Configuração

1. No SQL Editor do Supabase, execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql) para criar a tabela `public.renda`.
2. Na raiz do projeto, crie seu arquivo de ambiente a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

3. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env`, usando os dados do projeto Supabase. A chave `service_role` fica apenas no servidor; nunca a coloque no React nem em variáveis `VITE_*`.
4. Instale as dependências e inicie a API e o front-end:

   ```bash
   npm install
   npm --prefix client install
   npm run dev
   ```

5. Acesse o endereço informado pelo Vite (normalmente `http://localhost:5173`). A API fica disponível em `http://localhost:3001`.

## API

- `GET /api/rendas` lista as rendas, ordenadas da mais recente para a mais antiga.
- `POST /api/rendas` cadastra uma renda. Envie JSON com `TipoDeRenda`, `Nome`, `Data` (formato `AAAA-MM-DD`) e `Valor` (maior que zero). O `ID` é gerado pelo banco.

## Segurança

Arquivos `.env` e credenciais locais são ignorados pelo Git. O backend usa a chave `service_role`, que contorna as políticas RLS; portanto, não exponha essa chave e proteja a API com autenticação e autorização antes de disponibilizar o app publicamente. A interface e a API neste exemplo não implementam login.
