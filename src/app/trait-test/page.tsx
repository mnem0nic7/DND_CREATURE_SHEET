'use client'

import React, { useState } from 'react'
import { TRAIT_TEMPLATES, TRAIT_CATEGORIES, TraitTemplate, getTraitsByCategory, generateDynamicDescription, getRequiredInputs, validateTraitInputs, applyTraitEffects } from '@/data/traits'

interface TraitTestData {
  trait: TraitTemplate
  userInputs: Record<string, any>
  isValid: boolean
  errors: string[]
  finalDescription: string
  effectsApplied: any
}

const TraitTestPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TraitTestData>>({})
  const [showInputs, setShowInputs] = useState<Record<string, boolean>>({})

  // Initialize test data for a trait
  const initializeTraitTest = (traitKey: string, trait: TraitTemplate) => {
    const requiredInputs = getRequiredInputs(trait)
    const defaultInputs: Record<string, any> = {}
    
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
    const mockCreature = {
      languageEntries: [{ language: 'Common', isCustom: false }],
      senseEntries: [{ type: 'Passive Perception', range: 10, isCalculated: true }],
      speedEntries: [{ type: 'walk', distance: 30 }],
      damageImmunities: [],
      damageResistances: [],
      conditionImmunities: []
    }
    const effectsApplied = applyTraitEffects(mockCreature, trait, defaultInputs)

    setTestResults(prev => ({
      ...prev,
      [traitKey]: {
        trait,
        userInputs: defaultInputs,
        isValid: validation.isValid,
        errors: validation.errors,
        finalDescription,
        effectsApplied
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
      speedEntries: [{ type: 'walk', distance: 30 }],
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

  // Render trait input interface
  const renderTraitInputs = (traitKey: string, trait: TraitTemplate) => {
    const requiredInputs = getRequiredInputs(trait)
    if (requiredInputs.length === 0) return null

    const testData = testResults[traitKey]
    if (!testData) return null

    return (
      <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Required Inputs:</h4>
        {requiredInputs.map((input, index) => {
          const inputKey = `input_${index}`
          const value = testData.userInputs[inputKey] || ''

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
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Select Category to Test:</h2>
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedCategory} Traits ({getTraitsByCategory(selectedCategory).length})
              </h2>
              
              <div className="space-y-6">
                {getTraitsByCategory(selectedCategory).map(trait => {
                  const traitKey = Object.keys(TRAIT_TEMPLATES).find(key => 
                    TRAIT_TEMPLATES[key].name === trait.name
                  )
                  if (!traitKey) return null

                  const testData = testResults[traitKey]
                  const hasInputs = getRequiredInputs(trait).length > 0

                  return (
                    <div key={traitKey} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                      {/* Trait Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{trait.name}</h3>
                          <p className="text-sm text-gray-500">{trait.category}</p>
                        </div>
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
