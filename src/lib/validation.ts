import { ABILITY_SCORE_MIN, ABILITY_SCORE_MAX } from '@/data/constants'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

// Validate ability score (1-1000)
export const validateAbilityScore = (value: number): ValidationResult => {
  if (isNaN(value)) {
    return { isValid: false, error: 'Must be a number' }
  }
  if (value < ABILITY_SCORE_MIN) {
    return { isValid: false, error: `Minimum value is ${ABILITY_SCORE_MIN}` }
  }
  if (value > ABILITY_SCORE_MAX) {
    return { isValid: false, error: `Maximum value is ${ABILITY_SCORE_MAX}` }
  }
  return { isValid: true }
}

// Validate AC (cannot be negative)
export const validateAC = (value: number): ValidationResult => {
  if (isNaN(value)) {
    return { isValid: false, error: 'Must be a number' }
  }
  if (value < 0) {
    return { isValid: false, error: 'Cannot be negative' }
  }
  return { isValid: true }
}

// Validate HP (cannot be negative) 
export const validateHP = (value: string): ValidationResult => {
  // HP can be a number or dice notation like "8 (1d8+1)"
  if (!value.trim()) {
    return { isValid: false, error: 'HP is required' }
  }
  
  // Check if it starts with a number
  const numMatch = value.match(/^(\d+)/)
  if (!numMatch) {
    return { isValid: false, error: 'Must start with a number' }
  }
  
  const hpValue = parseInt(numMatch[1])
  if (hpValue < 0) {
    return { isValid: false, error: 'Cannot be negative' }
  }
  
  return { isValid: true }
}

// Validate creature name (not empty)
export const validateName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Name is required' }
  }
  return { isValid: true }
}
