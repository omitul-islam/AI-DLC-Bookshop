# MCP — Model Context Protocol Setup

This directory documents the MCP (Model Context Protocol) servers configured for opencode in this project. MCP servers extend opencode's capabilities by providing additional tools — in this case, the ability to browse and interact with live websites.

## Purpose

The Playwright MCP server allows the AI to:

- Navigate to any URL and read page content
- Click buttons, links, and interactive elements
- Fill in forms and submit data
- Take screenshots of web pages
- Inspect page structure and extract information

This is useful for:

- Researching competitor websites (e.g., rokomari.com)
- Verifying UI implementations against live references
- Debugging frontend rendering issues
- Extracting data from web pages
- Testing user workflows on external sites

---

## MCP Servers

### 1. Playwright Browser Automation

| Field | Value |
|-------|-------|
| **Name** | `playwright` |
| **Type** | `local` (runs on the same machine) |
| **Command** | `npx -y @playwright/mcp` |
| **Status** | ✅ Enabled |
| **Browser** | Chromium (headless) |

**What it does:** Launches a headless Chromium browser that the AI can control programmatically — visiting pages, clicking elements, reading text, and extracting structured data.

**Data consumption:** Renders pages locally. Does not send page content to third parties. The AI processes what it reads to answer your questions.

---

## For Humans — How to Use

### Prerequisites

Playwright MCP is configured in `/opencode.json` at the project root. It runs **automatically** when opencode starts.

To verify it's working:

1. Start (or restart) opencode
2. Ask the AI: *"Go to rokomari.com and tell me what you see"*
3. The AI will use the Playwright tools to browse the site

### Installing Dependencies

The MCP server uses `npx` to fetch `@playwright/mcp` on demand, so no global install is needed. Chromium browser binaries are already downloaded to `~/.cache/ms-playwright/`.

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "Browser not found" error | Run `npx playwright install chromium` |
| Page loads but no content | The page may require JavaScript — Playwright handles JS by default |
| Timeout on large pages | The AI will summarise what it can read |
| MCP not connecting | Restart opencode to reload the MCP config |

---

## For the AI — How to Use Playwright MCP

The Playwright MCP exposes several tools. Use them in this order when browsing a new site:

### Standard Browsing Workflow

```
1. browser_navigate(url)      — Go to the page
2. browser_snapshot()         — Get the current page state (text, links, buttons)
3. browser_click(element)     — Click a link or button (use selector from snapshot)
4. browser_snapshot()         — Re-read the page after navigation
```

### Available Tools

| Tool | When to Use |
|------|-------------|
| `browser_navigate` | First step — navigate to a URL |
| `browser_snapshot` | After every navigation/action — reads the current page |
| `browser_click` | Click buttons, links, tabs, accordions |
| `browser_fill` | Fill in text inputs (search boxes, forms) |
| `browser_select` | Choose from `<select>` dropdowns |
| `browser_screenshot` | Take a visual screenshot (useful for layout issues) |
| `browser_set_viewport` | Resize the browser window |
| `browser_close` | Close the browser when done |

### Guidelines

- **Always call `browser_snapshot()` after any navigation or click** — this is how you read the page content
- For search/filter workflows: `browser_fill` the search box → `browser_click` the search button → `browser_snapshot()` the results
- For multi-page sites, track where you are and navigate link by link
- If a page has dynamic content (lazy loading, infinite scroll), scroll by clicking "Load More" buttons if available
- Be mindful of rate limits — add small delays between navigations
- Summarise what you find for the user rather than dumping raw HTML

### Example Session

```
User: "What books are on sale at rokomari.com?"

1. browser_navigate("https://www.rokomari.com")
2. browser_snapshot()          → see homepage, find "Great Read" section
3. browser_click("Great Read") → navigate to sale page
4. browser_snapshot()          → read the list of discounted books
5. Report findings to user
```
