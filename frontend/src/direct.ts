// Mode direct : le site appelle Groq (voix) et Gemini (réponses) sans serveur.
// Les clés restent sur cet appareil (navigateur), jamais dans le dépôt.
const CLE_GROQ = "hermann.cle.groq";
const CLE_GEMINI = "hermann.cle.gemini";
const MODELE_GEMINI = "gemini-3.5-flash-lite";
const MODELE_VOIX = "whisper-large-v3-turbo";
const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

const PERSONNALITE =
  "Tu es HERMANN, un assistant personnel vocal. Tu parles français, avec un ton chaleureux, " +
  "calme et professionnel. Tes réponses sont lues à voix haute : sois concis (2 à 4 phrases), " +
  "sans listes, sans mise en forme, sans émojis. Tu n'as pas encore d'accès à l'agenda ou aux " +
  "applications de l'utilisateur : ne prétends jamais avoir effectué une action que tu ne peux " +
  "pas faire, et dis-le simplement si une demande dépasse tes moyens.";

function lire(cle: string): string {
  try {
    return window.localStorage.getItem(cle) ?? "";
  } catch {
    return "";
  }
}

export function lireCles() {
  return { groq: lire(CLE_GROQ), gemini: lire(CLE_GEMINI) };
}

export function ecrireCles(groq: string, gemini: string) {
  try {
    window.localStorage.setItem(CLE_GROQ, groq.trim());
    window.localStorage.setItem(CLE_GEMINI, gemini.trim());
  } catch {
    // Stockage indisponible : les clés ne seront pas conservées.
  }
}

export function effacerCles() {
  try {
    window.localStorage.removeItem(CLE_GROQ);
    window.localStorage.removeItem(CLE_GEMINI);
  } catch {
    // Rien à effacer.
  }
}

export function modeDirect(): boolean {
  const c = lireCles();
  return c.groq.trim() !== "" && c.gemini.trim() !== "";
}

function reponseJson(statut: number, corps: unknown): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { "Content-Type": "application/json" },
  });
}

function refus(service: string, statut: number): Response {
  if (statut === 401 || statut === 403) {
    return reponseJson(502, { detail: `${service} a refusé la clé. Vérifiez-la dans Paramètres, Clés IA.` });
  }
  if (statut === 429) {
    return reponseJson(429, { detail: `${service} limite les demandes pour le moment. Patientez un instant.` });
  }
  return reponseJson(502, { detail: `Le service ${service} est indisponible ou a refusé la demande (code ${statut}).` });
}

async function transcrire(form: FormData, signal?: AbortSignal | null): Promise<Response> {
  const audio = form.get("audio");
  if (!(audio instanceof Blob)) return reponseJson(400, { detail: "Enregistrement introuvable." });
  const envoi = new FormData();
  envoi.append("file", audio, audio instanceof File ? audio.name : "voix.webm");
  envoi.append("model", MODELE_VOIX);
  envoi.append("language", "fr");
  envoi.append("response_format", "json");
  const r = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${lireCles().groq.trim()}` },
    body: envoi,
    signal,
  });
  if (!r.ok) return refus("Groq", r.status);
  const j = (await r.json()) as { text?: string };
  return reponseJson(200, { texte: (j.text ?? "").trim() });
}

type Tour = { role: string; texte: string };

async function repondre(corps: string, signal?: AbortSignal | null): Promise<Response> {
  const { messages } = JSON.parse(corps) as { messages: Tour[] };
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELE_GEMINI}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": lireCles().gemini.trim() },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PERSONNALITE }] },
        contents: messages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.texte }],
        })),
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
      }),
      signal,
    },
  );
  if (!r.ok) return refus("Gemini", r.status);
  const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const texte = (j.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
  if (!texte) return reponseJson(502, { detail: "Gemini n’a pas renvoyé de réponse." });
  return reponseJson(200, { reponse: texte });
}

// Remplace fetch pour les deux appels du dialogue : direct si les deux clés sont enregistrées, sinon serveur.
export function fetchHermann(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const adresse = String(url);
  if (modeDirect()) {
    if (adresse.endsWith("/api/voix/transcrire") && init?.body instanceof FormData) {
      return transcrire(init.body, init.signal);
    }
    if (adresse.endsWith("/api/chat") && typeof init?.body === "string") {
      return repondre(init.body, init.signal);
    }
  }
  return fetch(url, init);
}
