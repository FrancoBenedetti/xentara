# ADR: Xentara Client PWA — Repository Placement

> **Decision type:** Architecture / Repository Strategy  
> **Status:** Under review — no implementation yet  
> **Context:** The current `packages/consumer-pwa` is a temporary scaffold inside the `xentara` monorepo workspace. The full-featured PWA needs its own GitHub repo so curators can fork it independently.

---

## Current State

The `xentara` repo is already a **pnpm workspace** with two internal packages:

```
xentara/                     ← git root (dashboard/studio)
├── src/                     ← Next.js App Router (dashboard)
├── packages/
│   ├── consumer-pwa/        ← temporary PWA (Next.js)
│   └── api-client/          ← typed SDK wrapping the Xentara REST API
└── pnpm-workspace.yaml
```

This structure already anticipates a degree of separation, but `consumer-pwa` currently shares the same git history as the dashboard. That creates a problem: **curators who fork the PWA would also inherit the entire dashboard codebase and its history.**

---

## The Three Options

### Option A — Full Separation (New Standalone Repo)

```
~/Projects/
├── xentara/                 ← existing repo (dashboard + api-client)
└── xentara-client/          ← NEW standalone repo (PWA only)
```

**How it works:**
- `xentara-client` is a completely independent Next.js project on GitHub.
- It depends on the Xentara API over HTTP — no shared local code.
- The `api-client` SDK (currently in `packages/api-client`) is **published to npm** (or GitHub Packages) so `xentara-client` can install it as a dependency: `@xentara/api-client`.
- Curators `git clone` or fork `xentara-client` only, configure their Hub API key, and deploy.

**Pros:**
- Cleanest possible separation. Curators get exactly what they need — nothing more.
- No git complexity. Two normal repos, each with a single clear purpose.
- The dashboard codebase stays private; the client template is public/forkable.
- CI/CD, secrets, and deployment pipelines are fully independent.
- Forces a healthy discipline: every feature the PWA needs from the backend *must* go through the published API — keeping the contract explicit.

**Cons:**
- The `api-client` SDK must be published and versioned separately. Adds a small release step each time the API changes.
- Local development requires running two separate dev servers (xentara dashboard + xentara-client) and pointing `.env.local` at the local dashboard API.
- No code sharing beyond the published SDK — intentional, but worth noting.

---

### Option B — Git Submodule Inside `xentara`

```
xentara/                     ← git root (dashboard)
├── src/
├── packages/
│   ├── api-client/
│   └── consumer-pwa/        ← becomes a git submodule pointing to xentara-client repo
└── pnpm-workspace.yaml
```

**How it works:**
- `xentara-client` is its own GitHub repo, but is *also* mounted inside `xentara` as a git submodule at `packages/consumer-pwa`.
- Running `git submodule update --init` inside xentara checks out the client.

**Pros:**
- Client stays accessible during dashboard development without switching directories.
- Code sharing via the pnpm workspace remains possible (though inadvisable for things that should go through the API).

**Cons:**
- **Git submodules are notoriously painful.** Detached HEAD state, forgetting to `--recurse-submodules`, CI configuration overhead. This is well-documented developer friction.
- Curator forks still need to know to ignore the submodule scaffolding, which is confusing.
- The workspace's `pnpm-workspace.yaml` treating a submodule as a local package creates dependency resolution edge cases.
- Adds complexity for essentially no gain once the api-client is published as a package.

> ⚠️ **Not recommended.** Submodules solve a problem you don't actually have here.

---

### Option C — Promote to a Standalone Repo, Keep Workspace for Shared Tooling

```
~/Projects/
├── xentara/                 ← dashboard repo (retains api-client package)
└── xentara-client/          ← standalone PWA repo (same as Option A)
```

With the addition of publishing `api-client` to GitHub Packages or npm under a scoped name:

```
@xentara/api-client          ← published package, consumed by xentara-client
```

This is **Option A with an explicit decision about the api-client package**, which is currently the missing piece.

---

## Recommendation: Option A / C (they are the same)

**Create `xentara-client` as a completely independent repository.**

The rationale is straightforward given your goals:

| Goal | Why Option A satisfies it |
|------|--------------------------|
| Curators can fork the client independently | ✅ They fork one repo with zero dashboard code |
| Client uses the Xentara API | ✅ API-only dependency, clean boundary |
| API will expand to accommodate new features | ✅ Forces the contract to be explicit and versioned |
| Dashboard stays private/controlled | ✅ Entirely separate git history |
| No git complexity | ✅ Two normal repos |

### The One Decision to Make: `api-client` SDK

The `packages/api-client` package inside `xentara` currently provides typed wrappers around the Xentara REST API. This is the *only* code the new client legitimately needs to share. You have two sub-options:

| Sub-option | How | Best for |
|---|---|---|
| **Publish to npm / GitHub Packages** | Add a `publish` step to xentara's CI | Production-grade; curators install it like any npm package |
| **Inline into xentara-client** | Copy and maintain types directly in the client repo | Simpler during early development; acceptable until the API stabilises |

**Suggested path:** Inline the SDK types into `xentara-client` now. Once the API surface stabilises (post feature-backlog implementation), extract and publish `@xentara/api-client` properly.

---

## Local Development Setup (No Submodules)

With two separate repos, local development looks like this:

```bash
# Terminal 1 — run the dashboard/API
cd ~/Projects/xentara
pnpm dev                     # runs on :3000

# Terminal 2 — run the client, pointing at local API
cd ~/Projects/xentara-client
NEXT_PUBLIC_XENTARA_API_URL=http://localhost:3000 pnpm dev  # runs on :3001
```

This is clean, explicit, and matches exactly how a curator deploying against a production Hub API would configure their fork.

---

## Suggested Directory Layout for `xentara-client`

```
xentara-client/              ← NEW GitHub repo (public / forkable)
├── src/
│   ├── app/                 ← Next.js App Router pages
│   ├── lib/
│   │   └── xentara/         ← inlined API client SDK types & fetch wrappers
│   ├── components/
│   └── styles/
├── public/
├── .env.local.example       ← NEXT_PUBLIC_XENTARA_HUB_KEY, NEXT_PUBLIC_XENTARA_API_URL
├── next.config.ts
├── package.json
└── README.md                ← curator setup guide
```

---

## What Happens to `packages/consumer-pwa`?

Once `xentara-client` is bootstrapped and validated:

1. `packages/consumer-pwa` is **removed** from the `xentara` workspace.
2. `pnpm-workspace.yaml` is updated to remove it.
3. The `api-client` package remains in the workspace — it continues to evolve alongside the dashboard API.

There is no need to preserve the history of `consumer-pwa`; it was explicitly a temporary scaffold.

---

*Ready for implementation planning once the repository strategy is confirmed.*
