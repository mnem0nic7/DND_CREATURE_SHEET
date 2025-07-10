import { Creature } from '@/types/creature'

interface CreatureCardProps {
  creature: Creature
  onSelect: (creature: Creature) => void
}

export function CreatureCard({ creature, onSelect }: CreatureCardProps) {
  return (
    <div 
      className="classic-stat-block hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => onSelect(creature)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">
            {creature.name}
          </h3>
          <p className="text-sm italic">
            {creature.size} {creature.type}
          </p>
        </div>
        <div className="text-right">
          <div className="bg-red-800 text-white px-2 py-1 rounded text-sm font-bold">
            CR {creature.cr}
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="stat-name">Armor Class</span>
          <span className="stat-value">{creature.ac}</span>
        </div>
        <div className="flex justify-between">
          <span className="stat-name">Hit Points</span>
          <span className="stat-value">{creature.hp}</span>
        </div>
        <div className="flex justify-between">
          <span className="stat-name">Speed</span>
          <span className="stat-value">{creature.speed}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 section-divider border-t">
        <div className="w-full bg-red-800 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
          View Details
        </div>
      </div>
    </div>
  )
}
