# SKILL-self-audit.md
# YDNT — Documentation Integrity Audit (doc-vs-code)
# Purpose: catch documentation rot BEFORE it breaks a push. Run periodically and
# after any change to build.js, the CSV structure, or the repo layout.
# This skill changes NOTHING. It only reads and reports.

## WHY THIS EXISTS
Telling an agent "read ARCHITECTURE.md" is necessary but not sufficient — a doc can be
confidently WRONG, and an agent will follow a wrong doc just as faithfully as a right one.
This audit forces every key claim in the docs to be checked against what build.js actually
does. If a doc and the code disagree, that mismatch is surfaced here instead of discovered
mid-task when something silently fails. (Two real bugs this session — the master/main image
branch and stale "known placeholder" claims — were exactly this kind of doc-vs-code drift.)

## SELF-CORRECTION RULE
For any MISMATCH found, propose the exact edit to bring the DOC in line with the CODE
(the code is the source of truth for behavior; the docs must describe it accurately).
Show the proposed edit to Nicholas. Do not edit silently. Do not push anything.

---

## HOW TO RUN
Paste the prompt block below into a fresh agent, OR work through the checks manually.
The agent must READ THE ACTUAL CODE for each item — not answer from the docs or from
memory. For each check it reports three lines:

```
DOC SAYS:  <what ARCHITECTURE.md / the relevant skill claims>
CODE DOES: <what build.js / the repo actually does, with the line quoted>
RESULT:    MATCH   (or)   MISMATCH -> proposed fix: <exact edit>
```

---

## THE AUDIT PROMPT (paste into a fresh agent)

```
SELF-AUDIT MODE — change no files, push nothing. Read ARCHITECTURE.md and every
file in skills/, then verify each claim below by reading the ACTUAL code in build.js
and the repo. For each, report DOC SAYS / CODE DOES / RESULT (MATCH or MISMATCH).
For any MISMATCH, propose the exact doc edit. Then STOP and show me the report.

1  IMAGE BRANCH: What branch does INVENTORY_REPO_BASE point to in build.js?
   What branch is the inventory actually served from on GitHub (local master pushed
   to main)? Confirm INVENTORY_REPO_BASE ends in /main, not /master.

2  MATCH KEY: Which CSV column does build.js use to find an item's folder? Find the
   match function and confirm it matches on the LOT_### prefix only, ignoring the rest
   of the folder name and ignoring any FOLDER_NAME column.

3  LOT FORMAT: What exact format must the LOT key be? Confirm the code's prefix check
   (capital LOT, three padded digits, trailing underscore).

4  THUMBNAIL SOURCE: Where does the code look for the thumbnail? Quote the line that
   searches for a file containing THUMBNAIL in the folder root.

5  PHOTOS: Where does the code read gallery photos from? Quote the Photos/ logic.

6  VIDEOS: Does build.js read a Videos/ subfolder and include videos in the gallery?
   Quote the line. (If the doc claims video support, the code must actually do it.)

7  CARD vs LOT PAGE: When a folder has photos but no thumbnail, what does the card show
   and what does the LOT page show first? Trace both in the code.

8  NO MATCH: What does the code return when no folder matches a LOT? Quote the line.
   Confirm it is the placeholder (grey card), per the documented behavior.

9  DEPLOY: Read .github/workflows/. Does the deploy workflow run build.js, or only serve
   the committed dist/index.html? The docs say it must NOT run build.js — confirm.

10 CSV COLUMNS: List the columns build.js reads (search p.COLUMN and p['...']). Confirm
   every one exists in products.csv's header and that there is NO FOLDER_NAME dependency.

11 GOOGLE SHEET: Does SKILL-new-lot.md explain how the agent updates the master data?
   Confirm it says to GENERATE A GOOGLE APPS SCRIPT (agent has no Sheet access) and stop,
   not to edit the Sheet or the local CSV directly.

12 PUSH GATE: Do the skills and ARCHITECTURE.md require explicit Nicholas approval in the
   current session before any git push? Confirm the rule is present and unambiguous.

Report all 12, then STOP.
```

---

## INTERPRETING THE REPORT (for Nicholas)
- All 12 MATCH  -> the docs accurately describe the code. Safe to hand work to an agent.
- Any MISMATCH  -> the doc is drifting from reality. Apply the proposed fix to the doc
  (or, if the CODE is what's wrong, fix the code) BEFORE running any real task. A mismatch
  left unfixed is a future silent failure.

## WHEN TO RUN
- After ANY edit to build.js, products.csv structure, or repo layout
- Before a session where you'll add/rebuild/push significant changes
- On a routine cadence (e.g. monthly) even if nothing changed, to catch drift
- Any time an agent's behavior surprises you — audit first, then resume
