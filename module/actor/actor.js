/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class KNUActor extends Actor {
  constructor(...args) {
    super(...args);
  }

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if ((actorData.type === 'character') || (actorData.type === 'npc')) this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;

    data.totals = {
      "fire":0,
      "earth":0,
      "air":0,
      "water":0,
      "physical":0,
      "intellectual":0,
      "social":0,
      "spiritual":0,
      "vitality":0
    };

    // Loop through ability scores, and add their modifiers to our sheet output.
    data.full_total = 0;
    for (let [key, charac] of Object.entries(data.characteristics)) {

      for (let [key2, element] of Object.entries(charac)) {
        data.totals[key2] += element;
        data.totals[key] += element;
        data.full_total += element;
      }
    }

    // Derived values
    // Max energy
    data.max_energy = Number(data.characteristics.physical.fire) + Number(data.characteristics.physical.air);

    // Health
    data.health = Number(data.characteristics.physical.fire) + Number(data.characteristics.physical.earth);

    // Endurance
    data.endurance = Math.floor((Number(data.characteristics.physical.water) + Number(data.characteristics.physical.earth)) / 3);

    // // Wither
    // data.wither = 0;
    // for (let [level, cells] of Object.entries(data['wither-points'])) {
    //   for (let [index, cell] of Object.entries(data['wither-points'][level])) {
    //     data.wither += data['wither-points'][level][index];
    //   }
    // }
  }

  async addSkill(skill) {
    console.log(this.data);
    const diff_data = {"data.energy.value" : this.data.data.energy.value + 1};
    // const srcData = mergeObject(this.data, expandObject(diff_data), { inplace: false });
    await setProperty(this.data, "data.energy.value", this.data.data.energy.value + 1);
    // let diff = diffObject(flattenObject(this.data), diff_data);
    // console.log(diff);
    // console.log(this.collection)
    await this.update(diff);
    console.log(this.data);

    // console.log(this.data.data);
    // this.data.data.skills.push(skill);
    // console.log(this.data.data);
  }

  addWounds(level, id, wounds) {
    const property = `data.hit-points.${level}`;
    let cur_hp = this.data.data['hit-points'][level];
    cur_hp[id] = wounds;
    let diff = {};
    diff[property] = cur_hp;
    this.update(expandObject(diff));
  }

  inflictWounds(level, value) {
    let hp_diff = {...this.data.data['hit-points']};

    for (let cur_level = level; cur_level > 0; cur_level--) {

      const cell_max = cur_level * this.data.data.health;
      for (let [index, cell] of Object.entries(hp_diff[cur_level])) {
        const remaining_hp = cell_max - cell;
        hp_diff[cur_level][index] += Math.min(remaining_hp, value);
        value -= remaining_hp;
  
        if (value <= 0) {
          break;
        }
      }

      if (value <= 0) {
        break;
      }
      else {
        value *= 2;
      }
    }
    // const remaining = this.inflictWoundsRec(level, value);
    // console.log(remaining);

    const update = {'data.hit-points': hp_diff};
    this.update(expandObject(update));
  }

  inflictWoundsRec(level, value) {
    if (level < 1) {
      return value;
    }

    const cell_max = level * this.data.data.health;
    for (let [index, cell] of Object.entries(this.data.data['hit-points'][level])) {
      const remaining_hp = cell_max - cell;
      this.data.data['hit-points'][level][index] += Math.min(remaining_hp, value);
      value -= remaining_hp;

      if (value <= 0) {
        return 0;
      }
    }

    return this.inflictWounds(level - 1, value * 2);
  }

  resetHP() {
    for (let [level, points] of Object.entries(this.data.data['hit-points'])) {
      for (let [index, cell] of Object.entries(points)) {
        this.data.data['hit-points'][level][index] = 0;
      }
    }

    let diff = {...this.data.data['hit-points']};
    const update = {"data.hit-points":diff};
    this.update(expandObject(update));
  }

  async _rollInitiative() {
    const initiative = this.data.data.initiative;
    let roll = new Roll(`${initiative}`).roll();

    const data = {
      actor: this,
      name: this.name,
      tokenId: this.token ? `${this.token.scene._id}.${this.token.id}` : null,
      dice: roll.dice.map(d => {
        return {
          classes: [
            "roll",
            "d" + d.faces
          ].join(" "),
          results: d.results.map(r => {
            const isMax = r.result === d.faces;
            const isMin = r.result === 1;
            return {
              classes: [
                isMax ? "max" : null,
                isMin ? "min" : null
              ].join(" "),
              result: r.result
            };
          })
        }
      })
    };

    let rollMode = game.settings.get("core", "rollMode");
    let chatData = {speaker: ChatMessage.getSpeaker({ actor: this })};
    chatData = mergeObject(
      {
        rollMode: rollMode,
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.CHAT,
        // flavor: `Jet d'initiative pour ${this.name}`
      },
      chatData
    );
    chatData.content = await renderTemplate("systems/kaijinnouta/templates/chat/initiative-roll.hbs", data);

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

    return {rollData: data, chatData: chatData};
  }

  preUpdate(data) {
    data = flattenObject(data);

    return data;
  }

  /**
   * Extend the default update method to enhance data before submission.
   * See the parent Entity.update method for full details.
   *
   * @param {Object} data     The data with which to update the Actor
   * @param {Object} options  Additional options which customize the update workflow
   * @return {Promise}        A Promise which resolves to the updated Entity
   */
  async update(data, options = {}) {
    data = expandObject(this.preUpdate(data));

    const r = super.update(data, options);
    return r
  }
}