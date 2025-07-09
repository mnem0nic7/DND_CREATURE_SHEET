import { Creature } from '@/types/creature'

interface CreatureCardProps {
  creature: Creature
  onSelect: (creature: Creature) => void
}

export function CreatureCard({ creature, onSelect }: CreatureCardProps) {
  return (
    <div 
      className="dnd-card hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => onSelect(creature)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-fantasy font-semibold text-dnd-dark">
            {creature.name}
          </h3>
          <p className="text-sm text-gray-600">
            {creature.size} {creature.type}
          </p>
        </div>
        <div className="text-right">
          <div className="bg-dnd-red text-white px-2 py-1 rounded text-sm font-bold">
            CR {creature.cr}
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Armor Class:</span>
          <span>{creature.ac}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Hit Points:</span>
          <span>{creature.hp}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Speed:</span>
          <span>{creature.speed}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-dnd-gold/30">
        <div className="w-full bg-dnd-gold text-dnd-dark py-2 rounded-md hover:bg-dnd-gold/80 transition-colors font-medium flex items-center justify-center gap-2">
          View Details
        </div>
      </div>
    </div>
  )
}
