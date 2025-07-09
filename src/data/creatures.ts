import { Creature } from '@/types/creature'

export const sampleCreatures: Creature[] = [
  {
    id: 1,
    name: 'Ancient Red Dragon',
    type: 'Dragon',
    cr: '24',
    size: 'Gargantuan',
    ac: '22',
    hp: '546',
    speed: '40 ft., climb 40 ft., fly 80 ft.',
    str: 30,
    dex: 10,
    con: 29,
    int: 18,
    wis: 15,
    cha: 23,
    savingThrows: ['Dex +7', 'Con +16', 'Wis +9', 'Cha +13'],
    skills: ['Perception +16', 'Stealth +7'],
    damageImmunities: ['Fire'],
    senses: ['Blindsight 60 ft.', 'Darkvision 120 ft.'],
    languages: ['Common', 'Draconic'],
    specialAbilities: [
      {
        name: 'Legendary Resistance',
        description: 'If the dragon fails a saving throw, it can choose to succeed instead (3/Day).'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.'
      },
      {
        name: 'Bite',
        description: 'Melee Weapon Attack',
        attackBonus: 17,
        damage: '2d10 + 10 piercing plus 2d6 fire',
        range: '15 ft.'
      }
    ],
    legendaryActions: [
      {
        name: 'Detect',
        description: 'The dragon makes a Wisdom (Perception) check.',
        cost: 1
      }
    ]
  },
  {
    id: 2,
    name: 'Owlbear',
    type: 'Monstrosity',
    cr: '3',
    size: 'Large',
    ac: '13',
    hp: '59',
    speed: '40 ft.',
    str: 20,
    dex: 12,
    con: 17,
    int: 3,
    wis: 12,
    cha: 7,
    skills: ['Perception +3'],
    senses: ['Darkvision 60 ft.'],
    languages: [],
    specialAbilities: [
      {
        name: 'Keen Sight and Smell',
        description: 'The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell.'
      }
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The owlbear makes two attacks: one with its beak and one with its claws.'
      },
      {
        name: 'Beak',
        description: 'Melee Weapon Attack',
        attackBonus: 7,
        damage: '1d10 + 5 piercing',
        range: '5 ft.'
      },
      {
        name: 'Claws',
        description: 'Melee Weapon Attack',
        attackBonus: 7,
        damage: '2d8 + 5 slashing',
        range: '5 ft.'
      }
    ]
  },
  {
    id: 3,
    name: 'Goblin',
    type: 'Humanoid',
    cr: '1/4',
    size: 'Small',
    ac: '15',
    hp: '7',
    speed: '30 ft.',
    str: 8,
    dex: 14,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
    skills: ['Stealth +6'],
    senses: ['Darkvision 60 ft.'],
    languages: ['Common', 'Goblin'],
    specialAbilities: [
      {
        name: 'Nimble Escape',
        description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.'
      }
    ],
    actions: [
      {
        name: 'Scimitar',
        description: 'Melee Weapon Attack',
        attackBonus: 4,
        damage: '1d6 + 2 slashing',
        range: '5 ft.'
      },
      {
        name: 'Shortbow',
        description: 'Ranged Weapon Attack',
        attackBonus: 4,
        damage: '1d6 + 2 piercing',
        range: '80/320 ft.'
      }
    ]
  }
]
