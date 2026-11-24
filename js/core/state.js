/* =========================================================
   STATE
========================================================= */

let state = {

    username: "PLAYER",

    totalUsageSeconds: 0,

    level: 1,

    xp: 0,

    skillPoints: 0,

    stats: {},

    unlocked: {},

    /* { race, path } una vez se ha completado una misión de ascensión */
    ascension: null,

    /* { date, pathId|null } misión de ascensión ofrecida hoy, si la hay */
    dailyAscensionOffer: null,

    completedToday: [],

    customMissions: [],

    missionProgress: {},

    daysConnected: 0,

    missionDBVersion: MISSION_DB_VERSION,

    dailyMissionIds: [],

    dailyMissionsDate: "",

    dailyMissionCount: 5,

    habits: [],

    completedHabitsToday: [],

    events: [],

    places: [],

    routes: [],

    mapView: null,

    mapSource: { id: "esri", key: "", url: "" },

    /* Exploración: casillas del mapa por las que ya has pasado */
    exploredCells: [],

    /* Zonas reveladas por completo (por ahora solo "vic") */
    unlockedZones: [],

    /* Monumentos ya encontrados, para no repetir el aviso */
    landmarksFound: [],

    lastDate: "",

    language: "es",

    theme: "black",

    onboarded: false,

    race: null,

    profile: { areas: [], goals: [] },

    /* Cronómetros de misiones en curso: { "base-3": { duration, endsAt, remaining } } */
    timers: {}

};

allStats.forEach(stat => {

    state.stats[stat] = {
        level: 1,
        xp: 0,
        points: 0
    };

});

/* =========================================================
   INITIALIZATION
========================================================= */

let currentView = "missions";

let currentCalendarDate = new Date();

let selectedCalendarDate = getLocalDateString();

let currentProfileCategory = null;

let currentStat = null;

/* Estado temporal del asistente de configuración inicial */
let onboarding = {
    open: false,
    editing: false,
    raceOnly: false,
    phase: "awaken",           /* awaken | name | loading | blackout | race | wizard */
    steps: ["areas", "goals", "pace"],
    step: 0,
    timers: [],
    draft: { name: "", race: null, areas: [], goals: [], count: 5 }
};

/* Elementos del cronómetro visibles en pantalla (se rellena en renderMissions) */
let timerRefs = {};

/* Estado temporal del mapa (lo guardado vive en state.places / routes / mapView) */
let mapUI = {
    ready: false,
    bound: false,
    el: null,
    tileLayer: null,
    markerLayer: null,
    svg: null,
    center: { lat: 0, lng: 0 },
    zoom: 2,
    width: 0,
    height: 0,
    tiles: {},
    markers: [],
    mode: "browse",            /* browse | place | route */
    pending: null,             /* { lat, lng } mientras se coloca un lugar */
    draft: [],                 /* puntos de la ruta que se está dibujando */
    form: { name: "", type: "other", note: "" },
    selected: null,            /* { kind: "place" | "route", id } */
    me: null,
    pointers: new Map(),
    gesture: null,
    frame: 0,
    saveTimer: 0,
    messageTimer: 0,
    lastWheel: 0,
    tilesOk: 0,
    tilesFailed: 0,
    needsFit: false,
    showSource: false,
    fogCanvas: null,
    fogCtx: null,
    banner: null,
    bannerTimer: 0,
    unlockTimer: 0,
    notifyAsked: false,
    tracking: false,       /* el usuario activó "En vivo" */
    following: false,      /* el mapa se mantiene centrado en ti */
    watchId: null,
    firstFix: false,
    meMarker: null
};
