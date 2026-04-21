# Understanding Xentara Taxonomy: Tags vs. Flavors

The Xentara Taxonomy system is a multi-stage intelligence pipeline designed to turn raw data into structured, actionable insights. Understanding the difference between **Raw Tags** and **Confirmed Flavors** is key to managing your Collective effectively.

---

## 1. Raw Tags (AI Discoveries)
When an article or video is ingested, the AI identifies significant keywords and concepts. These appear on the **Publication Card** in your stream.

*   **What they are:** Transient keywords extracted directly from the content.
*   **Purpose:** Instant visual context and searchability.
*   **Status:** "Unmanaged." They don't belong to your permanent hub taxonomy yet.

## 2. Hub Flavors (Lenses)
Flavors are the **Confirmed Lenses** of your Hub. They represent the permanent categories and topics your Collective cares about.

*   **AI Drafts (Suggestions):** When the AI finds a recurring or significant topic that doesn't match your existing flavors, it proposes it as an "AI Draft" in the **Taxonomy Studio**.
*   **Confirmed Flavors:** Once a curator approves a suggestion, it becomes an official Hub Flavor. These are high-precision categories used for advanced filtering and newsletter distribution.

---

## 3. The Taxonomy Studio: Management
The **Taxonomy Studio** is your command center for defining the "Taste" of your Hub.

### ✅ Acceptance (Confirmation)
Accepting an AI suggestion promotes it to a **Confirmed Flavor**. 
*   *Tip:* This instantly enables that flavor for "Suppression" in the publication modal for all matching articles.

### 🔀 Merging
If you have two similar flavors (e.g., `#AI` and `#ARTIFICIAL INTELLIGENCE`), you can **Merge** them.
*   **How it works:** Choose a source tag to merge into a target tag. All publications linked to the source will be moved to the target, and the source tag will be deleted.

### 🗑️ Deletion
Deleting a flavor removes it from your Hub's global taxonomy and unlinks it from all associated publications. 
*   *Warning:* This is permanent and affects your distribution filters.

---

## 4. Manual Refinement: Suppression
Within the **Republish Modal**, you can fine-tune exactly which flavors are associated with a specific piece of content before it goes live.

*   **The Suppression Toggle:** Even if an article is correctly identified as `#FINANCE`, a curator might decide it's not a good fit for that specific category in this context. 
*   **How to Suppress:** Click the Flavor chip in the modal to "Exclude" it. The tag will remain in the database for research but will be hidden from the public-facing Collective feed for that specific post.

---

## 5. Pro-Tip: Auto-Synchronization
If you approve a new Flavor in the Studio, Xentara will **automatically link** it to any existing articles on your board that contain that keyword the next time you open their "Refine & Publish" modal.
