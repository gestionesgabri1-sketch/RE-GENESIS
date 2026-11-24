/* =========================================================
   STORAGE
========================================================= */

function saveState() {

    localStorage.setItem(
        "lifeUpgradeState",
        JSON.stringify(state)
    );

}

function loadState() {

    const saved = localStorage.getItem("lifeUpgradeState");

    if (!saved) {
        return;
    }

    try {

        const parsed = JSON.parse(saved);

        state = {
            ...state,
            ...parsed
        };

        allStats.forEach(stat => {

            if (!state.stats[stat]) {

                state.stats[stat] = {
                    level: 1,
                    xp: 0,
                    points: 0
                };

            } else if (
                typeof state.stats[stat].points !== "number" ||
                !isFinite(state.stats[stat].points) ||
                state.stats[stat].points < 0
            ) {

                state.stats[stat].points = 0;

            }

        });

        if (!Array.isArray(state.completedToday)) {
            state.completedToday = [];
        }

        if (!Array.isArray(state.completedHabitsToday)) {
            state.completedHabitsToday = [];
        }

        if (!Array.isArray(state.customMissions)) {
            state.customMissions = [];
        }

        if (!Array.isArray(state.dailyMissionIds)) {
            state.dailyMissionIds = [];
        }

        if (
            typeof state.dailyMissionCount !== "number" ||
            state.dailyMissionCount < 1
        ) {
            state.dailyMissionCount = 5;
        }

        if (!Array.isArray(state.habits)) {
            state.habits = [];
        }

        /* Eventos del calendario: solo se conservan los que tienen nombre y fecha válidos */
        if (!Array.isArray(state.events)) {
            state.events = [];
        }

        state.events = state.events.filter(
            event =>
                event &&
                typeof event === "object" &&
                typeof event.name === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(event.date)
        );

        state.events.forEach(event => {

            if (!event.id) {

                event.id =
                    Date.now().toString() +
                    "-" +
                    Math.random().toString(36).slice(2);

            }

            if (typeof event.time !== "string") {
                event.time = "";
            }

        });

        /* Mapa: lugares, rutas y última vista, siempre validados */
        state.places = sanitizePlaces(state.places);

        state.routes = sanitizeRoutes(state.routes);

        state.mapView = sanitizeMapView(state.mapView);

        state.mapSource = sanitizeMapSource(state.mapSource);

        state.exploredCells = sanitizeExploredCells(state.exploredCells);

        state.unlockedZones = sanitizeStringList(state.unlockedZones, WORLD_ZONES.map(z => z.id));

        state.landmarksFound = sanitizeStringList(
            state.landmarksFound,
            WORLD_ZONES.map(z => z.landmark.id)
        );

        /* Ascensión: solo se comprueba la forma (sin mirar todavía los
           datos de las rutas, que se declaran más abajo en el script);
           si apuntara a una raza o ruta que no existe, getActiveAscension()
           ya lo trata como "sin ascender" sin romper nada */
        if (
            !state.ascension ||
            typeof state.ascension !== "object" ||
            typeof state.ascension.race !== "string" ||
            typeof state.ascension.path !== "string" ||
            state.ascension.race !== state.race
        ) {

            state.ascension = null;

        }

        if (
            !state.dailyAscensionOffer ||
            typeof state.dailyAscensionOffer !== "object" ||
            typeof state.dailyAscensionOffer.date !== "string" ||
            (
                state.dailyAscensionOffer.pathId !== null &&
                typeof state.dailyAscensionOffer.pathId !== "string"
            )
        ) {

            state.dailyAscensionOffer = null;

        }

        /* Perfil de usuario (onboarding): se limpia por si el guardado está incompleto */
        state.profile = sanitizeProfile(state.profile);

        state.onboarded = state.onboarded === true;

        state.race = RACES.some(race => race.id === state.race)
            ? state.race
            : null;

        state.timers = sanitizeTimers(state.timers);

        /* Recalcula rango y XP: ignora cualquier XP manipulada */
        state.customMissions = state.customMissions
            .map(item => normalizeCustomItem(item, false))
            .filter(Boolean);

        state.habits = state.habits
            .map(item => normalizeCustomItem(item, true))
            .filter(Boolean);

        if (
            !state.missionProgress ||
            typeof state.missionProgress !== "object" ||
            Array.isArray(state.missionProgress)
        ) {
            state.missionProgress = {};
        }

        /* Guardados anteriores sin contador: hoy cuenta como el día 1 */
        if (parsed.daysConnected === undefined && parsed.lastDate) {
            state.daysConnected = 1;
        }

        if (
            typeof state.daysConnected !== "number" ||
            !isFinite(state.daysConnected) ||
            state.daysConnected < 0
        ) {
            state.daysConnected = 0;
        }

        state.daysConnected = Math.floor(state.daysConnected);

        /* La base de misiones diarias cambió: se regeneran las de hoy */
        if (parsed.missionDBVersion !== MISSION_DB_VERSION) {

            state.dailyMissionIds = [];

            state.dailyMissionsDate = "";

            state.completedToday =
                state.completedToday.filter(
                    id => !String(id).startsWith("base-")
                );

            Object.keys(state.missionProgress).forEach(key => {
                if (key.startsWith("base-")) {
                    delete state.missionProgress[key];
                }
            });

            state.missionDBVersion = MISSION_DB_VERSION;

        }

    } catch (error) {

        console.error("Error loading state:", error);

    }

}
