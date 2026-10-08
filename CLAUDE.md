# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation has a Mutual NDA form with live preview and PDF download, behind a fake login screen, served via a Dockerised FastAPI backend.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
The frontend is statically built (`next build` with `output: "export"`) and served by FastAPI's `StaticFiles` at the root path.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (PL-4)
- Legal document templates added to `templates/` (12 files from CommonPaper)
- `catalog.json` listing all 12 templates with descriptions

### Completed (PL-5)
- Next.js 15 frontend in `frontend/` with Tailwind CSS
- Mutual NDA form with live preview and PDF download (`@react-pdf/renderer`)
- Unit tests for NDA utilities (17 tests)

### Completed (PL-6)
- FastAPI backend (`backend/`) as a uv project serving static frontend
- SQLite DB (`/app/data/prelegal.db`) created fresh each container start with `users` table
- Multi-stage Dockerfile: Node 20 builds static export, Python 3.12 + uv serves it
- `docker-compose.yml` with named volume for DB persistence
- Start/stop scripts for Mac, Linux, and Windows in `scripts/`
- Fake login page at `/login` (any credentials accepted, session stored in `localStorage`)
- Auth guard on main page; Sign out button in header

### Current API Endpoints
- `GET /api/health` - Health check