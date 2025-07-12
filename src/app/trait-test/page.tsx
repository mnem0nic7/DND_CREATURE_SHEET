'use client'

import React, { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { TRAIT_TEMPLATES, TRAIT_CATEGORIES, TraitTemplate, getTraitsByCategory, generateDynamicDescription, getRequiredInputs, validateTraitInputs, applyTraitEffects } from '@/data/traits'

interface TraitTestData {
  trait: TraitTemplate
  userInputs: Record<string, any>
  isValid: boolean
  errors: string[]
  finalDescription: string
  effectsApplied: any
  isComplete: boolean
}

// Persistent trait completion storage
const TRAIT_COMPLETION_KEY = 'dnd-trait-completion-status'

// D&D 5e Spell List for multi-select dropdowns
const DND_SPELLS = [
  // Cantrips
  'Acid Splash', 'Blade Ward', 'Chill Touch', 'Dancing Lights', 'Druidcraft', 'Eldritch Blast',
  'Fire Bolt', 'Guidance', 'Light', 'Mage Hand', 'Mending', 'Minor Illusion', 'Poison Spray',
  'Prestidigitation', 'Produce Flame', 'Ray of Frost', 'Resistance', 'Sacred Flame', 'Shillelagh',
  'Shocking Grasp', 'Spare the Dying', 'Thaumaturgy', 'Thorn Whip', 'True Strike', 'Vicious Mockery',
  
  // 1st Level
  'Alarm', 'Animal Friendship', 'Bane', 'Bless', 'Burning Hands', 'Charm Person', 'Comprehend Languages',
  'Cure Wounds', 'Detect Magic', 'Disguise Self', 'Faerie Fire', 'False Life', 'Feather Fall',
  'Find Familiar', 'Fog Cloud', 'Goodberry', 'Grease', 'Guiding Bolt', 'Healing Word', 'Heat Metal',
  'Hold Person', 'Hunter\'s Mark', 'Identify', 'Inflict Wounds', 'Jump', 'Longstrider', 'Mage Armor',
  'Magic Missile', 'Protection from Evil and Good', 'Shield', 'Sleep', 'Speak with Animals',
  'Spiritual Weapon', 'Thunderwave', 'Unseen Servant',
  
  // 2nd Level
  'Aid', 'Alter Self', 'Animal Messenger', 'Augury', 'Barkskin', 'Beast Sense', 'Blindness/Deafness',
  'Blur', 'Cloud of Daggers', 'Continual Flame', 'Darkness', 'Darkvision', 'Detect Thoughts',
  'Enhance Ability', 'Enlarge/Reduce', 'Flaming Sphere', 'Gentle Repose', 'Heat Metal', 'Hold Person',
  'Invisibility', 'Knock', 'Lesser Restoration', 'Levitate', 'Locate Object', 'Magic Weapon',
  'Mirror Image', 'Misty Step', 'Pass without Trace', 'Prayer of Healing', 'Scorching Ray',
  'See Invisibility', 'Shatter', 'Shield of Faith', 'Silence', 'Spider Climb', 'Suggestion',
  'Web', 'Zone of Truth',
  
  // 3rd Level
  'Animate Dead', 'Bestow Curse', 'Blink', 'Call Lightning', 'Clairvoyance', 'Counterspell',
  'Create Food and Water', 'Daylight', 'Dispel Magic', 'Fear', 'Fireball', 'Fly', 'Gaseous Form',
  'Glyph of Warding', 'Haste', 'Hypnotic Pattern', 'Lightning Bolt', 'Magic Circle', 'Major Image',
  'Mass Healing Word', 'Meld into Stone', 'Plant Growth', 'Protection from Energy', 'Remove Curse',
  'Revivify', 'Sending', 'Slow', 'Speak with Dead', 'Spirit Guardians', 'Stinking Cloud',
  'Tongues', 'Vampiric Touch', 'Water Breathing', 'Wind Wall',
  
  // 4th Level
  'Arcane Eye', 'Banishment', 'Blight', 'Confusion', 'Conjure Minor Elementals', 'Control Water',
  'Death Ward', 'Dimension Door', 'Divination', 'Dominate Beast', 'Fabricate', 'Fire Shield',
  'Freedom of Movement', 'Giant Insect', 'Greater Invisibility', 'Guardian of Faith', 'Hallucinatory Terrain',
  'Ice Storm', 'Locate Creature', 'Phantasmal Killer', 'Polymorph', 'Stone Shape', 'Stoneskin',
  'Wall of Fire', 'Wall of Stone',
  
  // 5th Level
  'Animate Objects', 'Antilife Shell', 'Awaken', 'Banishing Smite', 'Bigby\'s Hand', 'Circle of Power',
  'Cloudkill', 'Commune', 'Cone of Cold', 'Conjure Elemental', 'Contact Other Plane', 'Contagion',
  'Creation', 'Dominate Person', 'Dream', 'Flame Strike', 'Geas', 'Greater Restoration', 'Hold Monster',
  'Insect Plague', 'Legend Lore', 'Mass Cure Wounds', 'Mislead', 'Modify Memory', 'Passwall',
  'Planar Binding', 'Raise Dead', 'Reincarnate', 'Scrying', 'Seeming', 'Telekinesis', 'Teleportation Circle',
  'Tree Stride', 'Wall of Force', 'Wall of Stone',
  
  // 6th Level
  'Arcane Gate', 'Chain Lightning', 'Circle of Death', 'Contingency', 'Create Undead', 'Disintegrate',
  'Eyebite', 'Find the Path', 'Flesh to Stone', 'Forbiddance', 'Globe of Invulnerability', 'Guards and Wards',
  'Harm', 'Heal', 'Heroes\' Feast', 'Magic Jar', 'Mass Suggestion', 'Move Earth', 'Otto\'s Irresistible Dance',
  'Planar Ally', 'Programmed Illusion', 'Sunbeam', 'Transport via Plants', 'True Seeing', 'Wall of Ice',
  'Wind Walk', 'Word of Recall',
  
  // 7th Level
  'Delayed Blast Fireball', 'Etherealness', 'Finger of Death', 'Fire Storm', 'Force Cage', 'Mirage Arcane',
  'Mordenkainen\'s Sword', 'Plane Shift', 'Prismatic Spray', 'Project Image', 'Regenerate', 'Resurrection',
  'Reverse Gravity', 'Sequester', 'Simulacrum', 'Symbol', 'Teleport',
  
  // 8th Level
  'Animal Shapes', 'Antimagic Field', 'Clone', 'Control Weather', 'Demiplane', 'Dominate Monster',
  'Earthquake', 'Feeblemind', 'Holy Aura', 'Incendiary Cloud', 'Maze', 'Mind Blank', 'Power Word Stun',
  'Sunburst', 'Telepathic Bond',
  
  // 9th Level
  'Astral Projection', 'Foresight', 'Gate', 'Imprisonment', 'Mass Heal', 'Meteor Swarm', 'Power Word Kill',
  'Prismatic Wall', 'Shapechange', 'Storm of Vengeance', 'Time Stop', 'True Polymorph', 'Weird', 'Wish'
].sort()

const loadTraitCompletionStatus = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(TRAIT_COMPLETION_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const saveTraitCompletionStatus = (completionStatus: Record<string, boolean>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TRAIT_COMPLETION_KEY, JSON.stringify(completionStatus))
  } catch (error) {
    console.error('Failed to save trait completion status:', error)
  }
}

const TraitTestPage = () => {
  // Environment check - only show in development
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TraitTestData>>({})
  const [showInputs, setShowInputs] = useState<Record<string, boolean>>({})
  const [hideCompleted, setHideCompleted] = useState<boolean>(false)
  const [traitCompletionStatus, setTraitCompletionStatus] = useState<Record<string, boolean>>({})

  // Load persistent completion status on mount
  useEffect(() => {
    const completionStatus = loadTraitCompletionStatus()
    setTraitCompletionStatus(completionStatus)
  }, [])

  // Save completion status when it changes
  useEffect(() => {
    saveTraitCompletionStatus(traitCompletionStatus)
  }, [traitCompletionStatus])

  // Production fallback - show message instead of interface
  if (!isDevelopment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dnd-ocean-400 to-dnd-ocean-600 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-dnd-ocean-800 mb-4">Development Only</h1>
          <p className="text-gray-600 mb-4">
            The traits test interface is only available in development mode.
          </p>
          <p className="text-sm text-gray-500">
            To access this interface, run the application in development mode.
          </p>
        </div>
      </div>
    )
  }

  // Calculate overall completion stats
  const getOverallCompletionStats = () => {
    let totalTraits = 0
    let completedTraits = 0
    
    Object.keys(TRAIT_TEMPLATES).forEach(traitKey => {
      totalTraits++
      if (traitCompletionStatus[traitKey]) {
        completedTraits++
      }
    })
    
    return { totalTraits, completedTraits }
  }

  // Initialize test data for a trait
  const initializeTraitTest = (traitKey: string, trait: TraitTemplate) => {
    const requiredInputs = getRequiredInputs(trait)
    const defaultInputs: Record<string, any> = {}
    
    // Create mock creature with basic stats only
    const mockCreature = {
      languageEntries: [{ language: 'Common', isCustom: false }],
      senseEntries: [{ type: 'Passive Perception', range: 10, isCalculated: true }],
      speedEntries: [{ type: 'walk', distance: 30 }], // Only walking speed initially
      damageImmunities: [],
      damageResistances: [],
      conditionImmunities: []
    }
    
    // Set default values for inputs
    requiredInputs.forEach((input, index) => {
      const key = `input_${index}`
      switch (input.inputType) {
        case 'number':
          defaultInputs[key] = input.inputPrompt?.toLowerCase().includes('dc') ? 15 : 
                             input.inputPrompt?.toLowerCase().includes('damage') ? '7 (2d6)' :
                             input.inputPrompt?.toLowerCase().includes('range') ? 60 :
                             input.inputPrompt?.toLowerCase().includes('speed') ? 30 :
                             input.inputPrompt?.toLowerCase().includes('distance') ? 20 : 10
          break
        case 'select':
          defaultInputs[key] = input.options?.[0] || ''
          break
        case 'text':
        default:
          if (input.inputPrompt?.toLowerCase().includes('caster level')) {
            defaultInputs[key] = '9th-level'
          } else if (input.inputPrompt?.toLowerCase().includes('object')) {
            defaultInputs[key] = 'statue'
          } else if (input.inputPrompt?.toLowerCase().includes('attack')) {
            defaultInputs[key] = 'claw'
          } else if (input.inputPrompt?.toLowerCase().includes('damage')) {
            defaultInputs[key] = '7 (2d6)'
          } else if (input.inputPrompt?.toLowerCase().includes('spell')) {
            defaultInputs[key] = 'charm person and hold person'
          } else if (input.inputPrompt?.toLowerCase().includes('sound')) {
            defaultInputs[key] = 'simple sounds such as animal noises'
          } else {
            defaultInputs[key] = 'example value'
          }
          break
      }
    })

    const validation = validateTraitInputs(trait, defaultInputs)
    const finalDescription = generateDynamicDescription(trait, defaultInputs)
    const effectsApplied = applyTraitEffects(mockCreature, trait, defaultInputs)

    setTestResults(prev => ({
      ...prev,
      [traitKey]: {
        trait,
        userInputs: defaultInputs,
        isValid: validation.isValid,
        errors: validation.errors,
        finalDescription,
        effectsApplied,
        isComplete: traitCompletionStatus[traitKey] || false // Use persistent completion status
      }
    }))
  }

  // Update inputs for a trait
  const updateTraitInput = (traitKey: string, inputKey: string, value: any) => {
    const currentTest = testResults[traitKey]
    if (!currentTest) return

    const updatedInputs = { ...currentTest.userInputs, [inputKey]: value }
    const validation = validateTraitInputs(currentTest.trait, updatedInputs)
    const finalDescription = generateDynamicDescription(currentTest.trait, updatedInputs)
    const mockCreature = {
      languageEntries: [{ language: 'Common', isCustom: false }],
      senseEntries: [{ type: 'Passive Perception', range: 10, isCalculated: true }],
      speedEntries: [{ type: 'walk', distance: 30 }], // Only walking speed initially
      damageImmunities: [],
      damageResistances: [],
      conditionImmunities: []
    }
    const effectsApplied = applyTraitEffects(mockCreature, currentTest.trait, updatedInputs)

    setTestResults(prev => ({
      ...prev,
      [traitKey]: {
        ...currentTest,
        userInputs: updatedInputs,
        isValid: validation.isValid,
        errors: validation.errors,
        finalDescription,
        effectsApplied
      }
    }))
  }

  // Toggle completion status for a trait
  const toggleTraitComplete = (traitKey: string) => {
    const newCompletionStatus = !traitCompletionStatus[traitKey]
    
    // Update persistent storage
    setTraitCompletionStatus(prev => ({
      ...prev,
      [traitKey]: newCompletionStatus
    }))
    
    // Update test results if they exist
    const currentTest = testResults[traitKey]
    if (currentTest) {
      setTestResults(prev => ({
        ...prev,
        [traitKey]: {
          ...currentTest,
          isComplete: newCompletionStatus
        }
      }))
    }
  }

  // Bulk completion functions
  const markAllComplete = () => {
    const allTraitKeys = Object.keys(TRAIT_TEMPLATES)
    const newCompletionStatus: Record<string, boolean> = {}
    
    allTraitKeys.forEach(key => {
      newCompletionStatus[key] = true
    })
    
    setTraitCompletionStatus(prev => ({ ...prev, ...newCompletionStatus }))
    
    setTestResults(prev => {
      const updated: Record<string, TraitTestData> = {}
      Object.keys(prev).forEach(key => {
        updated[key] = { ...prev[key], isComplete: true }
      })
      return updated
    })
  }

  const markAllIncomplete = () => {
    const allTraitKeys = Object.keys(TRAIT_TEMPLATES)
    const newCompletionStatus: Record<string, boolean> = {}
    
    allTraitKeys.forEach(key => {
      newCompletionStatus[key] = false
    })
    
    setTraitCompletionStatus(prev => ({ ...prev, ...newCompletionStatus }))
    
    setTestResults(prev => {
      const updated: Record<string, TraitTestData> = {}
      Object.keys(prev).forEach(key => {
        updated[key] = { ...prev[key], isComplete: false }
      })
      return updated
    })
  }

  // Render trait input interface
  const renderTraitInputs = (traitKey: string, trait: TraitTemplate) => {
    const requiredInputs = getRequiredInputs(trait)
    if (requiredInputs.length === 0) return null

    const testData = testResults[traitKey]
    if (!testData) return null

    // Multi-select spell component
    const SpellSelector = ({ selectedSpells, onChange }: { selectedSpells: string[], onChange: (spells: string[]) => void }) => {
      const [isOpen, setIsOpen] = useState(false)
      const [searchTerm, setSearchTerm] = useState('')
      
      const toggleSpell = (spell: string) => {
        if (selectedSpells.includes(spell)) {
          onChange(selectedSpells.filter(s => s !== spell))
        } else {
          onChange([...selectedSpells, spell])
        }
      }
      
      const filteredSpells = DND_SPELLS.filter(spell => 
        spell.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      return (
        <div className="relative">
          <div 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer flex justify-between items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-gray-700">
              {selectedSpells.length === 0 
                ? 'Select spells...' 
                : `${selectedSpells.length} spell${selectedSpells.length !== 1 ? 's' : ''} selected`
              }
            </span>
            <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
          </div>
          
          {selectedSpells.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedSpells.map(spell => (
                <span 
                  key={spell} 
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {spell}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSpell(spell)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search spells..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredSpells.map(spell => (
                <div
                  key={spell}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                    selectedSpells.includes(spell) ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={() => toggleSpell(spell)}
                >
                  <span className="flex items-center justify-between">
                    {spell}
                    {selectedSpells.includes(spell) && <span className="text-blue-600">✓</span>}
                  </span>
                </div>
              ))}
              {filteredSpells.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  No spells found matching "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Required Inputs:</h4>
        {requiredInputs.map((input, index) => {
          const inputKey = `input_${index}`
          const value = testData.userInputs[inputKey] || ''
          const isSpellInput = input.inputPrompt?.toLowerCase().includes('spell')

          return (
            <div key={index} className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {input.inputPrompt}
              </label>
              {input.inputType === 'select' && input.options ? (
                <select
                  value={value}
                  onChange={(e) => updateTraitInput(traitKey, inputKey, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {input.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : isSpellInput ? (
                <SpellSelector
                  selectedSpells={typeof value === 'string' ? value.split(', ').filter(Boolean) : []}
                  onChange={(spells) => updateTraitInput(traitKey, inputKey, spells.join(', '))}
                />
              ) : input.inputType === 'number' ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateTraitInput(traitKey, inputKey, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min="0"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateTraitInput(traitKey, inputKey, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              )}
            </div>
          )
        })}
        
        {testData.errors.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <strong>Validation Errors:</strong>
            <ul className="mt-1 list-disc list-inside">
              {testData.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // Render trait effects display
  const renderTraitEffects = (traitKey: string) => {
    const testData = testResults[traitKey]
    if (!testData) return null

    const effects = testData.effectsApplied
    const hasEffects = effects.languageEntries?.length > 1 || 
                      effects.senseEntries?.length > 1 || 
                      effects.speedEntries?.length > 1 ||
                      effects.damageImmunities?.length > 0 ||
                      effects.damageResistances?.length > 0 ||
                      effects.conditionImmunities?.length > 0

    if (!hasEffects) return null

    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-sm text-blue-700 mb-3">Automatic Effects Applied:</h4>
        
        {effects.languageEntries?.length > 1 && (
          <div className="mb-2">
            <strong className="text-sm text-blue-600">Languages Added:</strong>
            <span className="ml-2 text-sm">
              {effects.languageEntries.slice(1).map((lang: any) => lang.language).join(', ')}
            </span>
          </div>
        )}
        
        {effects.senseEntries?.length > 1 && (
          <div className="mb-2">
            <strong className="text-sm text-blue-600">Senses Added:</strong>
            <span className="ml-2 text-sm">
              {effects.senseEntries.slice(1).map((sense: any) => `${sense.type} ${sense.range} ft.`).join(', ')}
            </span>
          </div>
        )}
        
        {effects.speedEntries?.length > 1 && (
          <div className="mb-2">
            <strong className="text-sm text-blue-600">Speed Added:</strong>
            <span className="ml-2 text-sm">
              {effects.speedEntries.slice(1).map((speed: any) => `${speed.type} ${speed.distance} ft.`).join(', ')}
            </span>
          </div>
        )}
        
        {effects.damageImmunities?.length > 0 && (
          <div className="mb-2">
            <strong className="text-sm text-blue-600">Damage Immunities:</strong>
            <span className="ml-2 text-sm">{effects.damageImmunities.join(', ')}</span>
          </div>
        )}
        
        {effects.damageResistances?.length > 0 && (
          <div className="mb-2">
            <strong className="text-sm text-blue-600">Damage Resistances:</strong>
            <span className="ml-2 text-sm">{effects.damageResistances.join(', ')}</span>
          </div>
        )}
        
        {effects.conditionImmunities?.length > 0 && (
          <div className="mb-2">
            <strong className="text-sm text-blue-600">Condition Immunities:</strong>
            <span className="ml-2 text-sm">{effects.conditionImmunities.join(', ')}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dnd-ocean-400 to-dnd-ocean-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-dnd-ocean-800 mb-2">D&D Traits Test Interface</h1>
          <p className="text-gray-600 mb-6">
            Test and inspect all trait interfaces, inputs, and outputs. Each trait shows its input requirements, 
            validation, final description, and automatic effects applied to creature stats.
          </p>

          {/* Category Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">Select Category to Test:</h2>
              
              <div className="flex items-center gap-4">
                {/* Overall Completion Stats */}
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                  {(() => {
                    const { totalTraits, completedTraits } = getOverallCompletionStats()
                    return (
                      <span className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Total Progress:</span>
                        <span className="text-green-600 font-semibold">{completedTraits}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-700 font-semibold">{totalTraits}</span>
                        <span className="text-gray-500">traits</span>
                        {totalTraits > 0 && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {Math.round((completedTraits / totalTraits) * 100)}%
                          </span>
                        )}
                      </span>
                    )
                  })()}
                </div>
                
                {/* Hide Completed Toggle */}
                <label className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={hideCompleted}
                    onChange={(e) => setHideCompleted(e.target.checked)}
                    className="w-4 h-4 text-dnd-coral-500 border-gray-300 rounded focus:ring-dnd-coral-500"
                  />
                  <span className="font-medium">Hide Completed</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {TRAIT_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category)
                    // Initialize all traits in this category
                    const traits = getTraitsByCategory(category)
                    traits.forEach(trait => {
                      const traitKey = Object.keys(TRAIT_TEMPLATES).find(key => 
                        TRAIT_TEMPLATES[key].name === trait.name
                      )
                      if (traitKey) {
                        initializeTraitTest(traitKey, trait)
                      }
                    })
                  }}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-dnd-coral-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Traits Display */}
          {selectedCategory && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedCategory} Traits ({(() => {
                    const allTraits = getTraitsByCategory(selectedCategory)
                    if (!hideCompleted) return allTraits.length
                    
                    const visibleTraits = allTraits.filter(trait => {
                      const traitKey = Object.keys(TRAIT_TEMPLATES).find(key => 
                        TRAIT_TEMPLATES[key].name === trait.name
                      )
                      if (!traitKey) return true
                      
                      return !traitCompletionStatus[traitKey]
                    })
                    return `${visibleTraits.length} of ${allTraits.length} shown`
                  })()})
                </h2>
                
                {/* Completion Summary and Controls */}
                <div className="flex items-center gap-4">
                  {/* Completion Status Summary */}
                  <div className="text-sm text-gray-600">
                    {(() => {
                      const categoryTraits = getTraitsByCategory(selectedCategory)
                      const relevantKeys = categoryTraits
                        .map(trait => Object.keys(TRAIT_TEMPLATES).find(key => 
                          TRAIT_TEMPLATES[key].name === trait.name
                        ))
                        .filter(Boolean) as string[]
                      
                      const total = relevantKeys.length
                      const complete = relevantKeys.filter(key => traitCompletionStatus[key]).length
                      const incomplete = total - complete
                      
                      return (
                        <span className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">{complete} complete</span>
                          {incomplete > 0 && (
                            <span className="text-orange-600 font-medium">{incomplete} need work</span>
                          )}
                        </span>
                      )
                    })()}
                  </div>
                  
                  {/* Bulk Completion Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllComplete}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      <Check size={12} />
                      Mark All Complete
                    </button>
                    <button
                      onClick={markAllIncomplete}
                      className="px-3 py-1 text-sm text-orange-600 hover:text-orange-800 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                    >
                      Mark All Incomplete
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {getTraitsByCategory(selectedCategory)
                  .filter(trait => {
                    if (!hideCompleted) return true
                    
                    const traitKey = Object.keys(TRAIT_TEMPLATES).find(key => 
                      TRAIT_TEMPLATES[key].name === trait.name
                    )
                    if (!traitKey) return true
                    
                    return !traitCompletionStatus[traitKey]
                  })
                  .map(trait => {
                  const traitKey = Object.keys(TRAIT_TEMPLATES).find(key => 
                    TRAIT_TEMPLATES[key].name === trait.name
                  )
                  if (!traitKey) return null

                  const testData = testResults[traitKey]
                  const hasInputs = getRequiredInputs(trait).length > 0
                  const isComplete = traitCompletionStatus[traitKey] || false

                  return (
                    <div key={traitKey} className={`border rounded-lg p-5 transition-colors ${
                      isComplete 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      {/* Trait Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800">{trait.name}</h3>
                            {isComplete && (
                              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                                ✓ COMPLETE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{trait.category}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Completion Toggle Button */}
                          <button
                            onClick={() => toggleTraitComplete(traitKey)}
                            className={`p-2 rounded-full transition-colors ${
                              isComplete
                                ? 'text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200'
                                : 'text-gray-400 hover:text-green-600 bg-gray-100 hover:bg-green-50'
                            }`}
                            title={isComplete ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            <Check size={16} />
                          </button>
                          
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
                          {testData?.isValid === false && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              Invalid
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Original Description */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Original Description:</h4>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                          {trait.description}
                        </p>
                      </div>

                      {/* Inputs Section */}
                      {hasInputs && (
                        <div>
                          <button
                            onClick={() => setShowInputs(prev => ({ ...prev, [traitKey]: !prev[traitKey] }))}
                            className="flex items-center space-x-2 text-sm font-medium text-dnd-coral-600 hover:text-dnd-coral-700 mb-2"
                          >
                            <span>{showInputs[traitKey] ? '▼' : '▶'}</span>
                            <span>Input Interface ({getRequiredInputs(trait).length} inputs)</span>
                          </button>
                          
                          {showInputs[traitKey] && renderTraitInputs(traitKey, trait)}
                        </div>
                      )}

                      {/* Final Description */}
                      {testData && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Final Description:</h4>
                          <p className="text-sm text-gray-800 bg-white p-3 rounded border font-medium">
                            {testData.finalDescription}
                          </p>
                        </div>
                      )}

                      {/* Effects Applied */}
                      {renderTraitEffects(traitKey)}

                      {/* Effects Summary */}
                      {trait.effects && trait.effects.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-100 rounded">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Effect Types:</h4>
                          <div className="flex flex-wrap gap-1">
                            {trait.effects.map((effect, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                              >
                                {effect.type}
                                {effect.requiresInput && ' (input required)'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!selectedCategory && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Select a category above to view and test traits</p>
              <p className="text-sm">
                Each trait will show its interface, validation, and effects when selected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TraitTestPage
