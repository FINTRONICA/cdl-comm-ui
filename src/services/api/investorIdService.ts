import { IdService } from './developerIdService'

// Create an investor-specific instance of the ID service
const investorIdService = {
  generateNewId: () => IdService.getInstance().generateNewId('INV'),
  getCurrentId: () => IdService.getInstance().getCurrentId(),
  isIdUnique: (id: string) => IdService.getInstance().isIdUnique(id),
  clearAllIds: () => IdService.getInstance().clearAllIds(),
  getStats: () => IdService.getInstance().getStats(),
}

export { investorIdService }
