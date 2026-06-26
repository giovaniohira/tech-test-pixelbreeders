# FileVault — TODO

> **Regra:** qualquer alteração no `frontend/` deve rodar `npm run doctor` logo após.

Legenda: `[x]` concluído

---

## P1 — Crítico (auditoria)

- [x] **Download/preview com refresh de token** — `authenticated-fetch.ts` + `downloadFileRecord()` + `useFilePreview` (React Query)
- [x] **Download falha em silêncio** — toast via `handleFileDownload` + `getErrorMessage`
- [x] **Listagem mascara erros da API** — `dashboard-page.tsx` trata `isError`
- [x] **Corrigir teste `test_delete_success`** — mocks de `generate_storage_name` / `save`
- [x] **Corrigir teste `test_user_cannot_download_another_users_files`** — patch em `apps.files.views.os`

---

## P2 — Médio (auditoria)

### Backend

- [x] **MIME `application/octet-stream`** — aceito quando extensão é válida (`validators.py`)
- [x] **Logout fraco** — `AllowAny` + `authentication_classes = []`; `TokenError` tratado
- [x] **Erros de login/refresh inconsistentes** — `_wrap_jwt_error_response` + `getErrorMessage` lê `detail`
- [x] **Upload órfão no disco** — cleanup no `except` após `storage.save`
- [x] **Delete: storage antes do DB** — DB removido primeiro, depois storage

### Frontend

- [x] **Drag-and-drop sem validação de tipo** — `validateFileForUpload` + `ALLOWED_FILE_TYPES`
- [x] **`useCurrentUser()` no dashboard** — `dashboard-layout.tsx`
- [x] **Auth guard fraco** — `ProtectedRoute` exige `accessToken` + hydration via `useSyncExternalStore`
- [x] **Race no preview modal** — React Query + `key={file.id}` + revoke de blob URL
- [x] **Rota wildcard** — `FallbackRedirect` vai direto para `/login` ou `/dashboard`

---

## P3 — Baixo (auditoria)

- [x] Remover imports não usados (`Response` em `views.py`, `settings` em `models.py`)
- [x] Remover `Pillow` de `requirements.txt`
- [x] Deduplicar URL da API (`files-api.ts` usa `fetchAuthenticatedBlob` com `API_URL`)
- [x] Remover deps npm não usadas (`dropdown-menu`, `separator`, `toast`)
- [x] Alinhar credenciais de `create_db.py` com `.env.example`
- [x] Adicionar CI/CD — `.github/workflows/ci.yml`
- [ ] Adicionar testes frontend (Vitest + Testing Library) — fora do escopo atual
- [ ] Hardening de produção completo (Gunicorn no compose, rate limiting) — parcial: gunicorn já em requirements

---

## React Doctor

**Score:** 100/100 · **0 issues**  
**Última execução:** após resolução completa (v0.5.8)

- [x] Todos os erros e warnings corrigidos
- [x] `npm run build` passa
- [x] `npm run doctor` passa

---

## Infra instalada

- [x] `react-doctor` em `frontend/` (devDependency + script `doctor`)
- [x] Skill Cursor via `npx react-doctor@latest install`
- [x] GitHub Actions: `frontend/.github/workflows/react-doctor.yml` + `.github/workflows/ci.yml`
- [x] Pre-commit hook em `.git/hooks/pre-commit`

---

## Backend

- [x] **12/12 testes** passando (`python manage.py test tests`)
