export const EMPYREAN = {}
EMPYREAN.root_path = 'systems/empyrean'
EMPYREAN.defaultTokens = {
  player: `${EMPYREAN.root_path}/assets/tokens/person.png`,
  ship: `${EMPYREAN.root_path}/assets/tokens/iron-hulled-warship.png`,
}
EMPYREAN.designTypes = ['size', 'frame', 'hull', 'bite', 'engine']
EMPYREAN.edgeMax = 1
EMPYREAN.edges = [
  'grace',
  'iron',
  'instinct',
  'reason',
  'fury',
  'litany',
  'veils',
  'radiance',
]
EMPYREAN.languageMax = 3
EMPYREAN.languages = [
  'abythalyss',
  'auribond',
  'battleVox',
  'eldren',
  'ferric',
  'gant',
  'glyphic',
  'glosyr',
  'highAuric',
  'husken',
  'lantic',
  'lowAuric',
  'metron',
  'skelter',
  'syncra'
]
EMPYREAN.milestoneSubtypes = ['major', 'minor']
EMPYREAN.resourceTypes = ['relic', 'loot', 'whisper', 'secret', 'rite']
EMPYREAN.shipRatings = ['armour', 'seals', 'speed', 'saws', 'stealth', 'tilt']
EMPYREAN.skillMax = 3
EMPYREAN.skills = [
  'battle',
  'break',
  'forge',
  'move',
  'elude',
  'impress',
  'obscure',
  'hunt',
  'survive',
  'mend',
  'sense',
  'study',
  'influence',
  'twist',
]
EMPYREAN.slimDefaults = {
  mires: {
    track: {
      max: 6,
      value: 0,
      burn: 0,
    },
  },
  reputations: {
    track: {
      max: 3,
      value: 0,
    },
  },
  designEffects: {
    rating: '',
    value: 0,
  },
}
EMPYREAN.trackVisibilityOptions = {
  open: 'empyrean.TRACKS.open',
  hidden: 'empyrean.TRACKS.hidden',
  secret: 'empyrean.TRACKS.secret',
  scene: 'empyrean.TRACKS.scene',
}

EMPYREAN.threatSizes = {
  small: 'empyrean.small',
  medium: 'empyrean.medium',
  large: 'empyrean.large',
  huge: 'empyrean.huge',
  variable: 'empyrean.variable',
  swarm: 'empyrean.swarm',
}

export const registerSystemSettings = () => {
  /*game.settings.register('empyrean', 'showBurnTooltip', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.showBurnTooltip.label',
    hint: 'SETTINGS.showBurnTooltip.hint',
    type: Boolean,
    default: true,
  })

  game.settings.register('empyrean', 'showAttributeTooltip', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.showAttributeTooltip.label',
    hint: 'SETTINGS.showAttributeTooltip.hint',
    type: Boolean,
    default: true,
  })*/

  game.settings.register('empyrean', 'showDepth', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.showDepth.label',
    hint: 'SETTINGS.showDepth.hint',
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  game.settings.register('empyrean', 'systemMigrationVersion', {
    config: false,
    scope: 'world',
    type: String,
    default: '',
  })
}
