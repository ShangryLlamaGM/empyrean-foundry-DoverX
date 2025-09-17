const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
import { EMPYREAN } from '../config.js'
import { enrich } from '../helpers.js'

export default class EmpyreanItemSheet extends ItemSheetV2 {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 400,
    })
  }

  async getData() {
    const context = await super.getData()
    context.config = EMPYREAN
    context.system = this.item.system
    context.system.enrichedDetails = await enrich(this.item.system.details)
    context.effects = this.item.effects
    return context
  }
}
