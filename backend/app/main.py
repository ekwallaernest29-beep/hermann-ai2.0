from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings

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
    allow_headers=["Content-Type"],
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


api = APIRouter(prefix="/api")


@api.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}


app.include_router(api)
