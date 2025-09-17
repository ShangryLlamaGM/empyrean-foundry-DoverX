const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
export default class EmpyreanJournalSheet extends JournalSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1100,
      height: 850,
    })
  }
}
