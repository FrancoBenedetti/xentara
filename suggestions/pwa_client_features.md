# Xentara Client PWA — Feature Backlog

> **Status:** Draft · For review and prioritisation  
> **Source:** `suggestions/architecture_v2.md` + UX analysis  
> **Scope:** Phases 10–12 (Consumer PWA, Article Reader, Meta-Hub)

---

## 1. Feed & Discovery

Core reading surface — the entry point for all users.

| # | Feature | Rationale |
|---|---------|-----------|
| F-01 | **Feed Rhythm Rendering** | Architecture defines polymorphic rhythms (e.g. 2 Detailed + 8 Visual). The PWA must render mixed-density layouts based on curator-configured rhythm rules. |
| F-02 | **Infinite / Paginated Feed** | Smooth, performant scrolling through publication history without full reloads (virtual list for large corpora). |
| F-03 | **Flavor / Lens Filter Bar** | Persistent chip/tab bar letting users filter the feed by Hub Flavors (taxonomy tags) in one tap. |
| F-04 | **Full-Text Search** | Search across titles, summaries, and bylines. Should support fuzzy matching and search-within-flavors. |
| F-05 | **Sort & Recency Controls** | Toggle between Newest, Oldest, Most Reacted, and Relevance (AI score). |
| F-06 | **"Out of Focus" Content Toggle** | Show/hide items flagged by Strict Mode as misaligned with Hub Flavors. Hidden by default. |
| F-07 | **New-Since-Last-Visit Indicator** | Visual badge or divider line showing publications added since the user last opened the feed. |
| F-08 | **Pull-to-Refresh / Auto-Refresh** | PWA-native gesture and background polling for fresh content without manual navigation. |

---

## 2. Publication Detail View

The single-article reading experience.

| # | Feature | Rationale |
|---|---------|-----------|
| P-01 | **AI Summary Panel** | Surfaced summary (from Mercury-2) displayed prominently. Collapsible for users who want to jump to source. |
| P-02 | **Flavor Tags Display** | Show all assigned and confidence-weighted Flavor tags so users understand *why* an article appeared. |
| P-03 | **Sentiment / Tone Indicator** | Visual badge (e.g. Positive / Neutral / Critical) derived from normalization agent score. |
| P-04 | **Byline & Source Attribution** | Clear source name, author, original URL, and publication timestamp. |
| P-05 | **Open Original Article** | One-tap link to the canonical source URL (opens in-app reader or external browser — user preference). |
| P-06 | **Reading Progress Indicator** | Progress bar on long articles so users know where they are. |
| P-07 | **Estimated Read Time** | Computed from word count; displayed on card and detail view. |
| P-08 | **Related Publications** | AI-surfaced or tag-matched articles from the same Hub below the detail view. |

---

## 3. Bookmarking & Read-Later

The architecture explicitly references an "Article Reader Service for saving and managing Read Later content." This is a first-class feature group.

| # | Feature | Rationale |
|---|---------|-----------|
| B-01 | **Bookmark / Save for Later** | One-tap save from feed card or detail view. Persisted to the Xentara Article Reader Service across sessions and devices. |
| B-02 | **Saved Items Library** | Dedicated screen listing all bookmarked publications with status (unread / in-progress / read). |
| B-03 | **Reading Lists (Collections)** | User-created named lists to group bookmarks thematically (e.g. "Q2 Research", "Weekend Reading"). |
| B-04 | **Quick-Add to List** | From the bookmark action, allow immediate assignment to an existing or new list. |
| B-05 | **Offline Reading Cache** | PWA service worker caches saved articles for offline consumption — critical for commuters. |
| B-06 | **Archive / Dismiss** | Mark items as "done" to clear them from active queues without deleting permanently. |
| B-07 | **Unsave / Remove from Library** | Obvious removal path with undo snackbar (prevent accidental deletion). |

---

## 4. Reading History & Tracking

Users want to know *what* they've read, *when*, and *how much*.

| # | Feature | Rationale |
|---|---------|-----------|
| H-01 | **Automatic Read Tracking** | Mark publications as "read" when user scrolls past a threshold or closes the detail view. |
| H-02 | **Read History Feed** | Chronological log of all viewed publications with timestamps — queryable and filterable. |
| H-03 | **Reading Streak / Activity Calendar** | GitHub-style heatmap or streak counter to gamify consistent reading habits. |
| H-04 | **Time-Spent Tracker** | Approximate time spent per article and cumulative per Hub / Flavor — useful for self-reflection. |
| H-05 | **"Read on" Timestamp** | Display when the user last read a specific article (visible in detail view and history). |
| H-06 | **Re-read Flag** | Allow users to explicitly mark an article as worth re-reading, surfacing it again later. |
| H-07 | **Clear History (Selective / Full)** | Privacy control — users can wipe individual entries or entire history. |
| H-08 | **History Export** | Export reading history as CSV or JSON for personal analytics or journaling workflows. |

---

## 5. Personal Notes & Annotations

Capturing thoughts is the bridge between passive reading and active knowledge building.

| # | Feature | Rationale |
|---|---------|-----------|
| N-01 | **Per-Article Notes** | Free-text note field attached to a publication — persisted to the user's account, not shared. |
| N-02 | **Rich Text / Markdown Notes** | Support basic formatting (bold, lists, headings) for structured note-taking. |
| N-03 | **Text Highlighting** | Select and highlight passages within the in-app reader; highlights persist across sessions. |
| N-04 | **Highlight-Anchored Notes** | Attach a note to a specific highlighted passage rather than just the article as a whole. |
| N-05 | **Notes Library / Search** | Dedicated view of all notes across publications, searchable by keyword, article, or date. |
| N-06 | **Note Timestamps** | Show when a note was created and last edited. |
| N-07 | **Note Export** | Export notes (with article reference) as Markdown or plain text for use in other tools. |

---

## 6. Categorisation & Taxonomy Interaction

Users should be able to personalise how they relate to Hub Flavors.

| # | Feature | Rationale |
|---|---------|-----------|
| C-01 | **Personal Flavor Preferences** | Allow users to "follow" or "mute" specific Flavors, personalising their feed view without changing Hub config. |
| C-02 | **User-Defined Labels / Tags** | Private, user-created labels that can be applied to any publication (separate from Hub Flavors). |
| C-03 | **Filter by User Label** | Filter Saved Library and History by personal labels. |
| C-04 | **Taste Profile Dashboard** | Visual breakdown of which Flavors the user most engages with — mirrors the curator-side intelligence but for self-awareness. |
| C-05 | **Suggest a Flavor (Consumer Feedback)** | Allow users to flag an article as belonging to an unlisted Flavor — routes into curator's Taxonomy Studio as a suggestion. |

---

## 7. Engagement & Reactions

Architecturally, Hub-level reactions are configurable. The PWA must surface this correctly.

| # | Feature | Rationale |
|---|---------|-----------|
| E-01 | **Reaction Bar** | Display the Hub's configured reaction set (emoji + label) on each publication card and detail view. |
| E-02 | **Submit Reaction** | One-tap reaction submission; updates Engagement Feedback pipeline. Only the Hub's active subset is shown. |
| E-03 | **Qualitative Response / Comment** | If the Hub enables comment capture, provide a text input for brief qualitative feedback — distinct from personal Notes. |
| E-04 | **Reaction Counts Display** | Show aggregate reaction counts (anonymous totals, not individual identities — privacy-first). |
| E-05 | **Undo Reaction** | Allow users to remove or change a reaction within a short window. |

---

## 8. Notifications & Alerts

| # | Feature | Rationale |
|---|---------|-----------|
| A-01 | **Push Notifications (PWA)** | Web push for new Hub publications — on-device permission request with clear value proposition. |
| A-02 | **Notification Preferences** | Per-Hub, per-Flavor, and time-of-day controls. Users can mute certain Flavors while keeping others noisy. |
| A-03 | **Digest Mode** | Opt-in daily/weekly email or in-app digest rather than per-item push, for low-noise users. |
| A-04 | **"Saved Article Ready Offline" Alert** | Notify when a cached article finishes downloading and is available offline. |

---

## 9. Identity & Account

Aligned with architecture's Unified Consumer Identity (PWA <-> Messengers).

| # | Feature | Rationale |
|---|---------|-----------|
| I-01 | **Account Creation & Auth** | Supabase-backed email/OAuth sign-up. Required to persist notes, bookmarks, and history server-side. |
| I-02 | **Messenger Identity Linking** | UI to link a Telegram or WhatsApp handle to the PWA account via the Identity Linking Service (Hub Handshake). |
| I-03 | **Multi-Hub Subscription Management** | (Meta-Hub / Phase 12) Discover and subscribe to multiple Hubs from one account. |
| I-04 | **Profile & Display Name** | Basic profile settings; display name used in attributed qualitative responses if user opts in. |
| I-05 | **Anonymous Mode Toggle** | Allow users to read and react without linking a persistent identity; explicitly opt into tracking features. |
| I-06 | **Data Export (GDPR)** | Export all personal data: notes, highlights, bookmarks, history, reactions. |
| I-07 | **Account Deletion** | Full erasure request with confirmation flow. |

---

## 10. PWA Shell & Infrastructure

Non-negotiable for a quality installable experience.

| # | Feature | Rationale |
|---|---------|-----------|
| S-01 | **Installable PWA (Manifest + Service Worker)** | `manifest.json` + SW for Add-to-Home-Screen on iOS/Android/Desktop. |
| S-02 | **Dark Mode (Default) + Light Mode Toggle** | Architecture specifies dark-mode as default; respect system preference with manual override. |
| S-03 | **Feed Rhythm Layout System** | Render mixed-density card grids (Detailed + Visual) as defined by curator configuration. |
| S-04 | **Responsive / Mobile-First Design** | Primary surface is mobile; must degrade gracefully to tablet and desktop. |
| S-05 | **Hub Handshake / API Key Onboarding** | Secure pairing of PWA instance to a Hub's API key (from architecture §6, Implication 7). |
| S-06 | **Path-Agnostic / Dynamic `basePath`** | Deployable on any subdirectory or subdomain without hard-coded paths (architecture §6, Implication 6). |
| S-07 | **Loading Skeletons & Optimistic UI** | Prevent layout shift; show skeleton cards during data fetches. |
| S-08 | **Error States & Offline Fallback Page** | Graceful offline page with access to cached articles. |
| S-09 | **Accessibility (WCAG AA)** | Keyboard navigation, ARIA labels, sufficient contrast — especially important given dark-mode default. |

---

## 11. Article Reader (Phase 11)

Standalone distraction-free reading — referenced as "Mode D" in the architecture.

| # | Feature | Rationale |
|---|---------|-----------|
| R-01 | **Distraction-Free Reader Mode** | Strip navigation and ads; render article content in a clean typographic layout. |
| R-02 | **Font Size & Typography Controls** | User-adjustable font size and line spacing for comfortable reading. |
| R-03 | **Reader Theme (Sepia / High-Contrast)** | Alternative reader themes beyond standard dark/light for eye comfort. |
| R-04 | **Text-to-Speech Playback** | Listen to an article hands-free; play/pause/seek controls. |
| R-05 | **Embeddable Reader Widget** | Drop-in `<iframe>` or Web Component that any third-party site can embed (Mode D integrated). |
| R-06 | **Cross-Hub Save** | Save an article from any Hub into the user's unified library regardless of which Hub delivered it. |

---

## 12. Meta-Hub / Global Discovery (Phase 12)

Future-state central aggregation — "Mode E."

| # | Feature | Rationale |
|---|---------|-----------|
| M-01 | **Hub Discovery Catalogue** | Browse and search publicly listed Hubs by category, Flavor, or audience. |
| M-02 | **Hub Preview Feed** | Sample the most recent publications of a Hub before subscribing. |
| M-03 | **One-Click Hub Subscribe** | Add a Hub to the user's personal feed with a single authenticated action. |
| M-04 | **Cross-Hub Unified Feed** | Merged chronological or ranked feed across all subscribed Hubs. |
| M-05 | **Hub Recommendation Engine** | Surface Hubs aligned with the user's existing Taste Profile. |

---

*Last updated: 2026-04-19 · Ready for prioritisation*
