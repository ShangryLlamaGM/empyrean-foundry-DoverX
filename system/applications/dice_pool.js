const { FormApplicationV2 } = foundry.applications.api;
import { EMPYREAN } from '../config.js'
import * as Dice from '../dice.js'

const blankPool = {
  edge: '',
  skillLanguage: '',
  advantage: 0,
  cut: 0,
}

export default class EmpyreanDicePool extends FormApplicationV2 {
  constructor() {
    super()
    this.dicePool = { ...blankPool }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'user-dice-pool',
      template: 'systems/empyrean/templates/applications/dice_pool.hbs',
      title: game.i18n.localize('empyrean.dicePoolTitle'),
      width: 400,
      height: 'auto',
      resizable: false,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: true,
    })
  }

  async getData() {
    const context = { ...this.dicePool }
    context.config = EMPYREAN

    this.actor = game.user.character?.uuid
      ? await fromUuid(game.user.character?.uuid)
      : null

    if (!this.actor) {
      const error = game.i18n.localize('empyrean.userNotFound')
      ui.notifications.error(error)
      // throw new Error(error)
      game.user.sheet.render(true)
      return
    }
    const edgeOptions = {}
    for (const edge of EMPYREAN.edges) {
      edgeOptions[`edge.${edge}`] = game.i18n.format('empyrean.diceRating', {
        label: game.i18n.localize(`empyrean.${edge}`),
        value: this.actor.system.edges[edge] || 0,
      })
    }
    context.edgeOptions = edgeOptions

    if (!this.actor.isOwner) {
      const error = game.i18n.localize('empyrean.userNotPermitted')
      ui.notifications.error(error)
      throw new Error(error)
    }

    const skillOptions = {}
    for (const skill of EMPYREAN.skills) {
      skillOptions[`skills.${skill}`] = game.i18n.format('empyrean.diceRating', {
        label: game.i18n.localize(`empyrean.${skill}`),
        value: this.actor.system.skills[skill] || 0,
      })
    }
    context.skillOptions = skillOptions

    const languageOptions = {}
    for (const language of EMPYREAN.languages) {
      languageOptions[`languages.${language}`] = game.i18n.format('empyrean.diceRating', {
          label: game.i18n.localize(`empyrean.${language}`),
          value: this.actor.system.languages[language] || 0,
        },
      )
    }
    context.languageOptions = languageOptions

    context.advantageOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `+${n}d`]),
    )

    return context
  }

  activateListeners(html) {
    html.find('.submit').click(this.handleSubmit.bind(this))
    html.find('.cancel').click(this.handleCancel.bind(this))

    super.activateListeners(html)
  }

  async toggle() {
    if (!this.rendered) {
      await this.render(true)
    } else {
      this.close()
    }
  }

  _updateObject(event, formData) {
    event.preventDefault()
    this.dicePool = {
      ...this.dicePool,
      ...formData,
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    this.doRoll({ ...this.dicePool })
    this.close()
    this.dicePool = { ...blankPool }
  }

  handleCancel(event) {
    event.preventDefault()
    this.close()
  }

  async doRoll(dicePool) {
    const system = this.actor.system
    dicePool.edgeDice = system.edges[dicePool.edge] || 0
    const [skillType, skillKey] = dicePool.skillLanguage.split('.')
    dicePool.skillType = skillType.slice(0, -1)
    dicePool.skillKey = skillKey
    dicePool.skillDice = system[skillType]?.[skillKey] || 0
    dicePool.advantageDice = parseInt(dicePool.advantage)

    const [roll, outcome] = await Dice.rollPool(dicePool)

    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: await renderTemplate(
        'systems/empyrean/templates/chat/roll.hbs',
        outcome,
      ),
      roll,
      rolls: [roll],
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    }
    ChatMessage.create(chatData)
  }

  async setEdge(edge) {
    this.dicePool.edge = `edge.${edge}`
    this.render(true)
  }
  async setSkill(skill) {
    this.dicePool.skillLanguage = `skills.${skill}`
    this.render(true)
  }

  async setLanguage(language) {
    this.dicePool.skillLanguage = `languages.${language}`
    this.render(true)
  }
}
