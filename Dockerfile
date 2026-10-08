# Stage 1: Build Next.js static export
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: FastAPI backend serving static frontend
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app/backend
COPY backend/pyproject.toml .
RUN uv sync

COPY backend/main.py .
COPY --from=frontend-builder /frontend/out /app/frontend/out

RUN mkdir -p /app/data

ENV STATIC_DIR=/app/frontend/out
ENV DB_PATH=/app/data/prelegal.db

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
