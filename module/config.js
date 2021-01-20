export const KNU = {};

KNU.expertises = {
    novice: "Novice",
    initiate: "Initié",
    expert: "Expert",
    master: "Maître",
    grandmaster:  "Grand maître",
};

KNU.expertisesCost = {
    novice: 50,
    initiate: 150,
    expert: 350,
    master: 650,
    grandmaster:  1150,
};

KNU.characteristics = {
    pf: "Physique-Feu",
    pt: "Physique-Terre",
    pa: "Physique-Air",
    pe: "Physique-Eau",

    if: "Intellectuel-Feu",
    it: "Intellectuel-Terre",
    ia: "Intellectuel-Air",
    ie: "Intellectuel-Eau",

    sof: "Social-Feu",
    sot: "Social-Terre",
    soa: "Social-Air",
    soe: "Social-Eau",

    spf: "Spirituel-Feu",
    spt: "Spirituel-Terre",
    spa: "Spirituel-Air",
    spe: "Spirituel-Eau",

    vf: "Vitalité-Feu",
    vt: "Vitalité-Terre",
    va: "Vitalité-Air",
    ve: "Vitalité-Eau",
};

KNU.characteristics_index = {
    pf: ["physical", "fire"],
    pt: ["physical", "earth"],
    pa: ["physical", "air"],
    pe: ["physical", "water"],

    if: ["intellectual", "fire"],
    it: ["intellectual", "earth"],
    ia: ["intellectual", "air"],
    ie: ["intellectual", "water"],

    sof: ["social", "fire"],
    sot: ["social", "earth"],
    soa: ["social", "air"],
    soe: ["social", "water"],

    spf: ["spiritual", "fire"],
    spt: ["spiritual", "earth"],
    spa: ["spiritual", "air"],
    spe: ["spiritual", "water"],

    vf: ["vitality", "fire"],
    vt: ["vitality", "earth"],
    va: ["vitality", "air"],
    ve: ["vitality", "water"],

};

KNU.charac_to_french = {
    physical: "Physique",
    intellectual: "Intellectuel",
    social: "Social",
    spiritual: "Spirituel",
    vitality: "Vitalité",

    fire: "Feu",
    earth: "Terre",
    air: "Air",
    water: "Eau",
};

KNU.weapon_types = {
    melee: "Corps à corps",
    distance: "Distance"
}

KNU.attack_names = {
    principal: "principale",
    secondary: "secondaire",
    tertiary: "tertiaire"
}