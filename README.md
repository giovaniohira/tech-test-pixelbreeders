# FileVault

Aplicação web de gerenciamento de arquivos construída como avaliação técnica. Usuários autenticados podem enviar, organizar, visualizar, baixar e compartilhar arquivos com experiência estilo SaaS.

## Features implementadas

| Área | O que está disponível |
|------|------------------------|
| **Autenticação** | Registro, login, logout, refresh JWT (cookie httpOnly + access token em memória) |
| **Landing page** | Página marketing com hero, recursos, CTA e preview do dashboard |
| **Dashboard** | Estatísticas, zona de upload, explorador de arquivos (lista/grade) |
| **Arquivos** | Upload (drag & drop), download, exclusão, preview de imagens, busca e ordenação client-side |
| **Pastas** | Criar, excluir, navegação por breadcrumb, mover arquivo via menu de contexto |
| **Grupos** | Criar grupo, convidar por username, aceitar convite, compartilhar arquivos, sair/remover membro |
| **Acesso compartilhado** | Membros de grupo podem **baixar** arquivos compartilhados; apenas o dono pode alterar metadados ou excluir |
| **Tema** | Modo claro/escuro persistido |
| **Auditoria** | Log interno de upload, download e delete (backend) |
| **Rate limiting** | Throttle em login e upload |
| **CI/CD** | GitHub Actions: testes backend, pip-audit, npm audit, lint, build, React Doctor |
| **Docker** | Stack dev (hot reload) + perfil prod (Gunicorn + Nginx) |

## Features não implementadas (e por quê)

| Feature ausente | Motivo |
|-----------------|--------|
| **S3 / object storage** | Escopo do tech test; adapter local permite migração futura |
| **Paginação server-side** | Volume típico por usuário é baixo; busca/ordenação client-side é suficiente |
| **Verificação de e-mail / reset de senha** | Fora do escopo; exigiria SMTP e fluxos adicionais |
| **Notificações em tempo real** | WebSockets não requisitados |
| **Versionamento de arquivos** | Complexidade desnecessária para o assessment |
| **RBAC granular** | Apenas papéis `owner` e `member` em grupos |
| **Links públicos de compartilhamento** | Compartilhamento apenas via grupos autenticados |
| **PWA / offline** | Não requisitado |
| **Testes E2E no CI** | Validados manualmente via Playwright durante desenvolvimento |
| **i18n completo** | UI em pt-BR; mensagens de erro da API em inglês (padrão DRF) |

## Arquitetura

```
┌─────────────┐     REST/JWT      ┌─────────────┐     SQL      ┌────────────┐
│   React     │ ◄──────────────► │   Django    │ ◄──────────► │ PostgreSQL │
│  (Vite)     │                   │    DRF      │              └────────────┘
└─────────────┘                   └──────┬──────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │  Local FS   │
                                  │   Storage   │
                                  └─────────────┘
```

### Backend (`backend/`)

```
backend/
├── apps/
│   ├── authentication/     # Registro, login, JWT
│   ├── files/              # Arquivos, pastas, upload-config
│   │   ├── file_views.py
│   │   ├── file_serializers.py
│   │   ├── folder_views.py
│   │   └── folder_serializers.py
│   └── groups/             # Grupos, convites, compartilhamento
├── api/                    # Roteamento raiz da API
├── config/                 # Settings e WSGI
├── core/                   # Permissões, respostas, mixins, exceções
├── services/               # Lógica de domínio (files, folders, groups, audit)
├── storage/                # Adapter de filesystem
└── tests/                  # test_api.py, test_groups.py
```

### Frontend (`frontend/src/`)

```
frontend/src/
├── app/                    # Shell, router, layouts (marketing, auth, dashboard)
├── pages/                  # Rotas finas (landing, login, dashboard, group detail)
├── features/
│   ├── auth/               # API, store, hooks, forms, types
│   ├── files/              # API, hooks, components, context, types
│   └── groups/             # API, hooks, components, types
└── shared/
    ├── api/                # Axios + fetchBlob unificado
    ├── components/ui/      # Primitivos shadcn-style
    ├── constants/
    └── types/              # ApiResponse + re-exports por feature
```

## Quick Start

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose

### Rodar em desenvolvimento

```bash
git clone <repository-url>
cd tech-test-pixelbreeders
docker compose up --build
```

| Serviço  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:8000/api  |
| Admin    | http://localhost:8000/admin |

Criar superusuário (opcional):

```bash
docker compose exec backend python manage.py createsuperuser
```

### Stack production-like

```bash
make prod
```

| Serviço  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:8080      |
| Backend  | http://localhost:8000/api  |

## API Endpoints

### Autenticação

| Método | Endpoint              | Descrição        |
|--------|-----------------------|------------------|
| POST   | `/api/auth/register/` | Registrar        |
| POST   | `/api/auth/login/`    | Login            |
| POST   | `/api/auth/refresh/`  | Refresh JWT      |
| POST   | `/api/auth/logout/`   | Logout           |
| GET    | `/api/auth/me/`       | Usuário atual    |

### Arquivos

| Método | Endpoint                        | Descrição              |
|--------|---------------------------------|------------------------|
| GET    | `/api/files/`                   | Listar arquivos        |
| POST   | `/api/files/`                   | Upload                 |
| GET    | `/api/files/upload-config/`     | Limites e tipos aceitos |
| GET    | `/api/files/stats/`             | Estatísticas           |
| GET    | `/api/files/{id}/`              | Metadados (dono)       |
| DELETE | `/api/files/{id}/`              | Excluir (dono)         |
| PATCH  | `/api/files/{id}/move/`         | Mover para pasta       |
| GET    | `/api/files/{id}/download/`     | Download (dono ou membro de grupo) |
| GET    | `/api/files/{id}/preview/`      | Preview de imagem      |

### Pastas

| Método | Endpoint                      | Descrição      |
|--------|-------------------------------|----------------|
| GET    | `/api/files/folders/`         | Listar pastas  |
| POST   | `/api/files/folders/`         | Criar pasta    |
| DELETE | `/api/files/folders/{id}/`    | Excluir pasta  |

### Grupos

| Método | Endpoint                                    | Descrição           |
|--------|---------------------------------------------|-----------------------|
| GET    | `/api/groups/`                              | Listar grupos         |
| POST   | `/api/groups/`                              | Criar grupo           |
| GET    | `/api/groups/{id}/`                         | Detalhe do grupo      |
| POST   | `/api/groups/{id}/invite/`                  | Convidar membro       |
| POST   | `/api/groups/{id}/leave/`                   | Sair do grupo         |
| DELETE | `/api/groups/{id}/members/{member_id}/`     | Remover membro        |
| GET    | `/api/groups/invitations/`                  | Convites pendentes    |
| POST   | `/api/groups/invitations/{token}/accept/`   | Aceitar convite       |
| GET/POST | `/api/groups/{id}/files/`                 | Arquivos do grupo     |
| DELETE | `/api/groups/{id}/files/{file_id}/`         | Remover do grupo      |

## Decisões técnicas

| Decisão | Rationale |
|---------|-----------|
| **JWT com refresh em cookie httpOnly** | API stateless com refresh seguro; access token só em memória no client |
| **Regras de acesso a arquivos explícitas** | Dono: CRUD; membro de grupo: download/preview apenas |
| **Camada de serviços (`services/`)** | Lógica de domínio fora das views; views finas com `ServiceErrorMixin` |
| **`group_ids` via contexto de serializer** | Evita N+1 de `GroupService` por arquivo na listagem |
| **`upload-config` como fonte da verdade** | Frontend valida upload com os mesmos limites do backend |
| **Axios único com `fetchBlob`** | Um fluxo de auth/refresh para JSON e blobs |
| **Feature folders no frontend** | `auth`, `files`, `groups` com api/hooks/components/types |
| **`DashboardShell` vs `FilesDashboardLayout`** | Página de grupo sem chrome de pastas |
| **Busca/ordenação client-side** | UX instantânea para volumes típicos do assessment |
| **Storage local** | Simples para o teste; adapter permite S3 depois |
| **React Query + Zustand** | Server state vs auth state separados |
| **Envelope `{ success, message, data }`** | Respostas previsíveis no client |

## Segurança

- JWT em todos os endpoints protegidos
- `can_access` / `can_modify` centralizados no `FileService`
- Validação de tipo por extensão + MIME (magic bytes)
- Limite de tamanho no servidor
- Blacklist de refresh token no logout
- CORS restrito
- Handler de exceções sem vazamento de stack trace
- Nomes de storage UUID (anti path traversal)
- **pip-audit** e **npm audit** no CI
- Testes de isolamento cross-user e de grupo (`test_groups.py`)

## Testes

### Backend (Docker)

```bash
docker compose exec backend python manage.py test tests
```

| Área | Cobertura |
|------|-----------|
| Auth | Registro, login, refresh via cookie, logout |
| Arquivos | Upload, tipo inválido, spoof MIME, quota, delete |
| Autorização | Isolamento entre usuários; membro baixa arquivo compartilhado |
| Grupos | Convites, sair/remover membro, compartilhamento |

### Frontend

```bash
cd frontend && npm run lint && npm run build && npm run doctor
```

### E2E manual (Playwright)

Fluxos validados no browser em `http://localhost:5173`:

1. Landing → registro/login
2. Upload de arquivo (`e2e/fixtures/sample.txt`)
3. Busca e ordenação na tabela
4. Preview e download
5. Exclusão com confirmação
6. Pastas (criar, navegar)
7. Grupos (criar, convidar, detalhe)
8. Compartilhar arquivo via context menu
9. Toggle de tema claro/escuro

## AI Usage Disclosure

Este projeto foi desenvolvido com **Cursor AI** (agente Composer) e ferramentas auxiliares de qualidade.

### Como a IA foi utilizada

| Área | Ferramenta | Uso |
|------|------------|-----|
| Scaffolding | Cursor Agent | Estrutura Django + React, componentes base, landing page |
| Limpeza de código | Cursor Agent | Remoção de dead code, comentários supérfluos, i18n pt-BR |
| Qualidade React | **React Doctor** (`npm run doctor`) | Scan no CI e pre-commit; score de saúde 0–100 |
| Segurança de dependências | **pip-audit** + **npm audit** | CI bloqueia vulnerabilidades high+ |
| Revisão estrutural | Cursor Explore Agent | Análise de responsabilidades e duplicação |
| Refatoração | Cursor Agent | Service layer, feature modules, layouts |
| Testes E2E | **Playwright** (MCP) | Validação manual dos fluxos principais |
| Documentação | Cursor Agent | README, decisões, disclosure |

### Automações no pipeline

- `.github/workflows/ci.yml` — backend tests, pip-audit, npm audit, lint, build, React Doctor
- `frontend/.agents/skills/react-doctor/` — skill do agente para triagem antes de commit
- Pre-commit hook — React Doctor em arquivos staged

### Controle do desenvolvedor

- Decisões de arquitetura (acesso a arquivos, feature folders, escopo)
- Revisão de cada diff antes de commit
- Definição do que entra e do que fica de fora do escopo
- Validação final via Playwright e testes Django

## Tradeoffs

- **Storage local** — Simples para assessment; não escala horizontalmente sem storage compartilhado
- **Services na raiz do backend** — Acoplamento `files ↔ groups` documentado; alternativa seria bounded contexts por app
- **Sem paginação** — OK para demo; necessário em produção com muitos arquivos
- **Sem e-mail** — Convites por username apenas

## License

MIT
