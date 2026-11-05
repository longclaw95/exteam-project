/**
 * Types du domaine ProductPulse.
 *
 * Ce module ne dépend d'aucune librairie UI : il décrit uniquement la forme
 * des données métier, indépendamment de la façon dont elles sont affichées.
 */

export type Segment = "enterprise" | "smb" | "startup";

export const SEGMENTS: readonly Segment[] = ["enterprise", "smb", "startup"];

export interface Account {
  id: string;
  segment: Segment;
  /** Date ISO (YYYY-MM-DD) de création du compte. */
  createdAt: string;
  /**
   * Dates ISO (YYYY-MM-DD) des jours où ce compte a généré au moins un
   * événement d'usage. Sert à calculer les comptes actifs sur une période
   * (cf. note de cadrage, règle de dédoublonnage).
   */
  activeDates: string[];
}

export interface Ticket {
  id: string;
  accountId: string;
  segment: Segment;
  /** Date ISO (YYYY-MM-DD) de création du ticket. */
  createdAt: string;
  /** Date ISO (YYYY-MM-DD) de résolution, absente si le ticket est encore ouvert. */
  resolvedAt?: string;
  /** Note de satisfaction (1 à 5), présente seulement si le client a répondu à l'enquête post-résolution. */
  csat?: number;
}

export interface SeedData {
  /** Date ISO du dernier jour couvert par le jeu de données (= "aujourd'hui" simulé). */
  generatedThrough: string;
  accounts: Account[];
  tickets: Ticket[];
}

export type Period = 7 | 30 | 90;

export interface DateRange {
  /** Inclusif, ISO YYYY-MM-DD. */
  start: string;
  /** Inclusif, ISO YYYY-MM-DD. */
  end: string;
}
