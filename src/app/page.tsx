'use client'

import { useState } from 'react'
import { Search, Plus, Filter, BookOpen, FileText, FolderOpen } from 'lucide-react'
import { CreatureCard } from '@/components/CreatureCard'
import { StatBlock } from '@/components/StatBlock'
import { sampleCreatures } from '@/data/creatures'
import { Creature } from '@/types/creature'

type ViewMode = 'home' | 'browse' | 'new' | 'existing'

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null)

  const filteredCreatures = sampleCreatures.filter(creature => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || creature.type.toLowerCase() === selectedFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const handleCreatureSelect = (creature: Creature) => {
    setSelectedCreature(creature)
  }

  // Home Screen - Main Navigation
  if (viewMode === 'home') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* New Creature */}
          <div 
            className="dnd-card hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={() => setViewMode('new')}
          >
            <div className="text-center">
              <div className="bg-dnd-red text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-fantasy font-semibold text-dnd-dark mb-2">
                New
              </h2>
              <p className="text-gray-600">
                Create a new creature from scratch with custom stats and abilities
              </p>
            </div>
          </div>

          {/* Existing Creatures */}
          <div 
            className="dnd-card hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={() => setViewMode('existing')}
          >
            <div className="text-center">
              <div className="bg-dnd-gold text-dnd-dark rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-fantasy font-semibold text-dnd-dark mb-2">
                Existing
              </h2>
              <p className="text-gray-600">
                Manage and edit your saved creatures and custom monsters
              </p>
            </div>
          </div>

          {/* Browse Creatures */}
          <div 
            className="dnd-card hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={() => setViewMode('browse')}
          >
            <div className="text-center">
              <div className="bg-gradient-to-r from-dnd-red to-dnd-gold text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-fantasy font-semibold text-dnd-dark mb-2">
                Browse
              </h2>
              <p className="text-gray-600">
                Explore the complete collection of D&D creatures and monsters
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-dnd-parchment border-2 border-dnd-gold/30 rounded-lg p-6">
            <h3 className="text-lg font-fantasy font-semibold text-dnd-dark mb-2">
              Quick Stats
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-dnd-red">{sampleCreatures.length}</div>
                <div className="text-gray-600">Sample Creatures</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-dnd-gold">329</div>
                <div className="text-gray-600">Total Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-dnd-dark">D&D 5e</div>
                <div className="text-gray-600">Compatible</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

  // Browse Creatures View
  if (viewMode === 'browse') {
    return (
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('home')}
            className="dnd-button"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-fantasy font-bold text-dnd-dark">
            Browse Creatures
          </h1>
          <div></div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
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
            <div className="text-gray-500 text-lg">
              No creatures found matching your search criteria.
            </div>
          </div>
        )}
      </div>
    )
  }

  // New Creature View
  if (viewMode === 'new') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setViewMode('home')}
            className="dnd-button"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-fantasy font-bold text-dnd-dark">
            Create New Creature
          </h1>
          <div></div>
        </div>

        <div className="dnd-card">
          <div className="text-center py-12">
            <Plus className="w-16 h-16 text-dnd-gold mx-auto mb-4" />
            <h2 className="text-xl font-fantasy font-semibold text-dnd-dark mb-2">
              Creature Creation Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              The creature creation feature is currently in development. 
              You'll be able to create custom creatures with full stat blocks, 
              abilities, and actions.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Custom ability scores</p>
              <p>• Special abilities and traits</p>
              <p>• Actions and legendary actions</p>
              <p>• Save and export functionality</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Existing Creatures View
  if (viewMode === 'existing') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setViewMode('home')}
            className="dnd-button"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-fantasy font-bold text-dnd-dark">
            Existing Creatures
          </h1>
          <div></div>
        </div>

        <div className="dnd-card">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-dnd-gold mx-auto mb-4" />
            <h2 className="text-xl font-fantasy font-semibold text-dnd-dark mb-2">
              No Saved Creatures Yet
            </h2>
            <p className="text-gray-600 mb-6">
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

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
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
          <button className="dnd-button flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Creature
          </button>
        </div>
      </div>

      {/* Creatures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatures.map((creature) => (
          <CreatureCard
            key={creature.id}
            creature={creature}
            onSelect={handleCreatureSelect}
          />
        ))}
      </div>

      {filteredCreatures.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            No creatures found matching your search criteria.
          </div>
        </div>
      )}
    </div>
  )
}
