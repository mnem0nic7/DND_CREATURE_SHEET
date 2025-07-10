// D&D 5e Constants for dropdowns and validation
import { SpeedEntry } from '@/types/creature'

export const CREATURE_SIZES = [
  'Tiny',
  'Small', 
  'Medium',
  'Large',
  'Huge',
  'Gargantuan'
] as const

export const CREATURE_TYPES = [
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead'
] as const

export const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good', 
  'Chaotic Good',
  'Lawful Neutral',
  'Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
  'Unaligned'
] as const

export const SPEED_TYPES = [
  'Walk',
  'Fly',
  'Swim',
  'Climb',
  'Burrow',
  'Hover'
] as const

export const ARMOR_TYPES = [
  'None',
  'Light Armor',
  'Medium Armor',
  'Heavy Armor',
  'Natural Armor'
] as const

export const ARMOR_SUBTYPES = {
  'None': ['Unarmored'],
  'Light Armor': ['Padded', 'Leather', 'Studded Leather'],
  'Medium Armor': ['Hide', 'Chain Shirt', 'Scale Mail', 'Breastplate', 'Half Plate'],
  'Heavy Armor': ['Ring Mail', 'Chain Mail', 'Splint', 'Plate'],
  'Natural Armor': []
} as const

export const ARMOR_BASE_AC = {
  'Unarmored': 10,
  // Light Armor
  'Padded': 11,
  'Leather': 11,
  'Studded Leather': 12,
  // Medium Armor  
  'Hide': 12,
  'Chain Shirt': 13,
  'Scale Mail': 14,
  'Breastplate': 14,
  'Half Plate': 15,
  // Heavy Armor
  'Ring Mail': 14,
  'Chain Mail': 16,
  'Splint': 17,
  'Plate': 18
} as const

export const ABILITY_SCORE_MIN = 1
export const ABILITY_SCORE_MAX = 1000

// D&D 5e Ability Score Modifier calculation
export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2)
}

// Format modifier with + or - sign
export const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

// Calculate AC based on armor type, subtype, DEX modifier, and additional modifiers
export const calculateArmorClass = (
  dexScore: number, 
  armorType: string, 
  armorSubtype: string, 
  armorModifier: number = 0,
  hasShield: boolean = false,
  shieldModifier: number = 0,
  hasMageArmor: boolean = false
): number => {
  const dexMod = getAbilityModifier(dexScore)
  
  // For Natural Armor, we need a base AC value - use 10 + any armor modifier as default
  let baseAC = 10
  if (armorType !== 'Natural Armor') {
    baseAC = ARMOR_BASE_AC[armorSubtype as keyof typeof ARMOR_BASE_AC] || 10
  }
  
  // Note: Mage Armor is for display only and doesn't affect calculation
  
  // Apply DEX modifier based on armor type
  let finalAC = baseAC
  
  if (armorType === 'None' || armorType === 'Light Armor' || armorType === 'Natural Armor') {
    // Full DEX modifier
    finalAC += dexMod
  } else if (armorType === 'Medium Armor') {
    // DEX modifier capped at +2
    finalAC += Math.min(dexMod, 2)
  } else if (armorType === 'Heavy Armor') {
    // No DEX modifier
    // finalAC remains baseAC
  }
  
  // Add armor modifier (magical bonuses, etc.)
  finalAC += armorModifier
  
  // Add shield bonus with modifier (base +2 plus modifier)
  if (hasShield) {
    finalAC += 2 + shieldModifier
  }
  
  return Math.max(1, finalAC)
}

// Legacy function for backward compatibility
export const calculateAC = (dexScore: number): number => {
  return calculateArmorClass(dexScore, 'None', 'Unarmored')
}

// Calculate HP based on CON modifier and hit dice
export const calculateHP = (conScore: number, hitDiceCount: number = 1, hitDiceType: string = 'd8'): number => {
  const conModifier = getAbilityModifier(conScore)
  
  // Parse hit dice type (remove 'd' if present)
  const diceSize = parseInt(hitDiceType.replace('d', ''))
  
  // Calculate average HP: (hitDiceCount * (diceSize + 1) / 2) + (hitDiceCount * conModifier)
  const averageRoll = (diceSize + 1) / 2
  const totalHP = Math.floor(hitDiceCount * averageRoll) + (hitDiceCount * conModifier)
  
  return Math.max(1, totalHP)
}

// Format HP display string
export const formatHP = (hp: number, hitDiceCount: number, hitDiceType: string, conModifier: number): string => {
  const modifierStr = formatModifier(conModifier * hitDiceCount)
  return `${hp} (${hitDiceCount}${hitDiceType}${modifierStr})`
}

// Title case formatter
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

// Parse legacy speed string into SpeedEntry array
export const parseLegacySpeed = (speedStr: string): SpeedEntry[] => {
  if (!speedStr) return [{ type: 'Walk', distance: '30 ft.' }]
  
  // If it's already a simple format like "30 ft.", treat as walk speed
  if (/^\d+\s*ft\.?$/.test(speedStr.trim())) {
    return [{ type: 'Walk', distance: speedStr }]
  }
  
  // Handle complex speed strings like "30 ft., fly 60 ft., swim 30 ft."
  const speeds: SpeedEntry[] = []
  const parts = speedStr.split(',').map(s => s.trim())
  
  for (const part of parts) {
    if (part.includes('fly')) {
      const distance = part.replace(/fly\s*/i, '').trim()
      speeds.push({ type: 'Fly', distance })
    } else if (part.includes('swim')) {
      const distance = part.replace(/swim\s*/i, '').trim()
      speeds.push({ type: 'Swim', distance })
    } else if (part.includes('climb')) {
      const distance = part.replace(/climb\s*/i, '').trim()
      speeds.push({ type: 'Climb', distance })
    } else if (part.includes('burrow')) {
      const distance = part.replace(/burrow\s*/i, '').trim()
      speeds.push({ type: 'Burrow', distance })
    } else if (part.includes('hover')) {
      const distance = part.replace(/hover\s*/i, '').trim()
      speeds.push({ type: 'Hover', distance })
    } else {
      // Default to walk speed
      speeds.push({ type: 'Walk', distance: part })
    }
  }
  
  return speeds.length > 0 ? speeds : [{ type: 'Walk', distance: '30 ft.' }]
}

// Convert SpeedEntry array back to legacy speed string
export const formatSpeedString = (speeds: SpeedEntry[]): string => {
  if (!speeds || speeds.length === 0) return '30 ft.'
  
  return speeds.map(speed => {
    const type = speed.type.toLowerCase()
    if (type === 'walk') {
      return speed.distance
    } else {
      return `${type} ${speed.distance}`
    }
  }).join(', ')
}
