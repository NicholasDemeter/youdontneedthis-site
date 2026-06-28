# YDNT SKILLS — INDEX
# Procedures for agents working on youdontneedthis.us
# ARCHITECTURE.md is the canonical source of truth. These skills are step-by-step
# procedures for specific tasks. If a skill ever disagrees with ARCHITECTURE.md,
# ARCHITECTURE.md wins and the skill is stale — flag it (see SELF-CORRECTION below).

---

## THE SOURCES OF TRUTH (current, post-revision)

```
products.csv   site repo root. 10 columns, in this exact order:
               LOT, OFFICIAL_NAME, COOLNESS_RATING, TAGLINE, DESCRIPTION,
               SPECIFICATIONS, PRICE, CATEGORY, PRICE ESTIMATE HYPERLINKS, SUBCATEGORY
               (There is NO FOLDER_NAME column. It was removed. Matching is by LOT only.)

inventory/     youdontneedthis-inventory repo. One folder per item:
               LOT_###_<name>/  with a *THUMBNAIL* file in the root,
               a Photos/ subfolder, and an optional Videos/ subfolder.

build.js       site repo. Reads the CSV, finds each item's folder by the LOT_### key
               ONLY (everything after LOT_###_ is ignored), writes dist/index.html.
```

Matching rule (the heart of everything): for a CSV row with LOT = LOT_###, build.js
uses the inventory folder whose name STARTS WITH `LOT_###_`. The rest of the folder
name is decoration — never matched. The LOT key must be capital LOT, three zero-padded
digits, then an underscore (LOT_012 not LOT_12; LOT not lot).

---

## WHICH SKILL FOR WHICH TASK

| Task | Skill |
|------|-------|
| Start of every session | SKILL-sync-check.md |
| Push an update to the live site | SKILL-push.md |
| Add a new item (raw photos → live) | SKILL-new-lot.md |
| Compress / rename / fix inventory files | SKILL-cleanup.md |
| Live site not behaving as expected | SKILL-verify-live.md |
| Verify docs still match the code (run periodically) | SKILL-self-audit.md |

You do NOT need to pre-load these. ARCHITECTURE.md carries the core sequences.
Open a skill only when a task needs its specific depth.

---

## SELF-CORRECTION RULE (applies to every skill)

If at any point the situation does not match what the skill or ARCHITECTURE.md describes —
a path that doesn't exist, a column that isn't where expected, a count that makes no sense,
an instruction whose logic conflicts with the user's request — STOP. Do not improvise a
workaround. Report the specific mismatch to Nicholas and ask for clarification.

When the clarification reveals that ARCHITECTURE.md or a skill is wrong, incomplete, or
out of date, you MUST propose the exact edit to that file and, with Nicholas's approval,
update the source of truth in the same session. The documents are meant to improve with
every correction. A mismatch you fix silently will resurface; a mismatch you document
disappears for good.

---

## REPO / BRANCH FACTS

```
Site repo:       ~/Documents/youdontneedthis-site         branch: main   push: git push origin main
Inventory repo:  ~/Documents/youdontneedthis-inventory    local master → GitHub main   push: git push origin master:main
Live site:       https://youdontneedthis.us               (GitHub Pages, ~2-3 min after a site push)
Image URLs are served from the inventory repo's branch set in build.js (INVENTORY_REPO_BASE).
This MUST be `main` — the inventory's local branch is `master` but it pushes to GitHub `main`,
so images live on `main`. If INVENTORY_REPO_BASE ends in `/master`, every image 404s.
If hand-testing a raw image URL, copy the branch from that constant — do not assume.
```

GitHub Actions deploys whatever dist/index.html is committed. It must NOT run build.js
(no inventory on GitHub's servers → whole-site placeholders). Build locally, always.
