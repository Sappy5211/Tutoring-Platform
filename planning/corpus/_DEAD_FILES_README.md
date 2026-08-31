# Quarantined scrapes — DO NOT TREAT AS EVIDENCE

Files in `_dead/` are 404 pages, server errors, or cookie-banner-only stubs that were saved as if they
were content. They are kept only so nobody re-scrapes them expecting something different.

Cause: the coordinator guessed `help.remnote.com` article slugs rather than discovering real URLs with
`firecrawl map` first. All ten `remnote-docs-*` files are "Uh oh. That page doesn't exist."
`toppr.md` was a transient 502. `novel-site.md` is a client-side JS error page.
`mathacademy-system.md` is "Cannot GET /learning-system" (wrong path).

**Lesson: map a domain before scraping paths on it. A 404 saved to a .md file looks exactly like
content to an agent reading a directory listing.**

For RemNote UI facts use `remnote-ui-screenshots.md` (primary, operator-supplied) and `remnote.md`.
