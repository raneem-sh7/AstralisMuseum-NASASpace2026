---
name: Progress-safe gameplay checks
description: How to verify fresh-start gameplay without leaving an existing player's save changed.
---

Preserve existing browser progress during regression checks. A fresh-start test must confirm the welcome screen has not created a save before the player begins.

**Why:** A welcome-screen autosave made the first-run flow appear to be a resumed adventure, so merely opening a new browser context was not enough to establish a fresh-start test.

**How to apply:** Prefer an isolated test session. If a test resets browser save state, snapshot the prior value and restore it in cleanup, including when the test fails. Verify the actual first-run button and selection flow rather than inferring them from a screenshot.
