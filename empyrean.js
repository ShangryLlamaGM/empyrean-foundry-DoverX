const { DocumentSheetConfig } = foundry.applications;
import { EMPYREAN, registerSystemSettings } from './system/config.js'
import {
  loadHandlebarsHelpers,
  loadHandlebarsPartials,
} from './system/preload.js'
import EmpyreanActor from './system/actor.js'
import { addDiceColor } from './system/dice.js'
import EmpyreanAspectSheet from './system/sheets/aspect.js'
import EmpyreanWoundSheet from './system/sheets/wound.js'
import EmpyreanConditionSheet from './system/sheets/condition.js'
import EmpyreanConvictionSheet from './system/sheets/conviction.js'
import EmpyreanAttributeSheet from './system/sheets/attribute.js'
import EmpyreanDicePool from './system/applications/dice_pool.js'
import EmpyreanItem from './system/item.js'
import EmpyreanJournalSheet from './system/sheets/journal.js'
import EmpyreanPlayerSheet from './system/sheets/player.js'
import EmpyreanResourceSheet from './system/sheets/resource.js'
import EmpyreanShipSheet from './system/sheets/ship.js'
import EmpyreanShipItemSheet from './system/sheets/ship_item.js'
import EmpyreanThreatSheet from './system/sheets/threat.js'
import { setupEnrichers } from './system/enrichers.js'
import { runMigrations } from './system/migrations.js'

import * as EmpyreanTracks from './system/applications/tracks/index.js'

Hooks.once('init', () => {
  console.log('empyrean | Initializing')

  registerSystemSettings()

  if (game.settings.get('empyrean', 'showDepth'))
    EMPYREAN.shipRatings.push('depth')

  CONFIG.empyrean = EMPYREAN
  CONFIG.ActiveEffect.legacyTransferral = false
  game.empyrean = {}

  EmpyreanTracks.setup()

  loadHandlebarsPartials()
  loadHandlebarsHelpers()
  setupEnrichers()

  CONFIG.Actor.documentClass = EmpyreanActor
  CONFIG.Item.documentClass = EmpyreanItem

  DocumentSheetConfig.unregisterSheet(Actor, "core", foundry.appv1.sheets.ActorSheet);DocumentSheetConfig.registerSheet(Actor, "empyrean", EmpyreanPlayerSheet, { types: ['player'] });DocumentSheetConfig.registerSheet(Actor, "empyrean", EmpyreanShipSheet, { types: ['ship'] });DocumentSheetConfig.registerSheet(Actor, "empyrean", EmpyreanThreatSheet, { types: ['threat'] });DocumentSheetConfig.unregisterSheet(Item, "core", foundry.appv1.sheets.ItemSheet);DocumentSheetConfig.registerSheet(Item, "empyrean", EmpyreanAspectSheet, {types: ['aspect', 'temporaryTrack']});DocumentSheetConfig.registerSheet(Item, "empyrean", EmpyreanWoundSheet, {types: ['woundTrack']});DocumentSheetConfig.registerSheet(Item, "empyrean", EmpyreanConditionSheet, {types: ['conditionTrack']});DocumentSheetConfig.registerSheet(Item, "empyrean", EmpyreanConvictionSheet, {types: ['conviction']});DocumentSheetConfig.registerSheet(Item, "empyrean", EmpyreanResourceSheet, { types: ['resource'] });DocumentSheetConfig.registerSheet(Item, "empyrean", EmpyreanShipItemSheet, {
    types: ['design', 'fitting', 'undercrew'],
  });DocumentSheetConfig.registerSheet(Item, "empyrean", EmpyreanAttributeSheet, {
    types: ['attribute'],
  });Journal.unregisterSheet('core', JournalSheet)
  Journal.registerSheet('empyrean', EmpyreanJournalSheet)

  CONFIG.TinyMCE.content_css = `${EMPYREAN.root_path}/styles/tinymce.css`
})

Hooks.once('ready', () => {
  runMigrations()
})

Hooks.on('ready', async () => {
  game.empyrean.dicePool = new EmpyreanDicePool()
})

Hooks.on('renderJournalPageSheet', (_obj, html) => {
  if (game.user.isGM) {
    html.on('click', '.track', async (event) => {
      const data = event.currentTarget.dataset
      console.log(data)

      const result = await game.empyrean.trackDatabase.showTrackDialog(
        'empyrean.TRACKS.addTrack',
        data,
      )
      if (result.cancelled) return
      game.empyrean.trackDatabase.addTrack({ ...result })
    })
  }
})

Hooks.on('renderSceneControls', (_controls, html) => {
  const dicePoolButton = $(
    `<li class="dice-pool-control" data-control="dice-pool" data-tooltip="${game.i18n.localize(
      'empyrean.dicePoolTitle',
    )}">
        <i class="fas fa-dice"></i>
        <ol class="control-tools">
        </ol>
    </li>`,
  )

  html.querySelectorAll('.main-controls').append(dicePoolButton)
  html
    .querySelectorAll('.dice-pool-control')
    .removeClass('control-tool')
    .on('click', async () => {
      await game.empyrean.dicePool.toggle()
    })
})

Hooks.once('diceSoNiceReady', (dice3d) => {
  const dark = '#2e2c20'
  const mid = '#626256'
  const light = '#858778'

  addDiceColor(dice3d, 'empyrean-dark', 'Dark', dark)
  addDiceColor(dice3d, 'empyrean-mid', 'Mid', mid)
  addDiceColor(dice3d, 'empyrean-light', 'Light', light)
})
