const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
import { EMPYREAN } from '../config.js'
import { renderDialog } from '../dialog.js'
import { clamp, clickModifiers, enrich } from '../helpers.js'
import EmpyreanActorSheet from './actor.js'
import * as Dice from '../dice.js'

export default class EmpyreanShipSheet extends EmpyreanActorSheet {
  static PARTS = { body: { template: '${EMPYREAN.root_path}/templates/sheets/ship.hbs' } };

  

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1000,
      height: 750,
    })
  }

  async getData() {
    const context = await await super.getData()
    context.system = this.actor.system

    context.stakesUsed = 0

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
      if (item.system.stakes)
        context.stakesUsed += parseInt(item.system.stakes) || 0
    }

    context.designs = {}
    for (const designType of EMPYREAN.designTypes) {
      context.designs[designType] = this.actor.itemTypes.design.filter(
        (d) => d.system.type === designType,
      )
    }

    context.system.designs = this.actor.itemTypes.design.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.system.fittings = this.actor.itemTypes.fitting.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.system.undercrew = this.actor.itemTypes.undercrew.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        html.find('.track').click(this.adjustTrack.bind(this, 1))
        html.find('.track').contextmenu(this.adjustTrack.bind(this, -1))

        html.find('.addItem').click(this.addItem.bind(this))
        html.find('.damage-button').click(this.toggleFittingDamaged.bind(this))
      }
      html.find('.ratingRoll').click(this.ratingRoll.bind(this))
    }
    super.activateListeners(html)
  }

  async adjustTrack(change, event) {
    event.preventDefault()

    const data = event.currentTarget.dataset
    const itemType = data.itemType
    const itemId = data.itemId

    switch (itemType) {
      case 'rating':
        await this.adjustRating(itemId, change, clickModifiers(event))
        break
      case 'reputations':
        await this.adjustSlimTrack(
          itemId,
          itemType,
          clickModifiers(event),
          change,
        )
        break
      default:
        break
    }
  }

  async adjustRating(rating, change = 1, isBurn) {
    const ratingMax = this.actor.system.ratings[rating]?.max || 6
    const marks = this.actor.system.ratings[rating]?.value
    const burns = this.actor.system.ratings[rating]?.burn

    let update = {
      system: {
        ratings: {
          [rating]: {
            value: marks,
            burn: burns,
          },
        },
      },
    }

    if (isBurn) {
      const newBurn = clamp(burns + change, ratingMax)
      update.system.ratings[rating].burn = newBurn
      if (marks <= burns) {
        update.system.ratings[rating].value = newBurn
      }
    } else {
      const newValue = clamp(marks + change, ratingMax, burns)
      update.system.ratings[rating].value = newValue
    }

    this.actor.update({ ...update })
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'cargoPassengers':
      case 'conditions':
      case 'reputations':
        this.addSlimItem(data.itemType)
        break
      case 'design':
        this.addDesign(data.itemSubtype)
        break
      case 'fittings':
        this.addFitting()
        break
      case 'undercrew':
        this.addUndercrew()
        break
      default:
        ui.notifications.warn(
          `Type "${data.itemType}" not recognised or not implemented`,
        )
        break
    }
  }

  async addDesign(subtype) {
    this.addEmbeddedDocument({
      name: game.i18n.format('empyrean.newDesignName', {
        subtype: game.i18n.localize(`empyrean.${subtype}`),
      }),
      type: 'design',
      system: {
        details: game.i18n.localize('empyrean.newDesignDetails'),
        type: subtype,
      },
    })
  }

  async addFitting() {
    this.addEmbeddedDocument({
      name: game.i18n.localize('empyrean.newFittingName'),
      type: 'fitting',
      system: {
        details: game.i18n.localize('empyrean.newFittingDetail'),
      },
    })
  }

  async addUndercrew() {
    this.addEmbeddedDocument({
      name: game.i18n.localize('empyrean.newUndercrewName'),
      type: 'undercrew',
      system: {
        details: game.i18n.localize('empyrean.newUndercrewDetails'),
      },
    })
  }

  async ratingRoll(event) {
    event.preventDefault()
    const rolling = event.currentTarget.dataset.rating

    const ratings = {}
    for (const rating of EMPYREAN.shipRatings) {
      const shipRating = this.actor.system.ratings[rating]
      ratings[rating] = clamp(shipRating.max - shipRating.value, shipRating.max)
    }

    const data = await renderDialog(
      game.i18n.localize('empyrean.ratingRoll'),
      this.handleRatingRoll,
      { rating: rolling, ratings },
      '/systems/empyrean/templates/dialogs/rating_roll.hbs',
    )

    if (data.cancelled) return

    const { rating, cut } = data

    const ratingDice = this.actor.system.ratings[rating]

    const dicePool = {
      rating: rolling,
      ratingDice: clamp(ratingDice.max - ratingDice.value, ratingDice.max),
      cut,
    }

    const [roll, outcome] = await Dice.rollPool(dicePool)

    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: await renderTemplate(
        'systems/empyrean/templates/chat/roll.hbs',
        outcome,
      ),
      roll,
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    }
    ChatMessage.create(chatData)
  }

  handleRatingRoll(html) {
    const form = html[0].querySelector('form')
    return {
      rating: form.rating.value,
      cut: parseInt(form.cut.value || 0),
    }
  }

  async toggleFittingDamaged(event) {
    const target = event.currentTarget
    const fittingID = target.dataset.fittingId

    const fitting = this.actor.items.get(fittingID)
    const prevStatus = fitting.system.damaged
    fitting.update({ 'system.damaged': !prevStatus })
  }
}
