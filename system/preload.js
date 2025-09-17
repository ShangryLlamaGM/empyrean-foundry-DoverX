import { stakesText } from './enrichers.js'

export const loadHandlebarsPartials = () => {
  const partials = [
    'systems/empyrean/templates/applications/tracks/track.hbs',
    'systems/empyrean/templates/shared/aspect.hbs',
    'systems/empyrean/templates/shared/aspects.hbs',
    'systems/empyrean/templates/shared/conviction.hbs',
    'systems/empyrean/templates/shared/convictions.hbs',
    'systems/empyrean/templates/shared/wound.hbs',
    'systems/empyrean/templates/shared/wounds.hbs',
    'systems/empyrean/templates/shared/condition.hbs',
    'systems/empyrean/templates/shared/conditions.hbs',
    'systems/empyrean/templates/shared/attribute.hbs',
    'systems/empyrean/templates/shared/description.hbs',
    'systems/empyrean/templates/shared/effects.hbs',
    'systems/empyrean/templates/shared/conviction_tracker.hbs',
    'systems/empyrean/templates/sheets/threat.hbs',
    'systems/empyrean/templates/shared/number_field.hbs',
    'systems/empyrean/templates/shared/rating_mods.hbs',
    'systems/empyrean/templates/shared/select_field.hbs',
    'systems/empyrean/templates/shared/slim_item.hbs',
    'systems/empyrean/templates/shared/text_field.hbs',
    'systems/empyrean/templates/shared/track.hbs',
    'systems/empyrean/templates/sheets/player/background.hbs',
    'systems/empyrean/templates/sheets/player/edges.hbs',
    'systems/empyrean/templates/sheets/player/languages.hbs',
    'systems/empyrean/templates/sheets/player/list_track.hbs',
    'systems/empyrean/templates/sheets/player/milestones.hbs',
    'systems/empyrean/templates/sheets/player/mire.hbs',
    'systems/empyrean/templates/sheets/player/mires.hbs',
    'systems/empyrean/templates/sheets/player/resource.hbs',
    'systems/empyrean/templates/sheets/player/resources.hbs',
    'systems/empyrean/templates/sheets/player/skills.hbs',
    'systems/empyrean/templates/sheets/ship/cargo.hbs',
    'systems/empyrean/templates/sheets/ship/conditions.hbs',
    'systems/empyrean/templates/sheets/ship/design.hbs',
    'systems/empyrean/templates/sheets/ship/designs.hbs',
    'systems/empyrean/templates/sheets/ship/fittings.hbs',
    'systems/empyrean/templates/sheets/ship/rating.hbs',
    'systems/empyrean/templates/sheets/ship/ratings.hbs',
    'systems/empyrean/templates/sheets/ship/reputations.hbs',
    'systems/empyrean/templates/sheets/threat/aspects.hbs',
    'systems/empyrean/templates/sheets/threat/presence.hbs',
    'systems/empyrean/templates/sheets/threat/quirks.hbs',
    'systems/empyrean/templates/sheets/threat/resource.hbs',
    'systems/empyrean/templates/sheets/threat/resources.hbs',
  ]

  return foundry.applications.handlebars.loadTemplates(partials)
}

export const loadHandlebarsHelpers = () => {
  // Register a helper to handle checkbox states
  Handlebars.registerHelper("checked", function (value) {
      return value ? "checked" : "";
  });
  Handlebars.registerHelper('times', (n, content) => {
    let result = ''
    for (let i = 0; i < n; i++) {
      content.data.index = i + 1
      result += content.fn(i)
    }
    return result
  })

  Handlebars.registerHelper('fieldType', (type = null) => type || 'text')
  Handlebars.registerHelper(
    'any',
    (array) =>
      (array.name ? array.size : Object.values(array || [])?.length || 0) > 0,
  )
  Handlebars.registerHelper("typeof", function(value) {
    return typeof value;
});

  Handlebars.registerHelper('byKey', (array, key) => {
    return array[key]
  })
  Handlebars.registerHelper('join', (array, glue) => array.join(glue))
  Handlebars.registerHelper('displayNumber', (value) =>
    value >= 0 ? `+${value}` : value,
  )
  // Returns a track cell which is either marked, burned, or empty based on the information provided.
  Handlebars.registerHelper('trackCell', (index, value, burn) => {
    const css_class = index <= burn ? 'burned' : index <= value ? 'checked' : ''
    //console.log("trackCell called:", { index, value, burn,})
    return `<li class="box ${css_class}"><span class="dot" data-index=${index}"></span></li>`
  })
  Handlebars.registerHelper("range", function (start, end, options) {
    let result = "";
    for (let i = start; i < end; i++) {
      result += options.fn(i);
    }
    return result;
  });
  
  Handlebars.registerHelper('stakesText', (stakes) => stakesText(stakes))
  Handlebars.registerHelper('selectOptGroup', (values, options) => {
    const { label, selected } = options?.hash
    let html = `<optgroup label="${label}">`
    for (const key of Object.keys(values)) {
      html += `<option value="${key}"`
      if (selected === key) html += ` selected`
      html += `>${values[key]}</option>`
    }
    html += '</optgroup>'
    return html
  })
}
