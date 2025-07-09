import React from 'react';
import { ArrowLeft, Edit } from 'lucide-react';

interface CreatureDisplayProps {
  creature: any;
  onBack?: () => void;
}

export const CreatureDisplay: React.FC<CreatureDisplayProps> = ({ creature, onBack }) => {
  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - Only show if onBack is provided */}
      {onBack && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-dnd-orange-400 hover:text-dnd-orange-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <button className="dnd-button flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Creature
          </button>
        </div>
      )}

      {/* Main Stat Block */}
      <div className="stat-block">
        {/* Title */}
        <div className="border-b-2 border-dnd-orange-600 pb-3 mb-4">
          <h1 className="text-3xl font-fantasy font-bold text-dnd-orange-400 mb-1">
            {creature.name || "New Creature"}
          </h1>
          <p className="text-dnd-parchment-300 text-sm font-medium">
            {creature.size && creature.type 
              ? `${creature.size} ${creature.type}${creature.alignment ? `, ${creature.alignment}` : ''}`
              : "Medium humanoid, neutral"
            }
          </p>
        </div>

        {/* Basic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-dnd-orange-400 font-semibold">Armor Class</span>
            <span className="text-dnd-parchment-100">{creature.armorClass}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-dnd-orange-400 font-semibold">Hit Points</span>
            <span className="text-dnd-parchment-100">
              {creature.hitPoints} ({creature.hitDice})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-dnd-orange-400 font-semibold">Speed</span>
            <span className="text-dnd-parchment-100">
              {creature.speeds?.length > 0 ? creature.speeds.join(', ') : '30 ft.'}
            </span>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="border-t-2 border-b-2 border-dnd-orange-600/40 py-4 mb-4">
          <div className="grid grid-cols-6 gap-4 text-center">
            {Object.entries(creature.abilities).map(([ability, score]) => (
              <div key={ability} className="flex flex-col">
                <div className="text-dnd-orange-400 font-semibold text-sm uppercase mb-1">
                  {ability.slice(0, 3)}
                </div>
                <div className="text-dnd-parchment-100 font-bold text-lg">
                  {score as number}
                </div>
                <div className="text-dnd-parchment-300 text-sm">
                  ({formatModifier(getModifier(score as number))})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-2 mb-4">
          {creature.savingThrows && (
            <div className="flex gap-2">
              <span className="text-dnd-orange-400 font-semibold min-w-fit">Saving Throws</span>
              <span className="text-dnd-parchment-100">{creature.savingThrows}</span>
            </div>
          )}
          {creature.skills && (
            <div className="flex gap-2">
              <span className="text-dnd-orange-400 font-semibold min-w-fit">Skills</span>
              <span className="text-dnd-parchment-100">{creature.skills}</span>
            </div>
          )}
          {creature.vulnerabilities && (
            <div className="flex gap-2">
              <span className="text-dnd-orange-400 font-semibold min-w-fit">Damage Vulnerabilities</span>
              <span className="text-dnd-parchment-100">{creature.vulnerabilities}</span>
            </div>
          )}
          {creature.resistances && (
            <div className="flex gap-2">
              <span className="text-dnd-orange-400 font-semibold min-w-fit">Damage Resistances</span>
              <span className="text-dnd-parchment-100">{creature.resistances}</span>
            </div>
          )}
          {creature.immunities && (
            <div className="flex gap-2">
              <span className="text-dnd-orange-400 font-semibold min-w-fit">Damage Immunities</span>
              <span className="text-dnd-parchment-100">{creature.immunities}</span>
            </div>
          )}
          {creature.conditionImmunities && (
            <div className="flex gap-2">
              <span className="text-dnd-orange-400 font-semibold min-w-fit">Condition Immunities</span>
              <span className="text-dnd-parchment-100">{creature.conditionImmunities}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-dnd-orange-400 font-semibold min-w-fit">Senses</span>
            <span className="text-dnd-parchment-100">{creature.senses}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-dnd-orange-400 font-semibold min-w-fit">Languages</span>
            <span className="text-dnd-parchment-100">{creature.languages}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-dnd-orange-400 font-semibold min-w-fit">Challenge</span>
            <span className="text-dnd-parchment-100">{creature.challenge}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-dnd-orange-400 font-semibold min-w-fit">Proficiency Bonus</span>
            <span className="text-dnd-parchment-100">{creature.proficiencyBonus}</span>
          </div>
        </div>

        {/* Special Abilities */}
        {creature.specialAbilities && creature.specialAbilities.length > 0 && (
          <div className="border-t-2 border-dnd-orange-600/40 pt-4 mb-4">
            <h3 className="text-xl font-fantasy font-bold text-dnd-orange-400 mb-3">
              Special Abilities
            </h3>
            <div className="space-y-3">
              {creature.specialAbilities.map((ability: any, index: number) => (
                <div key={index}>
                  <h4 className="text-dnd-orange-300 font-semibold mb-1">
                    {ability.name}
                  </h4>
                  <p className="text-dnd-parchment-200 text-sm">
                    {ability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t-2 border-dnd-orange-600/40 pt-4 mb-4">
          <h3 className="text-xl font-fantasy font-bold text-dnd-orange-400 mb-3">
            Actions
          </h3>
          {creature.actions && creature.actions.length > 0 ? (
            <div className="space-y-3">
              {creature.actions.map((action: any, index: number) => (
                <div key={index}>
                  <h4 className="text-dnd-orange-300 font-semibold mb-1">
                    {action.name}
                  </h4>
                  <p className="text-dnd-parchment-200 text-sm">
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-dnd-parchment-300 text-sm italic">
              No actions defined. Click "Edit Creature" to add actions.
            </div>
          )}
        </div>

        {/* Legendary Actions */}
        {creature.legendaryActions && creature.legendaryActions.length > 0 && (
          <div className="border-t-2 border-dnd-orange-600/40 pt-4">
            <h3 className="text-xl font-fantasy font-bold text-dnd-orange-400 mb-3">
              Legendary Actions
            </h3>
            <div className="space-y-3">
              {creature.legendaryActions.map((action: any, index: number) => (
                <div key={index}>
                  <h4 className="text-dnd-orange-300 font-semibold mb-1">
                    {action.name}
                  </h4>
                  <p className="text-dnd-parchment-200 text-sm">
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
