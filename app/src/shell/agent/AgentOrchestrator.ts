export interface MutationRequest {
  action: string;
  region: string;
  payload: any;
}

export interface OrchestrationResult {
  success: boolean;
  cost?: number;
  error?: string;
}

const VALID_REGIONS = ['EU-WEST', 'US-EAST', 'AP-SOUTH'];
const BASE_COST = 0.05; // Per mutation write

export class AgentOrchestrator {
  /**
   * Region Gate: Customer picks a region. Fail closed on missing/unknown.
   */
  static validateRegion(region: string): boolean {
    if (!region) return false;
    return VALID_REGIONS.includes(region.toUpperCase());
  }

  /**
   * Evaluates cost of a mutation at write time.
   */
  static calculateCost(action: string, payload: any): number {
    let multiplier = 1.0;
    if (action.includes('BULK') || action.includes('GRAPH')) {
      multiplier = 3.5;
    }
    return BASE_COST * multiplier;
  }

  /**
   * The BFF-side agent routing entrypoint.
   */
  static async orchestrateMutation(req: MutationRequest): Promise<OrchestrationResult> {
    if (!this.validateRegion(req.region)) {
      return {
        success: false,
        error: `Region Gate Failed: Unknown or missing region '${req.region}'. Failling closed.`
      };
    }

    const cost = this.calculateCost(req.action, req.payload);

    // Simulate successful routing to B199 (Ask Agent/Intelligence Rail)
    return {
      success: true,
      cost,
    };
  }
}
