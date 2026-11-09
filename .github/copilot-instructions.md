# Consignes pour Copilot : projet HERMANN AI

Projet : assistant personnel vocal, application web mobile (PWA) publique. Propriétaire : Hermann Ekwalla.

## Règles
- Textes de l'interface en français.
- Frontend : React + TypeScript dans `frontend/`. Backend : Python FastAPI dans `backend/app/`.
- Jamais de clé API, mot de passe ou secret dans le code : variables d'environnement uniquement, `.env` jamais commité.
- Les fournisseurs d'IA et de voix passent par des adaptateurs interchangeables ; ne jamais dépendre d'un seul.
- Aucune dépendance payante ni nécessitant une carte bancaire. Demander avant d'ajouter une dépendance.
- Toute nouvelle route backend a un test dans `backend/tests/`.
- Palette : #E8DDCC, #F8F7F2, #E5E7E4, #66716D, #A8DCC5, #315F50. Ne pas utiliser la menthe comme couleur de texte sur fond clair.
- Ne jamais simuler une fonction : signaler clairement ce qui n'est pas encore implémenté.
- Ne pas modifier l'architecture sans accord du propriétaire.
