// Import Modules
import { KNU } from "./config.js";
import { KNUActor } from "./actor/actor.js";
import { KNUActorSheet } from "./actor/actor-sheet.js";
import { KNUItem } from "./item/item.js";
import { KNUItemSheet } from "./item/item-sheet.js";
import { registerSystemSettings } from "./settings.js";
import { KNUCombat } from "./combat.js"

Hooks.once('init', async function() {

  game.kaijinnouta = {
    KNUActor,
    KNUItem,
    rollItemMacro
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@initiative",
    decimals: 2
  };

  // Define custom Entity classes
  CONFIG.KNU = KNU;
  CONFIG.Actor.entityClass = KNUActor;
  CONFIG.Item.entityClass = KNUItem;
  CONFIG.Combat.entityClass = KNUCombat;

  // Register System Settings
  registerSystemSettings();
  // game.settings.register("knu", "units", {
  //   name: "SETTINGS.pf1UnitsN",
  //   hint: "SETTINGS.pf1UnitsL",
  //   scope: "world",
  //   config: true,
  //   default: "imperial",
  //   type: String,
  //   choices: {
  //     imperial: "Imperial (feet, lbs)",
  //     metric: "Metric (meters, kg)",
  //   },
  //   onChange: () => {
  //     [...game.actors.entities, ...Object.values(game.actors.tokens)]
  //       .filter((o) => {
  //         return o.data.type === "character";
  //       })
  //       .forEach((o) => {
  //         o.update({});
  //         if (o.sheet != null && o.sheet._state > 0) o.sheet.render();
  //       });
  //   },
  // });

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("kaijinnouta", KNUActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("kaijinnouta", KNUItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
        
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
  });
});

Handlebars.registerHelper('ifEquals', function(a, b, options) {
  if (a === b) {
    return options.fn(this);
  }

  return options.inverse(this);
});

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createBoilerplateMacro(data, slot));
});


// Hooks.on("createActor", async (actor, options, userId) => {
//   // Get the type of item to create.
//   const type = "weapon";

//   // Initialize the name.
//   const name = `Mains nues`;

//   const data = {
//     weight: 0,
//     damage: 0,
//     penetration: 0,
//     stunning: 0,
//     locked: true
//   }

//   // Prepare the item object.
//   const itemData = {
//     name: name,
//     type: type,
//     data: data
//   };

//   const item = await actor.createOwnedItem(itemData);
//   await setProperty(actor.data, "data.combat-weapon", item._id);
//   await actor.update({'data.combat-weapon':item._id});
// });


/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createBoilerplateMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.boilerplate.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "boilerplate.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}