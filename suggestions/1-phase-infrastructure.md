To begin implementing **Phase 1: The Core Isolation Layer**, three key infrastructure pillars must be in place. These should be set up to prioritize **Multi-tenancy** and **Edge compatibility** from the very first commit.

### 1. The Managed Database (DBaaS)

*Recommended: **Supabase** (PostgreSQL + Auth + PostgREST)*
> [!IMPORTANT]
> A standard PostgreSQL instance is sufficient, but Supabase provides the **Row-Level Security (RLS)** visual editor and the **Auth-to-SQL integration** out-of-the-box, which significantly reduces the risk of data "leakage" between Hubs in Phase 1.

* **Setup Requirement**: A dedicated project/instance where we can define the `hubs` and `boards` tables.
* **Access**: We need a `SERVICE_ROLE_KEY` (for administrative provisioning) and an `ANON_KEY` (for the Public Web Tier).

### 2. The Web Runtime (CI/CD)

*Recommended: **Vercel** (for Next.js + Edge Middleware)*

* **Setup Requirement**: A repository (GitHub/GitLab) linked to a Vercel project.
* **Reasoning**: Vercel's **Edge Middleware** is the most cost-effective way to handle "Custom Domain Resolution" or "Subdomain Routing" at the "Edge" before the request even reaches your main server. This is critical for the "White-label" nature of the framework.

### 3. Local Development Environment

Before the first line of code is written, the local environment must be standardized:

* **Node.js (LTS)**: v18.0.0 or higher.
* **Package Manager**: `pnpm` (recommended for its speed and efficient handling of multi-tenant project structures).
* **Docker**: Required if we want to run the **Supabase Local CLI**. This allows us to test migration scripts and RLS policies locally before pushing to production.

---

### Phase 1 Pre-Implementation Checklist

1. [ ] **GitHub Repository Created**: `xentara-core` or similar.
2. [ ] **Supabase/PostgreSQL Project Provisioned**: Tables initialized with the `hub_id` column.
3. [ ] **Vercel Project Linked**: Connected to the repository for automatic deployments.
4. [ ] **Environment Variables Mapping**:
    * `NEXT_PUBLIC_SUPABASE_URL`
    * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    * `SUPABASE_SERVICE_ROLE_KEY`
    * `NEXT_PUBLIC_PROJECT_DOMAIN` (e.g., `xentara.app`)
5. [ ] **Master Branch Protection**: Ensure that the "Spine" can only be updated via Peer Reviews (PRs) to maintain the integrity of the isolation logic.

**Are you ready for us to begin the initial project scaffolding (setup of the Next.js project and Database migrations)?**
