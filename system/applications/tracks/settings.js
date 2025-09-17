export const registerEmpyreanTrackSettings = () => {
  game.settings.register('empyrean', 'activeTracks', {
    name: 'Active Tracks',
    scope: 'world',
    type: Object,
    default: {},
    config: false,
    onChange: () => game.empyrean.trackDatabase.refresh(),
  })

  game.settings.register('empyrean', 'trackPosition', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.trackPosition.label',
    hint: 'SETTINGS.trackPosition.hint',
    type: String,
    choices: {
      bottom: 'SETTINGS.trackPosition.bottom',
      top: 'SETTINGS.trackPosition.top',
    },
    default: 'bottom',
    requiresReload: true,
  })
}
