// ─── Utility Functions & AI Hooks ───────────────────────────────────
import { UserVector, TraitKey, TraitDelta, Scenario, ScenarioCategory } from '../types';

const TRAIT_KEYS: TraitKey[] = ['sociability', 'humor', 'risk', 'emotion', 'conflict', 'stability'];
const CATEGORY_DIVERSITY_BONUS = 8;
const CATEGORY_REPEAT_PENALTY = 2.4;
const FOCUS_TRAIT_SCARCITY_BONUS = 6;
const SIGNAL_SPREAD_WEIGHT = 1.35;
const TOP_RECOMMENDATION_POOL = 3;
const RECENT_SCENARIO_WINDOW = 6;
const QUESTION_SIMILARITY_PENALTY_WEIGHT = 18;

// ─── Profile Calculation ────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Updates a user vector based on trait deltas from a selected answer.
 * Each answer impacts specific traits with weighted values.
 */
export function calculateProfile(
  currentVector: UserVector,
  deltas: TraitDelta
): UserVector {
  const updated = { ...currentVector };
  for (const key of Object.keys(deltas) as TraitKey[]) {
    updated[key] = clamp(updated[key] + (deltas[key] ?? 0));
  }
  return updated;
}

// ─── Cosine Similarity ─────────────────────────────────────────────

/**
 * Computes cosine similarity between two user vectors.
 * Returns a value between -1 and 1, where 1 = identical direction.
 */
export function cosineSimilarity(a: UserVector, b: UserVector): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of TRAIT_KEYS) {
    dotProduct += a[key] * b[key];
    magnitudeA += a[key] * a[key];
    magnitudeB += b[key] * b[key];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Converts cosine similarity (-1 to 1) to a 0-100% score.
 */
export function similarityToPercent(similarity: number): number {
  return Math.round(((similarity + 1) / 2) * 100);
}

// ─── AI Hooks (Future Integration) ─────────────────────────────────

/**
 * FUTURE AI HOOK: Returns the next scenario based on user vector.
 * Currently returns scenarios in order, but this abstraction layer
 * allows easy replacement with an adaptive AI algorithm later.
 *
 * Future implementation:
 * - Analyze user vector gaps (low-confidence traits)
 * - Select scenarios that maximize information gain
 * - Adapt difficulty/category based on engagement metrics
 * - Connect to backend API for ML-driven selection
 */
function getTraitUncertainty(value: number): number {
  return 100 - Math.abs(value - 50) * 2;
}

function normalizeQuestionText(question: string): string {
  return question
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getQuestionTokenSet(question: string): Set<string> {
  return new Set(normalizeQuestionText(question).split(/\s+/).filter(Boolean));
}

function getQuestionSimilarity(left: string, right: string): number {
  const leftTokens = getQuestionTokenSet(left);
  const rightTokens = getQuestionTokenSet(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

function getAnsweredCategoryCounts(
  answeredIds: Set<string>,
  allScenarios: Scenario[]
): Record<ScenarioCategory, number> {
  return allScenarios.reduce(
    (counts, scenario) => {
      if (answeredIds.has(scenario.id)) {
        counts[scenario.category] += 1;
      }
      return counts;
    },
    {
      Social: 0,
      Absurd: 0,
      Values: 0,
      Relationship: 0,
    } as Record<ScenarioCategory, number>
  );
}

function getAnsweredFocusTraitCounts(
  answeredIds: Set<string>,
  allScenarios: Scenario[],
  userVector: UserVector
): Record<TraitKey, number> {
  return allScenarios.reduce(
    (counts, scenario) => {
      if (answeredIds.has(scenario.id)) {
        const focusTrait = getScenarioFocusTrait(scenario, userVector);
        counts[focusTrait] += 1;
      }
      return counts;
    },
    {
      sociability: 0,
      humor: 0,
      risk: 0,
      emotion: 0,
      conflict: 0,
      stability: 0,
    } as Record<TraitKey, number>
  );
}

function getScenarioTraitScore(scenario: Scenario, key: TraitKey, userVector: UserVector): number {
  const averageImpact =
    scenario.choices.reduce((sum, choice) => sum + Math.abs(choice.traitDeltas[key] ?? 0), 0) /
    scenario.choices.length;

  const uncertainty = getTraitUncertainty(userVector[key]) / 100;
  return averageImpact * (1 + uncertainty);
}

function getScenarioFocusTrait(scenario: Scenario, userVector: UserVector): TraitKey {
  let bestTrait = TRAIT_KEYS[0];
  let bestScore = -1;

  for (const key of TRAIT_KEYS) {
    const score = getScenarioTraitScore(scenario, key, userVector);
    if (score > bestScore) {
      bestScore = score;
      bestTrait = key;
    }
  }

  return bestTrait;
}

function getScenarioSignalSpread(scenario: Scenario): number {
  return TRAIT_KEYS.reduce((sum, key) => {
    const values = scenario.choices.map((choice) => choice.traitDeltas[key] ?? 0);
    return sum + (Math.max(...values) - Math.min(...values));
  }, 0) / TRAIT_KEYS.length;
}

function getQuestionReadabilityScore(scenario: Scenario, answeredCount: number): number {
  const questionLength = scenario.question.length;
  const preferredLength = answeredCount < 8 ? 118 : answeredCount < 18 ? 145 : 178;
  const deviation = Math.abs(questionLength - preferredLength);

  return Math.max(-4, 4 - deviation / 28);
}

function getRecentAnsweredScenarios(
  answeredIds: Set<string>,
  allScenarios: Scenario[],
  limit = RECENT_SCENARIO_WINDOW
): Scenario[] {
  const recentIds = Array.from(answeredIds).slice(-limit);

  if (recentIds.length === 0) {
    return [];
  }

  const scenarioById = new Map(allScenarios.map((scenario) => [scenario.id, scenario]));
  return recentIds
    .map((scenarioId) => scenarioById.get(scenarioId))
    .filter((scenario): scenario is Scenario => Boolean(scenario));
}

function getQuestionNoveltyPenalty(scenario: Scenario, recentAnsweredScenarios: Scenario[]): number {
  if (recentAnsweredScenarios.length === 0) {
    return 0;
  }

  const similarities = recentAnsweredScenarios
    .map((recentScenario) => getQuestionSimilarity(scenario.question, recentScenario.question))
    .sort((first, second) => second - first);

  const strongestSimilarity = similarities[0] ?? 0;
  const secondSimilarity = similarities[1] ?? 0;

  return strongestSimilarity * QUESTION_SIMILARITY_PENALTY_WEIGHT + secondSimilarity * 6;
}

function scoreScenario(
  scenario: Scenario,
  userVector: UserVector,
  answeredCategoryCounts: Record<ScenarioCategory, number>,
  answeredFocusTraitCounts: Record<TraitKey, number>,
  answeredCount: number,
  recentAnsweredScenarios: Scenario[]
): number {
  const traitScore = TRAIT_KEYS.reduce(
    (sum, key) => sum + getScenarioTraitScore(scenario, key, userVector),
    0
  );
  const focusTrait = getScenarioFocusTrait(scenario, userVector);
  const categoryCount = answeredCategoryCounts[scenario.category] ?? 0;
  const minCategoryCount = Math.min(...Object.values(answeredCategoryCounts));
  const categoryGap = categoryCount - minCategoryCount;
  const categoryBonus = Math.max(0, CATEGORY_DIVERSITY_BONUS - categoryGap * CATEGORY_REPEAT_PENALTY);
  const focusTraitCount = answeredFocusTraitCounts[focusTrait] ?? 0;
  const minFocusTraitCount = Math.min(...Object.values(answeredFocusTraitCounts));
  const focusTraitGap = focusTraitCount - minFocusTraitCount;
  const focusTraitBonus = Math.max(0, FOCUS_TRAIT_SCARCITY_BONUS - focusTraitGap * 2);
  const signalSpreadBonus = getScenarioSignalSpread(scenario) * SIGNAL_SPREAD_WEIGHT;
  const readabilityBonus = getQuestionReadabilityScore(scenario, answeredCount);
  const noveltyPenalty = getQuestionNoveltyPenalty(scenario, recentAnsweredScenarios);

  return traitScore + categoryBonus + focusTraitBonus + signalSpreadBonus + readabilityBonus - noveltyPenalty;
}

export function getRecommendedScenarios(
  userVector: UserVector,
  answeredIds: Set<string>,
  allScenarios: Scenario[],
  skippedIds: Set<string> = new Set()
): Scenario[] {
  const answeredCategoryCounts = getAnsweredCategoryCounts(answeredIds, allScenarios);
  const answeredFocusTraitCounts = getAnsweredFocusTraitCounts(answeredIds, allScenarios, userVector);
  const answeredCount = answeredIds.size;
  const recentAnsweredScenarios = getRecentAnsweredScenarios(answeredIds, allScenarios);

  const unansweredRanked = allScenarios
    .filter((scenario) => !answeredIds.has(scenario.id))
    .map((scenario, index) => ({
      scenario,
      index,
      score: scoreScenario(
        scenario,
        userVector,
        answeredCategoryCounts,
        answeredFocusTraitCounts,
        answeredCount,
        recentAnsweredScenarios
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.scenario);

  const prioritized = unansweredRanked.filter((scenario) => !skippedIds.has(scenario.id));
  return prioritized.length > 0 ? prioritized : unansweredRanked;
}

export function getNextScenario(
  userVector: UserVector,
  answeredIds: Set<string>,
  allScenarios: Scenario[],
  skippedIds: Set<string> = new Set()
): Scenario | null {
  const recommended = getRecommendedScenarios(userVector, answeredIds, allScenarios, skippedIds);

  if (recommended.length === 0) return null;

  const poolSize = answeredIds.size < 6 ? 1 : Math.min(TOP_RECOMMENDATION_POOL, recommended.length);
  return recommended[answeredIds.size % poolSize] ?? recommended[0];
}

export function getScenarioSelectionHint(
  scenario: Scenario,
  userVector: UserVector,
  answeredIds: Set<string>,
  allScenarios: Scenario[]
): { focusTrait: TraitKey; title: string; detail: string } {
  const focusTrait = getScenarioFocusTrait(scenario, userVector);
  const answeredCategoryCounts = getAnsweredCategoryCounts(answeredIds, allScenarios);
  const categoryCount = answeredCategoryCounts[scenario.category] ?? 0;
  const categoryLead =
    categoryCount === 0
      ? `Premiere exploration du registre ${scenario.category.toLowerCase()}.`
      : `Question choisie pour affiner ${TRAIT_LABELS[focusTrait].toLowerCase()}.`;

  return {
    focusTrait,
    title: TRAIT_LABELS[focusTrait],
    detail: `${categoryLead} Les reponses possibles donnent un signal utile sur cette dimension.`,
  };
}

/**
 * FUTURE AI HOOK: Fetch scenarios from API.
 * Currently returns null (use local data).
 * Replace with actual API call when backend is ready.
 */
export async function fetchScenariosFromAPI(
  _userVector: UserVector
): Promise<Scenario[] | null> {
  // ─── FUTURE: Replace with actual API call ───
  // const response = await fetch(`${API_BASE}/scenarios`, {
  //   method: 'POST',
  //   body: JSON.stringify({ userVector }),
  // });
  // return response.json();
  // ─────────────────────────────────────────────
  return null;
}

// ─── Trait Analysis ─────────────────────────────────────────────────

const TRAIT_LABELS: Record<TraitKey, string> = {
  sociability: 'Approche sociale',
  humor: 'Humour',
  risk: 'Tolérance au risque',
  emotion: 'Réactivité émotionnelle',
  conflict: 'Gestion des conflits',
  stability: 'Stabilité',
};

/**
 * Generates human-readable compatibility reasons between two vectors.
 */
export function generateCompatibilityReasons(
  userVector: UserVector,
  matchVector: UserVector
): string[] {
  const reasons: string[] = [];

  for (const key of TRAIT_KEYS) {
    const diff = Math.abs(userVector[key] - matchVector[key]);

    if (diff < 15) {
      reasons.push(`${TRAIT_LABELS[key]} similaire`);
    } else if (Math.abs(userVector[key] + matchVector[key] - 100) < 20) {
      reasons.push(`${TRAIT_LABELS[key]} complémentaire`);
    }
  }

  return reasons.slice(0, 3);
}

/**
 * Returns the dominant trait from a user vector.
 */
export function getDominantTrait(vector: UserVector): { key: TraitKey; label: string; value: number } {
  let best: TraitKey = TRAIT_KEYS[0];

  for (const key of TRAIT_KEYS) {
    if (vector[key] > vector[best]) best = key;
  }

  return { key: best, label: TRAIT_LABELS[best], value: vector[best] };
}

function getNameInitial(name: string): string {
  const stripped = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const match = stripped.match(/[A-Za-z0-9]/);
  return (match?.[0] ?? 'U').toUpperCase();
}

export function getAvatarMonogram(name: string, avatar?: string): string {
  const trimmedAvatar = (avatar ?? '').trim();

  if (/^[A-Za-z0-9]$/.test(trimmedAvatar)) {
    return trimmedAvatar.toUpperCase();
  }

  return getNameInitial(name);
}

export { TRAIT_LABELS };
