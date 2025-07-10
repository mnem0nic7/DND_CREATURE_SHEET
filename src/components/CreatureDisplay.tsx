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
      <div className="classic-stat-block">
        {/* Title */}
        <div className="section-divider border-b pb-3 mb-4">
          <h1 className="text-2xl font-bold mb-1">
            {creature.name || "New Creature"}
          </h1>
          <p className="text-sm italic">
            {creature.size && creature.type 
              ? `${creature.size} ${creature.type}${creature.alignment ? `, ${creature.alignment}` : ''}`
              : "Medium humanoid, neutral"
            }
          </p>
        </div>

        {/* Basic Stats */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex">
            <span className="stat-name w-32">Armor Class</span>
            <span className="stat-value">{creature.armorClass}</span>
          </div>
          <div className="flex">
            <span className="stat-name w-32">Hit Points</span>
            <span className="stat-value">
              {creature.hitPoints} ({creature.hitDice})
            </span>
          </div>
          <div className="flex">
            <span className="stat-name w-32">Speed</span>
            <span className="stat-value">
              {creature.speeds?.length > 0 ? creature.speeds.join(', ') : '30 ft.'}
            </span>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="section-divider border-t border-b py-4 mb-4">
          <div className="ability-scores">
            {Object.entries(creature.abilities).map(([ability, score]) => (
              <div key={ability} className="ability-score">
                <div className="ability-name">
                  {ability.slice(0, 3).toUpperCase()}
                </div>
                <div className="ability-value">
                  {score as number}
                </div>
                <div className="ability-modifier">
                  ({formatModifier(getModifier(score as number))})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-2 text-sm mb-4">
          {creature.savingThrows && (
            <div className="flex">
              <span className="stat-name w-36">Saving Throws</span>
              <span className="stat-value">{creature.savingThrows}</span>
            </div>
          )}
          {creature.skills && (
            <div className="flex">
              <span className="stat-name w-36">Skills</span>
              <span className="stat-value">{creature.skills}</span>
            </div>
          )}
          {creature.vulnerabilities && (
            <div className="flex">
              <span className="stat-name w-36">Damage Vulnerabilities</span>
              <span className="stat-value">{creature.vulnerabilities}</span>
            </div>
          )}
          {creature.resistances && (
            <div className="flex">
              <span className="stat-name w-36">Damage Resistances</span>
              <span className="stat-value">{creature.resistances}</span>
            </div>
          )}
          {creature.immunities && (
            <div className="flex">
              <span className="stat-name w-36">Damage Immunities</span>
              <span className="stat-value">{creature.immunities}</span>
            </div>
          )}
          {creature.conditionImmunities && (
            <div className="flex">
              <span className="stat-name w-36">Condition Immunities</span>
              <span className="stat-value">{creature.conditionImmunities}</span>
            </div>
          )}
          <div className="flex">
            <span className="stat-name w-36">Senses</span>
            <span className="stat-value">{creature.senses}</span>
          </div>
          <div className="flex">
            <span className="stat-name w-36">Languages</span>
            <span className="stat-value">{creature.languages}</span>
          </div>
          <div className="flex">
            <span className="stat-name w-36">Challenge</span>
            <span className="stat-value">{creature.challenge}</span>
          </div>
          <div className="flex">
            <span className="stat-name w-36">Proficiency Bonus</span>
            <span className="stat-value">{creature.proficiencyBonus}</span>
          </div>
        </div>

        {/* Special Abilities */}
        {creature.specialAbilities && creature.specialAbilities.length > 0 && (
          <div className="section-divider border-t pt-4 mb-4">
            <h3 className="text-lg font-bold mb-3">
              Special Abilities
            </h3>
            <div className="space-y-3 text-sm">
              {creature.specialAbilities.map((ability: any, index: number) => (
                <div key={index}>
                  <span className="stat-name">
                    {ability.name}.
                  </span>{' '}
                  <span className="stat-value">
                    {ability.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="section-divider border-t pt-4 mb-4">
          <h3 className="text-lg font-bold mb-3">
            Actions
          </h3>
          {creature.actions && creature.actions.length > 0 ? (
            <div className="space-y-3 text-sm">
              {creature.actions.map((action: any, index: number) => (
                <div key={index}>
                  <span className="stat-name">
                    {action.name}.
                  </span>{' '}
                  <span className="stat-value">
                    {action.description}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm italic">
              No actions defined. Click "Edit Creature" to add actions.
            </div>
          )}
        </div>

        {/* Legendary Actions */}
        {creature.legendaryActions && creature.legendaryActions.length > 0 && (
          <div className="section-divider border-t pt-4">
            <h3 className="text-lg font-bold mb-3">
              Legendary Actions
            </h3>
            <div className="space-y-3 text-sm">
              {creature.legendaryActions.map((action: any, index: number) => (
                <div key={index}>
                  <span className="stat-name">
                    {action.name}.
                  </span>{' '}
                  <span className="stat-value">
                    {action.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
