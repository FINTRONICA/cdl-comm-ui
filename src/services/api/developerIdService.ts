
import { generateId } from '@/utils';

export interface IdResponse {
  id: string;
  timestamp: Date;
  attempts: number;
}

export class IdService {
  private static instance: IdService;
  private generatedIds: Set<string> = new Set();
  private currentId: string | null = null;
  private generationAttempts: number = 0;

  private constructor() {}

  static getInstance(): IdService {
    if (!IdService.instance) {
      IdService.instance = new IdService();
    }
    return IdService.instance;
  }

  /**
   * Generates a new unique ID with specified prefix
   */
  generateNewId(prefix: string = 'DEV'): IdResponse {
    let newId: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      newId = generateId(prefix);
      attempts++;

      if (attempts > maxAttempts) {
        // Fallback to timestamp-based ID if too many attempts
        newId = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        break;
      }
    } while (this.generatedIds.has(newId));

    // Store the new ID
    this.generatedIds.add(newId);
    this.currentId = newId;
    this.generationAttempts = attempts;

    return {
      id: newId,
      timestamp: new Date(),
      attempts
    };
  }



  /**
   * Gets the current ID
   */
  getCurrentId(): string | null {
    return this.currentId;
  }

  /**
   * Validates if an ID is unique
   */
  isIdUnique(id: string): boolean {
    return !this.generatedIds.has(id);
  }

  /**
   * Clears all generated IDs (useful for testing or reset)
   */
  clearAllIds(): void {
    this.generatedIds.clear();
    this.currentId = null;
    this.generationAttempts = 0;
  }

  /**
   * Gets generation statistics
   */
  getStats(): { totalGenerated: number; currentId: string | null; lastAttempts: number } {
    return {
      totalGenerated: this.generatedIds.size,
      currentId: this.currentId,
      lastAttempts: this.generationAttempts
    };
  }
}

// Create the service instance
const idService = IdService.getInstance();

// Backward compatibility exports
export const developerIdService = {
  generateNewId: () => idService.generateNewId('DEV'),
  getCurrentId: () => idService.getCurrentId(),
  isIdUnique: (id: string) => idService.isIdUnique(id),
  clearAllIds: () => idService.clearAllIds(),
  getStats: () => idService.getStats()
};

// Export the main service for new usage
export { idService };