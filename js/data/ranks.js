/* =========================================================
   RANK SYSTEM
   La XP nunca se escribe a mano.
   - Misiones diarias: el rango está fijado en la base de datos.
   - Misiones y hábitos propios: el rango se calcula con
     esfuerzo (obligatorio) + tiempo (opcional) + objetivo (si es de conteo).
========================================================= */

const RANKS = [
    { rank: "S", min: 80, xp: 80 },
    { rank: "A", min: 60, xp: 55 },
    { rank: "B", min: 40, xp: 35 },
    { rank: "C", min: 20, xp: 20 },
    { rank: "D", min: 0,  xp: 10 }
];

/* Sube este número cuando cambies la base de misiones diarias */
const MISSION_DB_VERSION = 2;

/* El rango S queda reservado a las misiones del sistema */
const MAX_CUSTOM_RANK = "A";

/* Tope absoluto de XP por acción (defensa extra) */
const MAX_XP_PER_ACTION = RANKS[0].xp;

/* Si no se indica tiempo, se asume una duración media */
const DEFAULT_MINUTES = 30;

function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/*
   Puntuación 0-100:
   - Esfuerzo (1-5): hasta 60 puntos
   - Tiempo: hasta 40 puntos (90 min = máximo). Sin tiempo se asumen 30 min
   - Conteo: hasta +10 según el tamaño del objetivo (escala logarítmica)
   - Hábito semanal: +10
*/
function calcDifficultyScore(minutes, effort, options = {}) {

    const usedMinutes =
        minutes > 0 ? minutes : DEFAULT_MINUTES;

    const timePart =
        clampNumber(usedMinutes / 90, 0, 1) * 40;

    const effortPart =
        clampNumber((effort - 1) / 4, 0, 1) * 60;

    let bonus = 0;

    if (options.weekly) {
        bonus += 10;
    }

    if (options.kind === "count" && options.target > 0) {
        bonus +=
            clampNumber(
                Math.log10(options.target) / 3,
                0,
                1
            ) * 10;
    }

    return clampNumber(
        timePart + effortPart + bonus,
        0,
        100
    );

}

function getRankByName(name) {

    return RANKS.find(r => r.rank === name);

}

function getRankIndex(name) {

    return RANKS.findIndex(r => r.rank === name);

}

/* Devuelve { minutes|null, effort, target|null, score, rank, xp } */
function buildReward(minutes, effort, options = {}) {

    const rawMinutes =
        minutes === null || minutes === "" || minutes === undefined
            ? 0
            : Number(minutes);

    const hasTime =
        isFinite(rawMinutes) && rawMinutes > 0;

    const cleanMinutes =
        hasTime
            ? clampNumber(Math.round(rawMinutes), 1, 240)
            : null;

    const cleanEffort =
        clampNumber(
            Math.round(Number(effort)) || 1,
            1,
            5
        );

    const isCount =
        options.kind === "count" &&
        Number(options.target) > 0;

    const cleanTarget =
        isCount
            ? clampNumber(Number(options.target), 0.01, 1000000000)
            : null;

    const score = Math.round(
        calcDifficultyScore(
            cleanMinutes,
            cleanEffort,
            {
                weekly: options.weekly,
                kind: isCount ? "count" : "normal",
                target: cleanTarget
            }
        )
    );

    let data =
        RANKS.find(r => score >= r.min);

    /* Las misiones propias no pueden superar MAX_CUSTOM_RANK */
    if (
        options.custom &&
        getRankIndex(data.rank) <
            getRankIndex(MAX_CUSTOM_RANK)
    ) {

        data = getRankByName(MAX_CUSTOM_RANK);

    }

    return {
        minutes: cleanMinutes,
        effort: cleanEffort,
        target: cleanTarget,
        score,
        rank: data.rank,
        xp: data.xp
    };

}

/* Limpia una misión/hábito guardado: NUNCA se confía en la XP almacenada */
function normalizeCustomItem(item, isHabit) {

    if (!item || typeof item !== "object") {
        return null;
    }

    if (isHabit) {

        if (typeof item.name !== "string" || !item.name) {
            return null;
        }

        item.name = item.name.slice(0, 80);

        if (
            item.frequency !== "daily" &&
            item.frequency !== "weekly"
        ) {
            item.frequency = "daily";
        }

    } else {

        if (typeof item.title !== "string" || !item.title) {
            return null;
        }

        if (!allStats.includes(item.stat)) {
            return null;
        }

        item.title = item.title.slice(0, 80);

    }

    const weekly =
        isHabit && item.frequency === "weekly";

    /* Datos con esfuerzo: recalcular rango y XP */
    if (typeof item.effort === "number") {

        const kind =
            !isHabit &&
            item.kind === "count" &&
            Number(item.target) > 0
                ? "count"
                : "normal";

        const reward = buildReward(
            item.minutes,
            item.effort,
            {
                custom: true,
                weekly,
                kind,
                target: item.target
            }
        );

        item.kind = kind;

        item.minutes = reward.minutes;

        item.effort = reward.effort;

        item.score = reward.score;

        item.rank = reward.rank;

        item.xp = reward.xp;

        if (kind === "count") {

            item.target = reward.target;

            item.unit =
                typeof item.unit === "string"
                    ? item.unit.slice(0, 20)
                    : "";

        } else {

            delete item.target;

            delete item.unit;

        }

        return item;

    }

    /* Datos antiguos (XP libre): se convierten al rango más cercano, máx. A */
    const oldXP = Number(item.xp) || 0;

    let data =
        RANKS.find(r => r.xp <= oldXP) ||
        RANKS[RANKS.length - 1];

    if (
        getRankIndex(data.rank) <
        getRankIndex(MAX_CUSTOM_RANK)
    ) {
        data = getRankByName(MAX_CUSTOM_RANK);
    }

    item.rank = data.rank;
    item.xp = data.xp;

    return item;

}

function initBaseMissions() {
    /* Misiones diarias del sistema: el rango viene fijado en la base de datos */
    baseMissions.forEach(mission => {

        const data =
            getRankByName(mission.rank) ||
            getRankByName("D");

        mission.rank = data.rank;

        mission.xp = data.xp;

        /* Duración para el cronómetro: sale del título, salvo que se indique a mano.
           minutes: 0 desactiva el cronómetro en esa misión. */
        if (mission.minutes === undefined) {

            mission.minutes = parseMissionMinutes(mission.title);

        }

    });
}

/* Progreso diario de las misiones de conteo */
function getMissionProgress(mission) {

    const value =
        Number(
            state.missionProgress[
                getMissionCompletionId(mission)
            ]
        );

    return isFinite(value) && value > 0 ? value : 0;

}

function setMissionProgress(mission, value) {

    const number =
        clampNumber(
            Number(value) || 0,
            0,
            1000000000
        );

    state.missionProgress[
        getMissionCompletionId(mission)
    ] = number;

    saveState();

}

/* Ya no hay límite diario: las misiones y hábitos propios dan
   siempre toda su XP, tantas veces como se completen en un día */
function grantXP(amount) {

    return amount;

}

function createRankBadge(rank) {

    const badge = document.createElement("span");

    badge.className = "rank-badge rank-" + rank;

    badge.textContent = rank;

    return badge;

}

/* Vista previa en vivo en los formularios (y campos de conteo) */
function updateRankPreview() {

    /* Mostrar/ocultar campos de conteo */
    const kindSelect =
        document.getElementById("missionKind");

    const isCount =
        kindSelect && kindSelect.value === "count";

    ["missionTarget", "missionUnit"].forEach(id => {

        const field = document.getElementById(id);

        if (field) {
            field.style.display = isCount ? "" : "none";
        }

    });

    const configs = [
        {
            box: "missionRankPreview",
            minutes: "missionMinutes",
            effort: "missionEffort",
            habit: false
        },
        {
            box: "habitRankPreview",
            minutes: "habitMinutes",
            effort: "habitEffort",
            habit: true
        }
    ];

    configs.forEach(config => {

        const box =
            document.getElementById(config.box);

        if (!box) {
            return;
        }

        const minutesValue =
            document.getElementById(config.minutes).value;

        const effort =
            document.getElementById(config.effort).value;

        const weekly =
            config.habit &&
            document
                .getElementById("habitFrequency")
                .value === "weekly";

        const target =
            !config.habit && isCount
                ? Number(
                    document
                        .getElementById("missionTarget")
                        .value
                )
                : null;

        const reward = buildReward(
            minutesValue,
            effort,
            {
                custom: true,
                weekly,
                kind: !config.habit && isCount ? "count" : "normal",
                target
            }
        );

        box.innerHTML = "";

        const label = document.createElement("span");

        label.textContent = t("estimatedRank") + ":";

        const info = document.createElement("span");

        info.textContent =
            "+" + reward.xp + " XP";

        box.appendChild(label);
        box.appendChild(createRankBadge(reward.rank));
        box.appendChild(info);

        if (reward.minutes === null) {

            const note = document.createElement("span");

            note.textContent = "· " + t("noTimeNote");

            box.appendChild(note);

        }

    });

}


/* =========================================================
   DAILY MISSION ODDS
   Cuantos más días te conectas, más probable es que
   aparezcan misiones de rango alto (progresión lineal).
========================================================= */

/* Probabilidades (%) el primer día */
const RANK_ODDS_START = { S: 0.1, A: 0.9, B: 4, C: 15, D: 80 };

/* Probabilidades (%) al llegar a RANK_ODDS_DAYS días (cada objeto suma 100) */
const RANK_ODDS_END = { S: 15, A: 25, B: 30, C: 20, D: 10 };

/* Días de conexión necesarios para llegar a las probabilidades finales */
const RANK_ODDS_DAYS = 100;

function getDaysConnected() {

    return Math.max(
        1,
        Math.floor(Number(state.daysConnected) || 0)
    );

}

function getRankOdds(days) {

    if (days === undefined) {
        days = getDaysConnected();
    }

    const progress =
        clampNumber(
            (days - 1) / (RANK_ODDS_DAYS - 1),
            0,
            1
        );

    const odds = {};

    RANKS.forEach(({ rank }) => {

        odds[rank] =
            RANK_ODDS_START[rank] +
            (RANK_ODDS_END[rank] - RANK_ODDS_START[rank]) *
                progress;

    });

    return odds;

}

function pickWeightedRank(odds, random) {

    const ranks = Object.keys(odds);

    const total =
        ranks.reduce((sum, rank) => sum + odds[rank], 0);

    let roll = random() * total;

    for (const rank of ranks) {

        roll -= odds[rank];

        if (roll < 0) {
            return rank;
        }

    }

    return ranks[ranks.length - 1];

}

function formatPercent(value) {

    return Number(value.toFixed(1)) + "%";

}

function renderDailyOdds() {

    const box =
        document.getElementById("dailyOddsInfo");

    if (!box) {
        return;
    }

    const odds = getRankOdds();

    box.innerHTML = "";

    const label = document.createElement("span");

    label.textContent =
        t("connectedDays") + ": " + getDaysConnected() +
        " · " + t("dailyOdds") + ":";

    box.appendChild(label);

    RANKS.forEach(({ rank }) => {

        box.appendChild(createRankBadge(rank));

        const value = document.createElement("span");

        value.textContent = formatPercent(odds[rank]);

        box.appendChild(value);

    });

}
