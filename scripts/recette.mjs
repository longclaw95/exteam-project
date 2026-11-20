/**
 * Recette des 6 chemins critiques sur le build de production
 * (cf. docs/10-pv-recette.md). Vérifie le HTML réellement servi, pas des
 * composants isolés.
 *
 *   npm run build && npm run recette
 *
 * Par défaut, démarre `next start` sur un port libre puis l'arrête. Pour
 * viser un serveur déjà lancé : RECETTE_URL=http://localhost:3000 npm run recette
 */

import { spawn } from "node:child_process";

const PORT = 3199;
const BASE = process.env.RECETTE_URL ?? `http://localhost:${PORT}`;

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ");
}

async function load(path) {
  const response = await fetch(BASE + path);
  const html = await response.text();
  return {
    status: response.status,
    html,
    text: visibleText(html),
    // React sépare "7" et "j" par un commentaire <!-- --> dans le HTML.
    pressedPeriod: html.match(/aria-pressed="true"[^>]*>(\d+)(?:<!-- -->)?j</)?.[1],
    selectedSegment: html.match(/<option value="([^"]+)" selected/)?.[1],
    seriesCount: (html.match(/<path d=/g) ?? []).length,
    tableBody: html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? "",
    tableSegments: [...(html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? "").matchAll(
      /<td[^>]*>(Enterprise|PME|Startup)<\/td>/g,
    )].map((m) => m[1]),
  };
}

const results = [];

function check(path, label, ok, detail = "") {
  results.push({ path, label, ok: Boolean(ok), detail });
}

// Règles valables pour toute page : jamais de valeur technique brute à l'écran.
function checkHygiene(path, page) {
  check(path, "HTTP 200", page.status === 200, `reçu ${page.status}`);
  const leak = page.text.match(/NaN|Infinity|undefined|\d[.,]\d{3,}/);
  check(path, "aucun NaN / Infinity / undefined / artefact décimal", !leak, leak?.[0]);
}

async function run() {
  // 1. Lecture par défaut (persona PM)
  let p = await load("/");
  checkHygiene("1. Vue par défaut", p);
  check("1. Vue par défaut", "période 30 j active, tous segments", p.pressedPeriod === "30" && p.selectedSegment === "all");
  check(
    "1. Vue par défaut",
    "4 KPIs affichés",
    ["Comptes actifs", "Tickets créés", "Taux de résolution", "Satisfaction (CSAT)"].every((k) => p.text.includes(k)),
  );
  check("1. Vue par défaut", "graphique : 3 séries", p.seriesCount === 3, `${p.seriesCount} séries`);
  check("1. Vue par défaut", "tableau non vide", p.tableSegments.length > 0, `${p.tableSegments.length} lignes`);
  const dotDecimal = visibleText(p.tableBody).match(/\d\.\d/);
  check("1. Vue par défaut", "décimales au format français dans le tableau (« 4,3 » et non « 4.3 »)", !dotDecimal, dotDecimal?.[0]);

  // 2. Lien partagé + rechargement (persona responsable support)
  const shared = "/?period=7&segment=enterprise";
  p = await load(shared);
  const reload = await load(shared);
  checkHygiene("2. Lien partagé", p);
  check("2. Lien partagé", "filtres restaurés depuis l'URL (7 j, Enterprise)", p.pressedPeriod === "7" && p.selectedSegment === "enterprise");
  check("2. Lien partagé", "graphique synchronisé : 1 série", p.seriesCount === 1, `${p.seriesCount} séries`);
  check(
    "2. Lien partagé",
    "tableau synchronisé : uniquement Enterprise",
    p.tableSegments.length > 0 && p.tableSegments.every((s) => s === "Enterprise"),
    [...new Set(p.tableSegments)].join(", "),
  );
  check("2. Lien partagé", "rechargement : même résultat à l'identique", reload.text === p.text);

  // 3. Paramètres invalides (lien abîmé, saisie manuelle)
  p = await load("/?period=42&segment=bogus");
  checkHygiene("3. Paramètres invalides", p);
  check("3. Paramètres invalides", "repli sur 30 j / tous segments", p.pressedPeriod === "30" && p.selectedSegment === "all");

  // 4. Données incomplètes
  p = await load("/?period=90");
  checkHygiene("4. Données incomplètes", p);
  const unavailable = (p.text.match(/Pas de comparaison disponible/g) ?? []).length;
  check("4. Données incomplètes", "90 j : période précédente hors données → 4 × « Pas de comparaison »", unavailable === 4, `${unavailable} cartes`);
  check("4. Données incomplètes", "90 j : aucune fausse tendance « Nouveau »", !p.text.includes("Nouveau par rapport"));
  p = await load("/?period=7&segment=startup");
  checkHygiene("4. Données incomplètes", p);
  check("4. Données incomplètes", "7 j Startup sans note CSAT → « n/a »", /Satisfaction \(CSAT\) n\/a/.test(p.text));

  // 5. Erreur simulée et reprise
  p = await load("/?error=1&period=7&segment=smb");
  checkHygiene("5. Erreur simulée", p);
  check("5. Erreur simulée", "message d'erreur annoncé (role=alert)", p.html.includes('role="alert"'));
  check("5. Erreur simulée", "filtres toujours visibles et conservés", p.pressedPeriod === "7" && p.selectedSegment === "smb");
  check("5. Erreur simulée", "aucun KPI affiché (pas de chiffres faux)", !p.text.includes("Indicateurs clés"));
  check("5. Erreur simulée", "« Réessayer » conserve les filtres", p.html.includes('href="/?period=7&amp;segment=smb"'));

  // 6. Segment vide → état vide. Non atteignable via l'URL avec le jeu
  // actuel (chaque segment a de l'activité) : vérifié sur le catalogue,
  // qui rend le même composant que le tableau de bord.
  p = await load("/catalogue");
  checkHygiene("6. Segment vide", p);
  check("6. Segment vide", "état vide explicite (role=status)", p.text.includes("Aucune donnée pour ce segment et cette période") && p.html.includes('role="status"'));
}

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      await fetch(BASE);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Serveur injoignable sur ${BASE} — avez-vous lancé "npm run build" ?`);
}

const server = process.env.RECETTE_URL
  ? null
  : spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore", detached: true });

try {
  await waitForServer();
  await run();
} finally {
  if (server) process.kill(-server.pid);
}

let currentPath = "";
for (const r of results) {
  if (r.path !== currentPath) {
    currentPath = r.path;
    console.log(`\n${currentPath}`);
  }
  console.log(`  ${r.ok ? "OK  " : "ÉCHEC"} ${r.label}${!r.ok && r.detail ? ` (${r.detail})` : ""}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} vérifications OK`);
process.exit(failed === 0 ? 0 : 1);
