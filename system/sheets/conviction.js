const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
import { EMPYREAN } from '../config.js';
import { enrich } from '../helpers.js';

export default class EmpyreanConvictionSheet extends ItemSheetV2 {
  static PARTS = { body: { template: '${EMPYREAN.root_path}/templates/sheets/conviction.hbs' } };

  

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 400,
    });
  }

  async getData() {
    const context = await await super.getData();
    
    // Create a duplicate of the system data to avoid reference loops
    context.system = foundry.utils.duplicate(this.item.system);

    // Enrich details for display
    context.system.enrichedDetails = await enrich(context.system.details);

    // Ensure checkboxes exist
    if (!Array.isArray(context.system.checkboxes)) {
        context.system.checkboxes = [false, false, false, false, false];
    }

    // Ensure highlightedIndex exists
    context.system.highlightedIndex = context.system.highlightedIndex ?? null;

    console.log("Conviction Sheet Data:", context);
    return context;
}


  

  activateListeners(html) {
    super.activateListeners(html);

    // Handle checkbox toggles
    html.find("input[type='checkbox']").on("change", (event) => {
      const index = event.currentTarget.dataset.index;
      const checked = event.currentTarget.checked;
      this.item.update({ [`system.checkbox${index}`]: checked });
    });

    // Handle highlight selection (right-click)
    html.find(".checkbox-label").on("contextmenu", (event) => {
      event.preventDefault();
      const index = event.currentTarget.querySelector("input").dataset.index;
      this.item.update({ "system.highlightedIndex": index });
    });
  }
}
