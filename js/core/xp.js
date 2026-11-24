/* =========================================================
   DAILY RANDOM MISSIONS
========================================================= */

function seededRandom(seedText) {

    let seed = 2166136261;

    for (let i = 0; i < seedText.length; i++) {

        seed ^= seedText.charCodeAt(i);

        seed = Math.imul(seed, 16777619);

    }

    return function () {

        seed += 0x6D2B79F5;

        let t = seed;

        t = Math.imul(t ^ (t >>> 15), t | 1);

        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;

    };

}

function pickDailyMissionIds(seedText) {

    const random = seededRandom(seedText);

    const boosts = getProfileStatBoosts();

    /* Un grupo de misiones por rango. Solo entran las que encajan con el perfil */
    const pools = {};

    RANKS.forEach(({ rank }) => {
        pools[rank] = [];
    });

    let eligibleCount = 0;

    baseMissions.forEach((mission, index) => {

        if (!isMissionEligible(mission)) {
            return;
        }

        pools[mission.rank].push(index);

        eligibleCount++;

    });

    /* Mezcla ponderada: las misiones afines a tus metas quedan al final
       de cada grupo, que es de donde se sacan primero (pop) */
    Object.values(pools).forEach(pool => {

        const shuffled = pool
            .map(index => ({
                index,
                key: Math.pow(
                    random(),
                    1 / getMissionWeight(baseMissions[index], boosts)
                )
            }))
            .sort((a, b) => a.key - b.key)
            .map(item => item.index);

        pool.length = 0;

        pool.push(...shuffled);

    });

    const odds = getRankOdds();

    const amount = Math.min(
        Math.max(state.dailyMissionCount || 5, 1),
        eligibleCount
    );

    const chosen = [];

    while (chosen.length < amount) {

        /* Solo cuentan los rangos que aún tienen misiones sin usar */
        const available = {};

        RANKS.forEach(({ rank }) => {

            if (pools[rank].length > 0) {
                available[rank] = odds[rank];
            }

        });

        const rank =
            pickWeightedRank(available, random);

        chosen.push(pools[rank].pop());

    }

    return chosen.sort((a, b) => a - b);

}

function ensureDailyMissions() {

    const today = getLocalDateString();

    maybeOfferAscension();

    if (
        state.dailyMissionsDate === today &&
        Array.isArray(state.dailyMissionIds) &&
        state.dailyMissionIds.length > 0
    ) {

        return;

    }

    state.dailyMissionIds =
        pickDailyMissionIds(today);

    state.dailyMissionsDate = today;

    saveState();

}

function rerollDailyMissions() {

    const today = getLocalDateString();

    state.dailyMissionIds =
        pickDailyMissionIds(
            today + "-" + Date.now()
        );

    state.dailyMissionsDate = today;

    saveState();

    renderMissions();

}

function setDailyMissionCount(amount) {

    state.dailyMissionCount = amount;

    state.dailyMissionsDate = "";

    ensureDailyMissions();

    renderMissions();

}

/* =========================================================
   XP
========================================================= */

function xpRequired(level) {

    return level * 100;

}

function sanitizeXP(amount) {

    return clampNumber(
        Number(amount) || 0,
        0,
        MAX_XP_PER_ACTION
    );

}

function addGeneralXP(amount) {

    amount = sanitizeXP(amount);

    state.xp += amount;

    while (
        state.xp >= xpRequired(state.level)
    ) {

        state.xp -= xpRequired(state.level);

        state.level++;

        state.skillPoints++;

    }

}

function addStatXP(stat, amount) {

    amount = sanitizeXP(amount);

    const data = state.stats[stat];

    data.xp += amount;

    while (
        data.xp >= xpRequired(data.level)
    ) {

        data.xp -= xpRequired(data.level);

        data.level++;

        /* Un punto de ESA estadística, no del pozo compartido: así
           el árbol de Cuerpo solo crece entrenando Cuerpo, etc. */
        data.points = (data.points || 0) + 1;

    }

}

function getGeneralProgress() {

    return Math.min(
        100,
        (
            state.xp /
            xpRequired(state.level)
        ) * 100
    );

}
