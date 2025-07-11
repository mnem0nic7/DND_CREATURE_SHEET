// D&D 5e Constants for dropdowns and validation
import { SpeedEntry, SenseEntry } from '@/types/creature'

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

export const SAVING_THROWS = [
  'Strength',
  'Dexterity', 
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma'
] as const

export const SKILLS = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival'
] as const

export const SENSE_TYPES = [
  'Blindsight',
  'Darkvision',
  'Tremorsense',
  'Truesight',
  'Passive Perception'
] as const

export const LANGUAGES = [
  'None',
  'Common',
  'Dwarvish',
  'Elvish',
  'Giant',
  'Gnomish',
  'Goblin',
  'Halfling',
  'Orc',
  'Abyssal',
  'Celestial',
  'Draconic',
  'Deep Speech',
  'Infernal',
  'Primordial',
  'Sylvan',
  'Undercommon',
  'Thieves\' Cant'
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

// Calculate saving throw bonus
export const calculateSavingThrowBonus = (
  abilityScore: number,
  proficient: boolean = false,
  expertise: boolean = false,
  proficiencyBonus: number = 2
): number => {
  const abilityMod = getAbilityModifier(abilityScore)
  let bonus = abilityMod
  
  if (proficient) {
    bonus += proficiencyBonus
  }
  
  if (expertise) {
    bonus += proficiencyBonus // Expertise adds proficiency bonus again
  }
  
  return bonus
}

// Get ability score from creature based on saving throw name
export const getAbilityScoreForSavingThrow = (creature: any, savingThrow: string): number => {
  const abilityMap: { [key: string]: string } = {
    'Strength': 'str',
    'Dexterity': 'dex', 
    'Constitution': 'con',
    'Intelligence': 'int',
    'Wisdom': 'wis',
    'Charisma': 'cha'
  }
  
  const abilityKey = abilityMap[savingThrow]
  return creature[abilityKey] || 10
}

// Calculate skill bonus
export const calculateSkillBonus = (
  abilityScore: number,
  proficient: boolean = false,
  expertise: boolean = false,
  proficiencyBonus: number = 2
): number => {
  const abilityMod = getAbilityModifier(abilityScore)
  let bonus = abilityMod
  
  if (proficient) {
    bonus += proficiencyBonus
  }
  
  if (expertise) {
    bonus += proficiencyBonus // Expertise adds proficiency bonus again
  }
  
  return bonus
}

// Get ability score from creature based on skill name
export const getAbilityScoreForSkill = (creature: any, skill: string): number => {
  const skillAbilityMap: { [key: string]: string } = {
    'Acrobatics': 'dex',
    'Animal Handling': 'wis',
    'Arcana': 'int',
    'Athletics': 'str',
    'Deception': 'cha',
    'History': 'int',
    'Insight': 'wis',
    'Intimidation': 'cha',
    'Investigation': 'int',
    'Medicine': 'wis',
    'Nature': 'int',
    'Perception': 'wis',
    'Performance': 'cha',
    'Persuasion': 'cha',
    'Religion': 'int',
    'Sleight of Hand': 'dex',
    'Stealth': 'dex',
    'Survival': 'wis'
  }
  
  const abilityKey = skillAbilityMap[skill]
  return creature[abilityKey] || 10
}

// Calculate passive perception based on Wisdom and Perception skill proficiency
export const calculatePassivePerception = (
  wisdomScore: number,
  perceptionProficient: boolean = false,
  perceptionExpertise: boolean = false,
  proficiencyBonus: number = 2
): number => {
  const basePassive = 10 + getAbilityModifier(wisdomScore)
  
  if (perceptionProficient) {
    return basePassive + proficiencyBonus + (perceptionExpertise ? proficiencyBonus : 0)
  }
  
  return basePassive
}

// Parse legacy senses string into structured format
export const parseLegacySenses = (sensesString: string): SenseEntry[] => {
  if (!sensesString) return [{ type: 'Passive Perception', range: 10, isCalculated: true }]
  
  const senseEntries: SenseEntry[] = []
  const parts = sensesString.split(',').map(s => s.trim())
  
  for (const part of parts) {
    if (part.toLowerCase().includes('passive perception')) {
      const match = part.match(/(\d+)/)
      if (match) {
        senseEntries.push({
          type: 'Passive Perception',
          range: parseInt(match[1]),
          isCalculated: false // Legacy entries are manual
        })
      }
    } else if (part.toLowerCase().includes('blindsight')) {
      const match = part.match(/(\d+)/)
      if (match) {
        senseEntries.push({
          type: 'Blindsight',
          range: parseInt(match[1]),
          isCalculated: false
        })
      }
    } else if (part.toLowerCase().includes('darkvision')) {
      const match = part.match(/(\d+)/)
      if (match) {
        senseEntries.push({
          type: 'Darkvision',
          range: parseInt(match[1]),
          isCalculated: false
        })
      }
    } else if (part.toLowerCase().includes('tremorsense')) {
      const match = part.match(/(\d+)/)
      if (match) {
        senseEntries.push({
          type: 'Tremorsense',
          range: parseInt(match[1]),
          isCalculated: false
        })
      }
    } else if (part.toLowerCase().includes('truesight')) {
      const match = part.match(/(\d+)/)
      if (match) {
        senseEntries.push({
          type: 'Truesight',
          range: parseInt(match[1]),
          isCalculated: false
        })
      }
    }
  }
  
  // If no passive perception found, add calculated one
  if (!senseEntries.some(s => s.type === 'Passive Perception')) {
    senseEntries.push({
      type: 'Passive Perception',
      range: 10,
      isCalculated: true
    })
  }
  
  return senseEntries
}

// Format senses entries back to string
export const formatSensesString = (senseEntries: SenseEntry[]): string => {
  if (!senseEntries || senseEntries.length === 0) return 'Passive Perception 10'
  
  const formattedSenses = senseEntries
    .filter(sense => sense.type && (sense.range || sense.range === 0))
    .map(sense => {
      if (sense.type === 'Passive Perception') {
        return `Passive Perception ${sense.range}`
      } else {
        return `${sense.type} ${sense.range} ft.`
      }
    })
  
  return formattedSenses.join(', ') || 'Passive Perception 10'
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
  if (!speedStr) return [{ type: '', distance: 30 }]
  
  // If it's already a simple format like "30 ft.", treat as walk speed
  if (/^\d+\s*ft\.?$/.test(speedStr.trim())) {
    const distance = parseInt(speedStr.replace(/\D/g, '')) || 30
    return [{ type: 'Walk', distance }]
  }
  
  // Handle complex speed strings like "30 ft., fly 60 ft., swim 30 ft."
  const speeds: SpeedEntry[] = []
  const parts = speedStr.split(',').map(s => s.trim())
  
  for (const part of parts) {
    if (part.includes('fly')) {
      const distance = parseInt(part.replace(/fly\s*/i, '').replace(/\D/g, '')) || 30
      speeds.push({ type: 'Fly', distance })
    } else if (part.includes('swim')) {
      const distance = parseInt(part.replace(/swim\s*/i, '').replace(/\D/g, '')) || 30
      speeds.push({ type: 'Swim', distance })
    } else if (part.includes('climb')) {
      const distance = parseInt(part.replace(/climb\s*/i, '').replace(/\D/g, '')) || 30
      speeds.push({ type: 'Climb', distance })
    } else if (part.includes('burrow')) {
      const distance = parseInt(part.replace(/burrow\s*/i, '').replace(/\D/g, '')) || 30
      speeds.push({ type: 'Burrow', distance })
    } else if (part.includes('hover')) {
      const distance = parseInt(part.replace(/hover\s*/i, '').replace(/\D/g, '')) || 30
      speeds.push({ type: 'Hover', distance })
    } else {
      // Default to walk speed
      const distance = parseInt(part.replace(/\D/g, '')) || 30
      speeds.push({ type: 'Walk', distance })
    }
  }
  
  return speeds.length > 0 ? speeds : [{ type: '', distance: 30 }]
}

// Convert SpeedEntry array back to legacy speed string
export const formatSpeedString = (speeds: SpeedEntry[]): string => {
  if (!speeds || speeds.length === 0) return '30 ft.'
  
  return speeds
    .filter(speed => speed.type && speed.type !== '' && speed.distance > 0)
    .map(speed => {
      const type = speed.type.toLowerCase()
      if (type === 'walk') {
        return `${speed.distance} ft.`
      } else {
        return `${type} ${speed.distance} ft.`
      }
    }).join(', ') || '30 ft.'
}

// Parse legacy languages string into LanguageEntry array
export const parseLegacyLanguages = (languagesStr: string): import('@/types/creature').LanguageEntry[] => {
  if (!languagesStr) return []
  
  // Split by commas and clean up
  const languages = languagesStr.split(',').map(lang => lang.trim()).filter(lang => lang)
  
  return languages.map(language => ({ language }))
}

// Convert LanguageEntry array back to legacy languages string
export const formatLanguagesString = (languages: import('@/types/creature').LanguageEntry[]): string => {
  if (!languages || languages.length === 0) return ''
  
  // Filter out empty languages but keep "None" if explicitly selected
  const validLanguages = languages
    .filter(lang => lang.language && (lang.language.trim() !== '' || lang.language === 'None'))
    .map(lang => lang.language)
  
  // If the only language is "None", return "—" for display
  if (validLanguages.length === 1 && validLanguages[0] === 'None') {
    return '—'
  }
  
  // Filter out "None" when there are other languages
  return validLanguages
    .filter(lang => lang !== 'None')
    .join(', ')
}
