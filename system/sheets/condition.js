const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
import { EMPYREAN } from '../config.js'
import { enrich } from '../helpers.js'

export default class EmpyreanConditionSheet extends ItemSheetV2 {
  static PARTS = { body: { template: '${EMPYREAN.root_path}/templates/sheets/condition.hbs' } };

  

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 400,
    })
  }

  async getData() {
    const context = await super.getData()

    context.system = this.item.system
    context.system.enrichedDetails = await enrich(this.item.system.details)

    return context
  }
}
