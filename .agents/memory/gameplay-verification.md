---
name: Progress-safe gameplay checks
description: How to verify fresh-start gameplay without leaving an existing player's save changed.
---

Preserve existing browser progress during regression checks. A fresh-start test must confirm the welcome screen has not created a save before the player begins.

**Why:** A welcome-screen autosave made the first-run flow appear to be a resumed adventure, so merely opening a new browser context was not enough to establish a fresh-start test.

**How to apply:** Prefer an isolated test session. If a test resets browser save state, snapshot the prior value and restore it in cleanup, including when the test fails. Verify the actual first-run button and selection flow rather than inferring them from a screenshot.

When replacing an exhibit in an existing museum slot, preserve the player's earned passport progress unless they explicitly ask to reset it.

**Why:** The Moon exhibit content changed while the user required the passport and progression to remain intact.

**How to apply:** Migrate legacy exhibit identifiers to their replacement slot; verify that unrelated planet stamps and player settings remain unchanged.

For key-driven Phaser gameplay tests, wait until scene asset preloading and scene creation have completed before sending movement or interaction keys.

**Why:** The React game screen can appear before Phaser has registered its keyboard handlers; an early key press can be dropped and send a test toward the wrong display.

**How to apply:** Use a scene-ready signal or a checked readiness condition before simulating input; don't infer Phaser readiness from the React header or canvas element alone.

When integrating a Phaser scene with React, signal readiness from the scene's `create()` lifecycle after its systems and input handlers are available. Don't read `scene.events` before Phaser has booted the scene.

**Why:** A pre-boot readiness listener can access an undefined event emitter and crash the React canvas mount.

**How to apply:** Pass a readiness callback into scene configuration, invoke it at the end of `create()`, and have interactive tests wait for that signal before sending keys.
