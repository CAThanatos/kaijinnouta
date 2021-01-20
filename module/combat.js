export class KNUCombat extends Combat {
    constructor(...args) {
        super(...args);
    }

    async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
        // Structure input data
        ids = typeof ids === "string" ? [ids] : ids;
        const currentId = this.combatant._id;

        // Iterate over Combatants, performing an initiative roll for each
        // const new_combatant = await this.createCombatant(c.data, {});
        let to_add = [];
        let updates = [];
        let messages = [];
        for (let [index, cur_id] of Object.entries(ids)) {
            // Get Combatant data
            const c = this.getCombatant(cur_id);
            if ( !c || !c.owner ) return results;

            // Roll initiative
            const initiativeData = await c.actor._rollInitiative();
            const roll_results = initiativeData.rollData.dice.reduce((result, die) => {
                const cur_results = die.results.map(result => result.result);
                result = result.concat(cur_results);
                return result;
            }, []);

            updates.push({_id: cur_id, initiative: roll_results[0]});

            for (let i = 1; i < roll_results.length; ++i) {
                to_add.push({
                    data: {
                        tokenId: c.tokenId,
                        hidden: c.token.hidden
                    },
                    roll_result: roll_results[i]
                });
            }

            messages.push(initiativeData.chatData);
        }
        if ( !updates.length ) return this;

        for (let [index, addition] of Object.entries(to_add)) {
            const new_combatant = await this.createCombatant(addition.data, {});
            updates.push({_id: new_combatant._id, initiative: addition.roll_result});
        }

        // Update multiple combatants
        await this.updateEmbeddedEntity("Combatant", updates);

        // Ensure the turn order remains with the same combatant
        await this.update({turn: 0});
        // if ( updateTurn ) {
        //     await this.update({turn: this.turns.findIndex(t => t._id === currentId)});
        // }

        // Create multiple chat messages
        await CONFIG.ChatMessage.entityClass.create(messages);

        // Return the updated Combat
        return this;
    }

    async resetAll() {
        this._resetInitiatives();
        return this.update({turn: 0});
    }

    async _resetInitiatives() {
        let to_delete = [];
        let checked = {};
        let updates = [];

        this.data.combatants.map(combatant => {
            const id = combatant._id;
            if (!checked[id]) {
                for (let [key, other] of Object.entries(this.data.combatants)) {
                    const other_token = other.tokenId;

                    if ((other._id !== id) && (other_token === combatant.tokenId)) {
                        to_delete.push(other._id);
                        checked[other._id] = true;
                    }
                }
                checked[id] = true;
                updates.push({_id: id, initiative: null});
            }
        });

        await this.deleteEmbeddedEntity("Combatant", to_delete);
        await this.updateEmbeddedEntity("Combatant", updates);
    }

    async nextRound() {
        let turn = 0;
        if ( this.settings.skipDefeated ) {
          turn = this.turns.findIndex(t => {
            return !(t.defeated ||
            t.actor?.effects.find(e => e.getFlag("core", "statusId") === CONFIG.Combat.defeatedStatusId ));
          });
          if (turn === -1) {
            ui.notifications.warn(game.i18n.localize("COMBAT.NoneRemaining"));
            turn = 0;
          }
        }
        let advanceTime = Math.max(this.turns.length - this.data.turn, 1) * CONFIG.time.turnTime;
        advanceTime += CONFIG.time.roundTime;

        this._resetInitiatives();
        return this.update({round: this.round+1, turn: 0}, {advanceTime});
    }
}