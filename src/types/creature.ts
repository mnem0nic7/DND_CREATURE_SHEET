export interface Creature {
  id: number
  name: string
  type: string
  cr: string
  size: string
  ac: string
  hp: string
  speed: string
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
  savingThrows?: string[]
  skills?: string[]
  damageResistances?: string[]
  damageImmunities?: string[]
  conditionImmunities?: string[]
  senses?: string[]
  languages?: string[]
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
