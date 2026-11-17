from typing import Literal

from fastapi import APIRouter, Depends, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import settings
from .fournisseurs import repondre, transcrire
from .securite import exiger_acces

dev = settings.environment == "development"
app = FastAPI(
    title=settings.app_name,
    docs_url="/docs" if dev else None,
    redoc_url=None,
    openapi_url="/openapi.json" if dev else None,
)

origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Access-Code"],
    allow_credentials=True,
)


@app.middleware("http")
async def en_tetes_securite(request, call_next):
    reponse = await call_next(request)
    reponse.headers["X-Content-Type-Options"] = "nosniff"
    reponse.headers["X-Frame-Options"] = "DENY"
    reponse.headers["Referrer-Policy"] = "no-referrer"
    reponse.headers["Strict-Transport-Security"] = "max-age=31536000"
    if not dev:
        reponse.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    return reponse


class Message(BaseModel):
    role: Literal["user", "hermann"]
    texte: str = Field(min_length=1, max_length=2000)


class DemandeChat(BaseModel):
    messages: list[Message] = Field(min_length=1, max_length=20)


TAILLE_MAX_AUDIO = 5 * 1024 * 1024

api = APIRouter(prefix="/api")


@api.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}


@api.get("/acces/verifier", dependencies=[Depends(exiger_acces)])
def verifier_acces():
    return {"ok": True}


@api.post("/voix/transcrire", dependencies=[Depends(exiger_acces)])
async def voix_transcrire(audio: UploadFile):
    type_mime = audio.content_type or ""
    if not type_mime.startswith("audio/"):
        raise HTTPException(status_code=415, detail="Format audio non pris en charge.")
    contenu = await audio.read(TAILLE_MAX_AUDIO + 1)
    if not contenu:
        raise HTTPException(status_code=400, detail="Aucun son reçu.")
    if len(contenu) > TAILLE_MAX_AUDIO:
        raise HTTPException(status_code=413, detail="Enregistrement trop long.")
    texte = await transcrire(contenu, audio.filename or "voix.webm", type_mime)
    return {"texte": texte}


@api.post("/chat", dependencies=[Depends(exiger_acces)])
async def chat(demande: DemandeChat):
    if demande.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="Le dernier message doit venir de l'utilisateur.")
    reponse = await repondre([m.model_dump() for m in demande.messages])
    return {"reponse": reponse}


app.include_router(api)
