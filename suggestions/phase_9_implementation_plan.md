# Phase 9: Engagement Feedback Engine (Reactions & Responses)

This phase implements the **Engagement & Feedback Agent**, completing the "Intelligence Feedback Loop." It allows curators to see how their publications are performing across Telegram, WhatsApp, and the PWA, capturing both quantitative reactions and qualitative responses.

## Objective

To transform one-way broadcasting into a two-way intelligence exchange. Curators get high-signal data on what their audience values, powered by AI-driven sentiment analysis of incoming comments. Feedback is natively **Hub-Centric**, ensuring engagement is tracked against specific intelligence contexts regardless of the distribution channel.

**Core design principle (revised):** Available reactions and whether comment capture is enabled are **configurable per Hub** by the hub owner/curator, selected from a platform-defined base set. No hub is forced to use a generic vocabulary — a niche professional hub may want `🎯 Actionable | ❓ Need Context`, while a consumer news hub may prefer `👍 Helpful | 🔥 Trending | 👎 Not for me`.

---

## Current State (Post-Phase 8 + Phase 9 Partial Implementation)

| Layer                              | Status                                                                                         |
| :--------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Telegram Bot**                   | ✅ Commands (`/start`, `/link`, `/subscribe`, `/myhubs`, `/chatid`, `/help`)                   |
| **Distribution Agent**             | ✅ Inngest function pushes to channels and subscriber DMs                                      |
| **Inline Buttons (Current)**       | ✅ `🧠 Read Intelligence` + `🔗 Source Article` + **hardcoded** `🧠 👍 👎` reaction row        |
| **Distribution Log**               | ✅ Tracks every push with `message_id` for traceability                                        |
| **`publication_engagement` Table** | ✅ Migrated — schema, indexes, RLS all in place                                                |
| **Reaction Callback Handler**      | ✅ Implemented in `bot.ts` — toggle on/off, shadow profile support                             |
| **Reply-to-Comment Handler**       | ✅ Implemented in `bot.ts` — traces replies via `distribution_log.message_id`                  |
| **`findOrCreateMessengerIdentity`**| ✅ Helper implemented in `bot.ts`                                                              |
| **Inngest Feedback Analyst**       | ✅ Sentiment scoring via `analyzeSentiment` in `engagement.ts`                                 |
| **Intelligence Dashboard**         | ✅ Page at `/dashboard/hubs/[slug]/intelligence` with stat cards, pub breakdown, comment inbox  |
| **Per-Hub Engagement Config**      | ❌ Not yet — reactions are hardcoded in distribution agent, bot, and dashboard                  |
| **Engagement Config UI**           | ❌ No curator-facing panel to select reactions or toggle comments                              |

---

## 1. Database Schema

### ✅ [DONE] `supabase/migrations/20260412000000_engagement_engine.sql`

#### Table: `publication_engagement`

```sql
CREATE TABLE public.publication_engagement (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id         UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    hub_id                 UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    consumer_id            UUID REFERENCES public.consumer_profiles(id) ON DELETE SET NULL,
    messenger_identity_id  UUID REFERENCES public.messenger_identities(id) ON DELETE SET NULL,
    platform               TEXT NOT NULL CHECK (platform IN ('telegram', 'whatsapp', 'pwa')),
    type                   TEXT NOT NULL CHECK (type IN ('reaction', 'comment', 'share')),
    value                  TEXT NOT NULL,
    sentiment_score        DOUBLE PRECISION,
    metadata               JSONB DEFAULT '{}'::jsonb,
    created_at             TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE NULLS NOT DISTINCT (publication_id, messenger_identity_id, type, value)
);
```

**Design notes:**
- **`hub_id` is explicit** — cheaper RLS evaluation, direct hub-level queries.
- **Unique constraint on reactions** — same user cannot submit the same reaction twice (toggle deduplication).
- **`consumer_id` nullable** — unlinked shadow profiles tracked via `messenger_identity_id`.
- `value` stores any string key — historical records remain valid even when hub config changes.

---

### 🔲 [NEW] `supabase/migrations/20260418000000_hub_engagement_config.sql`

This is the primary schema addition required by the per-hub configurable reactions requirement.

```sql
CREATE TABLE public.hub_engagement_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id              UUID NOT NULL UNIQUE REFERENCES public.hubs(id) ON DELETE CASCADE,
    reactions_enabled   TEXT[] NOT NULL DEFAULT ARRAY['insight', 'helpful', 'irrelevant'],
    comments_enabled    BOOLEAN NOT NULL DEFAULT true,
    updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Keep updated_at fresh
CREATE TRIGGER update_hub_engagement_config_updated_at
    BEFORE UPDATE ON public.hub_engagement_config
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX idx_hub_engagement_config_hub_id ON public.hub_engagement_config(hub_id);

ALTER TABLE public.hub_engagement_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hub members can view engagement config"
ON public.hub_engagement_config FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hub_memberships hm
    WHERE hm.hub_id = public.hub_engagement_config.hub_id
    AND hm.user_id = auth.uid()
  )
);

CREATE POLICY "Hub owners and editors can manage engagement config"
ON public.hub_engagement_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.hub_memberships hm
    WHERE hm.hub_id = public.hub_engagement_config.hub_id
    AND hm.user_id = auth.uid()
    AND hm.role IN ('owner', 'editor')
  )
);
```

**Design notes:**
- `reactions_enabled` is an ordered `TEXT[]` — the order drives Telegram button placement.
- The default matches existing hardcoded behavior — existing hubs work without data migration.
- A hub with no config row falls back to the application-level defaults (upsert-on-first-use pattern, no migration required for existing hubs).

---

## 2. Platform Base Set (Shared Constant)

### 🔲 [NEW] `src/lib/engagement/reactions.ts`

The authoritative catalogue of available reactions. This lives in application code, not the database — evolving the base set requires no migration.

```typescript
export type ReactionKey =
  | 'insight'
  | 'helpful'
  | 'irrelevant'
  | 'trending'
  | 'share'
  | 'question';

export interface ReactionDefinition {
  key: ReactionKey;
  emoji: string;
  label: string;
  callbackLabel: string; // Shown in Telegram answerCallbackQuery toast
}

export const BASE_REACTION_SET: Record<ReactionKey, ReactionDefinition> = {
  insight:    { key: 'insight',    emoji: '🧠', label: 'Insight',      callbackLabel: '🧠 Marked as Insight' },
  helpful:    { key: 'helpful',    emoji: '👍', label: 'Helpful',      callbackLabel: '👍 Marked as Helpful' },
  irrelevant: { key: 'irrelevant', emoji: '👎', label: 'Not for me',   callbackLabel: '👎 Noted' },
  trending:   { key: 'trending',   emoji: '🔥', label: 'Trending',     callbackLabel: '🔥 Marked as Trending' },
  share:      { key: 'share',      emoji: '🚀', label: 'Share-worthy', callbackLabel: '🚀 Worth Sharing' },
  question:   { key: 'question',   emoji: '❓', label: 'Need context', callbackLabel: '❓ Context Requested' },
};

export const DEFAULT_REACTIONS: ReactionKey[] = ['insight', 'helpful', 'irrelevant'];

/** Build reaction buttons for a Telegram inline keyboard row. */
export function buildReactionButtons(
  publicationId: string,
  enabledReactions: string[]
): Array<{ text: string; callback_data: string }> {
  return enabledReactions
    .filter((key): key is ReactionKey => key in BASE_REACTION_SET)
    .map(key => ({
      text: `${BASE_REACTION_SET[key].emoji} ${BASE_REACTION_SET[key].label}`,
      callback_data: `react_${publicationId}_${key}`
    }));
}
```

---

## 3. Distribution Agent Modification

### 🔲 [REVISE] `src/inngest/distribution.ts`

The `fetch-distribution-context` step must be extended to retrieve `hub_engagement_config`. The reaction button row is then built dynamically.

**Step 1 — Extend context fetch:**
```typescript
const { data: engagementConfig } = await supabase
  .from('hub_engagement_config')
  .select('reactions_enabled, comments_enabled')
  .eq('hub_id', hubId)
  .maybeSingle();

return {
  publication,
  hub,
  channels: channels || [],
  eligibleSubscribers,
  engagementConfig: {
    reactionsEnabled: engagementConfig?.reactions_enabled ?? DEFAULT_REACTIONS,
    commentsEnabled:  engagementConfig?.comments_enabled  ?? true,
  }
};
```

**Step 3/4 — Dynamic reaction row (channels and DMs):**
```typescript
import { buildReactionButtons } from '@/lib/engagement/reactions';

const row2 = buildReactionButtons(
  publicationId,
  context.engagementConfig.reactionsEnabled
);

// Only add reaction row if the hub has any reactions enabled
const inlineKeyboard = row2.length > 0
  ? [row1, row2]
  : [row1];

await bot.api.sendMessage(channel.channel_id, formatted.telegramPreview, {
  parse_mode: 'HTML',
  reply_markup: { inline_keyboard: inlineKeyboard }
});
```

**Current hardcoded inline keyboard (Phase 8/9 partial):**
```
[ 🧠 Read Intelligence (URL) | 🔗 Source Article (URL) ]
[ 🧠 Insight | 👍 Helpful | 👎 Noted                  ]
```

**Updated dynamic inline keyboard (Phase 9 complete):**
```
[ 🧠 Read Intelligence (URL) | 🔗 Source Article (URL) ]
[ <hub-configured reaction buttons from base set>       ]  ← omitted if none enabled
```

---

## 4. Telegram Bot Updates

### ✅ [DONE] `src/lib/telegram/bot.ts`

All three handlers are implemented. The following targeted revisions are required.

#### 4a. Reaction Callback Handler — ✅ DONE, 🔲 REVISE validation

The handler is implemented. Add a config validation guard after resolving `pub.hub_id`:

```typescript
// After resolving pub.hub_id — validate reactionType against hub config
const { data: config } = await adminClient
  .from('hub_engagement_config')
  .select('reactions_enabled')
  .eq('hub_id', pub.hub_id)
  .maybeSingle();

const allowed: string[] = config?.reactions_enabled ?? DEFAULT_REACTIONS;

if (!allowed.includes(reactionType)) {
  return ctx.answerCallbackQuery("This reaction is no longer available for this hub.");
}
// ... rest of upsert/toggle logic unchanged
```

Replace the hardcoded `labels` map:
```typescript
// Replace:
const labels: Record<string, string> = {
  insight: "🧠 Marked as Insight",
  helpful: "👍 Marked as Helpful",
  irrelevant: "👎 Noted"
};

// With:
import { BASE_REACTION_SET } from '@/lib/engagement/reactions';
const callbackLabel = BASE_REACTION_SET[reactionType as ReactionKey]?.callbackLabel ?? "Recorded!";
await ctx.answerCallbackQuery(callbackLabel);
```

#### 4b. Reply-to-Comment Handler — ✅ DONE, 🔲 REVISE gate

Add a `comments_enabled` check before persisting:

```typescript
// After resolving logEntry — check hub comment config
const { data: config } = await adminClient
  .from('hub_engagement_config')
  .select('comments_enabled')
  .eq('hub_id', logEntry.publication.hub_id)
  .maybeSingle();

// If hub has explicitly disabled comments, ignore silently
if (config && config.comments_enabled === false) return;

// ... rest of insert + Inngest event unchanged
```

#### 4c. Helper: `findOrCreateMessengerIdentity` — ✅ DONE, no changes needed

---

## 5. Feedback Analyst Agent (Inngest)

### ✅ [DONE] `src/inngest/engagement.ts`

No changes required. The sentiment scoring function is agnostic to which reaction types are configured per hub.

---

## 6. Dashboard Integration

### ✅ [DONE] `/dashboard/hubs/[slug]/intelligence/page.tsx`

The page exists and shows stat cards, publication breakdown, and the comment inbox. The following revisions adapt it to dynamic hub configuration.

### 🔲 [REVISE] `src/app/dashboard/hubs/intelligence-actions.ts`

`getPublicationEngagement` currently hardcodes `insight`, `helpful`, `irrelevant` as aggregation keys. It must become hub-config-aware:

```typescript
export async function getPublicationEngagement(hubId: string) {
  const supabase = await createClient();

  // Fetch the hub's enabled reactions
  const { data: config } = await supabase
    .from('hub_engagement_config')
    .select('reactions_enabled')
    .eq('hub_id', hubId)
    .maybeSingle();

  const enabledReactions: string[] = config?.reactions_enabled ?? DEFAULT_REACTIONS;

  const { data, error } = await supabase
    .from('publication_engagement')
    .select(`publication_id, type, value, publication:publications(title)`)
    .eq('hub_id', hubId);

  if (error) { /* ... */ return []; }

  const pubMap = new Map<string, any>();

  for (const e of (data || [])) {
    if (!pubMap.has(e.publication_id)) {
      const reactionCounts = Object.fromEntries(enabledReactions.map(r => [r, 0]));
      pubMap.set(e.publication_id, {
        id: e.publication_id,
        title: (e.publication as any)?.title || 'Unknown',
        ...reactionCounts,
        comments: 0
      });
    }
    const stats = pubMap.get(e.publication_id);
    if (e.type === 'reaction' && e.value in stats) stats[e.value]++;
    else if (e.type === 'comment') stats.comments++;
  }

  return {
    rows: Array.from(pubMap.values()),
    enabledReactions   // Pass to UI so it can render correct columns
  };
}
```

### 🔲 [REVISE] `/dashboard/hubs/[slug]/intelligence/page.tsx`

The publication breakdown table must render columns dynamically based on `enabledReactions` returned by the action, using `BASE_REACTION_SET` for labels/emojis.

### 🔲 [NEW] Hub Settings — Engagement Configuration Section

**Location:** Add a new section to the hub settings page or create a dedicated sub-page at `/dashboard/hubs/[slug]/settings/engagement`.

**UI layout:**

```
┌─────────────────────────────────────────────────────┐
│  Engagement Configuration                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Reactions                                          │
│  Select which reactions appear on published         │
│  messages. Order controls button placement.         │
│                                                     │
│  ☑ 🧠 Insight      ☑ 👍 Helpful    ☑ 👎 Not for me │
│  ☐ 🔥 Trending    ☐ 🚀 Share-worthy ☐ ❓ Need context│
│                                                     │
│  Comment Capture                                    │
│  Allow subscribers to respond to published          │
│  messages with text replies.                        │
│                                                     │
│  ● Enabled    ○ Disabled                            │
│                                                     │
│                           [ Save Configuration ]   │
└─────────────────────────────────────────────────────┘
```

**New server actions in `src/app/dashboard/hubs/settings-actions.ts`:**

```typescript
export async function getHubEngagementConfig(hubId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('hub_engagement_config')
    .select('reactions_enabled, comments_enabled')
    .eq('hub_id', hubId)
    .maybeSingle();

  return {
    reactionsEnabled: data?.reactions_enabled ?? DEFAULT_REACTIONS,
    commentsEnabled:  data?.comments_enabled  ?? true,
  };
}

export async function saveHubEngagementConfig(
  hubId: string,
  reactionsEnabled: string[],
  commentsEnabled: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('hub_engagement_config')
    .upsert({ hub_id: hubId, reactions_enabled: reactionsEnabled, comments_enabled: commentsEnabled },
             { onConflict: 'hub_id' });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/hubs/[slug]/settings`, 'page');
  revalidatePath(`/dashboard/hubs/[slug]/intelligence`, 'page');
}
```

---

## 7. Revised Implementation Roadmap

| Step | Task | Status | Effort |
| :--- | :--- | :--- | :--- |
| 1 | DB migration: `publication_engagement` + indexes + RLS | ✅ DONE | — |
| 2 | Hardcoded reaction buttons on distribution messages | ✅ DONE (to be revised) | — |
| 3 | `findOrCreateMessengerIdentity` helper | ✅ DONE | — |
| 4 | Reaction callback handler | ✅ DONE (to be revised) | — |
| 5 | Reply-to-comment handler | ✅ DONE (to be revised) | — |
| 6 | Inngest sentiment analyst + `analyzeSentiment` | ✅ DONE | — |
| 7 | Register Inngest function | ✅ DONE | — |
| 8 | Intelligence dashboard page + server actions | ✅ DONE (to be revised) | — |
| **9** | **[DONE]** `src/lib/engagement/reactions.ts` — `BASE_REACTION_SET` constant + `buildReactionButtons` helper | ✅ DONE | Small |
| **10** | **[DONE]** DB migration: `hub_engagement_config` table + RLS | ✅ DONE | Small |
| **11** | **[DONE]** `distribution.ts` — fetch hub engagement config, dynamic reaction row, skip row if none enabled | ✅ DONE | Medium |
| **12** | **[DONE]** `bot.ts` reaction handler — validate reaction type against hub config; dynamic callback labels from `BASE_REACTION_SET` | ✅ DONE | Small |
| **13** | **[DONE]** `bot.ts` comment handler — check `comments_enabled` before persisting | ✅ DONE | Small |
| **14** | **[DONE]** `intelligence-actions.ts` — dynamic reaction key aggregation; pass `enabledReactions` to UI | ✅ DONE | Small |
| **15** | **[DONE]** `intelligence/page.tsx` — render dynamic reaction columns in publication breakdown table | ✅ DONE | Small |
| **16** | **[DONE]** Hub Settings — Engagement Config section: multi-select from base set + comments toggle + server actions | ✅ DONE | Medium |

**Recommended session split:**
- **Session A** (Steps 9–13): Data layer + bot/distribution runtime — these are tightly coupled and should land together.
- **Session B** (Steps 14–16): Dashboard + settings UI — can follow independently.

**Estimated remaining scope:** ~1.5 development sessions.

---

## 8. Verification Plan

| # | Test | Type |
| :- | :--- | :--- |
| 1 | Apply `hub_engagement_config` migration → confirm table, unique constraint, defaults, RLS policies | Automated |
| 2 | `pnpm build` passes across monorepo | Automated |
| 3 | Hub with no config row → distribution message shows default 3-button reaction row | Manual |
| 4 | Configure hub to use only `trending` + `share` → distribution message shows 2-button row | Manual |
| 5 | Configure hub with 0 reactions → distribution message has no reaction row | Manual |
| 6 | Click a reaction button → `publication_engagement` row inserted with correct `value` | Integration |
| 7 | Click same reaction again → row removed (toggle off) | Integration |
| 8 | Craft a `callback_data` for a reaction not in hub config → bot returns "no longer available" message | Integration |
| 9 | Hub with `comments_enabled = false` → reply to publication message → no DB row inserted | Integration |
| 10 | Hub with `comments_enabled = true` → reply captured, Inngest event fired, `sentiment_score` backfilled | Integration |
| 11 | Intelligence page publication breakdown shows columns matching hub's configured reactions only | Manual |
| 12 | Unlinked Telegram user reacts → `messenger_identity_id` populated, `consumer_id` NULL | Integration |
| 13 | Save engagement config from settings UI → distribution agent picks up new config on next publish | Manual |

---

## 9. Open Design Decisions

Before implementation of steps 9–16 begins, the following should be confirmed:

1. **Reaction ordering on Telegram**: The order of `reactions_enabled` in the array drives button order. Should the UI allow drag-to-reorder, or is checkbox order (top-to-bottom) sufficient?

2. **Maximum reactions**: Telegram renders up to ~8 buttons per row cleanly, but UX degrades above 4. Should the platform enforce a maximum of 4 enabled reactions per hub?

3. **Config seeding**: Hubs without a `hub_engagement_config` row use application-level defaults. The `saveHubEngagementConfig` upsert creates the row on first save. No backfill migration needed — confirmed.

4. **Historical reactions for discontinued types**: If a curator removes a reaction, historical `publication_engagement` rows with that `value` persist. The Intelligence dashboard should display all historical reaction types, with a visual cue (e.g., muted/italic label) for reactions no longer in the hub's active config.

---

## 10. Future Considerations (Post-Phase 9)

- **Privacy Controls**: Toggle per channel/group to make comments private (curator-only) or public.
- **Targeted Alerts**: Hub-directed notifications for engagement milestones or negative sentiment.
- **In-Channel Analytics**: Periodic summaries pushed back to the channel showing popular topics.
- **Reaction Count Display**: Optionally update inline keyboard text to show live counts (e.g., `🧠 12`). Requires `editMessageReplyMarkup` calls.
- **WhatsApp Engagement**: Reaction and comment capture parity for WhatsApp distribution channels.
