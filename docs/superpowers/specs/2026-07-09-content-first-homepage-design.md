# Content-first homepage redesign

Date: 2026-07-09
Status: Approved design, pending implementation plan

## Goal

Restructure the homepage to put content at the center, with three distinct
sections: personal info, blog articles, and curated external links. The visual
direction follows the minimalist, document-like `no-style-please` Hugo theme
(nested bullet lists, monospace, dates before titles), refined rather than raw.
Typography switches to IBM Plex Mono.

## Design decisions (all confirmed with the user)

- **Layout**: vertical stack, single content column anchored to the left
  (not centered), with a contained left margin and a `max-width` on the column
  so it does not float lost in empty space on wide screens.
- **Refinement level**: "minimal rifinito". Keep the existing header, footer and
  theme toggle. Keep nested bullet lists (`•` top level, `◦` nested) and the
  monospace document feel, but with curated spacing, clean hover states, and
  dates aligned with `tabular-nums`.
- **Font**: IBM Plex Mono everywhere (weights 400/500/600/700), self-hosted via
  the native Astro Fonts API (Astro 7). No external requests to Google Fonts.
  Replaces the current system `font-mono` stack.
- **Accent colors**: only the accent variables change.
  - Light: `#c81e77` (raspberry magenta, ~6:1 contrast on `#fdfdfd`, AA).
  - Dark: `#ff5cae` (hot magenta, AA on `#212737`).
  - All other theme variables stay as they are. The current light blue
    `#006cac` and dark orange `#ff6b01` accents are removed.
- **Dates in home**: shown on each article/link row (matches the reference).
- **Empty articles section**: hidden entirely while there are no `type: article`
  entries. It appears automatically once the first article is published.
- **Archive pages**: add a dedicated `/links` page for external links; `/posts`
  is scoped to articles only. Each home section links to its own coherent
  archive.

## Current state (relevant facts)

- Theme: AstroPaper on Astro 7.0.6, Tailwind v4. Global font is the system
  `font-mono`.
- Content lives in a single `blog` collection (`src/content.config.ts`) with a
  `type` field: `article` (default) or `link`. Link entries carry
  `resourceUrl`, `authorWebsite`, `author`.
- **All 7 current content files are `type: link`.** There are zero articles.
  So the articles section starts hidden.
- Homepage (`src/pages/index.astro`) currently renders hero + "Featured" +
  "Recent posts", mixing articles and links via `Card.astro`.
- `/posts` (`src/pages/posts/[...page].astro`) paginates all non-draft entries
  (mixed). `/archives` exists. No links-only page exists.
- `getSortedPosts` sorts by `modDatetime ?? pubDatetime` desc, after
  `postFilter` (drops drafts and future-scheduled posts).
- Personal links available from `SOCIALS` (`src/constants.ts`): GitHub, LinkedIn,
  Mail, RSS. `about` page exists at `/about`.

## Homepage structure (top to bottom)

1. **Name** — `H1`, large, bold (`Emanuele Guicciardi`).
2. **• info** — full bio paragraph (the current "Senior full-stack developer…"
   text, including the Lifetronic link), followed by nested `◦` links:
   `about`, `github`, `linkedin`, `email`. Sourced from `SOCIALS` + `/about`.
3. **• articles** — nested `◦` list of `type: article` entries, format
   `date + title` linking to the post detail page. Limited to `SITE.postPerIndex`
   items, then `see all articles →` linking to `/posts/`.
   **Hidden entirely when there are no articles.**
4. **• links** — nested `◦` list of `type: link` entries, format
   `date + title`, the title opening `resourceUrl` in a new tab (external arrow
   `↗`). Limited to `SITE.postPerIndex` items, then `see all links →` linking to
   `/links/`.
5. **• rss** — link to the feed.

## Components and files

### New

- `src/components/PostList.astro` — a reusable nested dated list. Given a list of
  `blog` entries and a mode (`article` | `link`), it renders `◦ date title`
  rows: articles link to the internal post path (`getPath`), links open
  `resourceUrl` externally with the `↗` marker. Replaces `Card.astro` usage on
  the homepage. `Card.astro` stays for other pages unless later consolidated.
- `src/pages/links/[...page].astro` — paginated archive of `type: link` entries
  only, mirroring the structure of the posts page (uses `Main`, `Pagination`).

### Modified

- `src/pages/index.astro` — rewritten around the three sections. Splits sorted
  posts by `type` (`article` vs `link`), conditionally renders the articles
  section, and renders each list via `PostList.astro`.
- `src/pages/posts/[...page].astro` — scope `getCollection` to
  `type === "article"` so `/posts` shows articles only.
- `src/styles/global.css` — set `--accent` to `#c81e77` (light) and `#ff5cae`
  (dark); apply the IBM Plex Mono family to the base `font-mono` usage.
- `astro.config.ts` — register IBM Plex Mono through the Astro Fonts API
  (`experimental.fonts` / `fonts`), self-hosted, with the weights above and a
  monospace fallback.
- `src/config.ts` — no structural change expected; `postPerIndex` (currently 4)
  governs how many rows each home section shows.

## Data flow

`getCollection("blog")` → `getSortedPosts` (filter drafts/scheduled, sort by
date desc) → partition by `type`:

- articles → `index.astro` articles section (sliced to `postPerIndex`) and
  `/posts` archive.
- links → `index.astro` links section (sliced to `postPerIndex`) and `/links`
  archive.

No schema changes: the existing `type`, `resourceUrl`, `authorWebsite`, `author`
fields already support the split.

## Out of scope

- No changes to the content schema or existing markdown files.
- No changes to search (Pagefind), OG image generation, or RSS feed contents
  beyond the accent/font restyle inheriting naturally.
- No consolidation/removal of `Card.astro` or `/archives`.
- Light accent stays blue-free; no additional palette tokens introduced.

## Success criteria

- Homepage shows the three sections (info, articles, links) in a left-anchored
  monospace column using IBM Plex Mono, with the articles section hidden while
  no articles exist.
- Accent is raspberry magenta in light and hot magenta in dark, everywhere the
  old accent was used, with no contrast regressions (AA).
- `/posts` lists only articles; `/links` lists only external links; home
  "see all" links point to the correct archive.
- `pnpm build` (astro check + build + pagefind) passes; `pnpm lint` and
  `pnpm format:check` pass.
