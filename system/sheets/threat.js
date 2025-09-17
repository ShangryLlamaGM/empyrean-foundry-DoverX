const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
import { EMPYREAN } from '../config.js'
import { enrich, clamp } from '../helpers.js'
import EmpyreanActorSheet from './actor.js'

export default class EmpyreanThreatSheet extends EmpyreanActorSheet {
  static PARTS = { body: { template: '${EMPYREAN.root_path}/templates/sheets/threat.hbs' } };

  

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 800,
      height: 400,
    })
  }
  render(force = false, options = {}) {
  console.log("Rendering Threat Sheet:", this.actor.name, this.actor.type);
  return super.render(force, options);
}


  async getData() {
    // Ensure the correct template path is set
    this.options.template = `${EMPYREAN.root_path}/templates/sheets/threat.hbs`;
    console.log("Template Path Set:", this.options.template);

    const context = await super.getData()
    console.log("Context Data Passed to Template:", context);

     context.system = this.actor.system
     console.log("Actor Object:", this.actor);
    for (const item of this.actor.items) {
      // Logging
      console.log("Item Name:", item.name);
      console.log("Item Type:", item.type);
      console.log("Item Details:", item.system.details);
      console.log("Actor Object:", this.actor);
      item.system.enrichedDetails = await enrich(item.system.details)
    }

    context.system.enrichedDetails = await enrich(this.actor.system.description)
    console.log("Actor Object:", this.actor);
    context.drives = []

    const resources = this.actor.itemTypes.resource
    for (const resourceType of EMPYREAN.resourceTypes) {
      context.system[resourceType] = resources
        .filter((r) => r.system.type === resourceType)
        .sort((a, b) => (a.sort < b.sort ? -1 : 1))
    }

    
    context.aspects = this.actor.itemTypes.aspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
        )
        console.log("Actor Object:", this.actor)

    context.temporaryTracks = this.actor.itemTypes.temporaryTrack.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
        )
        console.log("Actor Object:", this.actor)

    context.system.resources = this.actor.itemTypes.resource.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
        )
        console.log("Actor Object:", this.actor)
    console.log("Context Data:", context);
    return context
  }

  activateListeners(html) {
    //Add Item
    html.find('.addItem').click(this.addItem.bind(this))

    super.activateListeners(html)
  }

  
  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'aspect':
        this.addAspect()
        break
            case 'resource':
        this.addResource()
        break
      case 'temporaryTrack':
        this.addTemporaryTrack()
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
  

  
  
}
