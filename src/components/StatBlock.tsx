import { Creature, SpeedEntry } from '@/types/creature'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { 
  CREATURE_SIZES, 
  CREATURE_TYPES, 
  ALIGNMENTS,
  ARMOR_TYPES,
  ARMOR_SUBTYPES,
  SPEED_TYPES,
  getAbilityModifier,
  formatModifier,
  calculateAC,
  calculateArmorClass,
  calculateHP,
  formatHP,
  toTitleCase,
  parseLegacySpeed,
  formatSpeedString
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
  const [overrideAC, setOverrideAC] = useState(false)
  const [overrideHP, setOverrideHP] = useState(false)
  const [showCustomType, setShowCustomType] = useState(false)
  const [preEditData, setPreEditData] = useState<Creature>(creature)
  const [customACExplainer, setCustomACExplainer] = useState('')
  const [customHPExplainer, setCustomHPExplainer] = useState('')
  const [speeds, setSpeeds] = useState<SpeedEntry[]>(() => {
    // Initialize speeds only once when component mounts
    if (creature.speeds) {
      return creature.speeds
    } else if (creature.speed) {
      return parseLegacySpeed(creature.speed)
    } else {
      // Start with empty/placeholder speed that requires user selection
      return [{ type: '', distance: '30 ft.' }]
    }
  })
  const [customSpeedTypes, setCustomSpeedTypes] = useState<string[]>([])
  const [speedsInitialized, setSpeedsInitialized] = useState(false)

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

  const addAction = () => {
    const newAction = {
      name: 'New Action',
      description: 'Description of the action.'
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
    const newSpeed: SpeedEntry = { type: 'Walk', distance: '30 ft.' }
    setSpeeds(prev => [...prev, newSpeed])
  }

  const removeSpeed = (index: number) => {
    setSpeeds(prev => {
      const newSpeeds = prev.filter((_, i) => i !== index)
      // Always keep at least one speed entry (blank if needed)
      return newSpeeds.length === 0 ? [{ type: '', distance: '30 ft.' }] : newSpeeds
    })
  }

  const updateSpeed = (index: number, field: 'type' | 'distance', value: string) => {
    setSpeeds(prev => prev.map((speed, i) => 
      i === index ? { ...speed, [field]: value } : speed
    ))
  }

  const addCustomSpeedType = (type: string) => {
    if (type && !customSpeedTypes.includes(type)) {
      setCustomSpeedTypes(prev => [...prev, type])
    }
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
                  const showCustomInput = !isStandardType && !isCustomType && speed.type !== 'Other' && speed.type !== ''
                  const isLastEntry = index === speeds.length - 1
                  const hasValue = speed.type && speed.type !== 'Walk' || speed.distance !== '30 ft.'
                  
                  // Get already selected speed types (excluding current index)
                  const selectedTypes = speeds
                    .filter((_, i) => i !== index)
                    .map(s => s.type)
                    .filter(type => type && type !== 'Other' && type !== 'Custom')
                  
                  // Filter available options
                  const availableStandardTypes = SPEED_TYPES.filter(type => !selectedTypes.includes(type))
                  const availableCustomTypes = customSpeedTypes.filter(type => !selectedTypes.includes(type))
                  
                  return (
                    <div key={index} className="flex items-center gap-2 ml-4">
                      {showCustomInput ? (
                        <input
                          type="text"
                          value={speed.type}
                          onChange={(e) => {
                            const newType = e.target.value
                            updateSpeed(index, 'type', newType)
                            if (newType && !customSpeedTypes.includes(newType)) {
                              addCustomSpeedType(newType)
                            }
                          }}
                          placeholder="Custom speed type"
                          className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-32"
                        />
                      ) : (
                        <select
                          value={isStandardType || isCustomType ? speed.type : (speed.type === '' ? '' : 'Other')}
                          onChange={(e) => {
                            const newValue = e.target.value
                            if (newValue === 'Other') {
                              updateSpeed(index, 'type', 'Custom')
                            } else {
                              updateSpeed(index, 'type', newValue)
                              
                              // If this is the last entry and user made a real selection, add new entry
                              if (index === speeds.length - 1 && newValue !== 'Other' && newValue !== 'Custom' && newValue !== '') {
                                const selectedTypes = speeds.map(s => s.type).concat(newValue).filter(type => type && type !== 'Other' && type !== 'Custom')
                                const availableTypes = [...SPEED_TYPES, ...customSpeedTypes].filter(type => !selectedTypes.includes(type))
                                
                                if (availableTypes.length > 0) {
                                  // Add a new blank entry for the next selection
                                  setSpeeds(prev => [...prev, { type: '', distance: '30 ft.' }])
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
                          {/* Always show current value even if it would normally be filtered */}
                          {speed.type && speed.type !== '' && !availableStandardTypes.includes(speed.type as any) && !availableCustomTypes.includes(speed.type) && speed.type !== 'Other' && (
                            <option value={speed.type}>{speed.type}</option>
                          )}
                          {availableStandardTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                          {availableCustomTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                          {/* Only show "Other" option if there are available types or custom input is needed */}
                          {(availableStandardTypes.length > 0 || availableCustomTypes.length > 0 || speed.type === 'Other') && (
                            <option value="Other">Other...</option>
                          )}
                        </select>
                      )}
                    
                      <input
                        type="text"
                        value={speed.distance}
                        onChange={(e) => updateSpeed(index, 'distance', e.target.value)}
                        className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none w-20"
                        placeholder="30 ft."
                      />
                      
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
              {/* Editable Additional Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="stat-name w-24">Saving Throws</span>
                  <input
                    ref={firstInputRefs.section4}
                    type="text"
                    value={creatureData.savingThrows?.join(', ') || ''}
                    onChange={(e) => setCreatureData(prev => ({ 
                      ...prev, 
                      savingThrows: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                    placeholder="Dex +2, Con +3"
                  />
                </div>
                
                <div className="flex items-center">
                  <span className="stat-name w-24">Skills</span>
                  <input
                    type="text"
                    value={creatureData.skills?.join(', ') || ''}
                    onChange={(e) => setCreatureData(prev => ({ 
                      ...prev, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                    placeholder="Perception +3, Stealth +4"
                  />
                </div>
                
                <div className="flex items-center">
                  <span className="stat-name w-24">Senses</span>
                  <input
                    type="text"
                    value={creatureData.senses?.join(', ') || ''}
                    onChange={(e) => setCreatureData(prev => ({ 
                      ...prev, 
                      senses: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                    placeholder="Passive Perception 13"
                  />
                </div>
                
                <div className="flex items-center">
                  <span className="stat-name w-24">Languages</span>
                  <input
                    type="text"
                    value={creatureData.languages?.join(', ') || ''}
                    onChange={(e) => setCreatureData(prev => ({ 
                      ...prev, 
                      languages: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    className="bg-transparent border-b border-red-600 focus:border-red-800 outline-none flex-1"
                    placeholder="Common, Elvish"
                  />
                </div>
                
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
              {/* View Mode Additional Stats */}
              {(creatureData.savingThrows || creatureData.skills || creatureData.senses || creatureData.languages) && (
                <div className="space-y-2 text-sm">
                  {creatureData.savingThrows && creatureData.savingThrows.length > 0 && (
                    <div className="flex">
                      <span className="stat-name w-24">Saving Throws</span>
                      <span className="stat-value">{creatureData.savingThrows.join(', ')}</span>
                    </div>
                  )}
                  {creatureData.skills && creatureData.skills.length > 0 && (
                    <div className="flex">
                      <span className="stat-name w-24">Skills</span>
                      <span className="stat-value">{creatureData.skills.join(', ')}</span>
                    </div>
                  )}
                  {creatureData.senses && creatureData.senses.length > 0 && (
                    <div className="flex">
                      <span className="stat-name w-24">Senses</span>
                      <span className="stat-value">{creatureData.senses.join(', ')}</span>
                    </div>
                  )}
                  {creatureData.languages && creatureData.languages.length > 0 && (
                    <div className="flex">
                      <span className="stat-name w-24">Languages</span>
                      <span className="stat-value">{creatureData.languages.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="stat-name w-24">Challenge</span>
                    <span className="stat-value">{creatureData.cr}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Section 5: Actions */}
      <div className="py-4 relative">
        <div 
          ref={sectionRefs.section5}
          onClick={(e) => handleSectionClick('section5', e)}
          onKeyDown={(e) => handleKeyDown(e, 'section5')}
          className={`cursor-pointer ${!editMode.section5 ? 'hover:bg-gray-50 rounded p-2 -m-2' : ''}`}
          title={editMode.section5 ? 'Press Enter to save or Escape to cancel' : 'Click to edit actions'}
        >
          {editMode.section5 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Actions</h3>
                <button
                  onClick={addAction}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                >
                  <Plus size={14} />
                  Add Action
                </button>
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
              </div>
            </div>
          ) : (
            <div>
              {/* View Mode Actions */}
              <div>
                <h3 className="text-lg font-bold mb-3">Actions</h3>
                {creatureData.actions && creatureData.actions.length > 0 ? (
                  <div className="space-y-3 text-sm">
                    {creatureData.actions.map((action, index) => (
                      <div key={index}>
                        <span className="stat-name">{action.name}.</span>{' '}
                        <span className="stat-value">{action.description}</span>
                        {action.attackBonus && (
                          <span className="stat-value"> +{action.attackBonus} to hit</span>
                        )}
                        {action.damage && (
                          <span className="stat-value">, {action.damage} damage</span>
                        )}
                        {action.range && (
                          <span className="stat-value">, range {action.range}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm">No actions defined</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
