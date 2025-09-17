export default class EmpyreanItem extends Item {
  static getDefaultArtwork(data) {
    return {
      img: CONFIG.empyrean.defaultTokens[data.type],
      texture: { src: CONFIG.empyrean.defaultTokens[data.type] },
    }
  }
}
