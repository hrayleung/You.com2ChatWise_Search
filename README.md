**you.com2chatwise_search**

- Purpose: Convert You.com Search API responses into ChatWise-compatible format.
- Tech: Node.js + Express, Axios.
- Endpoint: `POST /search` with `{ "queries": ["..."] }`.

**How It Works**

- Accepts a JSON body with a `queries` array of strings.
- For each query, calls `https://api.ydc-index.io/v1/search` with `X-API-Key` header.
- Merges `web` and `news` results and returns ChatWise-shaped `results` with `links: [{ title, url, content }]`.

**Requirements**

- Node.js 18+ recommended.
- Environment variable `YOU_API_KEY` must be set (do NOT commit secrets).

**Setup**

- Install deps: `npm install`
- Set API key in your shell: `export YOU_API_KEY=ydc-sk-...`
- Run locally: `npm start` (listens on port `1999`).

Example request:

```
curl -X POST http://localhost:1999/search \
  -H 'Content-Type: application/json' \
  -d '{"queries":["open source LLMs","node.js express"]}'
```

Example response shape:

```
{
  "results": [
    {
      "query": "open source LLMs",
      "links": [
        { "title": "...", "url": "https://...", "content": "..." }
      ]
    }
  ]
}
```

**PM2 (optional)**

- Edit nothing sensitive in the repo. `ecosystem.config.js` reads `YOU_API_KEY` from the environment at runtime:
  - Start: `YOU_API_KEY=ydc-sk-... pm2 start ecosystem.config.js`
  - Or ensure your environment exports `YOU_API_KEY` before starting PM2.

**Security & Secrets**

- No API keys are stored in the repo.
- `.gitignore` excludes `.env` so accidental commits of secrets are avoided.
- If you keep keys locally in a file, use `.env` and never commit it.

**Project Name**

- Package/app name: `you.com2chatwise_search`.

**Notes**

- The server listens on `1999`. Adjust as needed in `server.js` if you want a different port.

