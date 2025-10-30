# Content Structure

This site now has a unified content collection for both articles and links.

## Adding a New Article

Create a new `.md` file in `src/data/blog/` with the following frontmatter:

```markdown
---
title: "Your Article Title"
pubDatetime: 2025-10-30T12:00:00Z
description: "A brief description of your article"
tags:
  - tag1
  - tag2
---

Your article content here...
```

## Adding a New Link

Create a new `.md` file in `src/data/blog/links/` with the following frontmatter:

```markdown
---
type: link
title: "Link Title"
author: Author Name
authorWebsite: https://example.com
resourceUrl: https://example.com/article
pubDatetime: 2025-10-30T12:00:00Z
tags:
  - tag1
  - tag2
description: "A brief description or quote from the link"
---

Optional: Add your own introduction or commentary about the link here.
This is the main benefit of the unified system - you can now add context to links!
```

## RSS Feed

The RSS feed at `/rss.xml` includes both articles and links. For links, the RSS feed links directly to the external resource URL.
