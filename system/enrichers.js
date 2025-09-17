import { enrich } from './helpers.js'
import EmpyreanTrack from './applications/tracks/track.js'

export const setupEnrichers = () => {
  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      // DisplayItem - uuid, name
      pattern: /@DisplayItem\[(.+?)\](?:{(.+?)})?/gm,
      enricher: async (match) => await enrichItem(match),
    },
    {
      //Track - groups, label
      pattern: /@Track\[(.+?)\](?:{(.+?)})?/gm,
      enricher: async (match) => await enrichTrack(match),
    },
  ])
}

const enrichTrack = async (match) => {
  const [_m, groups, label] = match
  const trackLabel = label ?? game.i18n.localize('empyrean.track')
  const track = new EmpyreanTrack({ label: trackLabel, groups })
  const container = document.createElement('span')
  container.className = 'track'
  foundry.utils.mergeObject(container.dataset, { label: trackLabel, groups })

  if (game.user.isGM) {
    const tooltip = game.i18n.localize('empyrean.track_tooltip')
    foundry.utils.mergeObject(container.dataset, { tooltip })
  }

  container.innerHTML = `<a class="label">${trackLabel}</a> <span class="slots">${track.render()}</span>`
  return container
}

const enrichItem = async (match) => {
  const [_m, uuid, name] = match
  const item = await fromUuid(uuid)
  const itemName = name ?? item.name

  const container = document.createElement('div')
  container.className = 'empyrean-item'
  let html = `@UUID[${uuid}]{${itemName}}`

  if (item) {
    const traits = []
    if (item.system.stakes) traits.push(stakesText(item.system.stakes))
    if (item.system.track && item.system.track.max > 0)
      traits.push(trackText(item.system.track))
    if (item.system.type) {
      if (!['design', 'fitting'].includes(item.type))
        traits.push(item.system.type)
    }

    html = `<h3><a class="content-link" data-link draggable="true" data-uuid="${item.uuid}" data-id="${item.id}">${itemName}</a>`
    if (traits.length > 0) html += ` <small>${traits.join(' ')}</small>`
    html += '</h3>'
    if (item.system.details) html += item.system.details
    if ((item.system.ratingMods?.length || 0) > 0) {
      html += '<ul>'
      html += item.system.ratingMods
        .map((mod) => {
          const sign = mod.value >= 0 ? '+' : ''
          return `<li><strong>${game.i18n.localize(
            `empyrean.${mod.rating}`,
          )} ${sign}${mod.value}</strong></li>`
        })
        .join('')
      html += '</ul>'
    }
  }

  container.innerHTML = await enrich(html)
  return container
}

const trackText = (track) => {
  return `${track.max}-Track`
}

export const stakesText = (s) => {
  const stakes = parseInt(s)
  if (stakes === 0) return game.i18n.localize('empyrean.free')
  if (stakes === 1) return game.i18n.localize('empyrean.stakesOne')
  return game.i18n.format('empyrean.stakesMany', { stakes })
}
