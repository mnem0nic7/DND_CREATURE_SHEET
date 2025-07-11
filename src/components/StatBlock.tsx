import { Creature, SpeedEntry, SavingThrowEntry, SkillEntry, SenseEntry, LanguageEntry } from '@/types/creature'
import { TraitTemplate } from '@/data/traits'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { 
  CREATURE_SIZES, 
  CREATURE_TYPES, 
  ALIGNMENTS,
  ARMOR_TYPES,
  ARMOR_SUBTYPES,
  SPEED_TYPES,
  SENSE_TYPES,
  LANGUAGES,
  SAVING_THROWS,
  SKILLS,
  ACTION_TYPES,
  ACTION_TEMPLATES,
  TRAIT_CATEGORIES,
  TRAIT_TEMPLATES,
  getTraitsByCategory,
  searchTraits,
  generateDynamicDescription,
  applyTraitEffects,
  getRequiredInputs,
  validateTraitInputs,
  getAbilityModifier,
  formatModifier,
  calculateAC,
  calculateArmorClass,
  calculateHP,
  formatHP,
  toTitleCase,
  parseLegacySpeed,
  formatSpeedString,
  parseLegacySenses,
  formatSensesString,
  parseLegacyLanguages,
  formatLanguagesString,
  calculatePassivePerception,
  calculateSavingThrowBonus,
  getAbilityScoreForSavingThrow,
  calculateSkillBonus,
  getAbilityScoreForSkill
} from '@/data/constants'
import { 
  validateAbilityScore, 
  validateAC, 
  validateHP, 
  validateName,
  ValidationResult 
} from '@/lib/validation'
import { saveCreatureToStorage } from '@/lib/storage'

interface StatBlockProps {
  creature: Creature
}

interface EditState {
  section1: boolean
  section2: boolean
  section3: boolean
  section4: boolean
  section5: boolean
}

interface ErrorState {
  [key: string]: string
}

export function StatBlock({ creature }: StatBlockProps) {
  const [editMode, setEditMode] = useState<EditState>({
    section1: false,
    section2: false,
    section3: false,
    section4: false,
    section5: false
  })

  const [creatureData, setCreatureData] = useState<Creature>(creature)
  const [errors, setErrors] = useState<ErrorState>({})

  // Trait selection state
  const [traitSelectionStep, setTraitSelectionStep] = useState<'category' | 'trait' | 'search' | 'inputs' | null>(null)
  const [selectedTraitCategory, setSelectedTraitCategory] = useState<string>('')
  const [selectedTraitKey, setSelectedTraitKey] = useState<string>('')
  const [traitUserInputs, setTraitUserInputs] = useState<Record<string, any>>({})
  const [traitSearchQuery, setTraitSearchQuery] = useState<string>('')
  const [traitSearchResults, setTraitSearchResults] = useState<TraitTemplate[]>([])

  const [overrideAC, setOverrideAC] = useState(false)
  const [overrideHP, setOverrideHP] = useState(false)
  const [showCustomType, setShowCustomType] = useState(false)
  const [preEditData, setPreEditData] = useState<Creature>(creature)
  const [customACExplainer, setCustomACExplainer] = useState('')
  const [customHPExplainer, setCustomHPExplainer] = useState('')
  const [customSensesExplainer, setCustomSensesExplainer] = useState(creature.sensesExplainer || '')
  const [speeds, setSpeeds] = useState<SpeedEntry[]>(() => {
    // Initialize speeds only once when component mounts
    if (creature.speeds) {
      return creature.speeds
    } else if (creature.speed) {
      return parseLegacySpeed(creature.speed)
    } else {
      // Start with empty/placeholder speed that requires user selection
      return [{ type: '', distance: 30 }]
    }
  })
  const [customSpeedTypes, setCustomSpeedTypes] = useState<string[]>([])
  const [speedsInitialized, setSpeedsInitialized] = useState(false)
  const [savingThrowEntries, setSavingThrowEntries] = useState<SavingThrowEntry[]>(() => {
    // Initialize saving throws - check if creature has structured saving throws, otherwise empty
    if (creature.savingThrowEntries) {
      return creature.savingThrowEntries
    }
    // Initialize with empty array - user can add saving throws as needed
    return []
  })
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>(() => {
    // Initialize skills - check if creature has structured skills, otherwise empty
    if (creature.skillEntries) {
      return creature.skillEntries
    }
    // Initialize with empty array - user can add skills as needed
    return []
  })
  const [senses, setSenses] = useState<SenseEntry[]>(() => {
    // Initialize senses - prioritize structured senses, then parse legacy
    if (creature.senseEntries) {
      return creature.senseEntries
    } else if (creature.senses && creature.senses.length > 0) {
      return parseLegacySenses(creature.senses.join(', '))
    } else {
      // Start with calculated passive perception
      return [{ type: 'Passive Perception', range: 10, isCalculated: true }]
    }
  })
  const [customSenseTypes, setCustomSenseTypes] = useState<string[]>([])
  const [sensesInitialized, setSensesInitialized] = useState(false)
  const [languages, setLanguages] = useState<LanguageEntry[]>(() => {
    // Initialize languages - prioritize structured languages, then parse legacy
    if (creature.languageEntries) {
      return creature.languageEntries
    } else if (creature.languages && creature.languages.length > 0) {
      return parseLegacyLanguages(creature.languages.join(', '))
    } else {
      // Start with Common language
      return [{ language: 'Common' }]
    }
  })
  const [customLanguages, setCustomLanguages] = useState<string[]>([])
  const [languagesInitialized, setLanguagesInitialized] = useState(false)
  const [duplicateLanguageError, setDuplicateLanguageError] = useState<string>('')

  // Initialize armor fields if not present
  useEffect(() => {
    if (!creatureData.armorType || !creatureData.armorSubtype) {
      setCreatureData(prev => ({
        ...prev,
        armorType: prev.armorType || 'None',
        armorSubtype: prev.armorSubtype || 'Unarmored',
        armorModifier: prev.armorModifier || 0,
        hasShield: prev.hasShield || false,
        shieldModifier: prev.shieldModifier || 0,
        hasMageArmor: prev.hasMageArmor || false,
        hitDiceCount: prev.hitDiceCount || 1,
        hitDiceType: prev.hitDiceType || 'd8'
      }))
    }
  }, [])

  // Refs for auto-focus and click detection
  const firstInputRefs = {
    section1: useRef<HTMLInputElement>(null),
    section2: useRef<HTMLInputElement>(null),
    section3: useRef<HTMLInputElement>(null),
    section4: useRef<HTMLInputElement>(null),
    section5: useRef<HTMLInputElement>(null)
  }

  // Refs for section containers
  const sectionRefs = {
    section1: useRef<HTMLDivElement>(null),
    section2: useRef<HTMLDivElement>(null),
    section3: useRef<HTMLDivElement>(null),
    section4: useRef<HTMLDivElement>(null),
    section5: useRef<HTMLDivElement>(null)
  }

  // Auto-focus when entering edit mode
  useEffect(() => {
    Object.entries(editMode).forEach(([section, isEditing]) => {
      if (isEditing) {
        const ref = firstInputRefs[section as keyof typeof firstInputRefs]
        ref.current?.focus()
      }
    })
  }, [editMode])

  // Auto-recalculate AC and HP when ability scores or armor change
  useEffect(() => {
    if (!overrideAC) {
      const newAC = calculateArmorClass(
        creatureData.dex,
        creatureData.armorType || 'None',
        creatureData.armorSubtype || 'Unarmored',
        creatureData.armorModifier || 0,
        creatureData.hasShield || false,
        creatureData.shieldModifier || 0,
        creatureData.hasMageArmor || false
      ).toString()
      setCreatureData(prev => ({ ...prev, ac: newAC }))
    }
    if (!overrideHP) {
      const newHP = calculateHP(
        creatureData.con, 
        creatureData.hitDiceCount || 1, 
        creatureData.hitDiceType || 'd8'
      )
      // Store just the HP number, not the formatted string with dice
      setCreatureData(prev => ({ ...prev, hp: newHP.toString() }))
    }
  }, [creatureData.dex, creatureData.con, creatureData.armorType, creatureData.armorSubtype, creatureData.armorModifier, creatureData.hasShield, creatureData.shieldModifier, creatureData.hasMageArmor, creatureData.hitDiceCount, creatureData.hitDiceType, overrideAC, overrideHP])

  // Save to localStorage whenever creature data changes
  useEffect(() => {
    saveCreatureToStorage(creatureData)
  }, [creatureData])

  // Check if current type is custom (not in predefined list)
  useEffect(() => {
    const isCustomType = !!(creatureData.type && 
      !CREATURE_TYPES.some(type => type.toLowerCase() === creatureData.type.toLowerCase()) &&
      creatureData.type !== 'Type') // Don't show custom for default placeholder
    setShowCustomType(isCustomType)
  }, [creatureData.type])

  // Handle clicks outside of sections to close edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const activeSection = Object.keys(editMode).find(key => editMode[key as keyof EditState])
      
      if (activeSection) {
        const sectionRef = sectionRefs[activeSection as keyof typeof sectionRefs]
        if (sectionRef.current && !sectionRef.current.contains(target)) {
          // Click outside the active section - close it
          setEditMode(prev => ({ ...prev, [activeSection]: false }))
          setErrors({})
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editMode])

  // Helper function to format type display (title case for predefined, as-is for custom)
  const formatTypeDisplay = (type: string) => {
    if (!type || type === 'Type') return type
    const isPredefinedType = CREATURE_TYPES.some(predefinedType => 
      predefinedType.toLowerCase() === type.toLowerCase()
    )
    return isPredefinedType ? toTitleCase(type) : type
  }

  // Helper function to handle custom explainer input (remove parentheses if user adds them)
  const handleCustomExplainerChange = (value: string, setter: (value: string) => void) => {
    let cleanValue = value
    // Always remove parentheses if user adds them at beginning and/or end
    if (cleanValue.startsWith('(')) {
      cleanValue = cleanValue.slice(1)
    }
    if (cleanValue.endsWith(')')) {
      cleanValue = cleanValue.slice(0, -1)
    }
    // Limit to 100 characters
    cleanValue = cleanValue.slice(0, 100)
    setter(cleanValue)
  }

  const toggleEditMode = (section: keyof EditState, forceClose: boolean = false) => {
    // If section is already in edit mode and forceClose is false, do nothing (stay in edit mode)
    if (editMode[section] && !forceClose) {
      return
    }
    
    // Store current data before editing
    if (!editMode[section]) {
      setPreEditData(creatureData)
    }
    
    // Only one section can be in edit mode at a time
    const newEditMode = {
      section1: false,
      section2: false,
      section3: false,
      section4: false,
      section5: false,
      [section]: !editMode[section]
    }
    setEditMode(newEditMode)
    
    // Clear errors when exiting edit mode
    if (editMode[section]) {
      setErrors({})
    }
  }

  // Handle section clicks - enter edit mode only if not already in edit mode
  const handleSectionClick = (section: keyof EditState, event: React.MouseEvent) => {
    if (!editMode[section]) {
      // Section is not in edit mode, enter edit mode
      toggleEditMode(section)
    }
    // If already in edit mode, let the click propagate to focus inputs
  }

  const handleKeyDown = (e: React.KeyboardEvent, section: keyof EditState) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      toggleEditMode(section, true) // Force close on Enter
    } else if (e.key === 'Escape') {
      e.preventDefault()
      // Reset to pre-edit data and exit edit mode
      setCreatureData(preEditData)
      setEditMode(prev => ({ ...prev, [section]: false }))
      setErrors({})
    }
  }

  const validateAndUpdate = (field: string, value: any): boolean => {
    let validation: ValidationResult

    switch (field) {
      case 'name':
        validation = validateName(value)
        break
      case 'str':
      case 'dex':
      case 'con':
      case 'int':
      case 'wis':
      case 'cha':
        validation = validateAbilityScore(parseInt(value))
        break
      case 'ac':
        validation = validateAC(parseInt(value))
        break
      case 'hp':
        // When HP override is enabled, validate as number only
        if (overrideHP) {
          validation = validateAC(parseInt(value)) // Use AC validation for number-only
        } else {
          validation = validateHP(value)
        }
        break
      default:
        validation = { isValid: true }
    }

    if (validation.isValid) {
      setErrors(prev => ({ ...prev, [field]: '' }))
      setCreatureData(prev => ({ ...prev, [field]: value }))
      return true
    } else {
      setErrors(prev => ({ ...prev, [field]: validation.error || 'Invalid input' }))
      return false
    }
  }

  const addAction = (actionType: keyof typeof ACTION_TEMPLATES = 'Custom Action') => {
    const template = ACTION_TEMPLATES[actionType]
    const newAction = {
      name: template.name,
      description: template.description
    }
    setCreatureData(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction]
    }))
  }

  const removeAction = (index: number) => {
    setCreatureData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }))
  }

  const updateAction = (index: number, field: 'name' | 'description', value: string) => {
    setCreatureData(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      ) || []
    }))
  }

  // Speed management functions
  const addSpeed = () => {
    const newSpeed: SpeedEntry = { type: 'Walk', distance: 30 }
    setSpeeds(prev => [...prev, newSpeed])
  }

  const removeSpeed = (index: number) => {
    setSpeeds(prev => {
      const newSpeeds = prev.filter((_, i) => i !== index)
      // Always keep at least one speed entry (blank if needed)
      return newSpeeds.length === 0 ? [{ type: '', distance: 30 }] : newSpeeds
    })
    
    // Clean up unused custom types after removal
    setTimeout(() => {
      cleanupUnusedCustomSpeedTypes()
    }, 0)
  }

  const updateSpeed = (index: number, field: 'type' | 'distance', value: string | number) => {
    const oldSpeed = speeds[index]
    setSpeeds(prev => prev.map((speed, i) => 
      i === index ? { ...speed, [field]: value } : speed
    ))
    
    // If we're changing the type field, clean up unused custom types
    if (field === 'type' && oldSpeed?.type !== value) {
      // Use setTimeout to ensure the state update has processed
      setTimeout(() => {
        cleanupUnusedCustomSpeedTypes()
      }, 0)
    }
  }

  const addCustomSpeedType = (type: string) => {
    if (type && !customSpeedTypes.includes(type)) {
      setCustomSpeedTypes(prev => [...prev, type])
    }
  }

  const cleanupUnusedCustomSpeedTypes = () => {
    // Get all currently used speed types
    const usedTypes = speeds.map(speed => speed.type).filter(type => type && type !== 'Other' && type !== '')
    
    // Remove custom types that are no longer being used
    setCustomSpeedTypes(prev => prev.filter(customType => usedTypes.includes(customType)))
  }

  // Update creature data when speeds change - but only after initialization
  useEffect(() => {
    if (speedsInitialized) {
      const speedString = formatSpeedString(speeds)
      setCreatureData(prev => ({
        ...prev,
        speed: speedString,
        speeds: speeds
      }))
    }
  }, [speeds, speedsInitialized])

  // Mark speeds as initialized on first render
  useEffect(() => {
    setSpeedsInitialized(true)
  }, [])

  // Saving throw management functions
  const addSavingThrow = () => {
    // Find the first saving throw that isn't already added
    const usedSavingThrows = savingThrowEntries.map(entry => entry.ability)
    const availableSavingThrow = SAVING_THROWS.find(st => !usedSavingThrows.includes(st))
    
    if (availableSavingThrow) {
      const newSavingThrow: SavingThrowEntry = {
        ability: availableSavingThrow,
        proficient: false,
        expertise: false,
        override: false
      }
      setSavingThrowEntries(prev => [...prev, newSavingThrow])
    }
  }

  const removeSavingThrow = (index: number) => {
    setSavingThrowEntries(prev => prev.filter((_, i) => i !== index))
  }

  const updateSavingThrow = (index: number, field: keyof SavingThrowEntry, value: any) => {
    setSavingThrowEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ))
  }

  const clearAllSavingThrows = () => {
    setSavingThrowEntries([])
  }

  // Update creature data when saving throws change
  useEffect(() => {
    // Convert structured saving throws to legacy string format for display
    const savingThrowStrings = savingThrowEntries.map(entry => {
      let bonus: number
      
      if (entry.override && entry.overrideValue !== undefined) {
        bonus = entry.overrideValue
      } else {
        const abilityScore = getAbilityScoreForSavingThrow(creatureData, entry.ability)
        bonus = calculateSavingThrowBonus(abilityScore, entry.proficient, entry.expertise)
      }
      
      const shortAbility = entry.ability.substring(0, 3)
      return `${shortAbility} ${formatModifier(bonus)}`
    })
    
    setCreatureData(prev => ({
      ...prev,
      savingThrows: savingThrowStrings,
      savingThrowEntries: savingThrowEntries
    }))
  }, [savingThrowEntries, creatureData.str, creatureData.dex, creatureData.con, creatureData.int, creatureData.wis, creatureData.cha])

  // Skill management functions
  const addSkill = () => {
    // Find the first skill that isn't already added
    const usedSkills = skillEntries.map(entry => entry.skill)
    const availableSkill = SKILLS.find(skill => !usedSkills.includes(skill))
    
    if (availableSkill) {
      const newSkill: SkillEntry = {
        skill: availableSkill,
        proficient: false,
        expertise: false,
        override: false
      }
      setSkillEntries(prev => [...prev, newSkill])
    }
  }

  const removeSkill = (index: number) => {
    setSkillEntries(prev => prev.filter((_, i) => i !== index))
  }

  const updateSkill = (index: number, field: keyof SkillEntry, value: any) => {
    setSkillEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ))
  }

  const clearAllSkills = () => {
    setSkillEntries([])
  }

  // Update creature data when skills change
  useEffect(() => {
    // Convert structured skills to legacy string format for display
    const skillStrings = skillEntries.map(entry => {
      let bonus: number
      
      if (entry.override && entry.overrideValue !== undefined) {
        bonus = entry.overrideValue
      } else {
        const abilityScore = getAbilityScoreForSkill(creatureData, entry.skill)
        bonus = calculateSkillBonus(abilityScore, entry.proficient, entry.expertise)
      }
      
      return `${entry.skill} ${formatModifier(bonus)}`
    })
    
    setCreatureData(prev => ({
      ...prev,
      skills: skillStrings,
      skillEntries: skillEntries
    }))
  }, [skillEntries, creatureData.str, creatureData.dex, creatureData.con, creatureData.int, creatureData.wis, creatureData.cha])

  // Senses management functions
  const addSense = () => {
    // Find the first sense that isn't already added
    const usedSenses = senses.map(entry => entry.type)
    const availableSense = SENSE_TYPES.find(sense => !usedSenses.includes(sense))
    
    if (availableSense) {
      const newSense: SenseEntry = {
        type: availableSense,
        range: availableSense === 'Passive Perception' ? 10 : 60,
        isCalculated: availableSense === 'Passive Perception'
      }
      setSenses(prev => [...prev, newSense])
    }
  }

  const removeSense = (index: number) => {
    setSenses(prev => {
      const newSenses = prev.filter((_, i) => i !== index)
      // Always keep at least one sense entry (Passive Perception if empty)
      return newSenses.length === 0 ? [{ type: 'Passive Perception', range: 10, isCalculated: true }] : newSenses
    })
    
    // Clean up unused custom types after removal
    setTimeout(() => {
      cleanupUnusedCustomSenseTypes()
    }, 0)
  }

  const updateSense = (index: number, field: 'type' | 'range' | 'isCalculated', value: string | number | boolean) => {
    const oldSense = senses[index]
    setSenses(prev => prev.map((sense, i) => 
      i === index ? { ...sense, [field]: value } : sense
    ))
    
    // If we're changing the type field, clean up unused custom types
    if (field === 'type' && oldSense?.type !== value) {
      // Use setTimeout to ensure the state update has processed
      setTimeout(() => {
        cleanupUnusedCustomSenseTypes()
      }, 0)
    }
  }

  const addCustomSenseType = (type: string) => {
    if (type && !customSenseTypes.includes(type)) {
      setCustomSenseTypes(prev => [...prev, type])
    }
  }

  const cleanupUnusedCustomSenseTypes = () => {
    // Get all currently used sense types
    const usedTypes = senses.map(sense => sense.type).filter(type => type && type !== 'Other' && type !== '')
    
    // Remove custom types that are no longer being used
    setCustomSenseTypes(prev => prev.filter(customType => usedTypes.includes(customType)))
  }

  const clearAllSenses = () => {
    // Reset to just passive perception
    setSenses([{ type: 'Passive Perception', range: 10, isCalculated: true }])
    setCustomSenseTypes([])
  }

  // Update creature data when senses change - but only after initialization
  useEffect(() => {
    if (sensesInitialized) {
      const sensesString = formatSensesString(senses)
      setCreatureData(prev => ({
        ...prev,
        senses: [sensesString],
        senseEntries: senses,
        sensesExplainer: customSensesExplainer
      }))
    }
  }, [senses, sensesInitialized, customSensesExplainer])

  // Mark senses as initialized on first render
  useEffect(() => {
    setSensesInitialized(true)
  }, [])

  // Auto-calculate passive perception when Wisdom or Perception skill changes
  useEffect(() => {
    if (sensesInitialized) {
      setSenses(prev => prev.map(sense => {
        if (sense.type === 'Passive Perception' && sense.isCalculated) {
          // Check if creature has Perception skill proficiency
          const perceptionSkill = skillEntries.find(skill => skill.skill === 'Perception')
          const passivePerception = calculatePassivePerception(
            creatureData.wis,
            perceptionSkill?.proficient || false,
            perceptionSkill?.expertise || false
          )
          return { ...sense, range: passivePerception }
        }
        return sense
      }))
    }
  }, [creatureData.wis, skillEntries, sensesInitialized])

  // Language management functions
  const addLanguage = () => {
    // Clear any previous duplicate error
    setDuplicateLanguageError('')
    
    // Check for duplicate languages first
    const languageMap = new Map<string, number>()
    const duplicates: string[] = []
    
    languages.forEach(entry => {
      if (entry.language && entry.language.trim() !== '' && entry.language !== 'None') {
        const normalizedLanguage = entry.language.toLowerCase().trim()
        const count = languageMap.get(normalizedLanguage) || 0
        languageMap.set(normalizedLanguage, count + 1)
        
        if (count === 1) { // Second occurrence, it's a duplicate
          duplicates.push(entry.language)
        }
      }
    })
    
    if (duplicates.length > 0) {
      const uniqueDuplicates = [...new Set(duplicates)]
      const duplicateNames = uniqueDuplicates.join(', ')
      setDuplicateLanguageError(`You have duplicate languages (${duplicateNames}). Please fix before you add another language.`)
      return // Don't add a new language
    }
    
    // Find the first language that isn't already added
    const usedLanguages = languages.map(entry => entry.language)
    
    // Create available options, filtering "None" if other languages are selected
    const hasNonEmptyLanguages = languages.some(l => l.language && l.language !== '' && l.language !== 'None')
    let availableLanguages = LANGUAGES.filter(lang => !usedLanguages.includes(lang))
    
    // Filter out "None" if there are other non-empty languages
    if (hasNonEmptyLanguages) {
      availableLanguages = availableLanguages.filter(lang => lang !== 'None')
    }
    
    const availableLanguage = availableLanguages.find(lang => lang)
    
    if (availableLanguage) {
      const newLanguage: LanguageEntry = {
        language: availableLanguage
      }
      setLanguages(prev => [...prev, newLanguage])
    } else {
      // If no predefined languages are available, add a blank entry for custom input
      const newLanguage: LanguageEntry = {
        language: ''
      }
      setLanguages(prev => [...prev, newLanguage])
    }
  }

  const removeLanguage = (index: number) => {
    // Clear duplicate error when removing languages
    setDuplicateLanguageError('')
    
    setLanguages(prev => {
      const newLanguages = prev.filter((_, i) => i !== index)
      // Always keep at least one language entry (Common if empty)
      return newLanguages.length === 0 ? [{ language: 'Common' }] : newLanguages
    })
    
    // Clean up unused custom types after removal
    setTimeout(() => {
      cleanupUnusedCustomLanguages()
    }, 0)
  }

  const updateLanguage = (index: number, value: string) => {
    // Clear duplicate error when updating languages
    setDuplicateLanguageError('')
    
    const oldLanguage = languages[index]
    setLanguages(prev => prev.map((language, i) => 
      i === index ? { ...language, language: value } : language
    ))
    
    // If we're changing the language, clean up unused custom types
    if (oldLanguage?.language !== value) {
      // Use setTimeout to ensure the state update has processed
      setTimeout(() => {
        cleanupUnusedCustomLanguages()
      }, 0)
    }
  }

  const addCustomLanguage = (language: string) => {
    if (language && !customLanguages.includes(language)) {
      setCustomLanguages(prev => [...prev, language])
    }
  }

  const cleanupUnusedCustomLanguages = () => {
    // Get all currently used languages
    const usedLanguages = languages.map(lang => lang.language).filter(language => language && language !== 'Other' && language !== '')
    
    // Remove custom types that are no longer being used
    setCustomLanguages(prev => prev.filter(customLanguage => usedLanguages.includes(customLanguage)))
  }

  const clearAllLanguages = () => {
    // Clear duplicate error and reset to None
    setDuplicateLanguageError('')
    setLanguages([{ language: 'None' }])
    setCustomLanguages([])
  }

  // Update creature data when languages change - but only after initialization
  useEffect(() => {
    if (languagesInitialized) {
      const languagesString = formatLanguagesString(languages)
      setCreatureData(prev => ({
        ...prev,
        languages: languagesString ? [languagesString] : [],
        languageEntries: languages
      }))
    }
  }, [languages, languagesInitialized])

  // Mark languages as initialized on first render
  useEffect(() => {
    setLanguagesInitialized(true)
  }, [])

  // Special Ability management functions
  const addSpecialAbility = (type: string) => {
    if (type === 'category') {
      setTraitSelectionStep('category')
      return
    }
    
    if (type === 'search') {
      setTraitSelectionStep('search')
      setTraitSearchQuery('')
      setTraitSearchResults([])
      return
    }
    
    if (type === 'custom') {
      const newAbility = {
        name: 'New Trait',
        description: 'Description of the trait.'
      }
      setCreatureData(prev => ({
        ...prev,
        specialAbilities: [...(prev.specialAbilities || []), newAbility]
      }))
    } else if (TRAIT_TEMPLATES[type]) {
      // Check if trait requires inputs
      const template = TRAIT_TEMPLATES[type]
      const requiredInputs = getRequiredInputs(template)
      
      if (requiredInputs.length > 0) {
        // Set up for input collection
        setSelectedTraitKey(type)
        setTraitUserInputs({})
        setTraitSelectionStep('inputs')
        return
      }
      
      // Add trait directly if no inputs required
      const newAbility = {
        name: template.name,
        description: template.description
      }
      setCreatureData(prev => ({
        ...prev,
        specialAbilities: [...(prev.specialAbilities || []), newAbility]
      }))
    }
    
    // Reset trait selection
    setTraitSelectionStep(null)
    setSelectedTraitCategory('')
    setSelectedTraitKey('')
    setTraitUserInputs({})
    setTraitSearchQuery('')
    setTraitSearchResults([])
  }

  const selectTraitCategory = (category: string) => {
    setSelectedTraitCategory(category)
    setTraitSelectionStep('trait')
  }

  const performTraitSearch = (query: string) => {
    setTraitSearchQuery(query)
    if (query.trim() === '') {
      setTraitSearchResults([])
      return
    }
    
    const results = searchTraits(query.trim())
    setTraitSearchResults(results)
  }

  const selectTrait = (traitKey: string) => {
    const template = TRAIT_TEMPLATES[traitKey]
    if (!template) return
    
    const requiredInputs = getRequiredInputs(template)
    
    if (requiredInputs.length > 0) {
      setSelectedTraitKey(traitKey)
      setTraitUserInputs({})
      setTraitSelectionStep('inputs')
    } else {
      // Add trait directly
      const newAbility = {
        name: template.name,
        description: template.description
      }
      setCreatureData(prev => ({
        ...prev,
        specialAbilities: [...(prev.specialAbilities || []), newAbility]
      }))
      
      // Reset selection
      cancelTraitSelection()
    }
  }

  const updateTraitInput = (inputKey: string, value: any) => {
    setTraitUserInputs(prev => ({
      ...prev,
      [inputKey]: value
    }))
  }

  const completeTrait = () => {
    const template = TRAIT_TEMPLATES[selectedTraitKey]
    if (!template) return

    // Validate inputs
    const validation = validateTraitInputs(template, traitUserInputs)
    if (!validation.isValid) {
      // Could show errors here in a real implementation
      console.log('Validation errors:', validation.errors)
      return
    }

    // Generate dynamic description
    const finalDescription = generateDynamicDescription(template, traitUserInputs)
    
    // Create the trait
    const newAbility = {
      name: template.name,
      description: finalDescription
    }

    // Apply trait effects to creature data
    const updatedCreatureData = applyTraitEffects(creatureData, template, traitUserInputs)
    
    // Add the trait and apply effects
    setCreatureData(prev => ({
      ...updatedCreatureData,
      specialAbilities: [...(prev.specialAbilities || []), newAbility]
    }))

    // Reset selection
    cancelTraitSelection()
  }

  const cancelTraitSelection = () => {
    setTraitSelectionStep(null)
    setSelectedTraitCategory('')
    setSelectedTraitKey('')
    setTraitUserInputs({})
    setTraitSearchQuery('')
    setTraitSearchResults([])
  }

  const removeSpecialAbility = (index: number) => {
    setCreatureData(prev => ({
      ...prev,
      specialAbilities: prev.specialAbilities?.filter((_, i) => i !== index) || []
    }))
  }

  const updateSpecialAbility = (index: number, field: 'name' | 'description', value: string) => {
    setCreatureData(prev => ({
      ...prev,
      specialAbilities: prev.specialAbilities?.map((ability, i) => 
        i === index ? { ...ability, [field]: value } : ability
      ) || []
    }))
  }

  // Bonus Action management functions
  const addBonusAction = (type: string) => {
    const newAction = {
      name: 'New Bonus Action',
      description: 'Description of the bonus action.'
    }
    setCreatureData(prev => ({
      ...prev,
      bonusActions: [...(prev.bonusActions || []), newAction]
    }))
  }

  const removeBonusAction = (index: number) => {
    setCreatureData(prev => ({
      ...prev,
      bonusActions: prev.bonusActions?.filter((_, i) => i !== index) || []
    }))
  }

  const updateBonusAction = (index: number, field: 'name' | 'description', value: string) => {
    setCreatureData(prev => ({
      ...prev,
      bonusActions: prev.bonusActions?.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      ) || []
    }))
  }

  // Legendary Action management functions
  const addLegendaryAction = (type: string) => {
    const newAction = {
      name: 'New Legendary Action',
      description: 'Description of the legendary action.',
      cost: 1
    }
    setCreatureData(prev => ({
      ...prev,
      legendaryActions: [...(prev.legendaryActions || []), newAction]
    }))
  }

  const removeLegendaryAction = (index: number) => {
    setCreatureData(prev => ({
      ...prev,
      legendaryActions: prev.legendaryActions?.filter((_, i) => i !== index) || []
    }))
  }

  const updateLegendaryAction = (index: number, field: 'name' | 'description', value: string) => {
    setCreatureData(prev => ({
      ...prev,
      legendaryActions: prev.legendaryActions?.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      ) || []
    }))
  }

  // Mythic Action management functions
  const addMythicAction = (type: string) => {
    const newAction = {
      name: 'New Mythic Action',
      description: 'Description of the mythic action.'
    }
    setCreatureData(prev => ({
      ...prev,
      mythicActions: [...(prev.mythicActions || []), newAction]
    }))
  }

  const removeMythicAction = (index: number) => {
    setCreatureData(prev => ({
      ...prev,
      mythicActions: prev.mythicActions?.filter((_, i) => i !== index) || []
    }))
  }

  const updateMythicAction = (index: number, field: 'name' | 'description', value: string) => {
    setCreatureData(prev => ({
      ...prev,
      mythicActions: prev.mythicActions?.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      ) || []
    }))
  }

  return (
    <div className="classic-stat-block">
      {/* Section 1: Basic Info */}
      <div className="py-4 relative">
        <div 
          ref={sectionRefs.section1}
          onClick={(e) => handleSectionClick('section1', e)}
          onKeyDown={(e) => handleKeyDown(e, 'section1')}
          className={`cursor-pointer ${!editMode.section1 ? 'hover:bg-gray-50 rounded p-2 -m-2' : ''}`}
          title={editMode.section1 ? 'Press Enter to save or Escape to cancel' : 'Click to edit basic info'}
        >
          {editMode.section1 ? (
            <div className="space-y-3">
              <div>
                <input
                  ref={firstInputRefs.section1}
                  type="text"
                  value={creatureData.name}
                  onChange={(e) => validateAndUpdate('name', e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-full"
                  placeholder="Creature Name"
                />
                {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
              </div>
              
              <div className="flex gap-2 text-sm italic">
                <select
                  value={creatureData.size}
                  onChange={(e) => validateAndUpdate('size', e.target.value)}
                  className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                >
                  <option value="">Size</option>
                  {CREATURE_SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                
                <select
                  value={showCustomType ? 'other' : creatureData.type}
                  onChange={(e) => {
                    if (e.target.value === 'other') {
                      setShowCustomType(true)
                      validateAndUpdate('type', '')
                    } else {
                      setShowCustomType(false)
                      validateAndUpdate('type', e.target.value)
                    }
                  }}
                  className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                >
                  <option value="">Type</option>
                  {CREATURE_TYPES.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
                
                {showCustomType && (
                  <input
                    type="text"
                    value={creatureData.type}
                    onChange={(e) => validateAndUpdate('type', e.target.value)}
                    placeholder="Custom type"
                    className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none ml-2"
                  />
                )}
                
                <span>,</span>
                
                <select
                  value={creatureData.alignment || 'neutral'}
                  onChange={(e) => validateAndUpdate('alignment', e.target.value)}
                  className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                >
                  {ALIGNMENTS.map(alignment => (
                    <option key={alignment} value={alignment.toLowerCase()}>{alignment}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {creatureData.name}
              </h2>
              <p className="text-sm italic">
                {toTitleCase(creatureData.size)} {formatTypeDisplay(creatureData.type)}, {toTitleCase(creatureData.alignment || 'neutral')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Section 2: Basic Stats */}
      <div className="py-4 relative">
        <div 
          ref={sectionRefs.section2}
          onClick={(e) => handleSectionClick('section2', e)}
          onKeyDown={(e) => handleKeyDown(e, 'section2')}
          className={`cursor-pointer ${!editMode.section2 ? 'hover:bg-gray-50 rounded p-2 -m-2' : ''}`}
          title={editMode.section2 ? 'Press Enter to save or Escape to cancel' : 'Click to edit basic stats'}
        >
          {editMode.section2 ? (
            <div className="space-y-3 text-sm">
              {/* Armor Class - Auto-calculated or Override */}
              <div className="flex items-center gap-2">
                <span className="stat-name w-28 whitespace-nowrap">Armor Class:</span>
                <input
                  ref={firstInputRefs.section2}
                  type="number"
                  value={creatureData.ac}
                  onChange={(e) => validateAndUpdate('ac', e.target.value)}
                  disabled={!overrideAC}
                  className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-16 disabled:opacity-50"
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={overrideAC}
                    onChange={(e) => setOverrideAC(e.target.checked)}
                  />
                  Override
                </label>
                {errors.ac && <div className="text-red-600 text-xs">{errors.ac}</div>}
              </div>
              {overrideAC && (
                <div className="flex items-center gap-2">
                  <span className="stat-name w-28 whitespace-nowrap">AC Explainer:</span>
                  <input
                    type="text"
                    value={customACExplainer}
                    onChange={(e) => handleCustomExplainerChange(e.target.value, setCustomACExplainer)}
                    className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                    placeholder="Natural armor, magical protection, etc. (parentheses added automatically)"
                    maxLength={100}
                  />
                  <span className="text-xs text-gray-500">{customACExplainer.length}/100</span>
                </div>
              )}

              {/* Armor Type Selection */}
              {!overrideAC && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="stat-name w-28 whitespace-nowrap">Armor Type:</span>
                    <select
                      value={creatureData.armorType || 'None'}
                      onChange={(e) => {
                        const newType = e.target.value
                        let newSubtype
                        if (newType === 'Natural Armor') {
                          // For Natural armor, always start with blank
                          newSubtype = ''
                        } else {
                          // For other armor types, use first predefined subtype
                          newSubtype = ARMOR_SUBTYPES[newType as keyof typeof ARMOR_SUBTYPES]?.[0] || 'Unarmored'
                        }
                        setCreatureData(prev => ({ 
                          ...prev, 
                          armorType: newType,
                          armorSubtype: newSubtype
                        }))
                      }}
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                    >
                      {ARMOR_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="stat-name w-28 whitespace-nowrap">Armor Subtype:</span>
                    {creatureData.armorType === 'Natural Armor' ? (
                      <input
                        type="text"
                        value={creatureData.armorSubtype || ''}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 32); // Limit to 32 characters
                          setCreatureData(prev => ({ ...prev, armorSubtype: value }));
                        }}
                        className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                        placeholder="Explain your creatures toughness"
                        maxLength={32}
                      />
                    ) : (
                      <select
                        value={creatureData.armorSubtype || 'Unarmored'}
                        onChange={(e) => setCreatureData(prev => ({ ...prev, armorSubtype: e.target.value }))}
                        className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                      >
                        {(ARMOR_SUBTYPES[creatureData.armorType as keyof typeof ARMOR_SUBTYPES] || ['Unarmored']).map(subtype => (
                          <option key={subtype} value={subtype}>{subtype}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="stat-name w-28 whitespace-nowrap">Armor Modifier:</span>
                    <select
                      value={creatureData.armorModifier || 0}
                      onChange={(e) => setCreatureData(prev => ({ ...prev, armorModifier: parseInt(e.target.value) }))}
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-16"
                    >
                      <option value={0}>+0</option>
                      <option value={1}>+1</option>
                      <option value={2}>+2</option>
                      <option value={3}>+3</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="stat-name w-28 whitespace-nowrap">Shield:</span>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={creatureData.hasShield || false}
                        onChange={(e) => setCreatureData(prev => ({ ...prev, hasShield: e.target.checked }))}
                      />
                      Has Shield
                    </label>
                    {creatureData.hasShield && (
                      <select
                        value={creatureData.shieldModifier || 0}
                        onChange={(e) => setCreatureData(prev => ({ ...prev, shieldModifier: parseInt(e.target.value) }))}
                        className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-16 ml-2"
                      >
                        <option value={0}>+0</option>
                        <option value={1}>+1</option>
                        <option value={2}>+2</option>
                        <option value={3}>+3</option>
                      </select>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="stat-name w-28 whitespace-nowrap">Mage Armor:</span>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={creatureData.hasMageArmor || false}
                        onChange={(e) => setCreatureData(prev => ({ ...prev, hasMageArmor: e.target.checked }))}
                      />
                      Has Mage Armor (13 + Dex for unarmored)
                    </label>
                  </div>
                </>
              )}
              
              {/* Hit Points */}
              <div className="flex items-center gap-2">
                <span className="stat-name w-28 whitespace-nowrap">Hit Points:</span>
                <input
                  type="number"
                  value={creatureData.hp}
                  onChange={(e) => validateAndUpdate('hp', e.target.value)}
                  disabled={!overrideHP}
                  className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-16 disabled:opacity-50"
                  placeholder="27"
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={overrideHP}
                    onChange={(e) => setOverrideHP(e.target.checked)}
                  />
                  Override
                </label>
                {errors.hp && <div className="text-red-600 text-xs">{errors.hp}</div>}
              </div>
              {overrideHP && (
                <div className="flex items-center gap-2">
                  <span className="stat-name w-28 whitespace-nowrap">HP Explainer:</span>
                  <input
                    type="text"
                    value={customHPExplainer}
                    onChange={(e) => handleCustomExplainerChange(e.target.value, setCustomHPExplainer)}
                    className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                    placeholder="High constitution, magical enhancement, etc. (parentheses added automatically)"
                    maxLength={100}
                  />
                  <span className="text-xs text-gray-500">{customHPExplainer.length}/100</span>
                </div>
              )}

              {/* Hit Dice Configuration */}
              {!overrideHP && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="stat-name w-28 whitespace-nowrap">Hit Dice Count:</span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={creatureData.hitDiceCount || 1}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const cappedValue = Math.min(Math.max(value, 1), 1000);
                        setCreatureData(prev => ({ ...prev, hitDiceCount: cappedValue }));
                      }}
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-16"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="stat-name w-28 whitespace-nowrap">Hit Dice Type:</span>
                    <select
                      value={creatureData.hitDiceType || 'd8'}
                      onChange={(e) => setCreatureData(prev => ({ ...prev, hitDiceType: e.target.value }))}
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                    >
                      <option value="d4">d4</option>
                      <option value="d6">d6</option>
                      <option value="d8">d8</option>
                      <option value="d10">d10</option>
                      <option value="d12">d12</option>
                      <option value="d20">d20</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* Speed */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="stat-name w-28 whitespace-nowrap">Speed:</span>
                </div>
                {speeds.map((speed, index) => {
                  const isStandardType = SPEED_TYPES.includes(speed.type as any)
                  const isCustomType = customSpeedTypes.includes(speed.type)
                  // Show custom input if it's "Other" OR if it's a custom value being typed (not empty, not standard, not already in custom list)
                  const showCustomInput = speed.type === 'Other' || (speed.type !== '' && !isStandardType && !isCustomType)
                  const isLastEntry = index === speeds.length - 1
                  const hasValue = speed.type && speed.type !== 'Walk' || speed.distance !== 30
                  
                  // Get already selected speed types (excluding current index)
                  const selectedTypes = speeds
                    .filter((_, i) => i !== index)
                    .map(s => s.type)
                    .filter(type => type && type !== 'Other' && type !== 'Custom' && type !== '')
                  
                  // Filter available options - exclude already selected types
                  const availableStandardTypes = SPEED_TYPES.filter(type => !selectedTypes.includes(type))
                  // Custom types should only appear in their own dropdown, not in others
                  const availableCustomTypes: string[] = []
                  
                  return (
                    <div key={index} className="flex items-center gap-2 ml-4">
                      {showCustomInput ? (
                        <input
                          type="text"
                          value={speed.type === 'Other' ? '' : speed.type}
                          onChange={(e) => {
                            const newType = e.target.value
                            updateSpeed(index, 'type', newType)
                          }}
                          onBlur={(e) => {
                            const newType = e.target.value
                            if (newType && !customSpeedTypes.includes(newType) && newType !== 'Other' && newType !== '') {
                              addCustomSpeedType(newType)
                              
                              // If this is the last entry and user entered a custom type, add new entry
                              if (index === speeds.length - 1) {
                                const selectedTypes = speeds.map(s => s.type).concat(newType).filter(type => type && type !== 'Other' && type !== 'Custom')
                                const availableTypes = SPEED_TYPES.filter(type => !selectedTypes.includes(type))
                                
                                if (availableTypes.length > 0) {
                                  // Add a new blank entry for the next selection
                                  setSpeeds(prev => [...prev, { type: '', distance: 30 }])
                                }
                              }
                            }
                          }}
                          placeholder="Enter custom speed type"
                          className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-32"
                          autoFocus
                        />
                      ) : (
                        <select
                          value={speed.type === '' ? '' : (isStandardType || isCustomType ? speed.type : 'Other')}
                          onChange={(e) => {
                            const newValue = e.target.value
                            if (newValue === 'Other') {
                              updateSpeed(index, 'type', 'Other')
                            } else {
                              updateSpeed(index, 'type', newValue)
                              
                              // If this is the last entry and user made a real selection, add new entry
                              if (index === speeds.length - 1 && newValue !== 'Other' && newValue !== 'Custom' && newValue !== '') {
                                const selectedTypes = speeds.map(s => s.type).concat(newValue).filter(type => type && type !== 'Other' && type !== 'Custom')
                                const availableTypes = SPEED_TYPES.filter(type => !selectedTypes.includes(type))
                                
                                if (availableTypes.length > 0) {
                                  // Add a new blank entry for the next selection
                                  setSpeeds(prev => [...prev, { type: '', distance: 30 }])
                                }
                              }
                            }
                          }}
                          className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                        >
                          {/* Show placeholder option when speed type is empty */}
                          {speed.type === '' && (
                            <option value="">Select speed type...</option>
                          )}
                          {/* Always show current value even if it would normally be filtered, but NOT if it's a custom type selected elsewhere */}
                          {speed.type && speed.type !== '' && 
                           !availableStandardTypes.includes(speed.type as any) && 
                           !availableCustomTypes.includes(speed.type) && 
                           speed.type !== 'Other' && 
                           !selectedTypes.includes(speed.type) && (
                            <option value={speed.type}>{speed.type}</option>
                          )}
                          {availableStandardTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                          {availableCustomTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                          {/* Only show "Other" option if there are available standard types or custom input is needed */}
                          {(availableStandardTypes.length > 0 || speed.type === 'Other') && (
                            <option value="Other">Other...</option>
                          )}
                        </select>
                      )}
                    
                      <input
                        type="number"
                        min="0"
                        max="999"
                        value={speed.distance}
                        onChange={(e) => updateSpeed(index, 'distance', parseInt(e.target.value) || 0)}
                        className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-20"
                        placeholder="30"
                      />
                      <span className="text-sm text-gray-600">ft.</span>
                      
                      {/* Only show remove button if it's not the last entry */}
                      {!isLastEntry && (
                        <button
                          onClick={() => removeSpeed(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove Speed"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="stat-name w-28 whitespace-nowrap">Armor Class:</span>
                <span className="stat-value">
                  {creatureData.ac}
                  {(() => {
                    // If AC is overridden and has custom explainer, show that instead
                    if (overrideAC && customACExplainer.trim()) {
                      return (
                        <span className="text-xs text-gray-600 ml-1">
                          ({customACExplainer})
                        </span>
                      );
                    }
                    
                    // If AC is overridden but no custom explainer, show nothing
                    if (overrideAC) {
                      return null;
                    }
                    
                    // Calculate AC without shield for display
                    const acWithoutShield = creatureData.hasShield 
                      ? parseInt(creatureData.ac) - (2 + (creatureData.shieldModifier || 0))
                      : parseInt(creatureData.ac);
                    
                    // Build armor info parts
                    const armorParts = [];
                    
                    // Handle Mage Armor case - show all possible AC combinations
                    if (creatureData.hasMageArmor && creatureData.armorType === 'None') {
                      const dexMod = getAbilityModifier(creatureData.dex);
                      const shieldBonus = creatureData.hasShield ? (2 + (creatureData.shieldModifier || 0)) : 0;
                      
                      // Calculate all AC combinations
                      const acWithMageArmorWithShield = 13 + dexMod + shieldBonus;
                      const acWithMageArmorNoShield = 13 + dexMod;
                      const acWithoutMageArmorWithShield = 10 + dexMod + shieldBonus;
                      const acWithoutMageArmorNoShield = 10 + dexMod;
                      
                      if (creatureData.hasShield) {
                        // Show: AC with mage armor + shield, AC with mage armor no shield, AC without mage armor with shield, AC without mage armor no shield
                        armorParts.push(`AC ${acWithMageArmorWithShield} with Mage Armor`);
                        armorParts.push(`AC ${acWithMageArmorNoShield} with Mage Armor without shield`);
                        armorParts.push(`AC ${acWithoutMageArmorWithShield} without Mage Armor`);
                        armorParts.push(`AC ${acWithoutMageArmorNoShield} without Mage Armor no shield`);
                      } else {
                        // Show: AC with mage armor, AC without mage armor
                        armorParts.push(`AC ${acWithMageArmorNoShield} with Mage Armor`);
                        armorParts.push(`AC ${acWithoutMageArmorNoShield} without Mage Armor`);
                      }
                    } else {
                      // Add armor type first
                      if (creatureData.armorType && creatureData.armorType !== 'None') {
                        armorParts.push(creatureData.armorType);
                      }
                      
                      // Add armor modifier and subtype together
                      if (creatureData.armorType && creatureData.armorType !== 'None') {
                        let armorDetail = '';
                        if (creatureData.armorModifier && creatureData.armorModifier > 0) {
                          armorDetail += `+${creatureData.armorModifier} `;
                        }
                        armorDetail += creatureData.armorSubtype || 'Armor';
                        armorParts.push(armorDetail);
                      }
                      
                      // Add AC without shield if shield is present
                      if (creatureData.hasShield) {
                        armorParts.push(`AC ${acWithoutShield} without shield`);
                      }
                    }
                    
                    return armorParts.length > 0 ? (
                      <span className="text-xs text-gray-600 ml-1">
                        ({armorParts.join(', ')})
                      </span>
                    ) : null;
                  })()}
                </span>
              </div>
              <div className="flex">
                <span className="stat-name w-28 whitespace-nowrap">Hit Points:</span>
                <span className="stat-value">
                  {creatureData.hp}
                  {(() => {
                    // If HP is overridden and has custom explainer, show that instead
                    if (overrideHP && customHPExplainer.trim()) {
                      return (
                        <span className="text-xs text-gray-600 ml-1">
                          ({customHPExplainer})
                        </span>
                      );
                    }
                    
                    // If HP is overridden but no custom explainer, show nothing
                    if (overrideHP) {
                      return null;
                    }
                    
                    // Generate standard D&D hit dice explanation
                    const hitDiceCount = creatureData.hitDiceCount || 1;
                    const hitDiceType = creatureData.hitDiceType || 'd8';
                    const conModifier = getAbilityModifier(creatureData.con);
                    const totalModifier = hitDiceCount * conModifier;
                    
                    let diceExplanation = `${hitDiceCount}${hitDiceType}`;
                    if (totalModifier !== 0) {
                      diceExplanation += ` ${totalModifier >= 0 ? '+' : ''}${totalModifier}`;
                    }
                    
                    return (
                      <span className="text-xs text-gray-600 ml-1">
                        ({diceExplanation})
                      </span>
                    );
                  })()}
                </span>
              </div>
              <div className="flex">
                <span className="stat-name w-28 whitespace-nowrap">Speed:</span>
                <span className="stat-value">{creatureData.speed}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Section 3: Ability Scores */}
      <div className="py-4 relative">
        <div 
          ref={sectionRefs.section3}
          onClick={(e) => handleSectionClick('section3', e)}
          onKeyDown={(e) => handleKeyDown(e, 'section3')}
          className={`cursor-pointer ${!editMode.section3 ? 'hover:bg-gray-50 rounded p-2 -m-2' : ''}`}
          title={editMode.section3 ? 'Press Enter to save or Escape to cancel' : 'Click to edit ability scores'}
        >
          <div className="ability-scores">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability, index) => (
              <div key={ability} className="ability-score">
                <div className="ability-name">{ability.toUpperCase()}</div>
                {editMode.section3 ? (
                  <div className="flex flex-col items-center">
                    <input
                      ref={index === 0 ? firstInputRefs.section3 : undefined}
                      type="number"
                      min={1}
                      max={1000}
                      value={creatureData[ability]}
                      onChange={(e) => validateAndUpdate(ability, e.target.value)}
                      className="ability-value bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-12 text-center"
                    />
                    {errors[ability] && <div className="text-red-600 text-xs mt-1">{errors[ability]}</div>}
                    <div className="ability-modifier">({formatModifier(getAbilityModifier(creatureData[ability]))})</div>
                  </div>
                ) : (
                  <>
                    <div className="ability-value">{creatureData[ability]}</div>
                    <div className="ability-modifier">({formatModifier(getAbilityModifier(creatureData[ability]))})</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Section 4: Additional Info */}
      <div className="py-4 relative">
        <div 
          ref={sectionRefs.section4}
          onClick={(e) => handleSectionClick('section4', e)}
          onKeyDown={(e) => handleKeyDown(e, 'section4')}
          className={`cursor-pointer ${!editMode.section4 ? 'hover:bg-gray-50 rounded p-2 -m-2' : ''}`}
          title={editMode.section4 ? 'Press Enter to save or Escape to cancel' : 'Click to edit additional info'}
        >
          {editMode.section4 ? (
            <div className="space-y-4">
              {/* Saving Throws */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="stat-name">Saving Throws</span>
                  <div className="flex items-center gap-2">
                    {savingThrowEntries.length > 0 && (
                      <button
                        onClick={clearAllSavingThrows}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        <X size={14} />
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={addSavingThrow}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                      disabled={savingThrowEntries.length >= 6}
                    >
                      <Plus size={14} />
                      Add Saving Throw
                    </button>
                  </div>
                </div>
                
                {savingThrowEntries.map((entry, index) => {
                  const usedSavingThrows = savingThrowEntries
                    .filter((_, i) => i !== index)
                    .map(e => e.ability)
                  const availableSavingThrows = SAVING_THROWS.filter(st => !usedSavingThrows.includes(st))
                  
                  return (
                    <div key={index} className="border border-gray-300 rounded p-2 relative">
                      <button
                        onClick={() => removeSavingThrow(index)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} />
                      </button>
                      
                      <div className="space-y-2 pr-6">
                        <div className="flex items-center gap-2">
                          <select
                            value={entry.ability}
                            onChange={(e) => updateSavingThrow(index, 'ability', e.target.value)}
                            className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                          >
                            {/* Always show current value even if it would normally be filtered */}
                            {entry.ability && !availableSavingThrows.includes(entry.ability as any) && (
                              <option value={entry.ability}>{entry.ability}</option>
                            )}
                            {availableSavingThrows.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={entry.proficient}
                                onChange={(e) => updateSavingThrow(index, 'proficient', e.target.checked)}
                              />
                              Proficient
                            </label>
                            
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={entry.expertise}
                                onChange={(e) => updateSavingThrow(index, 'expertise', e.target.checked)}
                                disabled={!entry.proficient}
                              />
                              Expertise
                            </label>
                            
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={entry.override}
                                onChange={(e) => updateSavingThrow(index, 'override', e.target.checked)}
                              />
                              Override
                            </label>
                          </div>
                        </div>
                        
                        {entry.override && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Manual Bonus:</span>
                            <input
                              type="number"
                              value={entry.overrideValue || 0}
                              onChange={(e) => updateSavingThrow(index, 'overrideValue', parseInt(e.target.value) || 0)}
                              className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-16"
                              placeholder="0"
                            />
                          </div>
                        )}
                        
                        {!entry.override && (
                          <div className="text-xs text-gray-600">
                            Calculated: {formatModifier(
                              calculateSavingThrowBonus(
                                getAbilityScoreForSavingThrow(creatureData, entry.ability),
                                entry.proficient,
                                entry.expertise
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Skills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="stat-name">Skills</span>
                  <div className="flex items-center gap-2">
                    {skillEntries.length > 0 && (
                      <button
                        onClick={clearAllSkills}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        <X size={14} />
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={addSkill}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                      disabled={skillEntries.length >= 18}
                    >
                      <Plus size={14} />
                      Add Skill
                    </button>
                  </div>
                </div>
                
                {skillEntries.map((entry, index) => {
                  const usedSkills = skillEntries
                    .filter((_, i) => i !== index)
                    .map(e => e.skill)
                  const availableSkills = SKILLS.filter(skill => !usedSkills.includes(skill))
                  
                  return (
                    <div key={index} className="border border-gray-300 rounded p-2 relative">
                      <button
                        onClick={() => removeSkill(index)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} />
                      </button>
                      
                      <div className="space-y-2 pr-6">
                        <div className="flex items-center gap-2">
                          <select
                            value={entry.skill}
                            onChange={(e) => updateSkill(index, 'skill', e.target.value)}
                            className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                          >
                            {/* Always show current value even if it would normally be filtered */}
                            {entry.skill && !availableSkills.includes(entry.skill as any) && (
                              <option value={entry.skill}>{entry.skill}</option>
                            )}
                            {availableSkills.map(skill => (
                              <option key={skill} value={skill}>{skill}</option>
                            ))}
                          </select>
                          
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={entry.proficient}
                                onChange={(e) => updateSkill(index, 'proficient', e.target.checked)}
                              />
                              Proficient
                            </label>
                            
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={entry.expertise}
                                onChange={(e) => updateSkill(index, 'expertise', e.target.checked)}
                                disabled={!entry.proficient}
                              />
                              Expertise
                            </label>
                            
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={entry.override}
                                onChange={(e) => updateSkill(index, 'override', e.target.checked)}
                              />
                              Override
                            </label>
                          </div>
                        </div>
                        
                        {entry.override && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Manual Bonus:</span>
                            <input
                              type="number"
                              value={entry.overrideValue || 0}
                              onChange={(e) => updateSkill(index, 'overrideValue', parseInt(e.target.value) || 0)}
                              className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-16"
                              placeholder="0"
                            />
                          </div>
                        )}
                        
                        {!entry.override && (
                          <div className="text-xs text-gray-600">
                            Calculated: {formatModifier(
                              calculateSkillBonus(
                                getAbilityScoreForSkill(creatureData, entry.skill),
                                entry.proficient,
                                entry.expertise
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Senses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="stat-name">Senses</span>
                  <div className="flex items-center gap-2">
                    {senses.length > 1 && ( // Don't show clear if only passive perception
                      <button
                        onClick={clearAllSenses}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        <X size={14} />
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={addSense}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                      disabled={senses.length >= 5}
                    >
                      <Plus size={14} />
                      Add Sense
                    </button>
                  </div>
                </div>
                
                {senses.map((sense, index) => {
                  const isStandardType = SENSE_TYPES.includes(sense.type as any)
                  const isCustomType = customSenseTypes.includes(sense.type)
                  // Show custom input if it's "Other" OR if it's a custom value being typed (not empty, not standard, not already in custom list)
                  const showCustomInput = sense.type === 'Other' || (sense.type !== '' && !isStandardType && !isCustomType)
                  const isLastEntry = index === senses.length - 1
                  
                  // Get already selected sense types (excluding current index)
                  const selectedTypes = senses
                    .filter((_, i) => i !== index)
                    .map(s => s.type)
                    .filter(type => type && type !== 'Other' && type !== 'Custom' && type !== '')
                  
                  // Filter available options - exclude already selected types
                  const availableStandardTypes = SENSE_TYPES.filter(type => !selectedTypes.includes(type))
                  // Custom types should only appear in their own dropdown, not in others
                  const availableCustomTypes: string[] = []
                  
                  return (
                    <div key={index} className="flex items-center gap-2 ml-4">
                      {showCustomInput ? (
                        <input
                          type="text"
                          value={sense.type === 'Other' ? '' : sense.type}
                          onChange={(e) => {
                            const newType = e.target.value
                            updateSense(index, 'type', newType)
                          }}
                          onBlur={(e) => {
                            const newType = e.target.value
                            if (newType && !customSenseTypes.includes(newType) && newType !== 'Other' && newType !== '') {
                              addCustomSenseType(newType)
                              
                              // If this is the last entry and user entered a custom type, add new entry
                              if (index === senses.length - 1) {
                                const selectedTypes = senses.map(s => s.type).concat(newType).filter(type => type && type !== 'Other' && type !== 'Custom')
                                const availableTypes = SENSE_TYPES.filter(type => !selectedTypes.includes(type))
                                
                                if (availableTypes.length > 0) {
                                  // Add a new blank entry for the next selection
                                  setSenses(prev => [...prev, { type: '', range: 60, isCalculated: false }])
                                }
                              }
                            }
                          }}
                          placeholder="Enter custom sense type"
                          className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-32"
                          autoFocus
                        />
                      ) : (
                        <select
                          value={sense.type === '' ? '' : (isStandardType || isCustomType ? sense.type : 'Other')}
                          onChange={(e) => {
                            const newValue = e.target.value
                            if (newValue === 'Other') {
                              updateSense(index, 'type', 'Other')
                            } else {
                              updateSense(index, 'type', newValue)
                              
                              // If this is the last entry and user made a real selection, add new entry
                              if (index === senses.length - 1 && newValue !== 'Other' && newValue !== 'Custom' && newValue !== '') {
                                const selectedTypes = senses.map(s => s.type).concat(newValue).filter(type => type && type !== 'Other' && type !== 'Custom')
                                const availableTypes = SENSE_TYPES.filter(type => !selectedTypes.includes(type))
                                
                                if (availableTypes.length > 0) {
                                  // Add a new blank entry for the next selection
                                  setSenses(prev => [...prev, { type: '', range: 60, isCalculated: false }])
                                }
                              }
                            }
                          }}
                          className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none"
                        >
                          {/* Show placeholder option when sense type is empty */}
                          {sense.type === '' && (
                            <option value="">Select sense type...</option>
                          )}
                          {/* Always show current value even if it would normally be filtered */}
                          {sense.type && sense.type !== '' && 
                           !availableStandardTypes.includes(sense.type as any) && 
                           !availableCustomTypes.includes(sense.type) && 
                           sense.type !== 'Other' && 
                           !selectedTypes.includes(sense.type) && (
                            <option value={sense.type}>{sense.type}</option>
                          )}
                          {availableStandardTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                          {availableCustomTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                          {/* Only show "Other" option if there are available standard types or custom input is needed */}
                          {(availableStandardTypes.length > 0 || sense.type === 'Other') && (
                            <option value="Other">Other...</option>
                          )}
                        </select>
                      )}
                    
                      {sense.type === 'Passive Perception' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={sense.range}
                            onChange={(e) => updateSense(index, 'range', parseInt(e.target.value) || 10)}
                            disabled={sense.isCalculated}
                            className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-16 disabled:opacity-50"
                            placeholder="10"
                          />
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={!sense.isCalculated}
                              onChange={(e) => updateSense(index, 'isCalculated', !e.target.checked)}
                            />
                            Override
                          </label>
                        </div>
                      ) : (
                        <>
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={sense.range}
                            onChange={(e) => updateSense(index, 'range', parseInt(e.target.value) || 0)}
                            className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-20"
                            placeholder="60"
                          />
                          <span className="text-sm text-gray-600">ft.</span>
                        </>
                      )}
                      
                      {/* Only show remove button if it's not the last entry or there's more than one entry */}
                      {(!isLastEntry || senses.length > 1) && (
                        <button
                          onClick={() => removeSense(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove Sense"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
                
                {/* Senses Explainer */}
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="stat-name w-24 text-xs">Senses Note:</span>
                    <input
                      type="text"
                      value={customSensesExplainer}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 50)
                        setCustomSensesExplainer(value)
                      }}
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1 text-xs"
                      placeholder="Optional note about creature's senses"
                      maxLength={50}
                    />
                    <span className="text-xs text-gray-500">{customSensesExplainer.length}/50</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Optional: Add a brief note about the creature's senses (e.g., "has advantage on checks based on smell")</div>
                </div>
              </div>
              
              {/* Languages */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="stat-name">Languages</span>
                  <div className="flex items-center gap-2">
                    {languages.length > 0 && languages.some(l => l.language && l.language !== 'None') && (
                      <button
                        onClick={clearAllLanguages}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        <X size={14} />
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={addLanguage}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                      disabled={languages.length >= LANGUAGES.length}
                    >
                      <Plus size={14} />
                      Add Language
                    </button>
                  </div>
                </div>
                
                {/* Show duplicate language error if it exists */}
                {duplicateLanguageError && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
                    {duplicateLanguageError}
                  </div>
                )}
                
                {languages.map((entry, index) => {
                  const usedLanguages = languages
                    .filter((_, i) => i !== index)
                    .map(e => e.language)
                  
                  // Create available languages, filtering "None" if other languages are selected
                  const otherEntriesHaveNonEmptyLanguages = languages
                    .filter((_, i) => i !== index)
                    .some(l => l.language && l.language !== '' && l.language !== 'None')
                  
                  let availableLanguages = LANGUAGES.filter(lang => !usedLanguages.includes(lang))
                  
                  // Filter out "None" if there are other non-empty languages
                  if (otherEntriesHaveNonEmptyLanguages) {
                    availableLanguages = availableLanguages.filter(lang => lang !== 'None')
                  }
                  
                  const isCustomLanguage = customLanguages.includes(entry.language)
                  const isStandardLanguage = LANGUAGES.includes(entry.language as any) || entry.language === 'None'
                  const showCustomInput = entry.language === 'Other' || (entry.language !== '' && !isStandardLanguage && !isCustomLanguage)
                  const isLastEntry = index === languages.length - 1
                  const shouldHideRemoveButton = languages.length === 1
                  
                  return (
                    <div key={index} className="border border-gray-300 rounded p-2 relative">
                      <div className="flex items-center gap-2">
                        {showCustomInput ? (
                          <input
                            type="text"
                            value={entry.language === 'Other' ? '' : entry.language}
                            onChange={(e) => {
                              const newLanguage = e.target.value
                              updateLanguage(index, newLanguage)
                            }}
                            onBlur={(e) => {
                              const newLanguage = e.target.value.trim()
                              if (newLanguage && newLanguage !== 'Other' && newLanguage !== '') {
                                // Check if this language is already selected by another entry
                                const otherLanguages = languages
                                  .filter((_, i) => i !== index)
                                  .map(l => l.language.toLowerCase())
                                
                                const isDuplicate = otherLanguages.includes(newLanguage.toLowerCase()) ||
                                  LANGUAGES.some(lang => lang.toLowerCase() === newLanguage.toLowerCase() && otherLanguages.includes(lang.toLowerCase()))
                                
                                if (isDuplicate) {
                                  // Don't save the duplicate, keep the input for user to see the error
                                  return
                                }
                                
                                if (!customLanguages.includes(newLanguage)) {
                                  addCustomLanguage(newLanguage)
                                }
                              }
                            }}
                            placeholder="Enter custom language"
                            className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                            autoFocus
                          />
                        ) : (
                          <select
                            value={entry.language === '' ? '' : (isStandardLanguage || isCustomLanguage ? entry.language : 'Other')}
                            onChange={(e) => {
                              const newValue = e.target.value
                              if (newValue === 'Other') {
                                updateLanguage(index, 'Other')
                              } else {
                                updateLanguage(index, newValue)
                              }
                            }}
                            className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                          >
                            {/* Show placeholder option when language is empty */}
                            {entry.language === '' && (
                              <option value="">Select language...</option>
                            )}
                            {/* Always show current value even if it would normally be filtered */}
                            {entry.language && entry.language !== '' && 
                             !availableLanguages.includes(entry.language as any) && 
                             !customLanguages.includes(entry.language) && 
                             entry.language !== 'Other' && 
                             entry.language !== 'None' &&
                             !usedLanguages.includes(entry.language) && (
                              <option value={entry.language}>{entry.language}</option>
                            )}
                            {availableLanguages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                            {customLanguages.filter(lang => !usedLanguages.includes(lang)).map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                            {/* Only show "Other" option if there are available languages or custom input is needed */}
                            {(availableLanguages.length > 0 || entry.language === 'Other') && (
                              <option value="Other">Other...</option>
                            )}
                          </select>
                        )}
                        
                        {/* Show remove button for all entries except when there's only one */}
                        {!shouldHideRemoveButton && (
                          <button
                            onClick={() => removeLanguage(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove Language"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      
                      {/* Show duplicate error message for custom input */}
                      {showCustomInput && entry.language && entry.language !== 'Other' && entry.language !== '' && (() => {
                        const otherLanguages = languages
                          .filter((_, i) => i !== index)
                          .map(l => l.language.toLowerCase())
                        
                        const isDuplicate = otherLanguages.includes(entry.language.toLowerCase()) ||
                          LANGUAGES.some(lang => lang.toLowerCase() === entry.language.toLowerCase() && otherLanguages.includes(lang.toLowerCase()))
                        
                        return isDuplicate
                      })() && (
                        <div className="text-red-600 text-xs mt-1">
                          Your creature already knows that language.
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Other Additional Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="stat-name w-24">Challenge</span>
                  <input
                    type="text"
                    value={creatureData.cr}
                    onChange={(e) => setCreatureData(prev => ({ ...prev, cr: e.target.value }))}
                    className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-24"
                    placeholder="1/4 (50 XP)"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* View Mode Additional Stats - Always show saving throws, skills, and senses */}
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="stat-name w-24">Saving Throws</span>
                  <span className="stat-value">
                    {creatureData.savingThrows && creatureData.savingThrows.length > 0 
                      ? creatureData.savingThrows.join(', ') 
                      : '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="stat-name w-24">Skills</span>
                  <span className="stat-value">
                    {creatureData.skills && creatureData.skills.length > 0 
                      ? creatureData.skills.join(', ') 
                      : '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="stat-name w-24">Senses</span>
                  <span className="stat-value">
                    {creatureData.senses && creatureData.senses.length > 0 
                      ? creatureData.senses.join(', ') 
                      : 'Passive Perception 10'}
                    {creatureData.sensesExplainer && creatureData.sensesExplainer.trim() && (
                      <span className="text-xs text-gray-600 ml-1">
                        ({creatureData.sensesExplainer})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex">
                  <span className="stat-name w-24">Languages</span>
                  <span className="stat-value">
                    {creatureData.languages && creatureData.languages.length > 0 
                      ? creatureData.languages.join(', ') 
                      : '—'
                    }
                  </span>
                </div>
                <div className="flex">
                  <span className="stat-name w-24">Challenge</span>
                  <span className="stat-value">{creatureData.cr}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Section 5: Traits & Actions */}
      <div className="py-4 relative">
        <div 
          ref={sectionRefs.section5}
          onClick={(e) => handleSectionClick('section5', e)}
          onKeyDown={(e) => handleKeyDown(e, 'section5')}
          className={`cursor-pointer ${!editMode.section5 ? 'hover:bg-gray-50 rounded p-2 -m-2' : ''}`}
          title={editMode.section5 ? 'Press Enter to save or Escape to cancel' : 'Click to edit traits & actions'}
        >
          {editMode.section5 ? (
            <div className="space-y-6">
              {/* Traits Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Traits</h3>
                  <div className="flex items-center gap-2">
                    {traitSelectionStep === null && (
                      <select 
                        className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none text-sm"
                        onChange={(e) => addSpecialAbility(e.target.value)}
                        value=""
                      >
                        <option value="">Add Trait...</option>
                        <option value="category">Browse by Category</option>
                        <option value="search">Search Traits</option>
                        <option value="custom">Custom Trait</option>
                      </select>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {creatureData.specialAbilities?.map((ability, index) => (
                    <div key={index} className="border border-gray-300 rounded p-2 relative">
                      <button
                        onClick={() => removeSpecialAbility(index)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} />
                      </button>
                      
                      <div className="space-y-2 pr-6">
                        <input
                          type="text"
                          value={ability.name}
                          onChange={(e) => updateSpecialAbility(index, 'name', e.target.value)}
                          className="w-full bg-transparent border-b border-red-600 focus:border-red-800 outline-none font-bold"
                          placeholder="Trait Name"
                        />
                        <textarea
                          value={ability.description}
                          onChange={(e) => updateSpecialAbility(index, 'description', e.target.value)}
                          className="w-full bg-transparent border border-red-600 focus:border-red-800 outline-none p-1 resize-none text-sm"
                          rows={2}
                          placeholder="Trait description..."
                        />
                      </div>
                    </div>
                  )) || []}
                  
                  {(creatureData.specialAbilities || []).length > 0 && (
                    <button
                      onClick={() => setCreatureData(prev => ({ ...prev, specialAbilities: [] }))}
                      className="text-red-600 hover:text-red-800 text-sm hover:underline"
                    >
                      Clear All Traits
                    </button>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Actions</h3>
                  <div className="flex items-center gap-2">
                    <select 
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none text-sm"
                      onChange={(e) => addAction(e.target.value as keyof typeof ACTION_TEMPLATES)}
                      value=""
                    >
                      <option value="">Add Action...</option>
                      {ACTION_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {creatureData.actions?.map((action, index) => (
                    <div key={index} className="border border-gray-300 rounded p-2 relative">
                      <button
                        onClick={() => removeAction(index)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} />
                      </button>
                      
                      <div className="space-y-2 pr-6">
                        <input
                          ref={index === 0 ? firstInputRefs.section5 : undefined}
                          type="text"
                          value={action.name}
                          onChange={(e) => updateAction(index, 'name', e.target.value)}
                          className="w-full bg-transparent border-b border-red-600 focus:border-red-800 outline-none font-bold"
                          placeholder="Action Name"
                        />
                        <textarea
                          value={action.description}
                          onChange={(e) => updateAction(index, 'description', e.target.value)}
                          className="w-full bg-transparent border border-red-600 focus:border-red-800 outline-none p-1 resize-none text-sm"
                          rows={2}
                          placeholder="Action description..."
                        />
                      </div>
                    </div>
                  )) || []}
                  
                  {(creatureData.actions || []).length > 0 && (
                    <button
                      onClick={() => setCreatureData(prev => ({ ...prev, actions: [] }))}
                      className="text-red-600 hover:text-red-800 text-sm hover:underline"
                    >
                      Clear All Actions
                    </button>
                  )}
                </div>
              </div>

              {/* Bonus Actions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Bonus Actions</h3>
                  <div className="flex items-center gap-2">
                    <select 
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none text-sm"
                      onChange={(e) => addBonusAction(e.target.value)}
                      value=""
                    >
                      <option value="">Add Bonus Action...</option>
                      <option value="custom">Custom Bonus Action</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {creatureData.bonusActions?.map((action, index) => (
                    <div key={index} className="border border-gray-300 rounded p-2 relative">
                      <button
                        onClick={() => removeBonusAction(index)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} />
                      </button>
                      
                      <div className="space-y-2 pr-6">
                        <input
                          type="text"
                          value={action.name}
                          onChange={(e) => updateBonusAction(index, 'name', e.target.value)}
                          className="w-full bg-transparent border-b border-red-600 focus:border-red-800 outline-none font-bold"
                          placeholder="Bonus Action Name"
                        />
                        <textarea
                          value={action.description}
                          onChange={(e) => updateBonusAction(index, 'description', e.target.value)}
                          className="w-full bg-transparent border border-red-600 focus:border-red-800 outline-none p-1 resize-none text-sm"
                          rows={2}
                          placeholder="Bonus action description..."
                        />
                      </div>
                    </div>
                  )) || []}
                  
                  {(creatureData.bonusActions || []).length > 0 && (
                    <button
                      onClick={() => setCreatureData(prev => ({ ...prev, bonusActions: [] }))}
                      className="text-red-600 hover:text-red-800 text-sm hover:underline"
                    >
                      Clear All Bonus Actions
                    </button>
                  )}
                </div>
              </div>

              {/* Legendary Actions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Legendary Actions</h3>
                  <div className="flex items-center gap-2">
                    <select 
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none text-sm"
                      onChange={(e) => addLegendaryAction(e.target.value)}
                      value=""
                    >
                      <option value="">Add Legendary Action...</option>
                      <option value="custom">Custom Legendary Action</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {creatureData.legendaryActions?.map((action, index) => (
                    <div key={index} className="border border-gray-300 rounded p-2 relative">
                      <button
                        onClick={() => removeLegendaryAction(index)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} />
                      </button>
                      
                      <div className="space-y-2 pr-6">
                        <input
                          type="text"
                          value={action.name}
                          onChange={(e) => updateLegendaryAction(index, 'name', e.target.value)}
                          className="w-full bg-transparent border-b border-red-600 focus:border-red-800 outline-none font-bold"
                          placeholder="Legendary Action Name"
                        />
                        <textarea
                          value={action.description}
                          onChange={(e) => updateLegendaryAction(index, 'description', e.target.value)}
                          className="w-full bg-transparent border border-red-600 focus:border-red-800 outline-none p-1 resize-none text-sm"
                          rows={2}
                          placeholder="Legendary action description..."
                        />
                      </div>
                    </div>
                  )) || []}
                  
                  {(creatureData.legendaryActions || []).length > 0 && (
                    <button
                      onClick={() => setCreatureData(prev => ({ ...prev, legendaryActions: [] }))}
                      className="text-red-600 hover:text-red-800 text-sm hover:underline"
                    >
                      Clear All Legendary Actions
                    </button>
                  )}
                </div>
              </div>

              {/* Mythic Actions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Mythic Actions</h3>
                  <div className="flex items-center gap-2">
                    <select 
                      className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none text-sm"
                      onChange={(e) => addMythicAction(e.target.value)}
                      value=""
                    >
                      <option value="">Add Mythic Action...</option>
                      <option value="custom">Custom Mythic Action</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {creatureData.mythicActions?.map((action, index) => (
                    <div key={index} className="border border-gray-300 rounded p-2 relative">
                      <button
                        onClick={() => removeMythicAction(index)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} />
                      </button>
                      
                      <div className="space-y-2 pr-6">
                        <input
                          type="text"
                          value={action.name}
                          onChange={(e) => updateMythicAction(index, 'name', e.target.value)}
                          className="w-full bg-transparent border-b border-red-600 focus:border-red-800 outline-none font-bold"
                          placeholder="Mythic Action Name"
                        />
                        <textarea
                          value={action.description}
                          onChange={(e) => updateMythicAction(index, 'description', e.target.value)}
                          className="w-full bg-transparent border border-red-600 focus:border-red-800 outline-none p-1 resize-none text-sm"
                          rows={2}
                          placeholder="Mythic action description..."
                        />
                      </div>
                    </div>
                  )) || []}
                  
                  {(creatureData.mythicActions || []).length > 0 && (
                    <button
                      onClick={() => setCreatureData(prev => ({ ...prev, mythicActions: [] }))}
                      className="text-red-600 hover:text-red-800 text-sm hover:underline"
                    >
                      Clear All Mythic Actions
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* View Mode - Traits */}
              {creatureData.specialAbilities && creatureData.specialAbilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Traits</h3>
                  <div className="space-y-3 text-sm">
                    {creatureData.specialAbilities.map((ability, index) => (
                      <div key={index}>
                        <span className="stat-name">{ability.name}.</span>{' '}
                        <span className="stat-value">{ability.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Mode - Actions */}
              {creatureData.actions && creatureData.actions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Actions</h3>
                  <div className="space-y-3 text-sm">
                    {creatureData.actions.map((action, index) => (
                      <div key={index}>
                        <span className="stat-name">{action.name}.</span>{' '}
                        <span className="stat-value">{action.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Mode - Bonus Actions */}
              {creatureData.bonusActions && creatureData.bonusActions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Bonus Actions</h3>
                  <div className="space-y-3 text-sm">
                    {creatureData.bonusActions.map((action, index) => (
                      <div key={index}>
                        <span className="stat-name">{action.name}.</span>{' '}
                        <span className="stat-value">{action.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Mode - Legendary Actions */}
              {creatureData.legendaryActions && creatureData.legendaryActions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Legendary Actions</h3>
                  <div className="space-y-3 text-sm">
                    {creatureData.legendaryActions.map((action, index) => (
                      <div key={index}>
                        <span className="stat-name">{action.name}.</span>{' '}
                        <span className="stat-value">{action.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Mode - Mythic Actions */}
              {creatureData.mythicActions && creatureData.mythicActions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Mythic Actions</h3>
                  <div className="space-y-3 text-sm">
                    {creatureData.mythicActions.map((action, index) => (
                      <div key={index}>
                        <span className="stat-name">{action.name}.</span>{' '}
                        <span className="stat-value">{action.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {(!creatureData.specialAbilities || creatureData.specialAbilities.length === 0) &&
               (!creatureData.actions || creatureData.actions.length === 0) &&
               (!creatureData.bonusActions || creatureData.bonusActions.length === 0) &&
               (!creatureData.legendaryActions || creatureData.legendaryActions.length === 0) &&
               (!creatureData.mythicActions || creatureData.mythicActions.length === 0) && (
                <div className="text-gray-500 italic text-sm">No traits or actions defined</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Trait Selection Modal */}
    {traitSelectionStep && traitSelectionStep !== null && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Add Trait</h2>
              <button
                onClick={cancelTraitSelection}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Choose a trait template to add to your creature. Templates provide structured options and automatically update relevant stats.
            </p>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Category Selection */}
            {traitSelectionStep === 'category' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Category:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TRAIT_CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => selectTraitCategory(category)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-dnd-coral-400 hover:bg-dnd-coral-50 transition-colors text-left"
                    >
                      <div className="font-semibold text-gray-800">{category}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {getTraitsByCategory(category).length} traits
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Interface */}
            {traitSelectionStep === 'search' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Search Traits:</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dnd-coral-500 focus:border-dnd-coral-500 outline-none"
                    placeholder="Enter trait name or description keywords..."
                    value={traitSearchQuery}
                    onChange={(e) => performTraitSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                
                {traitSearchQuery && traitSearchResults.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-3">
                      {traitSearchResults.length} result{traitSearchResults.length !== 1 ? 's' : ''} found:
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {traitSearchResults.map(trait => {
                        const traitKey = Object.keys(TRAIT_TEMPLATES).find(key => TRAIT_TEMPLATES[key].name === trait.name)
                        const hasInputs = getRequiredInputs(trait).length > 0
                        
                        return (
                          <div
                            key={trait.name}
                            className="border border-gray-200 rounded-lg p-4 hover:border-dnd-coral-400 hover:bg-dnd-coral-50 cursor-pointer transition-colors"
                            onClick={() => traitKey && selectTrait(traitKey)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-lg text-gray-800">{trait.name}</div>
                              <div className="flex items-center space-x-2">
                                {trait.dynamicDescription && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                    Dynamic
                                  </span>
                                )}
                                {hasInputs && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Requires Input
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">Category: {trait.category}</div>
                            <div className="text-sm text-gray-700">{trait.description}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {traitSearchQuery && traitSearchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-lg mb-2">No traits found matching "{traitSearchQuery}"</div>
                    <div className="text-sm">Try different keywords or browse by category instead.</div>
                  </div>
                )}
              </div>
            )}

            {/* Trait Selection within Category */}
            {traitSelectionStep === 'trait' && selectedTraitCategory && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{selectedTraitCategory} Traits</h3>
                  <button
                    onClick={() => setTraitSelectionStep('category')}
                    className="px-3 py-2 text-dnd-coral-600 hover:text-dnd-coral-700 font-medium"
                  >
                    ← Back to Categories
                  </button>
                </div>
                <div className="space-y-3">
                  {getTraitsByCategory(selectedTraitCategory).map(trait => {
                    const traitKey = Object.keys(TRAIT_TEMPLATES).find(key => TRAIT_TEMPLATES[key].name === trait.name)
                    const hasInputs = getRequiredInputs(trait).length > 0
                    
                    return (
                      <div
                        key={trait.name}
                        className="border border-gray-200 rounded-lg p-4 hover:border-dnd-coral-400 hover:bg-dnd-coral-50 cursor-pointer transition-colors"
                        onClick={() => traitKey && selectTrait(traitKey)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-lg text-gray-800">{trait.name}</div>
                          <div className="flex items-center space-x-2">
                            {trait.dynamicDescription && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                Dynamic
                              </span>
                            )}
                            {hasInputs && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Requires Input
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">{trait.description}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Input Configuration */}
            {traitSelectionStep === 'inputs' && selectedTraitKey && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Configure {TRAIT_TEMPLATES[selectedTraitKey]?.name}
                  </h3>
                  <button
                    onClick={() => setTraitSelectionStep(selectedTraitCategory ? 'trait' : 'search')}
                    className="px-3 py-2 text-dnd-coral-600 hover:text-dnd-coral-700 font-medium"
                  >
                    ← Back to Selection
                  </button>
                </div>

                <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Original Description:</h4>
                  <p className="text-gray-600">{TRAIT_TEMPLATES[selectedTraitKey]?.description}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Required Information:</h4>
                  {getRequiredInputs(TRAIT_TEMPLATES[selectedTraitKey]).map((input, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {input.inputPrompt}
                      </label>
                      {input.inputType === 'select' && input.options ? (
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dnd-coral-500 focus:border-dnd-coral-500 outline-none"
                          value={traitUserInputs[`input_${index}`] || ''}
                          onChange={(e) => updateTraitInput(`input_${index}`, e.target.value)}
                        >
                          <option value="">Choose...</option>
                          {input.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : input.inputType === 'number' ? (
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dnd-coral-500 focus:border-dnd-coral-500 outline-none"
                          value={traitUserInputs[`input_${index}`] || ''}
                          onChange={(e) => updateTraitInput(`input_${index}`, parseInt(e.target.value) || 0)}
                          placeholder={input.inputPrompt}
                          min="0"
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dnd-coral-500 focus:border-dnd-coral-500 outline-none"
                          value={traitUserInputs[`input_${index}`] || ''}
                          onChange={(e) => updateTraitInput(`input_${index}`, e.target.value)}
                          placeholder={input.inputPrompt}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Preview */}
                {(() => {
                  const validation = validateTraitInputs(TRAIT_TEMPLATES[selectedTraitKey], traitUserInputs)
                  const finalDescription = generateDynamicDescription(TRAIT_TEMPLATES[selectedTraitKey], traitUserInputs)
                  
                  return (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-700 mb-2">Preview:</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="font-semibold text-blue-800 mb-2">
                          {TRAIT_TEMPLATES[selectedTraitKey]?.name}
                        </div>
                        <div className="text-blue-700">{finalDescription}</div>
                      </div>
                      
                      {validation.errors.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Please fix the following:</strong>
                          <ul className="mt-1 list-disc list-inside">
                            {validation.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelTraitSelection}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {traitSelectionStep === 'inputs' && (
                <button
                  onClick={completeTrait}
                  className="px-4 py-2 bg-dnd-coral-600 text-white rounded-md hover:bg-dnd-coral-700 transition-colors"
                  disabled={!validateTraitInputs(TRAIT_TEMPLATES[selectedTraitKey], traitUserInputs).isValid}
                >
                  Add Trait
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  )
}
