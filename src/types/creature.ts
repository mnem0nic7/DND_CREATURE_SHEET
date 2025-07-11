export interface SpeedEntry {
  type: string
  distance: number
}

export interface SenseEntry {
  type: string
  range: number
  isCalculated: boolean
}

export interface SavingThrowEntry {
  ability: string
  proficient: boolean
  expertise: boolean
  override: boolean
  overrideValue?: number
}

export interface SkillEntry {
  skill: string
  proficient: boolean
  expertise: boolean
  override: boolean
  overrideValue?: number
}

export interface LanguageEntry {
  language: string
}

export interface Creature {
  id: number
  name: string
  type: string
  cr: string
  size: string
  alignment?: string
  ac: string
  armorType?: string
  armorSubtype?: string
  armorModifier?: number
  hasShield?: boolean
  shieldModifier?: number
  hasMageArmor?: boolean
  hp: string
  hitDiceCount?: number
  hitDiceType?: string
  speed: string
  speeds?: SpeedEntry[]
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
  savingThrows?: string[] // Legacy format for compatibility
  savingThrowEntries?: SavingThrowEntry[] // New structured format
  skills?: string[] // Legacy format for compatibility
  skillEntries?: SkillEntry[] // New structured format
  damageResistances?: string[]
  damageImmunities?: string[]
  conditionImmunities?: string[]
  senses?: string[] // Legacy format for compatibility
  senseEntries?: SenseEntry[] // New structured format
  sensesExplainer?: string // Optional explainer for senses
  languages?: string[] // Legacy format for compatibility
  languageEntries?: LanguageEntry[] // New structured format
  specialAbilities?: SpecialAbility[]
  actions?: Action[]
  legendaryActions?: LegendaryAction[]
}

export interface SpecialAbility {
  name: string
  description: string
}

export interface Action {
  name: string
  description: string
  attackBonus?: number
  damage?: string
  range?: string
}

export interface LegendaryAction {
  name: string
  description: string
  cost?: number
}

export interface CreatureFilter {
  type: string
  cr: string
  size: string
}

export type CreatureType = 
  | 'Aberration'
  | 'Beast'
  | 'Celestial'
  | 'Construct'
  | 'Dragon'
  | 'Elemental'
  | 'Fey'
  | 'Fiend'
  | 'Giant'
  | 'Humanoid'
  | 'Monstrosity'
  | 'Ooze'
  | 'Plant'
  | 'Undead'

export type CreatureSize = 
  | 'Tiny'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Huge'
  | 'Gargantuan'
