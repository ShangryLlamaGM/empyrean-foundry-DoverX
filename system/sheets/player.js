const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
import { EMPYREAN } from '../config.js'
import { enrich, listToRows, clamp, clickModifiers } from '../helpers.js'
import EmpyreanActorSheet from './actor.js'

export default class EmpyreanPlayerSheet extends EmpyreanActorSheet {
  static PARTS = { body: { template: '${EMPYREAN.root_path}/templates/sheets/player.hbs' } };

  

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1000,
      height: 750,
    })
  }

  async getData() {
    const context = await await super.getData()
    
    context.edgesList = listToRows(EMPYREAN.edges, 2)
    context.skillsList = listToRows(EMPYREAN.skills, 2)
    context.languagesList = listToRows(EMPYREAN.languages, 2)

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
      item.system.enrichedTags = await enrich(item.system.tags)
      item.system.enrichedAbility = await enrich(item.system.ability)
    }

    context.system = this.actor.system

    const resources = this.actor.itemTypes.resource
    for (const resourceType of EMPYREAN.resourceTypes) {
      context.system[resourceType] = resources
        .filter((r) => r.system.type === resourceType)
        .sort((a, b) => (a.sort < b.sort ? -1 : 1))
    }

    const milestones = this.actor.system.milestones
    for (const subtype of EMPYREAN.milestoneSubtypes) {
      context.system[`milestone_${subtype}`] = milestones.filter(
        (m) => m.subtype === subtype,
      )
    }

    context.aspects = this.actor.itemTypes.aspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.temporaryTracks = this.actor.itemTypes.temporaryTrack.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.woundTracks = this.actor.itemTypes.woundTrack.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )
    context.convictions = (this.actor.itemTypes?.conviction || []).sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    );
    
    context.conditionTracks = this.actor.itemTypes.conditionTrack.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.system.resources = this.actor.itemTypes.resource.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        // Mire tracks
        html.find('.mire .track').click(this.increaseMireTrack.bind(this))
        html.find('.mire .track').contextmenu(this.decreaseMireTrack.bind(this))

        // other tracks
        html.find('.list-track .track').click(this.increaseListTrack.bind(this))
        html
          .find('.list-track .track')
          .contextmenu(this.decreaseListTrack.bind(this))

        // Add item
        html.find('.addItem').click(this.addItem.bind(this))

        // rollable links
        html.find('.roll').click(this.updateRoll.bind(this))
      }
    }

    super.activateListeners(html)
  }

  async increaseListTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.closest('.track').dataset

    switch (data.itemType) {
      case 'edge':
        this.adjustEdge(data.itemId)
        break
      case 'skill':
        this.adjustSkill(data.itemId)
        break
      case 'language':
        this.adjustLanguage(data.itemId)
      default:
        break
    }
  }

  async decreaseListTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.closest('.track').dataset

    switch (data.itemType) {
      case 'edge':
        this.adjustEdge(data.itemId, -1)
        break
      case 'skill':
        this.adjustSkill(data.itemId, -1)
        break
      case 'language':
        this.adjustLanguage(data.itemId, -1)
      default:
        break
    }
  }

  async adjustEdge(key, change = 1) {
    const currentValue = this.actor.system.edges[key] || 0
    const newValue = clamp(currentValue + change, EMPYREAN.edgeMax)

    this.actor.update({
      system: {
        edges: {
          [key]: newValue,
        },
      },
    })
  }

  async adjustSkill(key, change = 1) {
    const currentValue = this.actor.system.skills[key] || 0
    const newValue = clamp(currentValue + change, EMPYREAN.skillMax)

    this.actor.update({
      system: {
        skills: {
          [key]: newValue,
        },
      },
    })
  }

  async adjustLanguage(key, change = 1) {
    const currentValue = this.actor.system.languages[key] || 0
    const newValue = clamp(currentValue + change, EMPYREAN.languageMax)

    this.actor.update({
      system: {
        languages: {
          [key]: newValue,
        },
      },
    })
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'aspect':
        this.addAspect()
        break
      case 'conviction':
        this.addConviction()
        break
      case 'milestone':
        this.addSlimItem('milestones', data.itemSubtype)
        break
      case 'mire':
      case 'mires':
        this.addSlimItem('mires')
        break
      case 'resource':
        this.addResource()
        break
      case 'temporaryTrack':
        this.addTemporaryTrack()
        break
      case 'woundTrack':
        this.addWoundTrack()
        break
      case 'conditionTrack':
        this.addConditionTrack()
        break    
      default:
        ui.notifications.warn(
          `Type "${data.itemType}" not recognised or not implemented`,
        )
        break
    }
  }

  async addAspect() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('empyrean.newAspectName'),
      type: 'aspect',
      system: {
        details: game.i18n.localize('empyrean.newAspectDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addResource() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('empyrean.newResourceName'),
      type: 'resource',
      system: {
        amount: 0,
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addTemporaryTrack() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('empyrean.newTemporaryTrackName'),
      type: 'temporaryTrack',
      system: {
        details: game.i18n.localize('empyrean.newTemporaryTrackDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }
  async addWoundTrack() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('empyrean.newWoundTrackName'),
      type: 'woundTrack',
      system: {
        details: game.i18n.localize('empyrean.newWoundTrackDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }
  async addConditionTrack() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('empyrean.newConditionTrackName'),
      type: 'conditionTrack',
      system: {
        details: game.i18n.localize('empyrean.newConditionTrackDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }
  async addConviction() {
    const defaultData = {
        checkboxes: [false, false, false, false, false], // Ensuring checkboxes exist
        highlightedIndex: null, // Allow highlighting a box
    };

    const itemData = {
      name: game.i18n.localize('empyrean.newConvictionName'),
      type: 'conviction',
      system: {
        details: game.i18n.localize('empyrean.newConvictionDetails'),
        ...defaultData, // Merge the default values with any future defaults you add
      },
    };

    this.addEmbeddedDocument(itemData);
}

  async increaseMireTrack(event) {
    event.preventDefault()
    const itemId = event.currentTarget.dataset.itemId
    this.adjustSlimTrack(itemId, 'mires', clickModifiers(event))
  }

  async decreaseMireTrack(event) {
    event.preventDefault()
    const itemId = event.currentTarget.dataset.itemId
    this.adjustSlimTrack(itemId, 'mires', clickModifiers(event), -1)
  }

  async updateRoll(event) {
    event.preventDefault()
    const data = event.currentTarget.dataset
    const dicePool = game.empyrean.dicePool

    switch (data.type) {
      case 'edge':
        dicePool.setEdge(data.value)
        break
      case 'skill':
        dicePool.setSkill(data.value)
        break
      case 'language':
        dicePool.setLanguage(data.value)
        break
    }
  }
}
