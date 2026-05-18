## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: prettier, eslint, tailwindcss, sveltekit-adapter, mcp

## Project
This project is a LinkedIn profile guessing game. Your job is to copy the (claude design) prototype in design/ EXACTLY.
Read `design/README.md`
Ensure pixel perfect adherence to the handoff. Make sure to use seperate jsons for data in a `data/` folder

Use Svelte 5 Runes properly and also utilize Tailwind CSS. Ensure simple clean code, and make sure everything works perfectly.

## Code Style
- Simple, clean, minimal — no overengineering
- No redundant comments - make sure to limit your comments to only docstrings above functions (if needed)
- Concise docstrings: lowercase, no full stops
- All lowercase naming, no camelCase, hyphens, or underscores
  - `emailverify` not `email_verify`, `getuserrole` not `get_user_role`
- Short, human-sounding names — no AI-like variable names
- No redundancies, consistent style throughout
- Minimal diffs — only change what's needed


---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
