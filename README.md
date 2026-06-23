# FileVault

A production-quality file management web application built as a technical assessment. Authenticated users can securely upload, view, download, and delete their own files with a modern SaaS-style experience.

## Features

- **Authentication** — Register, login, logout with JWT access + refresh tokens and session persistence
- **File management** — Upload, list, download, and delete files (PNG, JPG, PDF, TXT up to 10 MB)
- **Dashboard** — Statistics cards (total files, storage used, latest upload)
- **Search & sort** — Instant client-side search; sort by name, size, or upload date
- **Drag & drop upload** — Modern upload zone with progress indicator
- **Image preview** — Modal preview for PNG and JPG files
- **Audit logging** — Internal tracking of upload, download, and delete actions
- **Security** — Strict per-user ownership validation on every file operation

## Architecture

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

Feature-oriented Django project with clear separation of concerns:

```
backend/
├── apps/
│   ├── authentication/   # User registration, login, JWT endpoints
│   └── files/              # File models, serializers, API views
├── api/                    # Root API URL routing
├── config/                 # Django settings and WSGI
├── core/                   # Shared permissions, pagination, error handling
├── services/               # Business logic (file operations, audit logging)
├── storage/                # Filesystem storage adapter
└── tests/                  # API integration tests
```

### Frontend (`frontend/`)

Feature-oriented React application:

```
frontend/src/
├── app/                    # App shell, router, layouts
├── pages/                  # Route-level page components
├── features/
│   ├── auth/               # Auth API, store, hooks, forms
│   └── files/              # File API, hooks, dashboard components
└── shared/
    ├── api/                # Axios client with token refresh
    ├── components/ui/      # shadcn-style UI primitives
    ├── constants/
    ├── lib/
    └── types/
```

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run the application

```bash
# Clone the repository
git clone <repository-url>
cd tech-test-pixelbreeders

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:8000/api  |
| Admin    | http://localhost:8000/admin|

Create a superuser (optional):

```bash
docker compose exec backend python manage.py createsuperuser
```

## Environment Variables

| Variable                         | Description                          | Default                    |
|----------------------------------|--------------------------------------|----------------------------|
| `POSTGRES_DB`                    | Database name                        | `filevault`                |
| `POSTGRES_USER`                  | Database user                        | `filevault`                |
| `POSTGRES_PASSWORD`              | Database password                    | `filevault_secret`         |
| `DJANGO_SECRET_KEY`              | Django secret key                    | (see `.env.example`)       |
| `DJANGO_DEBUG`                   | Debug mode                           | `True`                     |
| `CORS_ALLOWED_ORIGINS`           | Allowed frontend origins             | `http://localhost:5173`    |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token TTL                  | `30`                       |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS`   | Refresh token TTL                   | `7`                        |
| `FILE_STORAGE_PATH`              | Upload directory                     | `/app/storage/uploads`     |
| `MAX_UPLOAD_SIZE_MB`             | Max file size                        | `10`                       |
| `VITE_API_URL`                   | Backend API URL (frontend)           | `http://localhost:8000/api`|

## API Endpoints

### Authentication

| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | `/api/auth/register/` | Register new user  |
| POST   | `/api/auth/login/`    | Login              |
| POST   | `/api/auth/refresh/`  | Refresh JWT        |
| POST   | `/api/auth/logout/`   | Logout (blacklist) |
| GET    | `/api/auth/me/`       | Current user       |

### Files

| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| GET    | `/api/files/`                 | List user's files    |
| POST   | `/api/files/`                 | Upload file          |
| GET    | `/api/files/stats/`           | Dashboard statistics |
| GET    | `/api/files/{id}/`            | File metadata        |
| DELETE | `/api/files/{id}/`            | Delete file          |
| GET    | `/api/files/{id}/download/`   | Download file        |
| GET    | `/api/files/{id}/preview/`    | Image preview        |

All file endpoints require authentication. Users can only access their own files.

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **JWT with refresh rotation** | Stateless API auth with secure token refresh and blacklisting on logout |
| **Feature-oriented folders** | Clear domain boundaries; easier to navigate and extend |
| **Service layer** | Business logic separated from views; testable and maintainable |
| **Local filesystem storage** | Simple, meets requirements; storage adapter allows future S3 migration |
| **React Query + Zustand** | Server state vs client auth state cleanly separated |
| **Streaming downloads** | `FileResponse` streams files without loading into memory |
| **Consistent API envelope** | `{ success, message, data }` format for predictable client handling |

## Tradeoffs

- **Local storage over S3** — Simpler setup for assessment; not horizontally scalable without shared storage
- **Client-side search/sort** — Instant UX for typical file counts; server-side pagination would be needed at scale
- **No email verification** — Reduces scope; would be required in production registration flow
- **SQLite not used** — PostgreSQL required; adds Docker dependency but matches production patterns

## Security Considerations

- JWT authentication on all protected endpoints
- Object-level ownership checks via queryset filtering and `IsOwner` permission
- File type validation by extension and MIME type
- File size limits enforced server-side
- Refresh token blacklisting on logout
- CORS restricted to configured origins
- Internal errors not leaked to clients (custom exception handler)
- Storage filenames are UUID-based to prevent path traversal

## Testing

Run backend tests inside Docker:

```bash
docker compose exec backend python manage.py test tests
```

### Test coverage

| Area           | Tests                                              |
|----------------|----------------------------------------------------|
| Authentication | Register success, login success, invalid login     |
| Authorization  | Cross-user list, delete, download isolation        |
| Files          | Upload success, invalid type, size validation, delete |
| API            | Protected endpoint access                          |

## Future Improvements

- [ ] S3-compatible object storage backend
- [ ] Server-side pagination and search for large file libraries
- [ ] Email verification and password reset
- [ ] Rate limiting on upload and auth endpoints
- [ ] Frontend test suite (Vitest + Testing Library)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Production deployment with Gunicorn + Nginx

## AI Usage Disclosure

This project was developed with assistance from **Cursor AI** (Claude). AI was used for:

- Scaffolding project structure and boilerplate
- Generating initial component and test templates
- Documentation drafting

All architectural decisions, security patterns, and final code were reviewed and refined. The developer maintained control over structure, naming conventions, and implementation choices throughout.

## License

MIT
