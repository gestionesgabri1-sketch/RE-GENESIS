/* =========================================================
   TOP BAR
========================================================= */

function updateTopBar() {

    const race = getRaceData(state.race);

    document.getElementById("topPlayerName").textContent =
        (race ? getRaceDisplayIcon(race) + " " : "") + state.username;

    document.getElementById("menuCurrentName").textContent =
        state.username;

    document.getElementById("topLevel").textContent =
        state.level;

    const progress =
        getGeneralProgress();

    document.getElementById("levelCircle").style
        .setProperty(
            "--progress",
            progress * 3.6 + "deg"
        );

}

/* =========================================================
   SETTINGS MENU
========================================================= */

function toggleSettingsMenu() {

    document
        .getElementById("settingsMenu")
        .classList.toggle("hidden");

}

document.addEventListener("click", function(event) {

    const menu =
        document.getElementById("settingsMenu");

    const button =
        document.querySelector(".menu-button");

    if (
        !menu.contains(event.target) &&
        !button.contains(event.target)
    ) {

        menu.classList.add("hidden");

    }

});

/* =========================================================
   USERNAME
========================================================= */

function saveUsername() {

    const input =
        document.getElementById("nameInput");

    const name =
        input.value.trim();

    if (!name) {
        return;
    }

    state.username = name;

    saveState();

    updateTopBar();

    if (document.getElementById("profileView")) {

        document.getElementById("profileName").textContent =
            state.username;

    }

}

/* =========================================================
   LANGUAGE
========================================================= */

function setLanguage(language) {

    state.language = language;

    saveState();

    applyLanguage();

}

function t(key) {

    return (
        translations[state.language][key] ||
        translations.es[key] ||
        key
    );

}

function applyLanguage() {

    document.documentElement.lang =
        state.language;

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.getAttribute("data-i18n");

            element.textContent =
                t(key);

        });

    document
        .querySelectorAll("[data-i18n-placeholder]")
        .forEach(element => {

            const key =
                element.getAttribute(
                    "data-i18n-placeholder"
                );

            element.placeholder =
                t(key);

        });

    document
        .getElementById("langES")
        .classList.toggle(
            "active",
            state.language === "es"
        );

    document
        .getElementById("langEN")
        .classList.toggle(
            "active",
            state.language === "en"
        );

    renderMissions();

    renderHabits();

    renderCalendar();

    if (mapUI.ready) {

        renderMapAll();

    }

    updateRankPreview();

    if (currentView === "profile") {

        renderProfile();

    }

    if (currentView === "stat") {

        renderSkillTree();

    }

    if (onboarding.open) {

        renderOnboarding(false);

    }

}

/* =========================================================
   THEMES
========================================================= */

function setTheme(theme) {

    state.theme = theme;

    saveState();

    applyTheme();

    refreshMapTheme();

}

function applyTheme() {

    document.body.classList.remove(
        "theme-white",
        "theme-red"
    );

    if (state.theme === "white") {

        document.body.classList.add(
            "theme-white"
        );

    }

    if (state.theme === "red") {

        document.body.classList.add(
            "theme-red"
        );

    }

    document
        .getElementById("themeWhiteOption")
        .classList.toggle(
            "active",
            state.theme === "white"
        );

    document
        .getElementById("themeBlackOption")
        .classList.toggle(
            "active",
            state.theme === "black"
        );

    document
        .getElementById("themeRedOption")
        .classList.toggle(
            "active",
            state.theme === "red"
        );

}

/* =========================================================
   RESET
========================================================= */

function resetProgress() {

    askConfirm(
        t("resetConfirm"),
        t("reset"),
        performReset
    );

}

function performReset() {

    state.level = 1;

    state.xp = 0;

    state.skillPoints = 0;

    state.completedToday = [];

    state.completedHabitsToday = [];

    state.customMissions = [];

    state.missionProgress = {};

    state.timers = {};

    state.daysConnected = 1;

    /* Reinicio total: también nombre y preferencias, para volver al onboarding */
    state.username = "PLAYER";

    state.totalUsageSeconds = 0;

    state.dailyMissionCount = 5;

    state.profile = { areas: [], goals: [] };

    state.onboarded = false;

    state.race = null;

    state.ascension = null;

    state.dailyAscensionOffer = null;

    state.dailyMissionsDate = "";

    state.dailyMissionIds = [];

    ensureDailyMissions();

    state.habits = [];

    state.events = [];

    state.places = [];

    state.routes = [];

    state.mapView = null;

    state.exploredCells = [];

    state.unlockedZones = [];

    state.landmarksFound = [];

    resetMapRuntime();

    state.unlocked = {};

    allStats.forEach(stat => {

        state.stats[stat] = {
            level: 1,
            xp: 0,
            points: 0
        };

    });

    saveState();

    document.getElementById("nameInput").value = state.username;

    currentProfileCategory = null;

    currentStat = null;

    updateTopBar();

    renderMissions();

    renderHabits();

    renderCalendar();

    showView("missions");

    openOnboarding(false);

}

/* =========================================================
   VIEWS
========================================================= */

function hideAllViews() {

    document
        .querySelectorAll(".view")
        .forEach(view => {

            view.classList.add("hidden");

        });

}

function showView(view) {

    currentView = view;

    /* Fuera del mapa el GPS se pausa; volviendo se reanuda */
    if (view !== "map") {

        pauseLiveLocation();

    }

    hideAllViews();

    document
        .getElementById(
            view + "View"
        )
        .classList.remove("hidden");

    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.remove("active");

        });

    if (view === "missions") {

        document
            .getElementById("navMissions")
            .classList.add("active");

    }

    if (view === "habits") {

        document
            .getElementById("navHabits")
            .classList.add("active");

    }

    if (view === "map") {

        document
            .getElementById("navMap")
            .classList.add("active");

        openMapView();

    }

    if (view === "calendar") {

        document
            .getElementById("navCalendar")
            .classList.add("active");

        renderCalendar();

    }

}

/* =========================================================
   DIÁLOGO DE CONFIRMACIÓN
   Sustituye a window.confirm(): algunos navegadores y vistas previas
   lo bloquean y devuelven "no" sin avisar, y el botón parece roto.
========================================================= */

function askConfirm(message, confirmLabel, onConfirm) {

    const previous = document.getElementById("confirmDialog");

    if (previous) {
        previous.remove();
    }

    const opener = document.activeElement;

    const overlay = document.createElement("div");

    overlay.className = "confirm-overlay";

    overlay.id = "confirmDialog";

    overlay.setAttribute("role", "alertdialog");

    overlay.setAttribute("aria-modal", "true");

    overlay.setAttribute("aria-describedby", "confirmText");

    const box = document.createElement("div");

    box.className = "card confirm-box";

    const text = document.createElement("p");

    text.className = "confirm-text";

    text.id = "confirmText";

    text.textContent = message;

    const actions = document.createElement("div");

    actions.className = "confirm-actions";

    const back = document.createElement("button");

    back.type = "button";

    back.className = "small-button";

    back.textContent = t("confirmBack");

    const ok = document.createElement("button");

    ok.type = "button";

    ok.className = "confirm-danger";

    ok.textContent = confirmLabel;

    function close() {

        overlay.remove();

        document.removeEventListener("keydown", onKey, true);

        if (opener && opener.isConnected && opener.focus) {
            opener.focus();
        }

    }

    function onKey(event) {

        if (event.key === "Escape") {

            event.stopPropagation();

            close();

        }

        /* El foco se queda dentro del diálogo */
        if (event.key === "Tab") {

            event.preventDefault();

            (document.activeElement === back ? ok : back).focus();

        }

    }

    back.onclick = close;

    ok.onclick = () => {

        close();

        onConfirm();

    };

    overlay.onclick = event => {

        if (event.target === overlay) {
            close();
        }

    };

    document.addEventListener("keydown", onKey, true);

    actions.appendChild(back);

    actions.appendChild(ok);

    box.appendChild(text);

    box.appendChild(actions);

    overlay.appendChild(box);

    document.body.appendChild(overlay);

    /* Por defecto, el foco cae en la opción segura */
    back.focus();

}
