import hmac
import time
from collections import defaultdict, deque

from fastapi import Header, HTTPException, Request

from .config import settings

_fenetres: dict[str, deque] = defaultdict(deque)


def _purger(cle: str, secondes: int) -> deque:
    maintenant = time.monotonic()
    f = _fenetres[cle]
    while f and maintenant - f[0] > secondes:
        f.popleft()
    return f


def _trop(message: str = "Trop de demandes. Réessayez dans un instant.") -> HTTPException:
    return HTTPException(status_code=429, detail=message)


def exiger_acces(request: Request, x_access_code: str = Header(default="")) -> None:
    """Protège les routes qui consomment nos quotas externes."""
    ip = request.client.host if request.client else "inconnu"
    if not settings.access_code:
        raise HTTPException(status_code=503, detail="Accès non configuré sur le serveur.")
    if len(_purger(f"echec:{ip}", 600)) >= 5:
        raise _trop("Trop d'essais. Réessayez dans 10 minutes.")
    if not hmac.compare_digest(x_access_code.encode(), settings.access_code.encode()):
        _fenetres[f"echec:{ip}"].append(time.monotonic())
        raise HTTPException(status_code=401, detail="Code d'accès invalide.")
    requetes = _purger(f"req:{ip}", 60)
    if len(requetes) >= 30:
        raise _trop()
    requetes.append(time.monotonic())
