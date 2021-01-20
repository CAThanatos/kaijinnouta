/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class KNUItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this.data;

    if (this.type == "skill") {
      if (this.actor) {
        const actorData = this.actor.data.data;
        const level = Number(item.data.level);
        let charac_value = 0;
        let label = `Jet de ${item.name}`;

        if (item.data.characteristic != "null") {
          const charac = item.data.characteristic;
          const charac_index = CONFIG.KNU.characteristics_index[charac];
          const type = charac_index[0];
          const element = charac_index[1];
          charac_value = Number(actorData.characteristics[type][element]);
          label = `Jet de ${item.name} sur ${CONFIG.KNU.characteristics[charac]}`;
        }

        const bonus = charac_value + level;

        let roll = new Roll(`d10+${bonus}`);
        roll.roll().toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label
        });
      }
    }
    // // Basic template rendering data
    // const token = this.actor.token;
    // const item = this.data;
    // const actorData = this.actor ? this.actor.data.data : {};
    // const itemData = item.data;

    // let roll = new Roll('d20+@abilities.str.mod', actorData);
    // let label = `Rolling ${item.name}`;
    // roll.roll().toMessage({
    //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //   flavor: label
    // });
  }
}
