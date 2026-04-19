# Xentara — Cross-Repo Change Workflow

> **Scope:** Changes that require a new or modified database schema, API endpoint, and consumer-pwa feature — simultaneously.  
> **Applies to:** Any feature from the `pwa_client_features.md` backlog that requires backend work.

---

## The Mental Model: Three Rings

Every change that originates in a consumer-pwa requirement touches three concentric rings, always worked from the **inside out**:

```
┌─────────────────────────────────────────┐
│  Ring 3: consumer-pwa (xentara-client)  │
│  ┌───────────────────────────────────┐  │
│  │  Ring 2: api-client SDK           │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Ring 1: xentara (DB + API) │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**You always build inward first, then outward.** A PWA feature cannot exist until the API supports it. An API cannot be extended until the database schema is in place. This order is non-negotiable.

---

## Example Feature: Per-Article User Notes (`N-01`)

Used throughout this document to make the workflow concrete.

> A consumer can write private notes against a publication. Notes must persist across devices and sessions.

---

## Phase 1 Workflow (Inlined SDK — early stage)

During early development, `xentara-client` contains a local copy of the API wrapper types rather than an installed npm package.

```
xentara/                        ← Repo A (dashboard + DB + api-client source)
xentara-client/
  └── src/lib/xentara/          ← Repo B (inlined copy of SDK types + fetchers)
```

### Step 1 — Contract Design (before any code)

Write the API contract on paper first. Define:

```
Resource:  /api/consumer/notes
Auth:      Bearer token (consumer JWT)

POST   /api/consumer/notes
  body: { publication_id: string, content: string }
  returns: { id, publication_id, content, created_at, updated_at }

GET    /api/consumer/notes?publication_id=<id>
  returns: Note[]

PATCH  /api/consumer/notes/:id
  body: { content: string }
  returns: Note

DELETE /api/consumer/notes/:id
  returns: 204
```

> **Why first?** Both repos can be developed in parallel once the contract is agreed. The PWA can mock it while the backend is being built. Saves wasted rework.

---

### Step 2 — Database Migration (`xentara` repo)

In the `xentara` repo, apply a Supabase migration:

```sql
-- supabase/migrations/<timestamp>_add_consumer_notes.sql

CREATE TABLE consumer_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (consumer_id, publication_id)  -- one note per article per user
);

-- RLS: consumers can only see and modify their own notes
ALTER TABLE consumer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consumers_own_notes" ON consumer_notes
  FOR ALL USING (consumer_id = auth.uid());
```

Commit: `feat(db): add consumer_notes table with RLS`

---

### Step 3 — API Route (`xentara` repo)

In `xentara/src/app/api/consumer/notes/`, add the Next.js route handlers implementing the contract from Step 1.

Key concerns:
- Authenticate via the Hub API key + consumer JWT (not curator session).
- Validate input with Zod before touching the DB.
- Return consistent error shapes (`{ error: string, code: string }`).

Commit: `feat(api): add consumer notes CRUD endpoints`

---

### Step 4 — Update `api-client` Source (`xentara` repo)

In `xentara/packages/api-client/src/`, add the typed wrapper:

```typescript
// packages/api-client/src/notes.ts

export interface ConsumerNote {
  id: string;
  publication_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const notesApi = (client: XentaraClient) => ({
  get: (publicationId: string): Promise<ConsumerNote[]> =>
    client.get(`/api/consumer/notes?publication_id=${publicationId}`),

  upsert: (publicationId: string, content: string): Promise<ConsumerNote> =>
    client.post('/api/consumer/notes', { publication_id: publicationId, content }),

  delete: (noteId: string): Promise<void> =>
    client.delete(`/api/consumer/notes/${noteId}`),
});
```

Commit: `feat(api-client): add ConsumerNote types and notesApi`

---

### Step 5 — Sync the Inline Copy (`xentara-client` repo)

Because the SDK is inlined in Phase 1, this step is **manual**:

1. Copy the updated files from `xentara/packages/api-client/src/` into `xentara-client/src/lib/xentara/`.
2. Update the barrel export (`index.ts`) if new modules were added.

```bash
# From the xentara-client root:
cp ../xentara/packages/api-client/src/notes.ts src/lib/xentara/notes.ts
```

> ⚠️ This manual sync is the main cost of the inline approach. It requires discipline but is acceptable while the API surface is still fluid. A `sync-sdk.sh` script can automate this.

Commit: `chore(sdk): sync api-client notes module from xentara`

---

### Step 6 — Build the PWA Feature (`xentara-client` repo)

Now build the actual UI using the synced SDK types:

- `NoteEditor` component (textarea + save/delete).
- Hook: `useNote(publicationId)` — wraps `notesApi.get` + `notesApi.upsert`.
- Surface in the publication detail view.
- Notes Library page (`/library/notes`).

Commit: `feat(pwa): per-article notes (N-01)`

---

### Step 7 — Local Integration Test

Run both dev servers simultaneously:

```bash
# Terminal 1 (xentara repo)
pnpm dev                          # → http://localhost:3000

# Terminal 2 (xentara-client repo)
NEXT_PUBLIC_XENTARA_API_URL=http://localhost:3000 pnpm dev  # → http://localhost:3001
```

Verify the full round-trip: write a note in the PWA → confirm it appears in the DB → reload the PWA → note persists.

---

### Step 8 — Deployment Order (critical)

**Always deploy the backend before the frontend.**

```
1. Deploy xentara (DB migration + API routes) → Vercel / production
2. Verify API endpoints are live and responding correctly
3. Deploy xentara-client → Vercel (or curator's own host)
```

Reversing this order means the PWA calls an API route that doesn't exist yet, causing runtime errors in production.

---

## Phase 2 Workflow (Published `@xentara/api-client`)

Once the API surface stabilises, Step 4 and Step 5 above are replaced by a proper package release.

### Replacing Steps 4 & 5:

**In `xentara` repo:**
```bash
# After updating packages/api-client/src/
cd packages/api-client
npm version patch           # or minor/major depending on change
npm publish --access public # publishes @xentara/api-client to npm
```

**In `xentara-client` repo:**
```bash
pnpm add @xentara/api-client@latest
```

The manual file copy is gone. The sync is explicit and auditable via `package.json`.

### Versioning discipline:
| Change type | Version bump | Notes |
|---|---|---|
| New endpoint added | `minor` | Backward compatible |
| Existing endpoint changed | `minor` or `major` | Major if breaking |
| Bug fix / type correction | `patch` | Safe for all consumers |
| Endpoint removed | `major` | Breaking — advance notice required |

---

## Backward Compatibility Rule

Because curators can fork `xentara-client` and may not update frequently, the Xentara API must treat breaking changes with care:

- **Never remove an endpoint without a deprecation period.**
- **Add fields; never remove them from responses** (consumers ignore unknown fields safely).
- **Use `/api/v2/` prefixing** only when a fundamental contract change is unavoidable.

---

## Change Initiation Summary

| Who raises the change? | Starting point |
|---|---|
| PWA feature backlog item | Start at Step 1 (contract design), work inward |
| Bug in existing API | Start at Step 3 (API route), propagate outward |
| Database performance issue | Start at Step 2 (migration), check if API response changes |
| Curator fork requests a custom field | Their fork patches the inlined SDK; ideally raised as an issue against `xentara` for upstream inclusion |

---

## Rollback Strategy

| Layer | Rollback mechanism |
|---|---|
| Database | Supabase migration down script or point-in-time restore |
| API | Revert Vercel deployment (one-click in dashboard) |
| api-client (published) | Pin previous version in `package.json`; redeploy |
| PWA | Revert Vercel deployment |

---

*This workflow applies to every backlog item in `pwa_client_features.md` that requires backend changes.*
