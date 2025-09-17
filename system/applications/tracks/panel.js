const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { clickModifiers } from '../../helpers.js'
import EmpyreanTrack from './track.js'
import SortableJS from '../../lib/sortable.complete.esm.js'

export class EmpyreanTrackPanel extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(db, options) {
    super(options)
    this.db = db
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      id: 'empyrean-tracks-panel',
      popOut: false,
      template: 'systems/empyrean/templates/applications/tracks/panel.hbs',
    }
  }

  async getData(options) {
    const data = await await await super.getData(options)
    const tracks = await this.prepareTracks()
    return {
      ...data,
      options: {
        editable: game.user.isGM,
      },
      tracks,
      position: game.settings.get('empyrean', 'trackPosition'),
    }
  }

  async prepareTracks() {
    const tracks = game.empyrean.trackDatabase.contents
    return tracks.map((track) => new EmpyreanTrack(track))
  }

  activateListeners(html) {
    if (game.user.isGM) {
      html.find('.addTrack').click(this.addTrack.bind(this))
      html.find('.label').click(this.editTrack.bind(this))
      html.find('.delete').click(this.interactWithTrack.bind(this, 'delete'))
      html.find('.slots').click(this.interactWithTrack.bind(this, 'mark'))
      html
        .find('.slots')
        .contextmenu(this.interactWithTrack.bind(this, 'unmark'))

      new SortableJS(html.find('.track-list').get(0), {
        animation: 200,
        direction: 'vertical',
        draggable: '.track',
        dragClass: 'drag-preview',
        ghostClass: 'drag-gap',
        onEnd: (event) => {
          const id = event.item.dataset.trackId
          const newIndex = event.newDraggableIndex
          game.empyrean.trackDatabase.moveTrack(id, newIndex)
        },
      })
    }
  }

  async addTrack(event) {
    event.preventDefault()

    const data = await game.empyrean.trackDatabase.showTrackDialog(
      'empyrean.TRACKS.addTrack',
    )
    if (data.cancelled) return

    game.empyrean.trackDatabase.addTrack({ ...data })
  }

  async editTrack(event) {
    event.preventDefault()
    const id = event.currentTarget.closest('.track').dataset.trackId
    const track = game.empyrean.trackDatabase.get(id)
    const data = await game.empyrean.trackDatabase.showTrackDialog(
      'empyrean.TRACKS.editTrack',
      track,
    )
    if (data.cancelled) return

    game.empyrean.trackDatabase.updateTrack(id, data)
  }

  handleDialogData(html) {
    const form = html[0].querySelector('form')
    const groups = form.groups.value
      .trim()
      .split(',')
      .map((v) => v.trim())
      .join(',')
    return {
      label: form.label.value.trim(),
      groups,
      visibility: form.visibility.value,
    }
  }

  async interactWithTrack(action, event) {
    event.preventDefault()
    const id = event.currentTarget.closest('.track').dataset.trackId

    switch (action) {
      case 'mark':
        game.empyrean.trackDatabase.markTrack(id, clickModifiers(event))
        break
      case 'unmark':
        game.empyrean.trackDatabase.markTrack(id, clickModifiers(event), -1)
        break
      case 'delete':
        game.empyrean.trackDatabase.deleteTrack(id)
        break
      default:
        break
    }
  }
}
