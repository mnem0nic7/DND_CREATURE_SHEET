import { Creature } from '@/types/creature'

interface StatBlockProps {
  creature: Creature
}

export function StatBlock({ creature }: StatBlockProps) {
  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  return (
    <div className="stat-block">
      <div className="border-b-2 border-dnd-gold pb-4 mb-4">
        <h2 className="text-2xl font-fantasy font-bold text-dnd-dark mb-1">
          {creature.name}
        </h2>
        <p className="text-sm italic text-gray-600">
          {creature.size} {creature.type.toLowerCase()}, neutral
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex">
          <span className="font-bold w-20">AC:</span>
          <span>{creature.ac}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-20">HP:</span>
          <span>{creature.hp}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-20">Speed:</span>
          <span>{creature.speed}</span>
        </div>
      </div>

      <div className="border-t border-dnd-gold/50 pt-4 mt-4">
        <div className="grid grid-cols-6 gap-2 text-center text-sm">
          <div>
            <div className="font-bold text-dnd-dark">STR</div>
            <div>{creature.str} ({formatModifier(getModifier(creature.str))})</div>
          </div>
          <div>
            <div className="font-bold text-dnd-dark">DEX</div>
            <div>{creature.dex} ({formatModifier(getModifier(creature.dex))})</div>
          </div>
          <div>
            <div className="font-bold text-dnd-dark">CON</div>
            <div>{creature.con} ({formatModifier(getModifier(creature.con))})</div>
          </div>
          <div>
            <div className="font-bold text-dnd-dark">INT</div>
            <div>{creature.int} ({formatModifier(getModifier(creature.int))})</div>
          </div>
          <div>
            <div className="font-bold text-dnd-dark">WIS</div>
            <div>{creature.wis} ({formatModifier(getModifier(creature.wis))})</div>
          </div>
          <div>
            <div className="font-bold text-dnd-dark">CHA</div>
            <div>{creature.cha} ({formatModifier(getModifier(creature.cha))})</div>
          </div>
        </div>
      </div>

      {(creature.savingThrows || creature.skills || creature.senses || creature.languages) && (
        <div className="border-t border-dnd-gold/50 pt-4 mt-4 space-y-2 text-sm">
          {creature.savingThrows && (
            <div className="flex">
              <span className="font-bold w-24">Saves:</span>
              <span>{creature.savingThrows.join(', ')}</span>
            </div>
          )}
          {creature.skills && (
            <div className="flex">
              <span className="font-bold w-24">Skills:</span>
              <span>{creature.skills.join(', ')}</span>
            </div>
          )}
          {creature.senses && (
            <div className="flex">
              <span className="font-bold w-24">Senses:</span>
              <span>{creature.senses.join(', ')}</span>
            </div>
          )}
          {creature.languages && creature.languages.length > 0 && (
            <div className="flex">
              <span className="font-bold w-24">Languages:</span>
              <span>{creature.languages.join(', ')}</span>
            </div>
          )}
          <div className="flex">
            <span className="font-bold w-24">Challenge:</span>
            <span>{creature.cr}</span>
          </div>
        </div>
      )}

      {creature.specialAbilities && creature.specialAbilities.length > 0 && (
        <div className="border-t border-dnd-gold/50 pt-4 mt-4">
          <h3 className="font-fantasy font-bold text-dnd-dark mb-2">Special Abilities</h3>
          <div className="space-y-2 text-sm">
            {creature.specialAbilities.map((ability, index) => (
              <div key={index}>
                <span className="font-bold">{ability.name}:</span>{' '}
                <span>{ability.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {creature.actions && creature.actions.length > 0 && (
        <div className="border-t border-dnd-gold/50 pt-4 mt-4">
          <h3 className="font-fantasy font-bold text-dnd-dark mb-2">Actions</h3>
          <div className="space-y-2 text-sm">
            {creature.actions.map((action, index) => (
              <div key={index}>
                <span className="font-bold">{action.name}:</span>{' '}
                <span>{action.description}</span>
                {action.attackBonus && (
                  <span> +{action.attackBonus} to hit</span>
                )}
                {action.damage && (
                  <span>, {action.damage} damage</span>
                )}
                {action.range && (
                  <span>, range {action.range}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {creature.legendaryActions && creature.legendaryActions.length > 0 && (
        <div className="border-t border-dnd-gold/50 pt-4 mt-4">
          <h3 className="font-fantasy font-bold text-dnd-dark mb-2">Legendary Actions</h3>
          <div className="space-y-2 text-sm">
            {creature.legendaryActions.map((action, index) => (
              <div key={index}>
                <span className="font-bold">{action.name}:</span>{' '}
                <span>{action.description}</span>
                {action.cost && action.cost > 1 && (
                  <span> (Costs {action.cost} actions)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
