import { analyseChain, ChainInput } from './engine';
import type { QualityProfile, Cable, Amplifier } from './types/domain';
import type { SignalNode } from './types/domain';

/**
 * Creates a deep clone of the chain and replaces the target cable's properties in the db,
 * and points the node to use that candidate.
 */
function cloneAndReplaceCable(chain: ChainInput, targetNodeSlug: string, candidate: Cable): ChainInput {
  const clone = JSON.parse(JSON.stringify(chain)) as ChainInput;

  // Insert the candidate into the DB so the engine can look it up
  clone.db.cables[candidate.slug] = { ...candidate };

  function traverse(node: SignalNode) {
    // A node in this physics model *is* the cable + speaker combo.
    if (node.slug === targetNodeSlug) {
      node.cableId = candidate.slug;
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  clone.roots.forEach(traverse);
  return clone;
}

/**
 * Suggest replacement cables that satisfy the quality profile for a specific failing node run.
 * (The node's cableId is what failed).
 */
export function suggestCables(
  chain: ChainInput,
  failingNodeSlug: string,
  quality: QualityProfile,
  catalog: Cable[]
): Cable[] {
  const suggestions: Cable[] = [];

  for (const candidate of catalog) {
    // 1. Swap the cable into a cloned tree
    const modifiedChain = cloneAndReplaceCable(chain, failingNodeSlug, candidate);
    
    // 2. Re-analyse
    const analysis = analyseChain(modifiedChain);
    
    // 3. Check if the target node now passes the drop criteria
    const result = analysis.get(failingNodeSlug);
    if (!result) continue;

    if ((result.results.dropPercent ?? 0) <= quality.maxDrop) {
      suggestions.push(candidate);
    }
  }

  return suggestions;
}

/**
 * Suggest replacement amplifiers that can safely drive the load.
 */
export function suggestAmps(
  requiredLoad: number, // The computed impedance (minLoad)
  requiredPower: number, // The computed total power draw
  systemMode: 'low-z' | '100V',
  catalog: Amplifier[]
): Amplifier[] {
  const suggestions: Amplifier[] = [];

  for (const amp of catalog) {
    if (systemMode === '100V') {
      if (amp.watt_100v && amp.watt_100v >= requiredPower) {
        suggestions.push(amp);
      }
    } else {
      // Low-Z
      const min = amp.min_load ?? 4; // Assume 4 ohms if unspecified
      if (requiredLoad >= min) {
        // Estimate power at this load
        let availablePower = 0;
        if (requiredLoad >= 8 && amp.watt_8) availablePower = amp.watt_8;
        else if (requiredLoad >= 4 && amp.watt_4) availablePower = amp.watt_4;
        else if (requiredLoad >= 2 && amp.watt_2) availablePower = amp.watt_2;
        
        // If the amp provides enough power at this impedance tier, it's a candidate
        if (availablePower >= requiredPower) {
          suggestions.push(amp);
        }
      }
    }
  }

  return suggestions;
}
