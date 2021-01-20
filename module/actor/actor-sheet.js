import { KNU } from "../config.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class KNUActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    this.damageControlPenetration = 0;
    this.damageControlDamage = 0;
    this.combat_mod = 0;
    this.combat_roll = 0;
    this.attack_type = 'melee';
    this.attacks = {
      principal: {
        precision: {
          levels: 0
        },
        power: {
          levels: 0
        },
        stunning: {
          levels: 0
        }
      },
      secondary: {
        precision: {
          levels: 0
        },
        power: {
          levels: 0
        },
        stunning: {
          levels: 0
        }
      },
      tertiary: {
        precision: {
          levels: 0
        },
        power: {
          levels: 0
        },
        stunning: {
          levels: 0
        }
      }
    };
    this.attacks_visibility = {
      principal: true,
      secondary: false,
      tertiary: false
    };
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "actor"],
      template: "systems/kaijinnouta/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    console.log('GET DATA');
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    // for (let attr of Object.values(data.data.attributes)) {
    //   attr.isCheckbox = attr.dtype === "Boolean";
    // }

    data.config = CONFIG.KNU;
    data.isGM = game.user.isGM;
    data.isCharacter = this.entity.data.type === "character";

    data.damageControlDamage = this.damageControlDamage;
    data.damageControlPenetration = this.damageControlPenetration;

    if (this.actor.data.type == 'character') {
      // Prepare items.
      this._prepareCharacterItems(data);
    }

    // Combat tab preparation
    this._prepareCombat(data);

    return data;
  }

  _prepareCombat(sheetData) {
    sheetData.combat_mod = this.combat_mod;
    sheetData.combat_roll = this.combat_roll;
    sheetData.success_levels = Math.floor((this.combat_roll - 15) / 5);
    sheetData.attack_type = this.attack_type;

    const actorData = sheetData.actor.data;

    const combat_charac = actorData['combat-charac'];
    const water_value = actorData.characteristics[combat_charac].water;

    let combat_weapon = {
      data: {
        data: {
          weight: actorData.characteristics[combat_charac].earth,
          damage: actorData.characteristics[combat_charac].fire,
          penetration: actorData.characteristics[combat_charac].water,
          stunning: 0
        }
      }
    };
    const combat_weapon_id = actorData['combat-weapon'];
    if (combat_weapon_id != "null") {
      const weapon = this.actor.getOwnedItem(combat_weapon_id);

      if (weapon)
        combat_weapon =  weapon;
    }
    this.combat_weapon = combat_weapon;
    sheetData.combat_weapon = this.combat_weapon;

    const combat_skill_id = actorData['combat-skill'];
    if (combat_skill_id != "null") {
      const combat_skill = this.actor.getOwnedItem(combat_skill_id);
      this.combat_skill = combat_skill;
      sheetData.combat_skill = this.combat_skill;
    }
    else {
      this.combat_skill = "null";
      sheetData.combat_skill = "null";
    }

    sheetData.attacks = this.attacks;
    sheetData.attacks_visibility = this.attacks_visibility;

    const attack_type_prefix = this.attack_type;
    const penetrationFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}PenetrationFormula`);
    const precisionFatigueFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}PrecisionFatigueFormula`);
    const damageFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}DamageFormula`);
    const powerFatigueFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}PowerFatigueFormula`);
    const stunningFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}StunningFormula`);
    const stunningFatigueFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}StunningFatigueFormula`);

    const penetrationResultFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}PenetrationResultFormula`);
    const damageResultFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}DamageResultFormula`);
    const stunningResultFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}StunningResultFormula`);
    const fatigueResultFormula = game.settings.get("kaijinnouta", `${attack_type_prefix}FatigueResultFormula`);

    let formulaData = {
      ...actorData.characteristics[combat_charac],
      weapon : combat_weapon.data.data,
    };

    let cpt_attack = 1;
    for (let [index, attack] of Object.entries(sheetData.attacks)) {
      let attackData = { ...sheetData.attacks[index] };
      let curFormulaData = mergeObject(formulaData, attackData);

      let result = new Roll(penetrationFormula, curFormulaData).roll().total;
      let result_fatigue = new Roll(precisionFatigueFormula, curFormulaData).roll().total;
      const precision = {
        penetration: (result) / cpt_attack,
        fatigue: result_fatigue
      }
      mergeObject(attack.precision, precision, {recursive:true, inplace: true});
  
      result = new Roll(damageFormula, curFormulaData).roll().total;
      result_fatigue = new Roll(powerFatigueFormula, curFormulaData).roll().total;
      const power = {
        damage: (result) / cpt_attack,
        fatigue: result_fatigue
      }
      mergeObject(attack.power, power, {recursive:true, inplace: true});
  
      result = new Roll(stunningFormula, curFormulaData).roll().total;
      result_fatigue = new Roll(stunningFatigueFormula, curFormulaData).roll().total;
      const stunning = {
        stun: (result) / cpt_attack,
        fatigue: result_fatigue
      }
      mergeObject(attack.stunning, stunning, {recursive:true, inplace: true});

      attackData = { ...attack };
      curFormulaData = mergeObject(formulaData, attackData);
  
      let penetration_result = new Roll(penetrationResultFormula, curFormulaData).roll().total;
      let damage_result = new Roll(damageResultFormula, curFormulaData).roll().total;
      let stunning_result = new Roll(stunningResultFormula, curFormulaData).roll().total;
      let fatigue_result = new Roll(fatigueResultFormula, curFormulaData).roll().total;
      const results = {
        results: {
          penetration: penetration_result,
          damage: damage_result,
          stunning: stunning_result,
          fatigue: fatigue_result
        }
      };
      mergeObject(attack, results, {insertKeys:true, inplace: true});

      cpt_attack++;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const skills = []
    const weapons = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'skill') {
        skills.push(i);
      }
      else if (i.type === "weapon") {
        weapons.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.skills = skills;
    this.computeSkillPoints(actorData);
    actorData.weapons = weapons;
  }

  computeSkillPoints(actorData) {
    let total_points = 0;

    for (let [index, skill] of Object.entries(actorData.skills)) {
      const level = Number(skill.data.level);
      total_points += (level*(level + 1)) / 2;

      const expertise = skill.data.expertise;
      if (expertise != "null") {
        total_points += CONFIG.KNU.expertisesCost[expertise];
      }
    }
    
    // Adding luck points buy
    total_points += actorData.data.luck * 10;

    actorData.total_skill_points = total_points;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Tooltips
    html.mousemove((ev) => this._moveTooltips(ev));

    // Ressources rolls
    html.find(".ressources .rollable").click(this._onRollRessource.bind(this));

    // Combat mod input
    html.find(".combat-mod-input").change(this._onCombatInputChange.bind(this));

    // Attack type input
    html.find(".attack-type .attack-input").change(this._onAttackTypeChange.bind(this));

    // Success levels input
    html.find(".success-input").change(this._onSuccessInputChange.bind(this));

    // Characs rolls
    html.find(".charac .rollable").click(this._onRollCharac.bind(this));

    // Health cells rolls
    html.find(".hp-cells-controls .rollable").click(this._onCellsControl.bind(this));

    // Hit points inputs
    html.find(".hp-input").change(this._onHPInputChange.bind(this));

    // Hit points reset
    html.find(".hp-controls.raz").click(this._onHPReset.bind(this));

    // Prevent damage-control inputs to fire a render
    html.find(".damage-control input").change(this._onDamageControlChange.bind(this));

    // Damage inflict
    html.find(".damage-control .rollable").click(this._onDamageInflict.bind(this));

    // Add Skill
    html.find('.skill-create').click(this._onItemCreate.bind(this));

    // Update input
    html.find(".skill input.skill-input")
      .click(evt => evt.target.select())
      .change(this._onSkillInputChange.bind(this));

    html.find(".skill select.skill-input").change(this._onSkillInputChange.bind(this));

    // Skill roll
    html.find(".skill .rollable").click(this._onRollSkill.bind(this));

    // Delete Skill
    html.find('.skill-delete').click(ev => {
      const tr = $(ev.currentTarget).parents(".skill");
      this.actor.deleteOwnedItem(tr.data("skillId"));
      tr.slideUp(200, () => this.render(false));
    });

    // Add Weapon
    html.find('.weapon-create').click(this._onItemCreate.bind(this));

    // Update weapon input
    html.find(".weapon input.weapon-input")
      .click(evt => evt.target.select())
      .change(this._onWeaponInputChange.bind(this));

    html.find(".weapon select.weapon-input").change(this._onWeaponInputChange.bind(this));

    // Delete Weapon
    html.find('.weapon-delete').click(ev => {
      const tr = $(ev.currentTarget).parents(".weapon");
      const locked = this.actor.getOwnedItem(tr.data("weaponId")).data.data.locked;

      if (!locked) {
        this.actor.deleteOwnedItem(tr.data("weaponId"));
        li.slideUp(200, () => this.render(false));
      }
    });

    // Select combat weapon
    // html.find(".weapon-choice .combat-weapon-input").change(this._onCombatWeaponChange.bind(this));

    // Combat roll
    html.find('.combat-roll .rollable').click(this._onRollCombat.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // // Rollable abilities.
    // html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _moveTooltips(event) {
    const elem = $(event.currentTarget);
    const x = event.clientX;
    const y = event.clientY + 24;
    elem.find(".tooltip:hover .tooltipcontent").css("left", `${x}px`).css("top", `${y}px`);
  }

  _onHPReset(event) {
    event.preventDefault();

    this.actor.resetHP();
  }

  _onDamageControlChange(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;

    if (type === "penetration")
      this.damageControlPenetration = header.value;
    else if (type === "damage")
      this.damageControlDamage = header.value;
  }

  _onDamageInflict(event) {
    event.preventDefault();

    const input_penetration = $('#damage-penetration-input').get(0);
    const input_value = $('#damage-value-input').get(0);

    if (input_penetration.value && input_value.value) {
      const penetration = Number(input_penetration.value);
      const value = Number(input_value.value);

      let level = Math.min(5, Math.floor(penetration / this.actor.data.data.endurance));
      if ((level > 1) && ((penetration % this.actor.data.data.endurance) == 0)) {
        level -= 1;
      }
      this.actor.inflictWounds(level, value);
    }
    // this.actor.inflictWoundsTest(11, 1);
  }

  _onRollRessource(event) {
    event.preventDefault();

    const header = event.currentTarget;
    const type = header.dataset.type;

    if (type === "luck") {
      this.luckRoll();
    }
    else if (type === "initiative") {
      this.initiativeRoll();
    }
  }

  async luckRoll() {
    // let roll = new Roll(`{d100+5, d100-${luck}}`);
    // let label = `Rolling luck`;
    // let result = roll.roll();
    // result.toMessage({
    //   speaker: ChatMessage.getSpeaker({ actor : this.actor}),
    //   flavor: label
    // });

    const luck = this.actor.data.data.luck;
    const roll = new Roll(`d100`).roll();

    const data = {
      actor: this.actor,
      name: this.actor.name,
      tokenId: this.actor.token ? `${this.actor.token.scene._id}.${this.actor.token.id}` : null,
      result: {
        roll: roll,
        rollJSON: escape(JSON.stringify(roll)),
        luck: roll._total + luck,
        misfortune: roll._total - luck
      }
    };
    console.log(data);

    let rollMode = game.settings.get("core", "rollMode");
    let chatData = {speaker: ChatMessage.getSpeaker({ actor: this.actor })};
    chatData = mergeObject(
      {
        rollMode: rollMode,
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.CHAT,
      },
      chatData
    );
    chatData.content = await renderTemplate("systems/kaijinnouta/templates/chat/luck-roll.hbs", data);

    // Handle different roll modes
    switch (chatData.rollMode) {
      case "gmroll":
        chatData["whisper"] = game.users.entities.filter((u) => u.isGM).map((u) => u._id);
        break;
      case "selfroll":
        chatData["whisper"] = [game.user._id];
        break;
      case "blindroll":
        chatData["whisper"] = game.users.entities.filter((u) => u.isGM).map((u) => u._id);
        chatData["blind"] = true;
        break;
    }

    const msg = ChatMessage.create(chatData);
  }

  async initiativeRoll() {
    const intiativeData = await this.actor._rollInitiative();
    const msg = ChatMessage.create(intiativeData.chatData);
  }

  _onRollCombat(event) {
    event.preventDefault();

    const data = this.actor.data;

    let skill_value = 0;
    if (data.data['combat-skill'] != "null") {
      const skill_id = data.data['combat-skill'];
      const skill = this.actor.getOwnedItem(skill_id);
      skill_value = skill.data.data.level;
    }

    const combat_charac = data.data['combat-charac'];
    let charac_value = data.data.characteristics[combat_charac].water;
    if (data.data['combat-weapon'] != "null") {
      const weapon_id = data.data['combat-weapon'];
      const weapon = this.actor.getOwnedItem(weapon_id);

      if ((weapon.data.data.type === this.attack_type) && (this.attack_type === "distance")) {
        charac_value = data.data.characteristics[combat_charac].air;
      }
    }


    let roll = new Roll(`d10+${skill_value}+${charac_value}`);
    let label = `Rolling d10`;
    let result = roll.roll();
    result.toMessage({
      speaker: ChatMessage.getSpeaker({ actor : this.actor}),
      flavor: label
    });

    this.combat_roll = roll._total;
    this.render();
  }

  _onCellsControl(event) {
    event.preventDefault();

    const header = event.currentTarget;
    const type = header.dataset.type;
    const td = $(header).parents(".hp-cells-controls").get(0);
    const level = td.dataset.level;

    const cur_hp = {...this.actor.data.data['hit-points']};
    let update = {};
    const max_cells = 5;
    if (type == "add") {
      if (this.actor.data.data['hit-points'][level].length < 5) {
        cur_hp[level].push(0);
      }
    }
    else if (type == "delete") {
      if (this.actor.data.data['hit-points'][level].length > 1) {
        cur_hp[level].pop();
      }
    }
    update = {'data.hit-points': cur_hp};
    this.actor.update(expandObject(update));
  }

  _onHPInputChange(event) {
    event.preventDefault();

    const header = event.currentTarget;
    const tr = $(header).parents(".hit-points-line").get(0);
    const level = tr.dataset.level;
    const id = Number(header.dataset.id);
    const health = this.actor.data.data.health;
    const value = Math.max(0, Math.min(Number(level) * health, Number(header.value)));

    this.actor.addWounds(level, id, value);
    // this.render();
  }

  _onSkillInputChange(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const tr = $(header).parents(".skill").get(0);
    const id = tr.dataset.skillId;
    const update = {_id: id};

    const input_type = header.dataset.inputType;
    const new_value = header.value;
    if (input_type == "name") {
      update.name = new_value;
    }
    else if (input_type == "level") {
      update.data = {level: new_value};
    }
    else if (input_type == "expertise") {
      update.data = {expertise: new_value};
    }
    else if (input_type == "charac") {
      update.data = {characteristic: new_value};
    }
    else {
      console.log(`Error : ${input_type} is not a correct input type for _onSkillInputChange !`)
    }

    this.actor.updateOwnedItem(update);
  }

  _onSuccessInputChange(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const input_type = header.dataset.type;
    const new_value = header.value;
    const div = $(header).parents(".attack").get(0);
    const name = div.dataset.name;

    if (input_type == "precision") {
      this.attacks[name].precision.levels = new_value;
    }
    else if (input_type == "power") {
      this.attacks[name].power.levels = new_value;
    }
    else if (input_type == "stunning") {
      this.attacks[name].stunning.levels = new_value;
    }

    this.render();
  }

  _onAttackTypeChange(event) {
    event.preventDefault();

    const header = event.currentTarget;
    const new_value = header.value;

    this.attack_type = new_value;
    this.render();
  }

  _onCombatInputChange(event) {
    event.preventDefault();

    const header = event.currentTarget;
    const new_value = header.value;

    this.combat_mod = new_value
  }


  // async _render(...args) {
    // console.log('RENDEEEEEEER');

  //   // Trick to avoid error on elements with changing name
  //   let focus = this.element.find(":focus");
  //   focus = focus.length ? focus[0] : null;
  //   console.log(focus);

  //   // if (focus && focus.name.match(/^data\.skills\.(?:[a-zA-Z0-9]*)\.name$/)) focus.blur();

    // const result = await super._render(...args);

  //   console.log(focus);
  //   // console.log(focus.name);
  //   if ( focus && focus.name ) {
  //     const input = this.form[focus.name];
  //     console.log(input);
  //     if ( input && (input.focus instanceof Function) ) {
  //       console.log('YEP');
  //       input.focus();
  //     }
  //   }

  //   // Create placeholders
  //   // this._createPlaceholders(this.element);

  //   // Apply accessibility settings
  //   // applyAccessibilitySettings(this, this.element, {}, game.settings.get("pf1", "accessibilityConfig"));

  //   return result;
  // }

  async _onWeaponInputChange(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const tr = $(header).parents(".weapon").get(0);
    const id = tr.dataset.weaponId;
    const update = {_id: id};

    const input_type = header.dataset.inputType;
    const new_value = header.value;
    if (input_type == "name") {
      update.name = new_value;
    }
    else if (input_type == "weight") {
      update.data = {weight: new_value};
    }
    else if (input_type == "type") {
      update.data = {type: new_value};
    }
    else if (input_type == "damage") {
      update.data = {damage: new_value};
    }
    else if (input_type == "penetration") {
      update.data = {penetration: new_value};
    }
    else if (input_type == "stunning") {
      update.data = {stunning: new_value};
    }
    else {
      console.log(`Error : ${input_type} is not a correct input type for _onWeaponInputChange !`)
    }

    this.actor.updateOwnedItem(update);
  }
  
  _onCombatWeaponChange(event) {
    event.preventDefault();
    const header = event.currentTarget;

    const weapon_id = header.value;

    if (weapon_id != null){
      const weapon = this.actor.getOwnedItem(weapon_id);
      const combat_weapon = {
        name: weapon.name,
        id: weapon._id,
        weight: weapon.data.weight,
        damage: weapon.data.damage,
        penetration: weapon.data.penetration,
        type: weapon.data.type,
        stunning: weapon.data.stunning
      }
      this.actor.data['combat-weapon'] = combat_weapon;
      const update = {'data.combat-weapon': combat_weapon};
      this.actor.update(update);
    }
    else {
      this.actor.data['combat-weapon'] = "null";
      const update = {'data.combat-weapon': "null"};
      this.actor.update(update);
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  _onRollCharac(event) {
    event.preventDefault();
    let charac_type = event.currentTarget.parentElement.dataset.type;
    let charac_elem = event.currentTarget.parentElement.dataset.element;

    let roll = new Roll(`d10+@characteristics.${charac_type}.${charac_elem}`, this.actor.data.data);
    let label = `Rolling ${charac_type}-${charac_elem}`;
    roll.roll().toMessage({
      speaker: ChatMessage.getSpeaker({ actor : this.actor}),
      flavor: label
    });
  }

  _onRollSkill(event) {
    event.preventDefault();
    const parent_tr = $(event.currentTarget).parents(".skill").get(0);
    const id = parent_tr.dataset.skillId;
    const item = this.actor.getOwnedItem(id);

    item.roll();
  }
}