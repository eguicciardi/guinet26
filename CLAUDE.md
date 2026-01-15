# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal developer portfolio and blog built with **Astro 5** and **TypeScript**. Features blog articles, curated external links, dynamic OG image generation, and full-text search via Pagefind.

## Commands

```bash
pnpm dev              # Start development server with hot reload
pnpm build            # Production build (type check + astro build + pagefind index)
pnpm preview          # Preview production build locally
pnpm lint             # Run ESLint
pnpm format           # Apply Prettier formatting
pnpm format:check     # Check formatting without changes
pnpm sync             # Regenerate Astro type definitions
```

## Architecture

### Content System

Uses Astro Content Collections with a unified `blog` collection supporting two types:

- **Articles** (`type: article`): Blog posts in `src/data/blog/*.md`
- **Links** (`type: link`): Curated external links in `src/data/blog/links/*.md`

Content schema defined in `src/content.config.ts` with Zod validation.

### Key Directories

- `src/pages/` - File-based routing (creates HTML pages)
- `src/layouts/` - Page templates (Layout, PostDetails, AboutLayout)
- `src/components/` - Reusable Astro components
- `src/data/blog/` - Markdown content (articles and links subdirectory)
- `src/utils/` - TypeScript utilities (sorting, filtering, OG generation)
- `src/styles/` - Global CSS and Tailwind configuration

### Configuration

- `src/config.ts` - Site metadata, feature toggles, pagination settings
- `src/constants.ts` - Social links and share buttons
- `astro.config.ts` - Astro integrations, markdown plugins, Shiki themes

### Post Filtering

- `postFilter()` in `src/utils/postFilter.ts` excludes drafts and scheduled posts
- `getSortedPosts()` in `src/utils/getSortedPosts.ts` sorts by modification date
- Scheduled posts have 15-minute margin (`SITE.scheduledPostMargin`)

### Styling

Tailwind CSS v4 with custom theme variables (CSS custom properties) in `src/styles/global.css`. Light/dark mode support via `data-theme` attribute.

## Content Frontmatter

### Articles

```yaml
title: "Article Title"
pubDatetime: 2025-10-30T12:00:00Z
description: "Brief description"
tags: [tag1, tag2]
featured: false  # Optional: highlight on homepage
draft: false     # Optional: hide from production
```

### Links

```yaml
type: link
title: "Link Title"
author: Author Name
authorWebsite: https://example.com
resourceUrl: https://example.com/article
pubDatetime: 2025-10-30T12:00:00Z
tags: [tag1, tag2]
description: "Quote or description"
```

## Build Pipeline

The `pnpm build` command runs:
1. `astro check` - TypeScript validation
2. `astro build` - Generate static HTML
3. `pagefind --site dist` - Create search index
4. `cp -r dist/pagefind public/` - Copy search index for dev server

## CI/CD

GitHub Actions runs lint, format check, and build on PRs. Deployment to Vercel on main branch.
