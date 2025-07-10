import { Creature } from '@/types/creature'

const STORAGE_KEY = 'dnd_creature_data'

// Save creature data to localStorage
export const saveCreatureToStorage = (creature: Creature): void => {
  try {
    const existing = getStoredCreatures()
    const updated = existing.filter(c => c.id !== creature.id)
    updated.push(creature)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save creature to storage:', error)
  }
}

// Get all stored creatures
export const getStoredCreatures = (): Creature[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load creatures from storage:', error)
    return []
  }
}

// Get specific creature by ID
export const getStoredCreature = (id: number): Creature | null => {
  const creatures = getStoredCreatures()
  return creatures.find(c => c.id === id) || null
}

// Delete creature from storage
export const deleteCreatureFromStorage = (id: number): void => {
  try {
    const creatures = getStoredCreatures()
    const filtered = creatures.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete creature from storage:', error)
  }
}
