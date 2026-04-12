# Phase 9: Engagement Feedback Engine (Reactions & Responses)

This phase implements the **Engagement & Feedback Agent**, completing the "Intelligence Feedback Loop." It allows curators to see how their publications are performing across Telegram, WhatsApp, and the PWA, capturing both quantitative reactions and qualitative responses.

## Objective

To transform one-way broadcasting into a two-way intelligence exchange. Curators get high-signal data on what their audience values, powered by AI-driven sentiment analysis of incoming comments. Feedback is natively **Hub-Centric**, ensuring engagement is tracked against specific intelligence contexts regardless of the distribution channel.

---

## Current State (Post-Phase 8)

| Layer                        | Status                                                                              |
| :--------------------------- | :---------------------------------------------------------------------------------- |
| **Telegram Bot**             | ✅ Commands (`/start`, `/link`, `/subscribe`, `/myhubs`, `/chatid`, `/help`)         |
| **Distribution Agent**       | ✅ Inngest function pushes to channels and subscriber DMs                           |
| **Inline Buttons (Current)** | ✅ `🧠 Read Intelligence` (viewer URL) + `🔗 Source Article` (source URL)            |
| **Distribution Log**         | ✅ Tracks every push with `message_id` for traceability                             |
| **Engagement Tracking**      | ❌ No reaction/comment capture — publications are fire-and-forget                   |
| **Feedback Analysis**        | ❌ No sentiment analysis on consumer responses                                      |
| **Intelligence Dashboard**   | ❌ No curator-facing view of how publications are received                           |

---

## 1. Database Schema

### [NEW] `supabase/migrations/20260412000000_engagement_engine.sql`

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
    -- Prevent duplicate reactions from the same user on the same publication
    UNIQUE NULLS NOT DISTINCT (publication_id, messenger_identity_id, type, value)
);

CREATE INDEX idx_engagement_publication_id ON public.publication_engagement(publication_id);
CREATE INDEX idx_engagement_hub_id ON public.publication_engagement(hub_id);
CREATE INDEX idx_engagement_consumer_id ON public.publication_engagement(consumer_id) WHERE consumer_id IS NOT NULL;
CREATE INDEX idx_engagement_messenger_id ON public.publication_engagement(messenger_identity_id) WHERE messenger_identity_id IS NOT NULL;

ALTER TABLE public.publication_engagement ENABLE ROW LEVEL SECURITY;

-- Service role writes (bot/Inngest). Curators can read for their hubs.
CREATE POLICY "Curators can view engagement for their hubs"
ON public.publication_engagement FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hub_memberships hm
    WHERE hm.hub_id = public.publication_engagement.hub_id
    AND hm.user_id = auth.uid()
  )
);
```

**Design notes:**

- **`hub_id` is explicit** (not derived via JOIN through `publications`) — cheaper RLS evaluation and direct hub-level queries without joining.
- **Unique constraint on reactions** prevents the same user from spamming the same reaction button. Comments are exempt (a user can reply multiple times).
- **Partial indexes** on nullable FK columns — only index rows where the value is actually populated, saving space.
- **`consumer_id` is nullable** — unlinked Telegram users (shadow profiles) still have their reactions tracked via `messenger_identity_id`. If/when they hydrate their identity later, a backfill query can populate `consumer_id`.

---

## 2. Distribution Agent Modification

### [MODIFY] `src/inngest/distribution.ts`

The existing distribution agent already sends messages with inline buttons (`🧠 Read Intelligence`, `🔗 Source Article`). Phase 9 **adds reaction buttons** to the same message.

**Current inline keyboard (Phase 8):**
```
[ 🧠 Read Intelligence (URL) | 🔗 Source Article (URL) ]
```

**Updated inline keyboard (Phase 9):**
```
[ 🧠 Read Intelligence (URL) | 🔗 Source Article (URL) ]
[ 🧠 Insight | 👍 Helpful | 👎 Not for me             ]
```

The second row uses `callback_data` values that encode the publication ID:

| Button | `callback_data`           |
| :----- | :------------------------ |
| 🧠     | `react_{pubId}_insight`   |
| 👍     | `react_{pubId}_helpful`   |
| 👎     | `react_{pubId}_irrelevant`|

**Why encode `pubId` and not `distributionLogId`?** Because feedback is Hub-Centric. A publication may be distributed to multiple channels, but all reactions roll up to the same publication regardless of where the user saw it.

**Important:** The `distribution_log` already stores the Telegram `message_id` for each push. Phase 9's reply handler uses this to resolve which publication a Telegram reply corresponds to.

---

## 3. Telegram Bot Updates

### [MODIFY] `src/lib/telegram/bot.ts`

Add two new handlers to the existing bot instance.

#### 3a. Reaction Callback Handler

```typescript
bot.callbackQuery(/^react_(.+)_(.+)$/, async (ctx) => {
  const publicationId = ctx.match[1];
  const reactionType = ctx.match[2]; // 'insight' | 'helpful' | 'irrelevant'
  const telegramId = ctx.from?.id;
  if (!telegramId || !publicationId) return;

  const adminClient = createAdminClient();

  // 1. Resolve or create messenger_identity (shadow profile support)
  let identity = await findOrCreateMessengerIdentity(adminClient, telegramId, ctx.from?.username);

  // 2. Resolve publication → hub_id
  const { data: pub } = await adminClient
    .from('publications')
    .select('hub_id')
    .eq('id', publicationId)
    .single();

  if (!pub) {
    return ctx.answerCallbackQuery("Publication not found.");
  }

  // 3. Upsert engagement (unique constraint handles dedup)
  const { error } = await adminClient
    .from('publication_engagement')
    .upsert({
      publication_id: publicationId,
      hub_id: pub.hub_id,
      consumer_id: identity.consumer_id || null,
      messenger_identity_id: identity.id,
      platform: 'telegram',
      type: 'reaction',
      value: reactionType,
      metadata: { chat_id: ctx.chat?.id }
    }, { onConflict: 'publication_id,messenger_identity_id,type,value' });

  if (error) {
    // If conflict → user already reacted with this emoji → toggle off (delete)
    await adminClient
      .from('publication_engagement')
      .delete()
      .eq('publication_id', publicationId)
      .eq('messenger_identity_id', identity.id)
      .eq('type', 'reaction')
      .eq('value', reactionType);

    await ctx.answerCallbackQuery("Reaction removed.");
  } else {
    const labels: Record<string, string> = {
      insight: "🧠 Marked as Insight",
      helpful: "👍 Marked as Helpful",
      irrelevant: "👎 Noted"
    };
    await ctx.answerCallbackQuery(labels[reactionType] || "Recorded!");
  }
});
```

**Key design decisions:**

- **Toggle behavior**: Pressing the same button twice removes the reaction (standard UX pattern).
- **Shadow profile support**: `findOrCreateMessengerIdentity()` is a helper that checks for an existing `messenger_identities` row. If none exists, it creates a shadow entry (`consumer_id = null`, `is_verified = false`). This means **unlinked users can still react**.
- **No Inngest event for reactions**: Reactions are simple writes — no AI processing needed. Direct DB insert keeps latency low (the user sees the callback response instantly).

#### 3b. Reply-to-Comment Handler

```typescript
bot.on('message', async (ctx) => {
  // Only process replies to bot messages
  if (!ctx.message?.reply_to_message) return;
  if (!ctx.message.text) return;

  const repliedToMessageId = ctx.message.reply_to_message.message_id.toString();
  const chatId = ctx.chat.id.toString();
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const adminClient = createAdminClient();

  // 1. Find which publication this message_id belongs to
  const { data: logEntry } = await adminClient
    .from('distribution_log')
    .select('publication_id, publication:publications!inner(hub_id)')
    .eq('message_id', repliedToMessageId)
    .eq('target_id', chatId)
    .eq('status', 'sent')
    .single();

  if (!logEntry) return; // Not a reply to a Xentara publication — ignore silently

  // 2. Resolve messenger identity
  const identity = await findOrCreateMessengerIdentity(adminClient, telegramId, ctx.from?.username);

  // 3. Store the comment
  await adminClient
    .from('publication_engagement')
    .insert({
      publication_id: logEntry.publication_id,
      hub_id: (logEntry.publication as any).hub_id,
      consumer_id: identity.consumer_id || null,
      messenger_identity_id: identity.id,
      platform: 'telegram',
      type: 'comment',
      value: ctx.message.text.substring(0, 2000), // Safety truncation
      metadata: {
        chat_id: chatId,
        message_id: ctx.message.message_id,
        reply_to_message_id: repliedToMessageId
      }
    });

  // 4. Emit Inngest event for sentiment analysis
  try {
    await inngest.send({
      name: 'xentara/engagement.received',
      data: {
        publicationId: logEntry.publication_id,
        hubId: (logEntry.publication as any).hub_id,
        type: 'comment',
        content: ctx.message.text.substring(0, 2000)
      }
    });
  } catch (e) {
    console.warn('Engagement event emission failed:', e);
  }
});
```

**Key design decisions:**

- **Uses existing `distribution_log.message_id`** to trace replies back to publications. No new lookup table needed.
- **Silent ignore** if the replied-to message isn't a Xentara publication — avoids confusing users in groups where the bot is present.
- **Comment text is truncated to 2000 chars** — prevents abuse while allowing meaningful feedback.
- **Inngest event only fires for comments** (not reactions) since comments need sentiment analysis.
- **Comments are visible to everyone** in groups/channels (per your decision). The bot does not delete, moderate, or redirect them.

#### 3c. Helper: `findOrCreateMessengerIdentity`

```typescript
async function findOrCreateMessengerIdentity(
  adminClient: SupabaseClient,
  telegramId: number,
  username?: string
) {
  const { data: existing } = await adminClient
    .from('messenger_identities')
    .select('id, consumer_id')
    .eq('platform', 'telegram')
    .eq('platform_user_id', telegramId.toString())
    .maybeSingle();

  if (existing) return existing;

  // Create shadow identity
  const { data: created } = await adminClient
    .from('messenger_identities')
    .insert({
      platform: 'telegram',
      platform_user_id: telegramId.toString(),
      platform_username: username || null,
      is_verified: false
    })
    .select('id, consumer_id')
    .single();

  return created!;
}
```

---

## 4. Feedback Analyst Agent (Inngest)

### [NEW] `src/inngest/engagement.ts`

Only processes **comments** — reactions are stored directly without AI processing.

```typescript
export const processEngagementFeedback = inngest.createFunction(
  {
    id: 'xentara-feedback-analyst',
    triggers: [{ event: 'xentara/engagement.received' }],
    concurrency: { limit: 10 },
    retries: 1,
  },
  async ({ event, step }) => {
    const { publicationId, hubId, type, content } = event.data;

    if (type !== 'comment' || !content) {
      return { status: 'skipped', reason: 'not a comment' };
    }

    // Step 1: Analyze sentiment
    const sentimentScore = await step.run('analyze-comment-sentiment', async () => {
      // Use existing AI engine (summarizeWithAI pattern)
      // Returns a float from -1.0 (very negative) to 1.0 (very positive)
      // For MVP: use a simple prompt to Gemini Flash
      return await analyzeSentiment(content);
    });

    // Step 2: Write score back
    await step.run('update-engagement-record', async () => {
      const supabase = createServiceClient();
      await supabase
        .from('publication_engagement')
        .update({ sentiment_score: sentimentScore })
        .eq('publication_id', publicationId)
        .eq('type', 'comment')
        .eq('value', content)
        .is('sentiment_score', null); // Only update if not already scored
    });

    return { status: 'analyzed', score: sentimentScore };
  }
);
```

### [MODIFY] `src/inngest/functions.ts`

Add export:
```typescript
export { processEngagementFeedback } from "./engagement";
```

### [MODIFY] `src/app/api/inngest/route.ts`

Register the function:
```typescript
import { processEngagementFeedback } from "@/inngest/functions";
// Add to functions array
```

---

## 5. Dashboard Integration

### [NEW] `/dashboard/hubs/[slug]/intelligence/page.tsx`

A server component that queries engagement data per hub.

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Hub Name — Intelligence                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  ENGAGEMENT SUMMARY (stat cards)        │    │
│  │  Total Reactions │ Comments │ Avg Sent.  │    │
│  │  127             │ 23       │ +0.4       │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  REACTION BREAKDOWN (per publication)   │    │
│  │  Publication Title    🧠  👍  👎        │    │
│  │  "AI Market Update"   12  34  2         │    │
│  │  "Crypto Regulation"   8  15  5         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  COMMENT INBOX                          │    │
│  │  [user] on "AI Market Update":          │    │
│  │  "Great analysis, especially the..."    │    │
│  │  Sentiment: +0.7  •  2h ago             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Data Queries (server actions):**

```typescript
// In settings-actions.ts or a new intelligence-actions.ts
export async function getHubEngagementSummary(hubId: string) {
  // Aggregate reaction counts grouped by value
  // Aggregate comment count
  // Average sentiment_score for comments
}

export async function getPublicationEngagement(hubId: string) {
  // Per-publication breakdown: reactions by type, comment count
  // Ordered by total engagement descending
}

export async function getRecentComments(hubId: string, limit = 20) {
  // Latest comments with platform, user info, sentiment
}
```

---

## 6. Implementation Roadmap

| Step | Task                                                               | Effort |
| :--- | :----------------------------------------------------------------- | :----- |
| 1    | Database Migration (`publication_engagement` + indexes + RLS)      | Small  |
| 2    | Add reaction buttons to distribution agent inline keyboard         | Small  |
| 3    | Implement `findOrCreateMessengerIdentity` helper                   | Small  |
| 4    | Implement reaction callback handler in bot                         | Medium |
| 5    | Implement reply-to-comment handler in bot                          | Medium |
| 6    | Create Inngest engagement agent + `analyzeSentiment` AI call       | Medium |
| 7    | Register new Inngest function                                      | Small  |
| 8    | Create dashboard Intelligence page + server actions                | Medium |

**Estimated scope:** ~2 development sessions for core (steps 1–7), +1 for the dashboard view.

---

## 7. Verification Plan

| # | Test                                                                                                  | Type        |
| : | :---------------------------------------------------------------------------------------------------- | :---------- |
| 1 | Apply migration → confirm `publication_engagement` table, constraints, partial indexes exist           | Automated   |
| 2 | `pnpm build` passes across monorepo                                                                   | Automated   |
| 3 | Publish a publication → verify Telegram message now has two rows of buttons (links + reactions)        | Manual      |
| 4 | Click 🧠 on a Telegram publication → confirm `publication_engagement` row with `type=reaction`        | Integration |
| 5 | Click 🧠 again → confirm the reaction is removed (toggle off)                                        | Integration |
| 6 | Click 🧠 then 👍 → confirm both reactions coexist (different `value`)                                | Integration |
| 7 | Reply to a publication message in Telegram → confirm `type=comment` row in DB                         | Integration |
| 8 | Verify Inngest receives `xentara/engagement.received` event and writes `sentiment_score`              | Integration |
| 9 | Unlinked Telegram user reacts → confirm `messenger_identity_id` populated, `consumer_id` is NULL      | Integration |
| 10| Dashboard Intelligence page loads and shows correct aggregated data                                    | Manual      |

---

## 8. Future Considerations (Post-Phase 9)

Based on current decisions, the following will be implemented as optional settings in future phases:

- **Privacy Controls**: Toggle per channel/group to make comments private (curator-only) or public. Not applicable to private chats (always visible).
- **Targeted Alerts**: Hub-directed notifications for engagement milestones or negative sentiment, configurable per distribution channel.
- **In-Channel Analytics**: Periodic summaries pushed back to the channel showing popular topics.
- **Reaction Count Display**: Optionally update the inline keyboard text to show live counts (e.g., `🧠 12`). Requires `editMessageReplyMarkup` calls.
