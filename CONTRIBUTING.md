# Contributing

Thanks for wanting to help. This is a small project with one maintainer, so
the process is short.

## The flow

**Fork → branch → pull request → review.**

Nobody pushes to `main` directly, including the maintainer. Every change
arrives as a pull request and is reviewed before it lands.

1. Fork the repository to your own account.
2. Branch off `main`. Name it after what it does: `feat/kids-map-legend`,
   `fix/portal-year-hint`.
3. Make the change, and make sure it builds (see below).
4. Open a pull request against `main`.
5. Wait for review. `@Surmi64` is the code owner and is requested
   automatically; the PR needs their approval to merge.

Small, focused pull requests get reviewed quickly. A branch that changes the
content, the theme and the build config at once will sit there a while — split
it up.

If you are planning something larger than a fix, open an issue first. It is
better to find out before you write it that the answer is no.

## Before you open the PR

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # must succeed — this is what gets deployed
```

`npm run build` is the check that matters. The content plugin validates
`content/*.json` at build time and fails loudly on a missing language block or
an empty answer, so a green build means the content is at least structurally
sound.

If you touched anything a visitor sees, look at it on a phone-sized viewport.
The whole game is played standing outdoors on a phone, and a layout that only
works at 1400px wide is a bug.

Check both tracks. `#/track` switches between kids and adults, and they are
different themes, not a light/dark toggle of one — something can look right in
one and be unreadable in the other.

## Commits

Conventional prefixes, written in English:

```
feat:     new behaviour a visitor could notice
fix:      something was broken and now is not
refactor: same behaviour, different shape
docs:     documentation only
chore:    build, tooling, dependencies
```

The subject line says what changed. The body says **why**, and what you tried
that did not work — that is the part nobody can reconstruct later from the
diff. If you had to measure something to get it right, put the measurement in
the message.

Do not add AI assistant attribution trailers to commits or pull requests.

## Content changes

The riddles and the interface strings live in `content/`, and editing them
needs no JavaScript. `README.md` documents every field.

Three things to know before you change a station:

- **All three languages, or none.** Hungarian, English and Polish are equal
  here; a station with an empty `pl` block fails the build.
- **Both tracks are written separately.** The kids track is not a simplified
  copy of the adults one. If you only have text for one, say so in the PR
  rather than machine-translating the other.
- **The answer must not appear in its own `story` or `question`.** That turns
  the riddle into reading comprehension. It is easy to do by accident,
  especially in a translation.

If a change depends on something physically at the cellar row — a carved year,
a count, a sign — say in the PR whether you have actually been there and seen
it. Stations carry a `_verify` note for exactly this reason.

## Test mode

`npm run build:test` produces a build with the walkthrough shortcuts enabled
(see README). It is for local testing only.

Never deploy a test build, and never turn the `__CHEAT__` compile-time constant
into a runtime flag. It is compiled out of the release precisely so the code
word cannot reach visitors. A test build shows a red `TEST` marker in the
corner so it cannot be mistaken for the real thing.

## Style

There is no linter and no formatter config. Match the file you are editing:
its indentation, its naming, its comment density.

Comments explain why, not what. The code already says what it does.

No new dependencies without discussing it first. The whole point of this
project is that it is a few hundred KB of plain ES modules and CSS with no
framework, and it stays that way.

## What this project will not take

- analytics, tracking, or anything that sends visitor data anywhere
- a sign-up, an account, or a login
- a backend

The game collects nothing and talks to no server. That is a promise made to
visitors on the intro screen, not an implementation detail.
