import { SearchItem, RerankOptions } from "./types";

/**
 * Evaluates single token match score against an item's fields.
 */
function scoreSingleToken(token: string, item: SearchItem): number {
  const code = (item.code || item.id || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const subtitle = (item.subtitle || "").toLowerCase();
  const type = (item.type || "").toLowerCase();
  const keywords = (item.keywords || []).map((k) => k.toLowerCase());

  // 1. Exact match (1.0 - 0.98)
  if (code === token) return 1.0;
  if (title === token) return 0.98;

  let maxScore = 0.0;

  // 2. Prefix match (0.95 - 0.88)
  if (code.startsWith(token)) {
    const score = 0.95 - (code.length - token.length) * 0.005;
    maxScore = Math.max(maxScore, Math.max(score, 0.90));
  }
  if (title.startsWith(token)) {
    const score = 0.92 - (title.length - token.length) * 0.003;
    maxScore = Math.max(maxScore, Math.max(score, 0.87));
  }

  // Word boundary match in title & subtitle
  const titleWords = title.split(/[\s\-_/\\.:,]+/);
  for (let i = 0; i < titleWords.length; i++) {
    const w = titleWords[i];
    if (!w) continue;
    if (w === token) {
      maxScore = Math.max(maxScore, 0.90 - i * 0.02);
    } else if (w.startsWith(token)) {
      maxScore = Math.max(maxScore, 0.88 - i * 0.02 - (w.length - token.length) * 0.005);
    }
  }

  const subWords = subtitle.split(/[\s\-_/\\.:,]+/);
  for (let i = 0; i < subWords.length; i++) {
    const w = subWords[i];
    if (!w) continue;
    if (w === token) {
      maxScore = Math.max(maxScore, 0.80 - i * 0.01);
    } else if (w.startsWith(token)) {
      maxScore = Math.max(maxScore, 0.75 - (w.length - token.length) * 0.005);
    }
  }

  // 3. Acronym / Initials matching (0.85)
  if (titleWords.length > 1 && token.length <= titleWords.length) {
    let acronym = "";
    for (const w of titleWords) {
      if (w && w.length > 0) acronym += w[0];
    }
    if (acronym.startsWith(token)) {
      maxScore = Math.max(maxScore, 0.85 - (acronym.length - token.length) * 0.02);
    }
  }

  // 4. Substring match (0.82 - 0.60)
  const codeIdx = code.indexOf(token);
  if (codeIdx !== -1) {
    const score = 0.82 - codeIdx * 0.02 - (code.length - token.length) * 0.002;
    maxScore = Math.max(maxScore, Math.max(score, 0.70));
  }

  const titleIdx = title.indexOf(token);
  if (titleIdx !== -1) {
    const score = 0.78 - titleIdx * 0.01 - (title.length - token.length) * 0.001;
    maxScore = Math.max(maxScore, Math.max(score, 0.68));
  }

  for (const kw of keywords) {
    if (kw === token) {
      maxScore = Math.max(maxScore, 0.76);
    } else if (kw.startsWith(token)) {
      maxScore = Math.max(maxScore, 0.74);
    } else if (kw.includes(token)) {
      maxScore = Math.max(maxScore, 0.70);
    }
  }

  if (type.includes(token)) {
    maxScore = Math.max(maxScore, 0.72);
  }

  if (subtitle.includes(token)) {
    const subIdx = subtitle.indexOf(token);
    const score = 0.65 - subIdx * 0.005;
    maxScore = Math.max(maxScore, Math.max(score, 0.50));
  }

  // 5. Fuzzy walk (0.30 - 0.58)
  if (maxScore < 0.60 && token.length >= 2) {
    const fuzzyScore = computeFuzzySubsequence(token, title, code);
    if (fuzzyScore > maxScore) {
      maxScore = fuzzyScore;
    }
  }

  return maxScore;
}

function computeFuzzySubsequence(query: string, title: string, code: string): number {
  const scoreTitle = scoreFuzzyWalk(query, title);
  const scoreCode = scoreFuzzyWalk(query, code);
  return Math.max(scoreTitle, scoreCode);
}

function scoreFuzzyWalk(query: string, target: string): number {
  if (!target || target.length < query.length) return 0;

  let qIdx = 0;
  let firstMatchIdx = -1;
  let lastMatchIdx = -1;
  let consecutiveMatches = 0;
  let maxConsecutive = 0;

  for (let tIdx = 0; tIdx < target.length && qIdx < query.length; tIdx++) {
    if (target[tIdx] === query[qIdx]) {
      if (firstMatchIdx === -1) firstMatchIdx = tIdx;
      lastMatchIdx = tIdx;
      qIdx++;
      consecutiveMatches++;
      if (consecutiveMatches > maxConsecutive) maxConsecutive = consecutiveMatches;
    } else {
      consecutiveMatches = 0;
    }
  }

  if (qIdx < query.length) return 0;

  const span = lastMatchIdx - firstMatchIdx + 1;
  const coverage = query.length / span;
  const leadPenalty = firstMatchIdx * 0.01;
  const consecutiveBonus = (maxConsecutive / query.length) * 0.1;

  const baseScore = 0.40 * coverage + consecutiveBonus - leadPenalty;
  return Math.max(0.15, Math.min(0.58, baseScore));
}

/**
 * uFuzzy-inspired unified single-scale scoring technique.
 * Scores all items (entities, actions, nav, recent) onto a uniform [0.0, 1.0] scale.
 */
export function computeMatchScore(
  query: string,
  item: SearchItem,
  options?: RerankOptions
): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1.0;

  const tokens = q.split(/\s+/).filter((t) => Boolean(t) && t.length > 0);
  if (tokens.length === 1 && tokens[0]) {
    let score = scoreSingleToken(tokens[0], item);
    if (options?.typeBonus && options.typeBonus[item.type]) {
      score += options.typeBonus[item.type]!;
    }
    return Math.min(1.0, Math.max(0.0, score));
  }

  // Multi-token scoring
  let totalTokenScore = 0;
  let matchedTokens = 0;

  for (const token of tokens) {
    if (!token) continue;
    const tScore = scoreSingleToken(token, item);
    if (tScore >= 0.20) {
      matchedTokens++;
      totalTokenScore += tScore;
    }
  }

  if (matchedTokens === 0) return 0.0;

  const fullTitle = (item.title || "").toLowerCase();
  const fullCode = (item.code || item.id || "").toLowerCase();
  const fullSubtitle = (item.subtitle || "").toLowerCase();

  let phraseBonus = 0;
  if (fullTitle.includes(q) || fullCode.includes(q)) {
    phraseBonus = 0.15;
  } else if (fullSubtitle.includes(q)) {
    phraseBonus = 0.08;
  }

  const coverage = matchedTokens / tokens.length;
  const avgScore = totalTokenScore / tokens.length;
  let finalScore = (avgScore * coverage * 0.85) + phraseBonus;

  if (options?.typeBonus && options.typeBonus[item.type]) {
    finalScore += options.typeBonus[item.type]!;
  }

  return Math.min(1.0, Math.max(0.0, finalScore));
}

/**
 * Unified rerank pass: ranks all candidate items against query on the exact same scale.
 */
export function rerankItems(
  query: string,
  items: SearchItem[],
  options?: RerankOptions
): SearchItem[] {
  const q = query.trim();
  const minScore = options?.minScore ?? (q.length > 0 ? 0.20 : 0.0);
  const limit = options?.limit ?? 50;

  const scored: SearchItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    const score = computeMatchScore(q, item, options);

    if (score >= minScore) {
      scored.push({
        id: item.id,
        type: item.type,
        title: item.title,
        subtitle: item.subtitle,
        code: item.code,
        keywords: item.keywords,
        category: item.category,
        url: item.url,
        action: item.action,
        icon: item.icon,
        metadata: item.metadata,
        score: Math.round(score * 1000) / 1000,
      });
    }
  }

  // Sort descending by score, tie-break by shorter title length, then alphabetical
  scored.sort((a, b) => {
    const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
    if (Math.abs(scoreDiff) > 0.0001) {
      return scoreDiff;
    }
    const lenDiff = (a.title || "").length - (b.title || "").length;
    if (lenDiff !== 0) return lenDiff;
    return (a.title || "").localeCompare(b.title || "");
  });

  return scored.slice(0, limit);
}
