# Implementation Plan: AI Token Usage & Cost Estimation
## Volkwolk Hub

> [!NOTE]
> **Goal:** Identify article types → map the AI calls made for each → measure average token cost per call → calculate expected model cost per article type.

---

## 1. Article Type Taxonomy

Based on `monitored_sources.type` (the enum `source_type`), there are **three meaningful article archetypes** in the Volkwolk hub:

| # | Archetype | Source Types | How Content Arrives | Current Volume |
|---|---|---|---|---|
| A | **RSS Article** | `rss` | Full article HTML/text pre-fetched during RSS discovery, stored in `raw_content` | 600 pubs |
| B | **RSSHub YouTube (description-only)** | `rsshub` with `/youtube/user/@…` routes | Only the YouTube video description (~455 chars) is stored; transcript NOT fetched | 926 pubs |
| C | **Manual YouTube (transcript)** | `manual` / `youtube` (ad-hoc submissions) | Full transcript fetched via `YoutubeTranscript.fetchTranscript()` at pipeline time | ~5 pubs (growing) |

> [!IMPORTANT]
> **Archetype B is a hybrid** - the AI is given only the video description (~455 chars) as "content", yet consistently produces 1,600-char summaries. This is quasi-creative generation, not summarization. This has significant implications for cost accuracy and output quality.

There is a **fourth type in principle** (`rsshub` non-YouTube routes, e.g. `/mybroadband/news/broadband` and `/lexlibertas/media`), which has much longer raw_content (10k-57k chars) — but these are rare in Volkwolk. The plan **treats them as a variant of Type A** (long-form RSS).

---

## 2. AI Calls Per Article Type

The Intelligence Pipeline (`xentara/publication.detected`) triggers these LLM calls:

| Step | Function | Model | Always Called? | Input Source | Output |
|---|---|---|---|---|---|
| **summarize-content** | `summarizeGemini()` | `gemini-2.5-flash` | ✅ Yes (if content > 50 chars) | `raw_content` (capped at 30,000 chars) + title | Markdown summary text |
| **predict-taste-and-taxonomy** | `predictTasteGemini()` | `gemini-2.5-flash` | ✅ Yes (after summarize) | Summary (capped at 10,000 chars) + hub taxonomy context + title | JSON: byline, synopsis, sentiment, tags, refined_title |
| **analyze-sentiment** *(engagement only)* | `analyzeSentiment()` | `gemini-2.5-flash` | ❌ Only on user comment | Comment text (capped at 2,000 chars) | Float |

The **distribution pipeline** (`xentara/publication.published`) makes **zero LLM calls** — it formats and sends to Telegram only.

**Per archetype, the standard path is always 2 Gemini calls per article.**

---

## 3. Retrospective Token Estimate (Current Collection)

Since the code **does not currently capture `usageMetadata`** from the Gemini API response, we estimate from character counts using the **4 chars ≈ 1 token** heuristic.

### Prompt Structure Overhead (fixed per call)

**Call 1 — Summarize:**
```
Prompt template (fixed): ~120 chars (~30 tokens)
Title: avg 62-69 chars (~16 tokens)
Content: raw_content (capped at 30,000 chars)
```

**Call 2 — Predict Taste:**
```
Prompt template (fixed): ~600 chars (~150 tokens)
Hub taxonomy: ~20 confirmed tags × ~60 chars = ~1,200 chars (~300 tokens)
Summary input (capped at 10,000 chars)
Output: JSON ~300-500 chars (~100 tokens)
```

### Estimated Tokens per Article Type

> All figures are **per article**. Token counts are rounded estimates.

#### Type A — RSS Article (avg raw: 4,567 chars, avg summary: 1,507 chars)

| Call | Input Tokens | Output Tokens | Input Cost | Output Cost | Total Cost |
|---|---|---|---|---|---|
| Summarize | (120 + 65 + 4,567) / 4 ≈ **1,188 tok** | 1,507 / 4 ≈ **377 tok** | $0.000178 | $0.000226 | **$0.000404** |
| Predict Taste | (600 + 1,200 + 1,507) / 4 ≈ **827 tok** | ~400 tok (JSON) | $0.000124 | $0.000240 | **$0.000364** |
| **Total per article** | **~2,015 tok input** | **~777 tok output** | **$0.000302** | **$0.000466** | **~$0.00077** |

#### Type B — RSSHub / YouTube Description (avg raw: 534 chars, avg summary: 1,612 chars)

| Call | Input Tokens | Output Tokens | Input Cost | Output Cost | Total Cost |
|---|---|---|---|---|---|
| Summarize | (120 + 62 + 534) / 4 ≈ **179 tok** | 1,612 / 4 ≈ **403 tok** | $0.000027 | $0.000242 | **$0.000269** |
| Predict Taste | (600 + 1,200 + 1,612) / 4 ≈ **853 tok** | ~400 tok (JSON) | $0.000128 | $0.000240 | **$0.000368** |
| **Total per article** | **~1,032 tok input** | **~803 tok output** | **$0.000155** | **$0.000482** | **~$0.00064** |

#### Type C — Manual YouTube Transcript (estimated; transcript varies 5k–30k chars)

| Call | Input Tokens (at avg 15k chars transcript) | Output Tokens | Input Cost | Output Cost | Total Cost |
|---|---|---|---|---|---|
| Summarize | (120 + 65 + 15,000) / 4 ≈ **3,796 tok** | ~500 tok | $0.000569 | $0.000300 | **$0.000869** |
| Predict Taste | (600 + 1,200 + 2,000) / 4 ≈ **950 tok** | ~400 tok | $0.000143 | $0.000240 | **$0.000383** |
| **Total per article** | **~4,746 tok input** | **~900 tok output** | **$0.000712** | **$0.000540** | **~$0.00125** |

### Summary Table

| Article Type | Est. Input Tokens | Est. Output Tokens | Est. Cost/Article | Cost/1000 Articles |
|---|---|---|---|---|
| **A: RSS Article** | ~2,015 | ~777 | **~$0.00077** | ~$0.77 |
| **B: RSSHub/YouTube (desc only)** | ~1,032 | ~803 | **~$0.00064** | ~$0.64 |
| **C: Manual YouTube (transcript)** | ~4,746 | ~900 | **~$0.00125** | ~$1.25 |

> [!TIP]
> Gemini 2.5 Flash is extremely economical. At Volkwolk's current run rate (~1,526 processed publications), the **retrospective cost of the entire collection is estimated at ~$1.05–$1.15 total**.

---

## 4. Implementation Plan

### Phase 1 — Add Real Token Instrumentation to the AI Engine
**File:** `src/utils/ai/engine.ts`

**Changes:**
1. Modify `summarizeGemini()` to return `{ text, usageMetadata }` instead of just the text string.
2. Modify `predictTasteGemini()` similarly — capture `data.usageMetadata` from each Gemini response.
3. The `usageMetadata` object from the Gemini API contains: `{ promptTokenCount, candidatesTokenCount, totalTokenCount }`.

```typescript
// Example change to summarizeGemini return:
return {
  text: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
  usage: data.usageMetadata ?? null  // { promptTokenCount, candidatesTokenCount, totalTokenCount }
};
```

**Acceptance:** Both AI functions return a structured object with `text` + `usage`.

---

### Phase 2 — Persist Token Data in the Pipeline
**File:** `src/inngest/functions.ts`

**Changes:**
1. Update the `summarize-content` step to pass `tokenUsage.summarize` from the AI response.
2. Update the `predict-taste-and-taxonomy` step similarly.
3. In the `finalize-publication` step, merge these into `intelligence_metadata`:

```typescript
intelligence_metadata: {
  ...existingMetadata,
  ai_usage: {
    summarize: { input_tokens: X, output_tokens: Y, model: 'gemini-2.5-flash' },
    predict_taste: { input_tokens: A, output_tokens: B, model: 'gemini-2.5-flash' },
    processed_at: new Date().toISOString()
  }
}
```

**No DB migration needed** — `intelligence_metadata` is already `jsonb`.

**Acceptance:** New publications have `intelligence_metadata.ai_usage` populated after processing.

---

### Phase 3 — Analytics SQL View
**Location:** Supabase SQL editor → create a view

```sql
CREATE OR REPLACE VIEW public.vw_ai_cost_by_article_type AS
SELECT
  ms.type AS source_type,
  COUNT(p.id) AS publication_count,
  -- Token averages
  ROUND(AVG((p.intelligence_metadata->'ai_usage'->'summarize'->>'input_tokens')::numeric)) AS avg_summarize_input_tokens,
  ROUND(AVG((p.intelligence_metadata->'ai_usage'->'summarize'->>'output_tokens')::numeric)) AS avg_summarize_output_tokens,
  ROUND(AVG((p.intelligence_metadata->'ai_usage'->'predict_taste'->>'input_tokens')::numeric)) AS avg_taste_input_tokens,
  ROUND(AVG((p.intelligence_metadata->'ai_usage'->'predict_taste'->>'output_tokens')::numeric)) AS avg_taste_output_tokens,
  -- Cost estimates (Gemini 2.5 Flash pricing: $0.15/MTok in, $0.60/MTok out)
  ROUND(AVG(
    (
      (p.intelligence_metadata->'ai_usage'->'summarize'->>'input_tokens')::numeric * 0.00000015 +
      (p.intelligence_metadata->'ai_usage'->'summarize'->>'output_tokens')::numeric * 0.00000060 +
      (p.intelligence_metadata->'ai_usage'->'predict_taste'->>'input_tokens')::numeric * 0.00000015 +
      (p.intelligence_metadata->'ai_usage'->'predict_taste'->>'output_tokens')::numeric * 0.00000060
    )
  ), 8) AS avg_cost_per_article_usd
FROM publications p
JOIN monitored_sources ms ON p.source_id = ms.id
WHERE p.intelligence_metadata ? 'ai_usage'
GROUP BY ms.type;
```

**Acceptance:** `SELECT * FROM vw_ai_cost_by_article_type;` returns live cost data.

---

### Phase 4 — Admin Dashboard Report Page
**Location:** `src/app/dashboard/settings/costs/page.tsx` (new page)

**Features:**
- Table showing per-type token averages and cost/article from the view
- Projections: "At current ingestion rate, monthly AI cost = $X"
- Breakdown of input vs output token spend
- Source-level drill-down for outliers

**Acceptance:** Accessible from the hub settings nav under a new "AI Costs" tab.

---

## 5. Scope & Exclusions

| Item | In Scope | Notes |
|---|---|---|
| `summarizeGemini` token tracking | ✅ | |
| `predictTasteGemini` token tracking | ✅ | |
| `analyzeSentiment` tracking | ❌ (Phase 2) | Low volume, negligible cost |
| Inception Labs (fallback model) | ❌ | Inception doesn't expose token counts via standard API |
| Backfilling historical publications | ❌ | Only new publications will have real token data; historical uses the char-count estimates above |
| Thinking mode token tracking | ❌ | Not currently enabled |

---

## 6. Proposed Work Order

```
Phase 1 (engine.ts)         → 1-2h, highest value, unblocks everything
Phase 2 (functions.ts)      → 1h, plumbing
Phase 3 (SQL view)          → 30min, immediate analytics value
Phase 4 (dashboard page)    → 2-3h, optional / deferred
```

Total estimated effort: **~5-6 hours** for Phase 1-3. Phase 4 is additive.
