# Prelegal

A platform for drafting common legal agreements.

> **Work in progress** — this project is actively being developed and is expected to be feature-complete by **13 October 2026**.

This is the result of me (Ed) running the Jira tickets through Claude Code. But you should do this yourself!

See the skill in the .claude directory.

The Jira ticket details are [at this link](https://docs.google.com/document/d/1KlQvrpffoLe6wynfA3WhqnMdjMQdT0B6Y3_awlAnazQ/edit?usp=sharing).

If you have skills to add, or more instructions, please add them to community_contributions and send a PR.

## Implementation Status

| Ticket | Feature | Status |
|--------|---------|--------|
| PL-4 | Docker setup, FastAPI backend, Next.js frontend, auth routes, start/stop scripts | ✅ Complete |
| PL-5 | AI chat interface, LiteLLM/OpenRouter/Cerebras integration, structured outputs, live preview | ✅ Complete |
| PL-6 | All 11 document types, document-specific previews and PDF generation | ✅ Complete |
| PL-7 | User authentication (JWT), document persistence, My Documents modal | ✅ Complete |
| PL-8+ | Remaining features | 🔄 In progress |

## Supported Document Types

1. Mutual Non-Disclosure Agreement
2. Cloud Service Agreement
3. Design Partner Agreement
4. Service Level Agreement
5. Professional Services Agreement
6. Partnership Agreement
7. Software License Agreement
8. Data Processing Agreement
9. Pilot Agreement
10. Business Associate Agreement
11. AI Addendum

## Quick Start

### Prerequisites
- Docker and Docker Compose installed

### Running the Application

**Mac/Linux:**
```bash
./scripts/start-mac.sh    # or start-linux.sh
```

**Windows:**
```powershell
.\scripts\start-windows.ps1
```

The application will be available at http://localhost:8000

### Stopping the Application

**Mac/Linux:**
```bash
./scripts/stop-mac.sh    # or stop-linux.sh
```

**Windows:**
```powershell
.\scripts\stop-windows.ps1
```

## Development

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```
Available at http://localhost:3000

### Backend Only
```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```
Available at http://localhost:8000

## Project Structure

```
prelegal/
  backend/         # FastAPI backend
  frontend/        # Next.js frontend
  scripts/         # Start/stop scripts
  templates/       # Legal document templates
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and receive JWT cookie
- `POST /api/auth/signout` - Clear auth cookie
- `GET /api/auth/me` - Get current user info

### Documents
- `GET /api/documents` - List user's saved documents (auth required)
- `POST /api/documents` - Save new document (auth required)
- `GET /api/documents/{id}` - Get specific document (auth required)
- `PUT /api/documents/{id}` - Update document (auth required)
- `DELETE /api/documents/{id}` - Delete document (auth required)

### Chat
- `GET /api/chat/greeting` - Get AI greeting
- `POST /api/chat/message` - Send chat message and get AI response

### Health
- `GET /api/health` - Health check

## License

See LICENSE file.
