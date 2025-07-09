'use client'

import { useState } from 'react'
import { Search, Plus, Filter, BookOpen } from 'lucide-react'
import { CreatureCard } from '@/components/CreatureCard'
import { StatBlock } from '@/components/StatBlock'
import { sampleCreatures } from '@/data/creatures'
import { Creature } from '@/types/creature'

export default function HomePage() {
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

  if (selectedCreature) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setSelectedCreature(null)}
            className="dnd-button"
          >
            ← Back to List
          </button>
        </div>
        <StatBlock creature={selectedCreature} />
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
