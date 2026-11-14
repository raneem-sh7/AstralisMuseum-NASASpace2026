---
name: Approved astronaut art direction
description: User-approved playable astronaut concepts and transparency verification
---

The user approved both photo-inspired idle character concepts: Christina Koch with brown hair and Victor Glover with dark skin and short hair, in matching white suits and a consistent cartoon style.

**Why:** The user explicitly approved both concepts before authorizing the walking sprite sheets. Keep their recognizable identities rather than reverting to generic color-based astronauts.

**How to apply:** Preserve these identities and the matching visual style when refining animation or adding poses. NASA portraits are profile photography; playable artwork is a separate AI-generated interpretation.

Check actual alpha channels on newly generated sprite sheets, not the visible checkerboard alone.

**Why:** Image editing produced an opaque painted checkerboard even though the prompt requested transparency; the approved idle images already had real alpha.

**How to apply:** Inspect the output channels and composite on a dark background before integration. If extracting a pale background around white suits, remove boundary-connected background rather than globally deleting white pixels.
