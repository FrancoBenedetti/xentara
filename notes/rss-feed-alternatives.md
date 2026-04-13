Searched web: "rss.app pricing plans 2025 feed from any website"
Searched web: "morph.so politepol fetchrss create RSS feed from any website pricing comparison 2025"
Searched web: "rss.app pricing tiers 2025 site:rss.app OR "rss.app" plans cost per month feeds"
Searched web: "RSSHub self-host vercel deploy unlimited feeds open source 2025"

Here's a full comparison of your options, tailored to Xentara's specific needs — including sites like Solidariteit that have **no feed at all**.

---

## The Two Distinct Problems

It's important to separate these into two categories because they each require a different solution:

| Problem | Examples | Root Cause |
|---|---|---|
| **Blocked RSS feed** | Maroela Media | Has a feed, but Cloudflare WAF blocks datacenter IPs |
| **No RSS feed at all** | Solidariteit.co.za | No `/feed` exists; requires web scraping to discover articles |

These need different tools.

---

## Option Comparison

### 1. RSS.app — *"RSS as a Service"*

Generates proxy-served RSS feeds from any website using their own scraping infrastructure, bypassing WAF issues for you.

| | |
|---|---|
| **Free** | 2 feeds, 24h refresh — unusable for production |
| **Basic (~$8/mo)** | 15 feeds, 25 posts/feed, webhooks |
| **Mid (~$17/mo)** | 100 feeds, 50 posts/feed |
| **Pro** | 500+ feeds, API access |
| **Fit for Xentara** | ✅ Solves both problems (blocked feeds + no-feed sites) |
| **Downside** | You're paying per-feed as Xentara scales. A hub with 10 sources costs the same as one with 2. No control over extraction quality. |

**Practical workflow**: Curator adds a source URL → Xentara sends it to RSS.app API → gets back a generated feed URL → polls it on your hourly cron. Clean, no code changes to discovery logic.

---

### 2. Firecrawl — *"Scraping as a Service"*

Scrapes any page and returns clean Markdown. Best for **article body ingestion**, not discovery.

| | |
|---|---|
| **Credit cost** | 1 credit/page scrape; 2/crawl |
| **Discovery use** | You'd crawl a news index page, extract article links — ~2 credits/run/source |
| **Ingestion use** | Replacing your `fetchRSSMetadata` — 1 credit/article |
| **At scale** | 5 hubs × 5 sources × 10 articles/day = **~300 credits/day = ~9,000/month** → needs Standard at $83/mo |
| **Fit for Xentara** | 🟡 Best for ingestion quality, expensive for discovery at scale |

---

### 3. PolitePol / FetchRSS — *"Simple feed generators"*

Lightweight SaaS tools to generate RSS from pages using CSS selectors you configure manually.

| | |
|---|---|
| **Price** | ~$5/mo for unlimited feeds |
| **Fit for Xentara** | ❌ Requires manual CSS selector config per site; no API to automate; can't be integrated into your source-add flow |

---

### 4. RSSHub (Self-Hosted) — *"Open-source feed engine"*

A massive open-source project with pre-built routes for hundreds of sites. Community-maintained.

| | |
|---|---|
| **Cost** | Free, but needs a VPS (~$5-10/mo on Hetzner/DigitalOcean) |
| **Fit for Xentara** | 🟡 Good if Solidariteit/Maroela already have a community route. Unlikely for niche SA Afrikaans sites |
| **Downside** | Not a dynamic "add any URL" tool — you need pre-built routes |

---

### 5. Hybrid: RSS.app for Discovery + Firecrawl for Ingestion — *Recommended*

This is the cleanest architecture for Xentara's model:

```
Source Added by Curator
        │
        ▼
  RSS.app API                ← Generates a real feed URL for ANY source
  (even non-RSS sites)         Costs: ~$17/mo for up to 100 feeds
        │
        ▼
  Hourly Cron            ← Polls the RSS.app feed URL
  (existing engine)        Gets item links — same as today
        │
        ▼
  Firecrawl /scrape      ← Called per article during pipeline
  (replaces fetchRSSMetadata)  Gets clean Markdown for AI
  Cost: ~1 credit/article
```

**Total estimated cost for a 5-hub Xentara instance:**
- RSS.app Basic: **~$8/mo** (up to 15 sources)
- Firecrawl Hobby: **~$16/mo** (3,000 credits, ~3,000 articles/mo)
- **Total: ~$24/mo** for universal, WAF-bypassing, clean content ingestion

---

## My Recommendation

**Go with RSS.app for discovery** — it solves both your immediate problems (blocked feeds + no-feed sites like Solidariteit) with zero complexity on your end. The curator just adds a URL, RSS.app handles the rest, and your existing discovery engine stays unchanged.

**Keep a deferred Firecrawl integration** for article body ingestion quality — it can replace the fragile regex scraper in `fetchRSSMetadata`, but that's a separate, lower-urgency improvement.

Shall I implement the RSS.app integration? The plan would be:
1. Add `RSSAPP_API_KEY` to your environment
2. Modify `addSource` to register the URL with RSS.app and store the generated feed URL
3. Discovery engine polls the RSS.app feed URL instead of the raw source URL