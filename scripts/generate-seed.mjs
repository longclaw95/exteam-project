#!/usr/bin/env node
/**
 * Génère le jeu de données synthétique de ProductPulse :
 * 90 jours × 3 segments, aucune donnée réelle.
 *
 * Déterministe (PRNG à graine fixe) pour que le fichier généré soit
 * reproductible d'une machine à l'autre — relancer ce script produit
 * toujours le même JSON.
 *
 * Usage : node scripts/generate-seed.mjs
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "../src/data/seed.json");

const SEGMENTS = ["enterprise", "smb", "startup"];
const ACCOUNTS_PER_SEGMENT = { enterprise: 18, smb: 40, startup: 65 };
const DAYS = 90;
// "Aujourd'hui" simulé : dernier jour couvert par le jeu de données.
const REFERENCE_DATE = "2026-11-04";

// PRNG déterministe (mulberry32) — pas de dépendance externe nécessaire.
function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(42);

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function pick(arr) {
  return arr[Math.floor(random() * arr.length)];
}

// Probabilité d'activité quotidienne par segment : les comptes enterprise
// sont les plus engagés, les startups les plus irrégulières.
const DAILY_ACTIVITY_RATE = { enterprise: 0.55, smb: 0.35, startup: 0.2 };
// Tickets créés par compte actif et par jour (taux moyen).
const TICKET_RATE = { enterprise: 0.06, smb: 0.04, startup: 0.03 };
// Probabilité qu'un ticket résolu reçoive une note CSAT.
const CSAT_RESPONSE_RATE = 0.6;
// Délai moyen de résolution (jours), par segment — enterprise = support prioritaire.
const RESOLUTION_DELAY_DAYS = { enterprise: 1, smb: 2, startup: 4 };

const firstDay = addDays(REFERENCE_DATE, -(DAYS - 1));

const accounts = [];
for (const segment of SEGMENTS) {
  for (let i = 0; i < ACCOUNTS_PER_SEGMENT[segment]; i++) {
    const id = `${segment}-${String(i + 1).padStart(3, "0")}`;
    // Compte créé à un moment aléatoire dans les 90 jours (ou avant, pour
    // la majorité — on simule une base client déjà établie).
    const createdAt =
      random() < 0.85 ? addDays(firstDay, -Math.floor(random() * 200)) : addDays(firstDay, Math.floor(random() * DAYS));

    const activeDates = [];
    for (let day = 0; day < DAYS; day++) {
      const date = addDays(firstDay, day);
      if (date < createdAt) continue;
      if (random() < DAILY_ACTIVITY_RATE[segment]) {
        activeDates.push(date);
      }
    }
    accounts.push({ id, segment, createdAt, activeDates });
  }
}

let ticketSeq = 1;
const tickets = [];
for (const account of accounts) {
  for (const activeDate of account.activeDates) {
    if (random() < TICKET_RATE[account.segment]) {
      const ticketId = `t-${String(ticketSeq++).padStart(5, "0")}`;
      const delay = Math.max(0, Math.round(RESOLUTION_DELAY_DAYS[account.segment] * (0.5 + random())));
      const resolvedAtCandidate = addDays(activeDate, delay);
      // Un ticket n'est marqué résolu que si la résolution tombe avant ou
      // au jour de référence (sinon il est encore ouvert "aujourd'hui").
      const resolvedAt = resolvedAtCandidate <= REFERENCE_DATE ? resolvedAtCandidate : undefined;
      const csat =
        resolvedAt && random() < CSAT_RESPONSE_RATE
          ? Math.min(5, Math.max(1, Math.round(pick([2, 3, 3, 4, 4, 4, 5, 5, 5, 5]))))
          : undefined;

      tickets.push({
        id: ticketId,
        accountId: account.id,
        segment: account.segment,
        createdAt: activeDate,
        ...(resolvedAt ? { resolvedAt } : {}),
        ...(csat ? { csat } : {}),
      });
    }
  }
}

const seed = {
  generatedThrough: REFERENCE_DATE,
  accounts,
  tickets,
};

writeFileSync(OUTPUT_PATH, JSON.stringify(seed, null, 2) + "\n", "utf-8");

console.log(
  `Seed généré : ${accounts.length} comptes, ${tickets.length} tickets, ${DAYS} jours (${firstDay} → ${REFERENCE_DATE}).`,
);
console.log(`Écrit dans ${OUTPUT_PATH}`);
