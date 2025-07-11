// D&D 5e Traits System - Comprehensive trait database with categories and templates

export interface TraitEffect {
  type: 'language' | 'sense' | 'speed' | 'damage_immunity' | 'damage_resistance' | 'condition_immunity' | 'skill_advantage' | 'saving_throw_advantage' | 'ac_bonus' | 'hp_regeneration' | 'spell_immunity' | 'custom'
  value?: string | number
  requiresInput?: boolean
  inputPrompt?: string
  inputType?: 'text' | 'number' | 'select'
  options?: string[]
}

export interface TraitTemplate {
  name: string
  description: string
  category: string
  effects?: TraitEffect[]
  dynamicDescription?: boolean // If true, description will be updated based on user inputs
}

// Trait Categories for organization
export const TRAIT_CATEGORIES = [
  'Movement & Positioning',
  'Combat & Damage',
  'Magical & Supernatural',
  'Sensory & Perception',
  'Environmental & Elemental',
  'Social & Mental',
  'Physical Form & Biology',
  'Defensive & Protective',
  'Racial & Heritage',
  'Specialized Abilities'
] as const

// Comprehensive D&D 5e Trait Templates
export const TRAIT_TEMPLATES: Record<string, TraitTemplate> = {
  // Movement & Positioning
  'amphibious': {
    name: 'Amphibious',
    description: 'The creature can breathe air and water.',
    category: 'Movement & Positioning',
    effects: [
      {
        type: 'speed',
        value: 'swim',
        requiresInput: true,
        inputPrompt: 'Swimming speed (in feet)',
        inputType: 'number'
      }
    ]
  },
  'flyby': {
    name: 'Flyby',
    description: 'The creature doesn\'t provoke opportunity attacks when it flies out of an enemy\'s reach.',
    category: 'Movement & Positioning'
  },
  'incorporeal_movement': {
    name: 'Incorporeal Movement',
    description: 'The creature can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object.',
    category: 'Movement & Positioning'
  },
  'spider_climb': {
    name: 'Spider Climb',
    description: 'The creature can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.',
    category: 'Movement & Positioning',
    effects: [
      {
        type: 'speed',
        value: 'climb',
        requiresInput: true,
        inputPrompt: 'Climbing speed (in feet, usually equal to walking speed)',
        inputType: 'number'
      }
    ]
  },
  'water_breathing': {
    name: 'Water Breathing',
    description: 'The creature can breathe only underwater.',
    category: 'Movement & Positioning'
  },

  // Combat & Damage
  'aggressive': {
    name: 'Aggressive',
    description: 'As a bonus action, the creature can move up to its speed toward a hostile creature that it can see.',
    category: 'Combat & Damage'
  },
  'blood_frenzy': {
    name: 'Blood Frenzy',
    description: 'The creature has advantage on melee attack rolls against any creature that doesn\'t have all its hit points.',
    category: 'Combat & Damage',
    effects: [
      {
        type: 'skill_advantage',
        value: 'melee_attacks_vs_wounded'
      }
    ]
  },
  'charge': {
    name: 'Charge',
    description: 'If the creature moves at least [distance] feet straight toward a target and then hits it with a [attack] attack on the same turn, the target takes an extra [damage] damage. If the target is a creature, it must succeed on a DC [dc] Strength saving throw or be knocked prone.',
    category: 'Combat & Damage',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Minimum charge distance (feet)',
        inputType: 'number'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Attack type (e.g., "ram", "gore", "claw")',
        inputType: 'text'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Extra damage (e.g., "7 (2d6)", "9 (2d8)")',
        inputType: 'text'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Save DC',
        inputType: 'number'
      }
    ]
  },
  'keen_sight': {
    name: 'Keen Sight',
    description: 'The creature has advantage on Wisdom (Perception) checks that rely on sight.',
    category: 'Combat & Damage',
    effects: [
      {
        type: 'skill_advantage',
        value: 'perception_sight'
      }
    ]
  },
  'pack_tactics': {
    name: 'Pack Tactics',
    description: 'The creature has advantage on an attack roll against a creature if at least one of the creature\'s allies is within 5 feet of the creature and the ally isn\'t incapacitated.',
    category: 'Combat & Damage'
  },
  'pounce': {
    name: 'Pounce',
    description: 'If the creature moves at least [distance] feet straight toward a creature and then hits it with a [attack] attack on the same turn, that target must succeed on a DC [dc] Strength saving throw or be knocked prone. If the target is prone, the creature can make one [bonus_attack] attack against it as a bonus action.',
    category: 'Combat & Damage',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Minimum pounce distance (feet)',
        inputType: 'number'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Initial attack type (e.g., "claw", "bite")',
        inputType: 'text'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Save DC',
        inputType: 'number'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Bonus action attack type (e.g., "bite", "claw")',
        inputType: 'text'
      }
    ]
  },
  'reckless': {
    name: 'Reckless',
    description: 'At the start of its turn, the creature can gain advantage on all melee weapon attack rolls during that turn, but attack rolls against it have advantage until the start of its next turn.',
    category: 'Combat & Damage'
  },

  // Magical & Supernatural
  'antimagic_susceptibility': {
    name: 'Antimagic Susceptibility',
    description: 'The creature is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the creature must succeed on a Constitution saving throw against the caster\'s spell save DC or fall unconscious for 1 minute.',
    category: 'Magical & Supernatural'
  },
  'false_appearance': {
    name: 'False Appearance',
    description: 'While the creature remains motionless, it is indistinguishable from a normal [object_type].',
    category: 'Magical & Supernatural',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'What object does it resemble? (e.g., "tree", "statue", "pile of bones")',
        inputType: 'text'
      }
    ]
  },
  'magic_resistance': {
    name: 'Magic Resistance',
    description: 'The creature has advantage on saving throws against spells and other magical effects.',
    category: 'Magical & Supernatural',
    effects: [
      {
        type: 'saving_throw_advantage',
        value: 'spells_and_magic'
      }
    ]
  },
  'magic_weapons': {
    name: 'Magic Weapons',
    description: 'The creature\'s weapon attacks are magical.',
    category: 'Magical & Supernatural'
  },
  'spell_immunity': {
    name: 'Spell Immunity',
    description: 'The creature is immune to [spells].',
    category: 'Magical & Supernatural',
    dynamicDescription: true,
    effects: [
      {
        type: 'spell_immunity',
        requiresInput: true,
        inputPrompt: 'Which spells is it immune to? (e.g., "charm person", "hold person", "all enchantment spells of 3rd level or lower")',
        inputType: 'text'
      }
    ]
  },
  'spellcasting': {
    name: 'Spellcasting',
    description: 'The creature is a [caster_level] spellcaster. Its spellcasting ability is [ability] (spell save DC [dc], [bonus] to hit with spell attacks).',
    category: 'Magical & Supernatural',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Caster level (e.g., "5th-level", "18th-level")',
        inputType: 'text'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Spellcasting ability',
        inputType: 'select',
        options: ['Intelligence', 'Wisdom', 'Charisma']
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Spell save DC',
        inputType: 'number'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Spell attack bonus (with + sign, e.g., "+7")',
        inputType: 'text'
      }
    ]
  },

  // Sensory & Perception
  'blindsight': {
    name: 'Blindsight',
    description: 'The creature can perceive its surroundings without relying on sight, within [range] feet.',
    category: 'Sensory & Perception',
    dynamicDescription: true,
    effects: [
      {
        type: 'sense',
        value: 'Blindsight',
        requiresInput: true,
        inputPrompt: 'Blindsight range (in feet)',
        inputType: 'number'
      }
    ]
  },
  'echolocation': {
    name: 'Echolocation',
    description: 'The creature can\'t use its blindsight while deafened.',
    category: 'Sensory & Perception'
  },
  'keen_hearing': {
    name: 'Keen Hearing',
    description: 'The creature has advantage on Wisdom (Perception) checks that rely on hearing.',
    category: 'Sensory & Perception',
    effects: [
      {
        type: 'skill_advantage',
        value: 'perception_hearing'
      }
    ]
  },
  'keen_smell': {
    name: 'Keen Smell',
    description: 'The creature has advantage on Wisdom (Perception) checks that rely on smell.',
    category: 'Sensory & Perception',
    effects: [
      {
        type: 'skill_advantage',
        value: 'perception_smell'
      }
    ]
  },

  // Environmental & Elemental
  'fire_immunity': {
    name: 'Fire Immunity',
    description: 'The creature is immune to fire damage.',
    category: 'Environmental & Elemental',
    effects: [
      {
        type: 'damage_immunity',
        value: 'fire'
      }
    ]
  },
  'cold_immunity': {
    name: 'Cold Immunity',
    description: 'The creature is immune to cold damage.',
    category: 'Environmental & Elemental',
    effects: [
      {
        type: 'damage_immunity',
        value: 'cold'
      }
    ]
  },
  'heated_body': {
    name: 'Heated Body',
    description: 'A creature that touches the creature or hits it with a melee attack while within 5 feet of it takes [damage] fire damage.',
    category: 'Environmental & Elemental',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Fire damage amount (e.g., "5 (1d10)", "3", "7 (2d6)")',
        inputType: 'text'
      }
    ]
  },
  'water_susceptibility': {
    name: 'Water Susceptibility',
    description: 'For every 5 feet the creature moves in water, or for every gallon of water splashed on it, it takes [damage] cold damage.',
    category: 'Environmental & Elemental',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Cold damage per 5 feet/gallon (e.g., "1", "2", "1d4")',
        inputType: 'text'
      }
    ]
  },

  // Social & Mental
  'telepathic_bond': {
    name: 'Telepathic Bond',
    description: 'The creature can communicate telepathically with other creatures within [range] feet.',
    category: 'Social & Mental',
    dynamicDescription: true,
    effects: [
      {
        type: 'language',
        value: 'Telepathy',
        requiresInput: true,
        inputPrompt: 'Telepathic range (in feet)',
        inputType: 'number'
      }
    ]
  },
  'mimicry': {
    name: 'Mimicry',
    description: 'The creature can mimic [sounds_type] it has heard, including voices. A creature that hears the sounds can tell they are imitations with a successful DC [dc] Wisdom (Insight) check.',
    category: 'Social & Mental',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'What sounds can it mimic? (e.g., "simple sounds such as animal noises", "any sounds", "humanoid voices")',
        inputType: 'text'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Insight DC to detect mimicry',
        inputType: 'number'
      }
    ]
  },

  // Physical Form & Biology
  'amorphous': {
    name: 'Amorphous',
    description: 'The creature can move through a space as narrow as 1 inch wide without squeezing.',
    category: 'Physical Form & Biology'
  },
  'immutable_form': {
    name: 'Immutable Form',
    description: 'The creature is immune to any spell or effect that would alter its form.',
    category: 'Physical Form & Biology',
    effects: [
      {
        type: 'condition_immunity',
        value: 'shape_change'
      }
    ]
  },
  'regeneration': {
    name: 'Regeneration',
    description: 'The creature regains [hp_amount] hit points at the start of its turn. If the creature takes [damage_types] damage, this trait doesn\'t function at the start of the creature\'s next turn. The creature dies only if it starts its turn with 0 hit points and doesn\'t regenerate.',
    category: 'Physical Form & Biology',
    dynamicDescription: true,
    effects: [
      {
        type: 'hp_regeneration',
        requiresInput: true,
        inputPrompt: 'HP regenerated per turn (e.g., "10", "5", "15")',
        inputType: 'number'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Damage types that stop regeneration (e.g., "fire or radiant", "cold", "necrotic")',
        inputType: 'text'
      }
    ]
  },

  // Defensive & Protective
  'damage_transfer': {
    name: 'Damage Transfer',
    description: 'While attached to a creature, the creature takes only half the damage dealt to it, and the attached creature takes the other half.',
    category: 'Defensive & Protective'
  },
  'turn_resistance': {
    name: 'Turn Resistance',
    description: 'The creature has advantage on saving throws against any effect that turns undead.',
    category: 'Defensive & Protective',
    effects: [
      {
        type: 'saving_throw_advantage',
        value: 'turn_undead'
      }
    ]
  },

  // Racial & Heritage
  'fey_ancestry': {
    name: 'Fey Ancestry',
    description: 'The creature has advantage on saving throws against being charmed, and magic can\'t put the creature to sleep.',
    category: 'Racial & Heritage',
    effects: [
      {
        type: 'saving_throw_advantage',
        value: 'charmed'
      },
      {
        type: 'condition_immunity',
        value: 'magical_sleep'
      }
    ]
  },
  'undead_fortitude': {
    name: 'Undead Fortitude',
    description: 'If damage reduces the creature to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the creature drops to 1 hit point instead.',
    category: 'Racial & Heritage'
  },

  // Specialized Abilities
  'legendary_resistance': {
    name: 'Legendary Resistance',
    description: 'If the creature fails a saving throw, it can choose to succeed instead ([uses]/Day).',
    category: 'Specialized Abilities',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Number of uses per day (usually 3)',
        inputType: 'number'
      }
    ]
  },
  'siege_monster': {
    name: 'Siege Monster',
    description: 'The creature deals double damage to objects and structures.',
    category: 'Specialized Abilities'
  },
  'tunneler': {
    name: 'Tunneler',
    description: 'The creature can burrow through solid rock at half its burrow speed and leaves a tunnel in its wake.',
    category: 'Specialized Abilities',
    effects: [
      {
        type: 'speed',
        value: 'burrow',
        requiresInput: true,
        inputPrompt: 'Burrowing speed (in feet)',
        inputType: 'number'
      }
    ]
  },

  // Additional Advanced Traits
  'damage_absorption': {
    name: 'Damage Absorption',
    description: 'Whenever the creature is subjected to [damage_type] damage, it takes no damage and instead regains a number of hit points equal to the [damage_type] damage dealt.',
    category: 'Defensive & Protective',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Damage type absorbed (e.g., "fire", "cold", "necrotic")',
        inputType: 'text'
      }
    ]
  },

  'frightful_presence': {
    name: 'Frightful Presence',
    description: 'Each creature of the creature\'s choice that is within [range] feet of the creature and aware of it must succeed on a DC [dc] Wisdom saving throw or become frightened for 1 minute.',
    category: 'Social & Mental',
    dynamicDescription: true,
    effects: [
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Frightful presence range (in feet)',
        inputType: 'number'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Wisdom save DC',
        inputType: 'number'
      }
    ]
  },

  'elemental_body': {
    name: 'Elemental Body',
    description: 'The creature is immune to [damage_type] damage. Additionally, when a creature touches the creature or hits it with a melee attack while within 5 feet of it, that creature takes [damage] [damage_type] damage.',
    category: 'Environmental & Elemental',
    dynamicDescription: true,
    effects: [
      {
        type: 'damage_immunity',
        requiresInput: true,
        inputPrompt: 'Damage type for immunity (e.g., "fire", "cold", "lightning")',
        inputType: 'text'
      },
      {
        type: 'custom',
        requiresInput: true,
        inputPrompt: 'Contact damage amount (e.g., "5 (1d10)", "7 (2d6)")',
        inputType: 'text'
      }
    ]
  }
}

// Helper functions for trait management
export const getTraitsByCategory = (category: string): TraitTemplate[] => {
  return Object.values(TRAIT_TEMPLATES).filter(trait => trait.category === category)
}

export const getAllTraitNames = (): string[] => {
  return Object.keys(TRAIT_TEMPLATES)
}

export const searchTraits = (query: string): TraitTemplate[] => {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return []
  
  const queryWords = lowerQuery.split(/\s+/)
  
  return Object.values(TRAIT_TEMPLATES).filter(trait => {
    const traitText = `${trait.name} ${trait.description} ${trait.category}`.toLowerCase()
    
    // Check if all query words are found in the trait text
    return queryWords.every(word => traitText.includes(word))
  }).sort((a, b) => {
    // Sort by relevance: exact name match first, then partial name match, then description match
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const queryLower = lowerQuery
    
    // Exact name match
    if (aName === queryLower) return -1
    if (bName === queryLower) return 1
    
    // Name starts with query
    if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1
    if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1
    
    // Name contains query
    if (aName.includes(queryLower) && !bName.includes(queryLower)) return -1
    if (bName.includes(queryLower) && !aName.includes(queryLower)) return 1
    
    // Alphabetical order
    return aName.localeCompare(bName)
  })
}

export const getTraitTemplate = (traitKey: string): TraitTemplate | undefined => {
  return TRAIT_TEMPLATES[traitKey]
}

// Generate dynamic description based on user inputs
export const generateDynamicDescription = (
  template: TraitTemplate,
  userInputs: Record<string, any>
): string => {
  if (!template.dynamicDescription || !template.effects) {
    return template.description
  }

  let description = template.description
  const placeholders = description.match(/\[(\w+)\]/g) || []
  
  placeholders.forEach((placeholder, index) => {
    const key = placeholder.slice(1, -1) // Remove brackets
    const value = userInputs[key] || userInputs[`input_${index}`] || placeholder
    description = description.replace(placeholder, value)
  })

  return description
}

// Apply trait effects to creature data
export const applyTraitEffects = (
  creatureData: any,
  trait: TraitTemplate,
  userInputs: Record<string, any>
): any => {
  if (!trait.effects) return creatureData

  let updatedCreature = { ...creatureData }

  trait.effects.forEach((effect, index) => {
    switch (effect.type) {
      case 'language':
        if (effect.value === 'Telepathy') {
          const range = userInputs[`input_${index}`] || userInputs.range || 120
          const telepathyLanguage = `Telepathy ${range} ft.`
          updatedCreature.languageEntries = [
            ...(updatedCreature.languageEntries || []),
            { language: telepathyLanguage, isCustom: true }
          ]
        } else if (effect.value) {
          updatedCreature.languageEntries = [
            ...(updatedCreature.languageEntries || []),
            { language: effect.value, isCustom: true }
          ]
        }
        break

      case 'sense':
        if (effect.value && effect.requiresInput) {
          const range = userInputs[`input_${index}`] || userInputs.range || 60
          updatedCreature.senseEntries = [
            ...(updatedCreature.senseEntries || []),
            { type: effect.value, range: range, isCalculated: false }
          ]
        }
        break

      case 'speed':
        if (effect.value && effect.requiresInput) {
          const speed = userInputs[`input_${index}`] || userInputs.speed || 30
          updatedCreature.speedEntries = [
            ...(updatedCreature.speedEntries || []),
            { type: effect.value, distance: speed }
          ]
        }
        break

      case 'damage_immunity':
        if (effect.value) {
          updatedCreature.damageImmunities = [
            ...(updatedCreature.damageImmunities || []),
            effect.value
          ]
        }
        break

      case 'damage_resistance':
        if (effect.value) {
          updatedCreature.damageResistances = [
            ...(updatedCreature.damageResistances || []),
            effect.value
          ]
        }
        break

      case 'condition_immunity':
        if (effect.value) {
          updatedCreature.conditionImmunities = [
            ...(updatedCreature.conditionImmunities || []),
            effect.value
          ]
        }
        break

      default:
        // Custom effects are handled in the trait description
        break
    }
  })

  return updatedCreature
}

// Get required inputs for a trait
export const getRequiredInputs = (trait: TraitTemplate): TraitEffect[] => {
  if (!trait.effects) return []
  return trait.effects.filter(effect => effect.requiresInput)
}

// Validate user inputs for a trait
export const validateTraitInputs = (
  trait: TraitTemplate,
  userInputs: Record<string, any>
): { isValid: boolean; errors: string[] } => {
  const requiredInputs = getRequiredInputs(trait)
  const errors: string[] = []

  requiredInputs.forEach((input, index) => {
    const inputKey = `input_${index}`
    const value = userInputs[inputKey]

    if (value === undefined || value === null || value === '') {
      errors.push(`${input.inputPrompt || 'Input'} is required`)
      return
    }

    if (input.inputType === 'number') {
      const numValue = Number(value)
      if (isNaN(numValue) || numValue < 0) {
        errors.push(`${input.inputPrompt || 'Input'} must be a valid positive number`)
      }
    }

    if (input.inputType === 'select' && input.options) {
      if (!input.options.includes(value)) {
        errors.push(`${input.inputPrompt || 'Input'} must be one of: ${input.options.join(', ')}`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}
