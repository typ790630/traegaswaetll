import { ChainService } from './ChainService'
import { ActivityItem } from '../types'

// Simulation of an Indexer Service (like The Graph or Etherscan API)
// This service manages blockchain activity history.

// In-memory mock database for simulation
// In a real app, this would be queried from an API endpoint
const DB: {
  activities: Record<string, ActivityItem[]> // userAddress -> activities
} = {
  activities: {}
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const ActivityService = {
  // Initialize user activity list if empty
  initUser: (address: string) => {
    if (!DB.activities[address]) {
      DB.activities[address] = []
    }
    return DB.activities[address]
  },

  // Fetch activities (Simulate API GET)
  getActivities: async (address: string): Promise<ActivityItem[]> => {
    // 1. Fetch real activities from chain (RADRS + USDT + ...)
    const realActivities = await ChainService.getAllActivity(address)
    
    // 2. Fetch mock activities
    ActivityService.initUser(address)
    const mockActivities = DB.activities[address]

    // 3. Merge: Prefer real activities over mock if hash matches (deduplication)
    const all = [...realActivities, ...mockActivities]
    
    // Remove duplicates by hash if any
    const unique = Array.from(new Map(all.map(item => [item.hash, item])).values())
    
    return unique.sort((a, b) => b.timestamp - a.timestamp)
  },

  // Add new activity (Simulate Indexer catching a new event)
  addActivity: async (address: string, activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> => {
    await delay(300)
    ActivityService.initUser(address)
    
    const newActivity: ActivityItem = {
      ...activity,
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      // Ensure date is present, if not provided in omit (though type says it is, let's just handle it safely)
    }

    DB.activities[address].unshift(newActivity)
    return newActivity
  },

  // Clear activities (for testing)
  clearActivities: (address: string) => {
    DB.activities[address] = []
  }
}
