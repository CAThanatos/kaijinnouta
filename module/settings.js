export const registerSystemSettings = function () {
    game.settings.register("kaijinnouta", "meleePenetrationFormula", {
        name: "Pénétration corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "@water * @precision.levels",
    });

    game.settings.register("kaijinnouta", "meleePrecisionFatigueFormula", {
        name: "Fatigue précision corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "(1 + @weapon.weight) * ceil(@precision.levels / 1000)",
    });

    game.settings.register("kaijinnouta", "meleeDamageFormula", {
        name: "Dommages corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "@fire * @power.levels",
    });

    game.settings.register("kaijinnouta", "meleePowerFatigueFormula", {
        name: "Fatigue puissance corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "3 * (1 + @weapon.weight) * ceil(@power.levels / 1000)",
    });

    game.settings.register("kaijinnouta", "meleeStunningFormula", {
        name: "Etourdissant corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "@weapon.stunning * @stunning.levels",
    });

    game.settings.register("kaijinnouta", "meleeStunningFatigueFormula", {
        name: "Fatigue étourdissant corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "2 * (1 + @weapon.weight) * ceil(@stunning.levels / 1000)",
    });

    game.settings.register("kaijinnouta", "meleePenetrationResultFormula", {
        name: "Total pénétration corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "@weapon.penetration + @precision.penetration + @water",
    });

    game.settings.register("kaijinnouta", "meleeDamageResultFormula", {
        name: "Total dommages corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "@weapon.damage + @power.damage + @fire",
    });

    game.settings.register("kaijinnouta", "meleeStunningResultFormula", {
        name: "Total étourdissant corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "@stunning.stun",
    });

    game.settings.register("kaijinnouta", "meleeFatigueResultFormula", {
        name: "Total fatigue corps-à-corps",
        scope: "world",
        config: true,
        type: String,
        default: "@precision.fatigue + @power.fatigue + @stunning.fatigue + @weapon.weight",
    });


    game.settings.register("kaijinnouta", "distancePenetrationFormula", {
        name: "Pénétration distance",
        scope: "world",
        config: true,
        type: String,
        default: "@water * @precision.levels",
    });

    game.settings.register("kaijinnouta", "distancePrecisionFatigueFormula", {
        name: "Fatigue précision distance",
        scope: "world",
        config: true,
        type: String,
        default: "(1 + @weapon.weight) * ceil(@precision.levels / 1000)",
    });

    game.settings.register("kaijinnouta", "distanceDamageFormula", {
        name: "Dommages distance",
        scope: "world",
        config: true,
        type: String,
        default: "@fire * @power.levels",
    });

    game.settings.register("kaijinnouta", "distancePowerFatigueFormula", {
        name: "Fatigue puissance distance",
        scope: "world",
        config: true,
        type: String,
        default: "3 * (1 + @weapon.weight) * ceil(@power.levels / 1000)",
    });

    game.settings.register("kaijinnouta", "distanceStunningFormula", {
        name: "Etourdissant distance",
        scope: "world",
        config: true,
        type: String,
        default: "@weapon.stunning * @stunning.levels",
    });

    game.settings.register("kaijinnouta", "distanceStunningFatigueFormula", {
        name: "Fatigue étourdissant distance",
        scope: "world",
        config: true,
        type: String,
        default: "2 * (1 + @weapon.weight) * ceil(@stunning.levels / 1000)",
    });

    game.settings.register("kaijinnouta", "distancePenetrationResultFormula", {
        name: "Total pénétration distance",
        scope: "world",
        config: true,
        type: String,
        default: "@weapon.penetration + @precision.penetration + @water",
    });

    game.settings.register("kaijinnouta", "distanceDamageResultFormula", {
        name: "Total dommages distance",
        scope: "world",
        config: true,
        type: String,
        default: "@weapon.damage + @power.damage + @fire",
    });

    game.settings.register("kaijinnouta", "distanceStunningResultFormula", {
        name: "Total étourdissant distance",
        scope: "world",
        config: true,
        type: String,
        default: "@stunning.stun",
    });

    game.settings.register("kaijinnouta", "distanceFatigueResultFormula", {
        name: "Total fatigue distance",
        scope: "world",
        config: true,
        type: String,
        default: "@precision.fatigue + @power.fatigue + @stunning.fatigue + @weapon.weight",
    });    
};