import { registerEmpyreanTrackSettings } from './settings.js'
import { EmpyreanTrackDatabase } from './db.js'
import { EmpyreanTrackPanel } from './panel.js'

export const setup = () => {
  registerEmpyreanTrackSettings()
  game.empyrean.trackDatabase = new EmpyreanTrackDatabase()
  game.empyrean.trackPanel = new EmpyreanTrackPanel(game.empyrean.trackDatabase)
  game.empyrean.trackDatabase.refresh()
  const top = document.querySelector('#ui-top')
  if (top) {
    const template = document.createElement('template')
    template.setAttribute('id', 'empyrean-tracks-panel')
    top?.insertAdjacentElement('afterend', template)
  }

  Handlebars.registerHelper('renderTrack', (track) => track.render())

  Hooks.on('canvasReady', () => {
    game.empyrean.trackPanel.render(true)
  })

  Hooks.on('createSetting', (setting) => {
    if (setting.key === 'empyrean.activeTracks') {
      game.empyrean.trackDatabase.refresh()
    }
  })
}
