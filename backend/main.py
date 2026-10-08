import json
import logging
import os
import sqlite3
import warnings
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
<<<<<<< HEAD
from typing import Optional, Literal, Annotated
=======
from typing import Any, Literal, Optional
>>>>>>> origin/main

import bcrypt as _bcrypt

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from litellm import acompletion
from pydantic import BaseModel, Field, field_validator, model_validator

logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DB_PATH = os.environ.get("DB_PATH", "/app/data/prelegal.db")
STATIC_DIR = os.environ.get("STATIC_DIR", "/app/frontend/out")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

<<<<<<< HEAD
_INSECURE_DEFAULT_SECRET = "dev-secret-change-in-production"

security = HTTPBearer(auto_error=False)


# ── Auth models ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(max_length=72)


class AuthResponse(BaseModel):
    token: str
    email: str
    user_id: int


# ── NDA / chat models ─────────────────────────────────────────────────────────
=======
# Field schemas for all supported document types
DOCUMENT_SCHEMAS: dict[str, dict[str, Any]] = {
    "mutual-nda": {
        "name": "Mutual Non-Disclosure Agreement",
        "description": "Mutual NDA for protecting confidential information exchanged between two parties.",
        "parties": ["Party 1", "Party 2"],
        "fields": {
            "party1Company": "Party 1 company name",
            "party1Name": "Party 1 signatory full name",
            "party1Title": "Party 1 signatory job title",
            "party1NoticeAddress": "Party 1 notice address (email or postal)",
            "party1Date": "Party 1 signature date (YYYY-MM-DD)",
            "party2Company": "Party 2 company name",
            "party2Name": "Party 2 signatory full name",
            "party2Title": "Party 2 signatory job title",
            "party2NoticeAddress": "Party 2 notice address (email or postal)",
            "party2Date": "Party 2 signature date (YYYY-MM-DD)",
            "purpose": "Purpose: how Confidential Information may be used",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "mndaTermType": "MNDA Term type: 'expires' or 'continues'",
            "mndaTermYears": "MNDA Term length in years (if expires, e.g. '1')",
            "confidentialityTermType": "Confidentiality Term: 'years' or 'perpetuity'",
            "confidentialityTermYears": "Confidentiality Term length in years (if years, e.g. '1')",
            "governingLaw": "Governing Law state (e.g. Delaware)",
            "jurisdiction": "Jurisdiction for disputes (e.g. courts in New Castle, DE)",
            "modifications": "Custom modifications to standard terms (optional)",
        },
    },
    "cloud-service-agreement": {
        "name": "Cloud Service Agreement",
        "description": "Agreement for selling/buying cloud software or SaaS products.",
        "parties": ["Provider", "Customer"],
        "fields": {
            "providerCompany": "Provider (vendor) company name",
            "providerName": "Provider signatory full name",
            "providerTitle": "Provider signatory job title",
            "providerNoticeAddress": "Provider notice address",
            "customerCompany": "Customer company name",
            "customerName": "Customer signatory full name",
            "customerTitle": "Customer signatory job title",
            "customerNoticeAddress": "Customer notice address",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "subscriptionPeriod": "Subscription period (e.g. 1 year, 12 months)",
            "technicalSupport": "Technical support tier/description",
            "useLimitations": "Usage limitations (e.g. 50 users, 100 GB storage)",
            "paymentProcess": "Payment process (e.g. invoicing net-30, automatic monthly)",
            "generalCapAmount": "General liability cap (e.g. fees paid in prior 12 months)",
            "governingLaw": "Governing Law state",
            "jurisdiction": "Jurisdiction for disputes",
            "modifications": "Custom modifications (optional)",
        },
    },
    "design-partner-agreement": {
        "name": "Design Partner Agreement",
        "description": "Early product access where partners provide feedback in exchange for pre-release software.",
        "parties": ["Provider", "Partner"],
        "fields": {
            "providerCompany": "Provider company name",
            "providerName": "Provider signatory full name",
            "providerTitle": "Provider signatory job title",
            "providerNoticeAddress": "Provider notice address",
            "partnerCompany": "Partner company name",
            "partnerName": "Partner signatory full name",
            "partnerTitle": "Partner signatory job title",
            "partnerNoticeAddress": "Partner notice address",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "term": "Agreement duration (e.g. 6 months, 1 year)",
            "program": "Description of the design partner program",
            "fees": "Fees payable by Partner (or 'None')",
            "governingLaw": "Governing Law state",
            "chosenCourts": "Chosen courts for dispute resolution",
            "modifications": "Custom modifications (optional)",
        },
    },
    "service-level-agreement": {
        "name": "Service Level Agreement",
        "description": "SLA defining uptime targets, response times, and service credits.",
        "parties": ["Provider", "Customer"],
        "fields": {
            "providerCompany": "Provider company name",
            "customerCompany": "Customer company name",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "uptimeTarget": "Uptime target (e.g. 99.9%)",
            "responseTimeCritical": "Response time for critical incidents (e.g. 1 hour)",
            "responseTimeHigh": "Response time for high severity (e.g. 4 hours)",
            "serviceCredits": "Service credit terms for downtime breaches",
            "supportTier": "Support tier (e.g. Business, Enterprise)",
            "governingLaw": "Governing Law state",
            "modifications": "Custom modifications (optional)",
        },
    },
    "professional-services-agreement": {
        "name": "Professional Services Agreement",
        "description": "Agreement for professional services covering deliverables and payment.",
        "parties": ["Provider", "Customer"],
        "fields": {
            "providerCompany": "Provider company name",
            "providerName": "Provider signatory full name",
            "providerNoticeAddress": "Provider notice address",
            "customerCompany": "Customer company name",
            "customerName": "Customer signatory full name",
            "customerNoticeAddress": "Customer notice address",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "sowTerm": "Statement of Work duration",
            "deliverables": "Key deliverables description",
            "rejectionPeriod": "Rejection period for deliverables (e.g. 10 business days)",
            "paymentProcess": "Payment process and schedule",
            "paymentPeriod": "Payment terms (e.g. net-30)",
            "governingLaw": "Governing Law state",
            "jurisdiction": "Jurisdiction for disputes",
            "modifications": "Custom modifications (optional)",
        },
    },
    "partnership-agreement": {
        "name": "Partnership Agreement",
        "description": "Business partnership covering cooperation, trademark licensing, and fees.",
        "parties": ["Party 1", "Party 2"],
        "fields": {
            "party1Company": "Party 1 company name",
            "party1Name": "Party 1 signatory full name",
            "party1NoticeAddress": "Party 1 notice address",
            "party2Company": "Party 2 company name",
            "party2Name": "Party 2 signatory full name",
            "party2NoticeAddress": "Party 2 notice address",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "endDate": "Partnership end date (or 'until terminated')",
            "obligations": "Key partnership obligations",
            "territory": "Territory covered by the partnership",
            "fees": "Fees or revenue sharing arrangement",
            "governingLaw": "Governing Law state",
            "jurisdiction": "Jurisdiction for disputes",
            "modifications": "Custom modifications (optional)",
        },
    },
    "software-license-agreement": {
        "name": "Software License Agreement",
        "description": "License agreement for on-premise or installable software.",
        "parties": ["Licensor", "Licensee"],
        "fields": {
            "licensorCompany": "Licensor (software owner) company name",
            "licensorName": "Licensor signatory full name",
            "licensorNoticeAddress": "Licensor notice address",
            "licenseeCompany": "Licensee (software user) company name",
            "licenseeName": "Licensee signatory full name",
            "licenseeNoticeAddress": "Licensee notice address",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "licenseScope": "License scope and permitted uses",
            "territory": "License territory",
            "fees": "License fees",
            "supportTerms": "Support and maintenance terms",
            "governingLaw": "Governing Law state",
            "jurisdiction": "Jurisdiction for disputes",
            "modifications": "Custom modifications (optional)",
        },
    },
    "data-processing-agreement": {
        "name": "Data Processing Agreement",
        "description": "GDPR-compliant agreement covering data protection obligations.",
        "parties": ["Controller", "Processor"],
        "fields": {
            "controllerCompany": "Controller (data owner) company name",
            "controllerName": "Controller signatory full name",
            "processorCompany": "Processor (data handler) company name",
            "processorName": "Processor signatory full name",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "dataCategories": "Categories of personal data processed",
            "processingPurposes": "Purposes of data processing",
            "retentionPeriod": "Data retention period",
            "securityMeasures": "Key security measures in place",
            "breachNotificationPeriod": "Breach notification period (e.g. 72 hours)",
            "governingLaw": "Governing Law state",
            "modifications": "Custom modifications (optional)",
        },
    },
    "pilot-agreement": {
        "name": "Pilot Agreement",
        "description": "Short-term trial agreement for evaluating a product before full commitment.",
        "parties": ["Provider", "Customer"],
        "fields": {
            "providerCompany": "Provider company name",
            "providerName": "Provider signatory full name",
            "customerCompany": "Customer company name",
            "customerName": "Customer signatory full name",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "pilotPeriod": "Pilot duration (e.g. 90 days, 3 months)",
            "evaluationPurposes": "Purpose of the pilot evaluation",
            "successCriteria": "Success criteria for the pilot",
            "fees": "Pilot fees (or 'No fee / free pilot')",
            "generalCapAmount": "Liability cap amount",
            "governingLaw": "Governing Law state",
            "modifications": "Custom modifications (optional)",
        },
    },
    "business-associate-agreement": {
        "name": "Business Associate Agreement",
        "description": "HIPAA-compliant agreement for business associates handling protected health information.",
        "parties": ["Covered Entity", "Business Associate"],
        "fields": {
            "coveredEntityCompany": "Covered entity (e.g. healthcare provider) company name",
            "coveredEntityName": "Covered entity signatory full name",
            "businessAssociateCompany": "Business associate company name",
            "businessAssociateName": "Business associate signatory full name",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "permittedUses": "Permitted uses/disclosures of PHI",
            "phiCategories": "Categories of Protected Health Information involved",
            "securityMeasures": "Security measures for PHI protection",
            "breachNotificationPeriod": "Breach notification timeline (e.g. 60 days)",
            "governingLaw": "Governing Law state",
            "modifications": "Custom modifications (optional)",
        },
    },
    "ai-addendum": {
        "name": "AI Addendum",
        "description": "Addendum for agreements involving AI/ML features covering ownership and restrictions.",
        "parties": ["Party 1", "Party 2"],
        "fields": {
            "party1Company": "Party 1 company name",
            "party1Name": "Party 1 signatory full name",
            "party2Company": "Party 2 company name",
            "party2Name": "Party 2 signatory full name",
            "effectiveDate": "Effective Date (YYYY-MM-DD)",
            "parentAgreementName": "Name of the parent agreement this addendum applies to",
            "inputOwnership": "Ownership of AI inputs (who owns data submitted to the AI)",
            "outputOwnership": "Ownership of AI outputs/generated content",
            "modelTrainingRestrictions": "Restrictions on using data for model training",
            "governingLaw": "Governing Law state",
            "modifications": "Custom modifications (optional)",
        },
    },
}

SUPPORTED_DOCUMENT_TYPES = set(DOCUMENT_SCHEMAS.keys())

>>>>>>> origin/main

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)


class ChatResponse(BaseModel):
    reply: str
    form_updates: dict[str, Optional[str]] = Field(default_factory=dict)


class ChatRequest(BaseModel):
    document_type: str = "mutual-nda"
    messages: list[Message] = Field(max_length=50)
    current_form_data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("document_type")
    @classmethod
    def validate_document_type(cls, v: str) -> str:
        if v not in SUPPORTED_DOCUMENT_TYPES:
            raise ValueError(f"Unsupported document type: {v!r}. Must be one of: {sorted(SUPPORTED_DOCUMENT_TYPES)}")
        return v

    @model_validator(mode="after")
    def sanitize_form_data(self) -> "ChatRequest":
        allowed_keys = set(DOCUMENT_SCHEMAS[self.document_type]["fields"].keys())
        cleaned: dict[str, Any] = {}
        for k, v in self.current_form_data.items():
            if k not in allowed_keys:
                continue
            if not isinstance(v, str):
                v = str(v)
            cleaned[k] = v[:500]
        self.current_form_data = cleaned
        return self


<<<<<<< HEAD
# ── Document models ───────────────────────────────────────────────────────────

class DocumentSave(BaseModel):
    title: str = Field(max_length=200)
    document_type: str = Field(default="mutual_nda", max_length=100)
    form_data: dict
    messages: list[dict] = Field(default_factory=list, max_length=50)


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    form_data: Optional[dict] = None
    messages: Optional[list[dict]] = Field(default=None, max_length=50)


# ── Database ──────────────────────────────────────────────────────────────────

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Non-destructive migration: add password_hash if upgrading from old schema
        try:
            conn.execute("ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''")
        except sqlite3.OperationalError:
            pass
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                title TEXT NOT NULL,
                document_type TEXT NOT NULL DEFAULT 'mutual_nda',
                form_data TEXT NOT NULL DEFAULT '{}',
                messages TEXT NOT NULL DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


# ── Auth helpers ──────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"user_id": int(payload["sub"]), "email": payload["email"]}
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── App startup ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    if JWT_SECRET == _INSECURE_DEFAULT_SECRET:
        warnings.warn(
            "JWT_SECRET is set to the insecure default. Set the JWT_SECRET environment variable in production.",
            stacklevel=2,
        )
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


# ── Auth endpoints ────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=AuthResponse, status_code=201)
async def register(request: RegisterRequest):
    email = request.email.lower().strip()
    with get_db() as conn:
        try:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id",
                (email, hash_password(request.password)),
            )
            user_id = cursor.fetchone()[0]
            conn.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="An account with this email already exists")
    return AuthResponse(token=create_token(user_id, email), email=email, user_id=user_id)


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            (request.email.lower().strip(),),
        ).fetchone()
    if not row or not verify_password(request.password, row[2]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return AuthResponse(token=create_token(row[0], row[1]), email=row[1], user_id=row[0])


# ── Document endpoints ────────────────────────────────────────────────────────

@app.get("/api/documents")
async def list_documents(user: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, title, document_type, created_at, updated_at FROM documents "
            "WHERE user_id = ? ORDER BY updated_at DESC",
            (user["user_id"],),
        ).fetchall()
    return [
        {"id": r[0], "title": r[1], "document_type": r[2], "created_at": r[3], "updated_at": r[4]}
        for r in rows
    ]


@app.post("/api/documents", status_code=201)
async def create_document(doc: DocumentSave, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO documents (user_id, title, document_type, form_data, messages) "
            "VALUES (?, ?, ?, ?, ?) RETURNING id",
            (
                user["user_id"],
                doc.title,
                doc.document_type,
                json.dumps(doc.form_data),
                json.dumps(doc.messages),
            ),
        )
        doc_id = cursor.fetchone()[0]
        conn.commit()
    return {"id": doc_id, "title": doc.title}


@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: int, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, title, document_type, form_data, messages, created_at, updated_at "
            "FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user["user_id"]),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": row[0],
        "title": row[1],
        "document_type": row[2],
        "form_data": json.loads(row[3]),
        "messages": json.loads(row[4]),
        "created_at": row[5],
        "updated_at": row[6],
    }


@app.put("/api/documents/{doc_id}")
async def update_document(doc_id: int, doc: DocumentUpdate, user: dict = Depends(get_current_user)):
    if doc.title is None and doc.form_data is None and doc.messages is None:
        raise HTTPException(status_code=422, detail="At least one field must be provided to update")
    with get_db() as conn:
        exists = conn.execute(
            "SELECT id FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user["user_id"]),
        ).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="Document not found")
        updates: list[str] = []
        params: list = []
        if doc.title is not None:
            updates.append("title = ?")
            params.append(doc.title)
        if doc.form_data is not None:
            updates.append("form_data = ?")
            params.append(json.dumps(doc.form_data))
        if doc.messages is not None:
            updates.append("messages = ?")
            params.append(json.dumps(doc.messages))
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.extend([doc_id, user["user_id"]])
        conn.execute(
            f"UPDATE documents SET {', '.join(updates)} WHERE id = ? AND user_id = ?",
            params,
        )
        conn.commit()
    return {"success": True}


# ── NDA system prompt ─────────────────────────────────────────────────────────

def build_system_prompt(current_form_data: CurrentFormData) -> str:
    return f"""You are a friendly legal assistant helping a user fill in a Mutual Non-Disclosure Agreement (MNDA).
=======
def build_system_prompt(current_form_data: dict[str, Any], document_type: str = "mutual-nda") -> str:
    schema = DOCUMENT_SCHEMAS[document_type]
    doc_name = schema["name"]
    doc_description = schema["description"]
    fields = schema["fields"]
    parties = schema.get("parties", ["Party 1", "Party 2"])
>>>>>>> origin/main

    field_list = "\n".join(f"- **{key}**: {desc}" for key, desc in fields.items())
    party_str = " and ".join(parties)

    all_supported = "\n".join(f"- {s['name']}" for s in DOCUMENT_SCHEMAS.values())

    return f"""You are a friendly legal assistant helping a user fill in a **{doc_name}**.

{doc_description}

Your job is to have a natural conversation to gather the required information for {party_str}.
Ask one or two questions at a time — do not overwhelm the user.
**Always ask a follow-on question if you still need more information.**

The agreement requires these fields:
{field_list}

Current form state:
{json.dumps(current_form_data, indent=2)}

When the conversation starts with no prior messages, greet the user warmly and begin asking for the required information.
As users provide information, populate the relevant fields in form_updates using the exact field names listed above.
Only include fields in form_updates that you have new information for — omit the rest (leave them null or absent).
Keep your tone friendly, professional, and concise.

If the user asks for a document type you cannot generate (i.e., not in this list of supported types):
{all_supported}
Explain politely that you cannot generate that document type yet, and offer the closest supported alternative."""


# ── Chat + health endpoints ───────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    system_prompt = build_system_prompt(request.current_form_data, request.document_type)
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
    except Exception as exc:
        logger.exception("AI service call failed: %s", exc)
        raise HTTPException(status_code=502, detail="AI service error")


# ── Static frontend ───────────────────────────────────────────────────────────

static_path = Path(STATIC_DIR)
if static_path.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
