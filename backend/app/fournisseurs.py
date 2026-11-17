import logging

import httpx
from fastapi import HTTPException

from .config import settings

log = logging.getLogger("hermann")

GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{modele}:generateContent"

PERSONNALITE = (
    "Tu es HERMANN, un assistant personnel vocal. Tu parles français, avec un ton chaleureux, "
    "calme et professionnel. Tes réponses sont lues à voix haute : sois concis (2 à 4 phrases), "
    "sans listes, sans mise en forme, sans émojis. Tu n'as pas encore de mémoire durable ni "
    "d'accès à l'agenda ou aux applications de l'utilisateur : ne prétends jamais avoir effectué "
    "une action que tu ne peux pas faire, et dis-le simplement si une demande dépasse tes moyens."
)


def _indisponible(service: str) -> HTTPException:
    return HTTPException(status_code=502, detail=f"Le service {service} est indisponible ou a refusé la demande.")


async def transcrire(contenu: bytes, nom: str, type_mime: str) -> str:
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="Reconnaissance vocale non configurée.")
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                files={"file": (nom, contenu, type_mime)},
                data={"model": settings.groq_stt_model, "language": "fr", "response_format": "json"},
            )
        r.raise_for_status()
        return str(r.json().get("text", "")).strip()
    except (httpx.HTTPError, ValueError) as e:
        log.warning("Groq : %s", e)
        raise _indisponible("de reconnaissance vocale") from None


async def repondre(messages: list[dict]) -> str:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=503, detail="Intelligence artificielle non configurée.")
    corps = {
        "systemInstruction": {"parts": [{"text": PERSONNALITE}]},
        "contents": [
            {"role": "user" if m["role"] == "user" else "model", "parts": [{"text": m["texte"]}]}
            for m in messages
        ],
        "generationConfig": {"maxOutputTokens": 400, "temperature": 0.7},
    }
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                GEMINI_URL.format(modele=settings.gemini_model),
                headers={"x-goog-api-key": settings.gemini_api_key},
                json=corps,
            )
        r.raise_for_status()
        parties = r.json()["candidates"][0]["content"]["parts"]
        texte = "".join(p.get("text", "") for p in parties).strip()
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError) as e:
        log.warning("Gemini : %s", e)
        raise _indisponible("d'intelligence artificielle") from None
    if not texte:
        raise _indisponible("d'intelligence artificielle")
    return texte
