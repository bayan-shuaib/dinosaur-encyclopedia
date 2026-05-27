---
name: Audio detection pattern
description: How NarrationPlayer detects audio file availability without hardcoded lists.
---

## Pattern
`fetch('/audio/{speciesId}/{mode}.mp3', { method: 'HEAD' })` — if `res.ok`, audio is available.

## File conventions
- Audio: `public/audio/{speciesId}/life.mp3` and `public/audio/{speciesId}/scientific.mp3`
- Transcript (optional): `public/audio/{speciesId}/life.json` and `public/audio/{speciesId}/scientific.json`
- Transcript entry shape: `{ sectionId, sectionTitle, text, start, end }` (seconds)

## States
- `checking` — brief skeleton shown during HEAD request
- `available` — full HTML5 `<audio>` player with custom controls
- `unavailable` — premium animated placeholder ("narration in production")

**Why:** Adding audio files to `public/audio/` must require zero code changes. HEAD-based detection enables this automatically.
**How to apply:** Never hardcode species IDs that have audio; the detection is fully automatic.
