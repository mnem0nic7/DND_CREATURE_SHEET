'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Filter, BookOpen, FileText, FolderOpen } from 'lucide-react'
import { CreatureCard } from '@/components/CreatureCard'
import { StatBlock } from '@/components/StatBlock'
import { CreatureDisplay } from '@/components/CreatureDisplay'
import { sampleCreatures } from '@/data/creatures'
import { Creature } from '@/types/creature'
import { getStoredCreature } from '@/lib/storage'

// Default new creature template
const newCreatureTemplate: Creature = {
  id: 0,
  name: 'New Creature',
  type: 'Type',
  cr: '0 (10 XP)',
  size: 'Size',
  alignment: 'Unaligned',
  ac: '10',
  armorType: 'None',
  armorSubtype: 'Unarmored',
  armorModifier: 0,
  hasShield: false,
  hp: '1 (1d8)',
  speed: '30 ft.',
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
  senses: ['Passive Perception 10'],
  languages: ['Common'],
  actions: []
}

type ViewMode = 'home' | 'browse' | 'new' | 'existing'

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null)
  const [newCreature, setNewCreature] = useState<Creature>(newCreatureTemplate)

  // Load saved new creature from localStorage on mount
  useEffect(() => {
    const savedCreature = getStoredCreature(0) // ID 0 is for new creatures
    if (savedCreature) {
      setNewCreature(savedCreature)
    }
  }, [])

  const filteredCreatures = sampleCreatures.filter(creature => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || creature.type.toLowerCase() === selectedFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const handleCreatureSelect = (creature: Creature) => {
    setSelectedCreature(creature)
  }

  const renderNavigationCards = () => (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* New Creature */}
        <div 
          className={`nav-card magical-glow ${viewMode === 'new' ? 'ring-2 ring-dnd-orange-400' : ''}`}
          onClick={() => setViewMode('new')}
        >
          <div className="text-center">
            <div className="bg-gradient-to-br from-dnd-coral-600 to-dnd-coral-700 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg floating">
              <Plus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-fantasy font-semibold text-dnd-ocean-700 mb-2">
              New
            </h2>
            <p className="text-dnd-ocean-600 font-medium">
              Create a new creature from scratch with custom stats and abilities
            </p>
          </div>
        </div>

        {/* Existing Creatures */}
        <div 
          className={`nav-card magical-glow ${viewMode === 'existing' ? 'ring-2 ring-dnd-orange-400' : ''}`}
          onClick={() => setViewMode('existing')}
        >
          <div className="text-center">
            <div className="bg-gradient-to-br from-dnd-sunset-600 to-dnd-sunset-700 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg floating" style={{ animationDelay: '0.5s' }}>
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-fantasy font-semibold text-dnd-ocean-700 mb-2">
              Existing
            </h2>
            <p className="text-dnd-ocean-600 font-medium">
              Manage and edit your saved creatures and custom monsters
            </p>
          </div>
        </div>

        {/* Browse Creatures */}
        <div 
          className={`nav-card magical-glow ${viewMode === 'browse' ? 'ring-2 ring-dnd-orange-400' : ''}`}
          onClick={() => setViewMode('browse')}
        >
          <div className="text-center">
            <div className="bg-gradient-to-br from-dnd-aqua-600 to-dnd-aqua-700 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg floating" style={{ animationDelay: '1s' }}>
              <FolderOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-fantasy font-semibold text-dnd-ocean-700 mb-2">
              Browse
            </h2>
            <p className="text-dnd-ocean-600 font-medium">
              Explore the complete collection of D&D creatures and monsters
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    // Creature Detail View
    if (selectedCreature) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setSelectedCreature(null)}
              className="dnd-button"
            >
              ← Back to {viewMode === 'browse' ? 'Browse' : 'List'}
            </button>
          </div>
          <StatBlock creature={selectedCreature} />
        </div>
      )
    }

    // New Creature View
    if (viewMode === 'new') {
      return (
        <div className="max-w-4xl mx-auto">
          <StatBlock creature={newCreature} />
        </div>
      )
    }

    // Existing Creatures View
    if (viewMode === 'existing') {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="dnd-card">
            <h2 className="text-2xl font-fantasy font-bold text-dnd-orange-400 mb-6">
              Existing Creatures
            </h2>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-dnd-gold mx-auto mb-4" />
              <h3 className="text-xl font-fantasy font-semibold text-dnd-parchment-200 mb-2">
                No Saved Creatures Yet
              </h3>
              <p className="text-dnd-parchment-300 mb-6">
                You haven't created or saved any creatures yet. 
                Create your first creature or import from the browse collection.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setViewMode('new')}
                  className="dnd-button"
                >
                  Create New Creature
                </button>
                <button
                  onClick={() => setViewMode('browse')}
                  className="bg-dnd-gold text-dnd-dark px-4 py-2 rounded-md hover:bg-dnd-gold/80 transition-colors"
                >
                  Browse Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Browse Creatures View
    if (viewMode === 'browse') {
      return (
        <div className="max-w-6xl mx-auto">
          <div className="dnd-card">
            <h2 className="text-2xl font-fantasy font-bold text-dnd-orange-400 mb-6">
              Browse Creatures
            </h2>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search creatures..."
                  className="dnd-input w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="dnd-input"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="dragon">Dragon</option>
                  <option value="monstrosity">Monstrosity</option>
                  <option value="humanoid">Humanoid</option>
                  <option value="beast">Beast</option>
                  <option value="undead">Undead</option>
                </select>
              </div>
            </div>

            {/* Creatures Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreatures.map((creature) => (
                <CreatureCard key={creature.id} creature={creature} onSelect={handleCreatureSelect} />
              ))}
            </div>

            {filteredCreatures.length === 0 && (
              <div className="text-center py-12">
                <div className="text-dnd-parchment-300 text-lg">
                  No creatures found matching your search criteria.
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Home view - no additional content, just navigation cards
    return null
  }

  return (
    <div className="space-y-8">
      {/* Navigation Cards - Always Visible */}
      {renderNavigationCards()}
      
      {/* Dynamic Content Below */}
      {renderContent()}
    </div>
  )
}
