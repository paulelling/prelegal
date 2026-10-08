import json
import os
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional, Literal

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from litellm import acompletion
from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DB_PATH = os.environ.get("DB_PATH", "/app/data/prelegal.db")
STATIC_DIR = os.environ.get("STATIC_DIR", "/app/frontend/out")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)


class PartyInfo(BaseModel):
    name: str = ""
    title: str = ""
    company: str = ""
    noticeAddress: str = ""
    date: str = ""


class CurrentFormData(BaseModel):
    purpose: str = ""
    effectiveDate: str = ""
    mndaTermType: Literal["expires", "continues"] = "expires"
    mndaTermYears: int = 1
    confidentialityTermType: Literal["years", "perpetuity"] = "years"
    confidentialityTermYears: int = 1
    governingLaw: str = ""
    jurisdiction: str = ""
    modifications: str = ""
    party1: PartyInfo = Field(default_factory=PartyInfo)
    party2: PartyInfo = Field(default_factory=PartyInfo)


class PartyUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    noticeAddress: Optional[str] = None
    date: Optional[str] = None


class FormUpdates(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[Literal["expires", "continues"]] = None
    mndaTermYears: Optional[int] = None
    confidentialityTermType: Optional[Literal["years", "perpetuity"]] = None
    confidentialityTermYears: Optional[int] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None
    party1: Optional[PartyUpdate] = None
    party2: Optional[PartyUpdate] = None


class ChatResponse(BaseModel):
    reply: str
    form_updates: FormUpdates


class ChatRequest(BaseModel):
    messages: list[Message] = Field(max_length=50)
    current_form_data: CurrentFormData


def build_system_prompt(current_form_data: CurrentFormData) -> str:
    return f"""You are a friendly legal assistant helping a user fill in a Mutual Non-Disclosure Agreement (MNDA).

Your job is to have a natural conversation to gather the required information.
Ask one or two questions at a time — do not overwhelm the user.

The agreement requires:
- **Party 1**: company name, signatory name, title, notice address, signature date
- **Party 2**: company name, signatory name, title, notice address, signature date
- **Purpose**: how Confidential Information may be used
- **Effective Date**: when the agreement takes effect
- **MNDA Term**: expires after N year(s) from Effective Date, or continues until terminated
- **Confidentiality Term**: N year(s) from Effective Date, or in perpetuity
- **Governing Law**: which state's laws govern (e.g. Delaware)
- **Jurisdiction**: city/county and state for dispute resolution
- **Modifications** (optional): any custom additional terms

Current form state:
{json.dumps(current_form_data.model_dump(), indent=2)}

When the conversation starts with no prior messages, greet the user warmly and begin asking for the required information.
As users provide information, populate the relevant fields in form_updates.
Only include fields in form_updates that you have new information for — omit the rest (leave them as null).
Keep your tone friendly, professional, and concise."""


def init_db():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    system_prompt = build_system_prompt(request.current_form_data)
    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.messages:
        messages.append({"role": msg.role, "content": msg.content})

    try:
        response = await acompletion(
            model=MODEL,
            messages=messages,
            response_format=ChatResponse,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
            api_key=OPENROUTER_API_KEY,
        )
        result_json = response.choices[0].message.content
        return ChatResponse.model_validate_json(result_json)
    except Exception:
        raise HTTPException(status_code=502, detail="AI service error")


static_path = Path(STATIC_DIR)
if static_path.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
