const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
import { EMPYREAN } from '../config.js'
import { enrich, clamp } from '../helpers.js'
import EmpyreanActorSheet from './actor.js'

export default class EmpyreanThreatSheet extends EmpyreanActorSheet {
  static PARTS = { body: { template: '${EMPYREAN.root_path}/templates/sheets/threat.hbs' } };

  

  async getData() {
    const context = await await super.getData()
    context.system = this.actor.system

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
    }

    context.system.enrichedDetails = await enrich(this.actor.system.description)
    context.aspects = []
    context.drives = []
    context.quirks = []

    for (const attribute of this.actor.itemTypes.attribute) {
      if (attribute.system.type === 'aspect') {
        context.aspects.push(attribute)
      }
    }

    for (const attribute of this.actor.itemTypes.attribute) {
      if (attribute.system.type === 'drive') {
        context.drives.push(attribute)
      }
    }

    for (const attribute of this.actor.itemTypes.attribute) {
      if (attribute.system.type === 'quirk') {
        context.quirks.push(attribute)
      }
    }

    context.system.resources = this.actor.itemTypes.resource.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  activateListeners(html) {
    // Add item
    html.find('.addItem').click(this.addItem.bind(this))

    super.activateListeners(html)
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'aspect':
      case 'drive':
      case 'quirk':
        this.addAttribute(data.itemType)
        break
      case 'sight':
      case 'sound':
      case 'smell':
      case 'taste':
        this.addSlimItem(data.itemType)
        break
      case 'resource':
        this.addResource()
        break
      default:
        ui.notifications.warn(
          `Type "${data.itemType}" not recognised or not implemented`,
        )
        break
    }
  }

  async addAttribute(aspectType) {
    const defaultData = {track: {
      current: 0,
      max: 10,
  },
};

    const itemData = {
      name: game.i18n.localize('empyrean.newAttributeName'),
      type: 'attribute',
      system: {
        details: game.i18n.localize('empyrean.newAttributeDetails'),
        type: attributeType,
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
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }
}
