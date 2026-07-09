# Content-first homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage as a left-anchored, monospace, three-section document (info, articles, links) in IBM Plex Mono with magenta accents, and give links their own archive page.

**Architecture:** Reuse the existing `blog` content collection, splitting entries by `type` (`article` vs `link`). A new `PostList.astro` renders a nested dated list for both the homepage sections and drives the new `/links` archive; `Card.astro` stays for the archive pages. Typography and accent are theme-level changes (Astro Fonts API + CSS custom properties).

**Tech Stack:** Astro 7.0.6, TypeScript, Tailwind CSS v4, dayjs, Astro Fonts API (`fontProviders.google()`), pnpm.

## Global Constraints

- Package manager is **pnpm**. Never invoke npm/yarn.
- Astro **7.0.6**: `fonts` is a stable top-level config key; the `<Font>` component is imported from `astro:assets`.
- Fonts must be **self-hosted via the Astro Fonts API** (no runtime request to Google Fonts).
- Accent colors, exact values: **light `#c81e77`**, **dark `#ff5cae`**. These fully replace the old accents (light `#006cac`, dark `#ff6b01`). No other theme variables change.
- IBM Plex Mono weights: **400, 500, 600, 700**.
- Homepage column is **left-anchored** (not centered) with a contained responsive left margin and a `max-w-app` cap.
- The **articles** section is **hidden entirely** while there are zero `type: article` entries.
- Dates render as **`YYYY-MM-DD`** on homepage rows, formatted in `SITE.timezone` (or the entry's `timezone`).
- No test runner exists in this repo and none is added. Verification per task is: `pnpm astro check`, `pnpm lint`, `pnpm format:check`, and manual visual checks on `pnpm dev`.
- Documentation/markdown copy must not use dashes (`-`/`—`) as punctuation.

---

### Task 1: Register and apply IBM Plex Mono

**Files:**
- Modify: `astro.config.ts`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: a CSS variable `--font-ibm-plex-mono` (set by the Fonts API) and Tailwind's `--font-mono` token remapped to it, so every existing `font-mono` usage renders IBM Plex Mono.

- [ ] **Step 1: Add the font to `astro.config.ts`**

Change the import on line 1 to include `fontProviders`:

```ts
import { defineConfig, envField, fontProviders } from "astro/config";
```

Add a `fonts` array inside `defineConfig({ ... })` (e.g. right after `site: SITE.website,`):

```ts
  fonts: [
    {
      provider: fontProviders.google(),
      name: "IBM Plex Mono",
      cssVariable: "--font-ibm-plex-mono",
      weights: [400, 500, 600, 700],
      fallbacks: ["ui-monospace", "SFMono-Regular", "monospace"],
    },
  ],
```

- [ ] **Step 2: Emit the font in `src/layouts/Layout.astro`**

Add to the frontmatter imports (after line 4, `import { SITE } from "@/config";`):

```ts
import { Font } from "astro:assets";
```

In `<head>`, immediately before `<ClientRouter />` (line 131), add:

```astro
    <!-- Self-hosted IBM Plex Mono via Astro Fonts API -->
    <Font cssVariable="--font-ibm-plex-mono" preload />
```

- [ ] **Step 3: Point Tailwind's mono token at the font in `src/styles/global.css`**

In the `@theme inline { ... }` block (lines 23-29), add one line so every `font-mono` utility uses the new family:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --font-mono: var(--font-ibm-plex-mono), ui-monospace, SFMono-Regular, monospace;
}
```

(The `body` rule already applies `font-mono`, so no change is needed there.)

- [ ] **Step 4: Verify type check and build wiring**

Run: `pnpm astro check`
Expected: completes with 0 errors.

Run: `pnpm dev`, open `http://localhost:4321/`. In DevTools, inspect `<body>` computed style.
Expected: `font-family` resolves to `"IBM Plex Mono"`; a `<link rel="preload" as="font">` is present in `<head>`; no request goes to `fonts.googleapis.com` at runtime (fonts are served from the local `/_astro/` path).

- [ ] **Step 5: Commit**

```bash
git add astro.config.ts src/layouts/Layout.astro src/styles/global.css
git commit -m "feat: self-host IBM Plex Mono via Astro Fonts API"
```

---

### Task 2: Switch accent to magenta

**Files:**
- Modify: `src/styles/global.css:8` (light `--accent`), `src/styles/global.css:18` (dark `--accent`)

**Interfaces:**
- Consumes: nothing.
- Produces: updated `--accent` values inherited by every `text-accent`/`--color-accent` usage.

- [ ] **Step 1: Update the light accent**

In the `:root, html[data-theme="light"]` block, change:

```css
  --accent: #006cac;
```
to:
```css
  --accent: #c81e77;
```

- [ ] **Step 2: Update the dark accent**

In the `html[data-theme="dark"]` block, change:

```css
  --accent: #ff6b01;
```
to:
```css
  --accent: #ff5cae;
```

- [ ] **Step 3: Verify visually in both themes**

Run: `pnpm dev`, open `http://localhost:4321/`.
Expected: links and accented UI are raspberry magenta in light mode; toggle the theme and confirm hot magenta in dark mode. Text on links remains clearly readable (AA).

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: switch accent color to magenta (light #c81e77, dark #ff5cae)"
```

---

### Task 3: Create the `PostList` component

**Files:**
- Create: `src/components/PostList.astro`

**Interfaces:**
- Consumes: `getPath(id, filePath)` from `@/utils/getPath`; `SITE.timezone` from `@/config`; `IconExternalLink` from `@/assets/icons/IconExternalLink.svg`.
- Produces: `PostList` component with `Props { posts: CollectionEntry<"blog">[] }`. Renders a `<ul>` where each `<li>` is a `◦ date title` row. `type: link` entries link to `data.resourceUrl` in a new tab with an external-link icon; other entries link internally via `getPath`.

- [ ] **Step 1: Write the component**

Create `src/components/PostList.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getPath } from "@/utils/getPath";
import { SITE } from "@/config";
import IconExternalLink from "@/assets/icons/IconExternalLink.svg";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface Props {
  posts: CollectionEntry<"blog">[];
}

const { posts } = Astro.props;

const formatDate = (date: Date, tz?: string) =>
  dayjs(date)
    .tz(tz || SITE.timezone)
    .format("YYYY-MM-DD");
---

<ul class="my-2 space-y-1">
  {
    posts.map(({ data, id, filePath }) => {
      const isLink = data.type === "link";
      const href =
        isLink && data.resourceUrl ? data.resourceUrl : getPath(id, filePath);
      const isExternal = isLink && Boolean(data.resourceUrl);
      return (
        <li class="flex items-baseline gap-3">
          <span class="select-none opacity-60" aria-hidden="true">
            &#9702;
          </span>
          <time
            datetime={data.pubDatetime.toISOString()}
            class="shrink-0 tabular-nums opacity-70"
          >
            {formatDate(data.pubDatetime, data.timezone)}
          </time>
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            class="text-accent decoration-dashed underline-offset-4 hover:underline"
          >
            {data.title}
            {isExternal && (
              <IconExternalLink class="inline-block size-4 align-text-top" />
            )}
          </a>
        </li>
      );
    })
  }
</ul>
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm astro check`
Expected: 0 errors. (The component is not yet imported anywhere; it is exercised in Task 4.)

- [ ] **Step 3: Commit**

```bash
git add src/components/PostList.astro
git commit -m "feat: add PostList component for dated nested lists"
```

---

### Task 4: Rebuild the homepage into three sections

**Files:**
- Modify: `src/pages/index.astro` (full rewrite of the template)

**Interfaces:**
- Consumes: `PostList` (Task 3); `getSortedPosts` from `@/utils/getSortedPosts`; `SITE` from `@/config`; `SOCIALS` from `@/constants`.
- Produces: the homepage. No exports consumed by later tasks.

- [ ] **Step 1: Rewrite `src/pages/index.astro`**

Replace the entire file with:

```astro
---
import { getCollection } from "astro:content";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import PostList from "@/components/PostList.astro";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";
import { SOCIALS } from "@/constants";

const posts = await getCollection("blog");
const sortedPosts = getSortedPosts(posts);

const articles = sortedPosts.filter(({ data }) => data.type === "article");
const links = sortedPosts.filter(({ data }) => data.type === "link");

const github = SOCIALS.find(s => s.name === "GitHub")?.href;
const linkedin = SOCIALS.find(s => s.name === "LinkedIn")?.href;
const email = SOCIALS.find(s => s.name === "Mail")?.href;

const infoLinks = [
  { label: "about", href: "/about/", external: false },
  { label: "github", href: github, external: true },
  { label: "linkedin", href: linkedin, external: true },
  { label: "email", href: email, external: false },
].filter(l => Boolean(l.href));
---

<Layout>
  <Header />
  <main
    id="main-content"
    data-layout="index"
    class="mx-4 mb-12 w-full max-w-app sm:ml-8 lg:ml-16"
  >
    <h1 class="mt-8 mb-8 px-4 text-3xl font-bold tracking-tight sm:text-4xl">
      {SITE.author}
    </h1>

    <section id="info" class="mb-10">
      <h2 class="mb-2 text-lg font-semibold">
        <span class="select-none opacity-60" aria-hidden="true"
          >&bull;</span
        > info
      </h2>
      <p class="max-w-prose leading-relaxed">
        Senior full-stack developer with a strong focus on backend architecture
        and modern JavaScript frameworks. I build scalable applications, design
        robust APIs, and orchestrate DevOps workflows with Docker and AWS,
        turning ideas into reliable, user-focused products. Currently serving as
        Senior Developer at <a
          href="https://lifetronic.it"
          title="Lifetronic Srl website"
          class="text-accent decoration-dashed underline-offset-4 hover:underline"
          >Lifetronic Srl</a
        >, Pisa, Italy.
      </p>
      <ul class="my-3 space-y-1">
        {
          infoLinks.map(link => (
            <li class="flex items-baseline gap-3">
              <span
                class="select-none opacity-60"
                aria-hidden="true"
              >
                &#9702;
              </span>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                class="text-accent decoration-dashed underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))
        }
      </ul>
    </section>

    {
      articles.length > 0 && (
        <section id="articles" class="mb-10">
          <h2 class="mb-2 text-lg font-semibold">
            <span class="select-none opacity-60" aria-hidden="true">
              &bull;
            </span>{" "}
            articles
          </h2>
          <PostList posts={articles.slice(0, SITE.postPerIndex)} />
          <a
            href="/posts/"
            class="text-accent mt-2 inline-block decoration-dashed underline-offset-4 hover:underline"
          >
            see all articles &rarr;
          </a>
        </section>
      )
    }

    {
      links.length > 0 && (
        <section id="links" class="mb-10">
          <h2 class="mb-2 text-lg font-semibold">
            <span class="select-none opacity-60" aria-hidden="true">
              &bull;
            </span>{" "}
            links
          </h2>
          <PostList posts={links.slice(0, SITE.postPerIndex)} />
          <a
            href="/links/"
            class="text-accent mt-2 inline-block decoration-dashed underline-offset-4 hover:underline"
          >
            see all links &rarr;
          </a>
        </section>
      )
    }

    <section id="rss" class="mb-6">
      <h2 class="text-lg font-semibold">
        <span class="select-none opacity-60" aria-hidden="true"
          >&bull;</span
        >{" "}
        <a
          href="/rss.xml"
          class="text-accent decoration-dashed underline-offset-4 hover:underline"
          >rss</a
        >
      </h2>
    </section>
  </main>
  <Footer />
</Layout>

<script>
  document.addEventListener("astro:page-load", () => {
    const indexLayout = (document.querySelector("#main-content") as HTMLElement)
      ?.dataset?.layout;
    if (indexLayout) {
      sessionStorage.setItem("backUrl", "/");
    }
  });
</script>
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: 0 errors.

- [ ] **Step 3: Verify visually**

Run: `pnpm dev`, open `http://localhost:4321/`.
Expected:
- Column is anchored to the left with a modest left margin (not centered), capped at `max-w-app`.
- Sections appear in order: name (H1) → `• info` (bio paragraph + `◦ about/github/linkedin/email`) → `• links` (dated rows, external arrow, `see all links →`) → `• rss`.
- The `• articles` section is **absent** (there are no articles yet).
- Link rows open the external `resourceUrl` in a new tab; dates read `YYYY-MM-DD`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: restructure homepage into info/articles/links sections"
```

---

### Task 5: Scope `/posts` to articles only

**Files:**
- Modify: `src/pages/posts/[...page].astro:14` (collection filter) and `:24-25` (page copy)

**Interfaces:**
- Consumes: existing `getSortedPosts`, `Card`, `Main`, `Pagination`.
- Produces: `/posts` listing only `type: article` entries.

- [ ] **Step 1: Filter the collection to articles**

Change line 14 from:

```ts
    const posts = await getCollection("blog", ({ data }) => !data.draft);
```
to:

```ts
    const posts = await getCollection(
      "blog",
      ({ data }) => !data.draft && data.type === "article"
    );
```

- [ ] **Step 2: Update the page copy**

Change the `Main` props (lines 24-25) from:

```astro
    pageTitle="Posts"
    pageDesc="All the articles and links I've shared."
```
to:

```astro
    pageTitle="Articles"
    pageDesc="Articles I've written."
```

- [ ] **Step 3: Type-check and build**

Run: `pnpm astro check`
Expected: 0 errors.

Run: `pnpm dev`, open `http://localhost:4321/posts/`.
Expected: the page renders (empty list is acceptable while there are no articles) with the "Articles" heading and no `type: link` entries.

- [ ] **Step 4: Commit**

```bash
git add "src/pages/posts/[...page].astro"
git commit -m "feat: scope /posts to articles only"
```

---

### Task 6: Add the `/links` archive page

**Files:**
- Create: `src/pages/links/[...page].astro`

**Interfaces:**
- Consumes: `getSortedPosts`, `Card`, `Main`, `Pagination`, `Layout`, `Header`, `Footer`, `SITE`.
- Produces: paginated `/links` archive of `type: link` entries. This is the `see all links →` target from the homepage.

- [ ] **Step 1: Create the page**

Create `src/pages/links/[...page].astro` (mirrors the posts page, filtered to links):

```astro
---
import type { GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import Main from "@/layouts/Main.astro";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import Card from "@/components/Card.astro";
import Pagination from "@/components/Pagination.astro";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

export const getStaticPaths = (async ({ paginate }) => {
  const links = await getCollection(
    "blog",
    ({ data }) => !data.draft && data.type === "link"
  );
  return paginate(getSortedPosts(links), { pageSize: SITE.postPerPage });
}) satisfies GetStaticPaths;

const { page } = Astro.props;
---

<Layout title={`Links | ${SITE.title}`}>
  <Header />
  <Main pageTitle="Links" pageDesc="Interesting things I've found around the web.">
    <ul>
      {page.data.map(data => <Card {...data} />)}
    </ul>
  </Main>

  <Pagination {page} />

  <Footer noMarginTop={page.lastPage > 1} />
</Layout>
```

- [ ] **Step 2: Type-check and verify**

Run: `pnpm astro check`
Expected: 0 errors.

Run: `pnpm dev`, open `http://localhost:4321/links/`.
Expected: paginated list of all external links (currently 7) with the "Links" heading; pagination controls appear if more than `SITE.postPerPage` (4) exist. The homepage `see all links →` navigates here.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/links/[...page].astro"
git commit -m "feat: add /links archive page"
```

---

### Task 7: Full-pipeline verification

**Files:** none (verification only).

- [ ] **Step 1: Lint and format**

Run: `pnpm lint`
Expected: no errors.

Run: `pnpm format:check`
Expected: all files formatted. If it reports issues, run `pnpm format`, then re-commit with message `style: apply prettier formatting`.

- [ ] **Step 2: Production build (includes type check + Pagefind)**

Run: `pnpm build`
Expected: `astro check` passes, `astro build` completes, Pagefind indexes `dist`, and the index is copied to `public/`. No errors.

- [ ] **Step 3: Preview smoke test**

Run: `pnpm preview`, open the served URL.
Expected: homepage shows info + links sections (articles hidden), magenta accents in both themes, IBM Plex Mono throughout; `/posts` (articles only) and `/links` (links only) resolve.

- [ ] **Step 4: Final commit if formatting changed anything**

```bash
git add -A
git commit -m "style: apply prettier formatting" || echo "nothing to commit"
```
