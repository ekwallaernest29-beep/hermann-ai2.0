"""Génère les icônes PNG de HERMANN AI (une sphère menthe sur fond beige), sans dépendance."""
import math
import os
import struct
import zlib

FOND = (232, 221, 204)
BLANC = (248, 247, 242)
MENTHE = (168, 220, 197)
VERT = (49, 95, 80)


def melange(a, b, u):
    return tuple(round(a[i] + (b[i] - a[i]) * u) for i in range(3))


def couleur_sphere(t):
    if t < 0.55:
        return melange(BLANC, MENTHE, t / 0.55)
    return melange(MENTHE, VERT, (t - 0.55) / 0.45)


def bloc(type_, data):
    contenu = type_ + data
    return struct.pack(">I", len(data)) + contenu + struct.pack(">I", zlib.crc32(contenu) & 0xFFFFFFFF)


def creer(chemin, taille, part):
    rayon = taille * part
    c = taille / 2
    lx, ly = c - rayon * 0.3, c - rayon * 0.4
    brut = bytearray()
    for y in range(taille):
        brut.append(0)
        for x in range(taille):
            px, py = x + 0.5, y + 0.5
            couverture = max(0.0, min(1.0, rayon - math.hypot(px - c, py - c) + 0.5))
            if couverture > 0:
                t = min(math.hypot(px - lx, py - ly) / (rayon * 1.5), 1.0)
                pixel = melange(FOND, couleur_sphere(t), couverture)
            else:
                pixel = FOND
            brut.extend(pixel)
    entete = struct.pack(">IIBBBBB", taille, taille, 8, 2, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + bloc(b"IHDR", entete)
        + bloc(b"IDAT", zlib.compress(bytes(brut), 9))
        + bloc(b"IEND", b"")
    )
    with open(chemin, "wb") as f:
        f.write(png)


os.makedirs("public/icones", exist_ok=True)
creer("public/icones/icone-192.png", 192, 0.38)
creer("public/icones/icone-512.png", 512, 0.38)
creer("public/icones/icone-maskable-512.png", 512, 0.30)
creer("public/icones/apple-touch-icon.png", 180, 0.38)
print("Icônes créées dans public/icones")
