/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

    document.getElementById("topPlayerName").textContent =
        state.username;

    document.getElementById("menuCurrentName").textContent =
        state.username;

    document.getElementById("nameInput").value =
        state.username;

    renderStatsSelect();

    applyLanguage();

    applyTheme();

    updateTopBar();

    renderMissions();

    renderHabits();

    renderCalendar();

    /* Primera vez (o guardado antiguo sin perfil): configuración inicial */
    if (!state.onboarded) {

        openOnboarding(false);

    } else if (!state.race) {

        /* Partida anterior a las razas: solo se hace la tirada */
        openOnboarding(false, true);

    }

}

initBaseMissions();

loadState();

checkNewDay();

window.__regenesisSessionStart = Date.now();
setInterval(() => {
    if (!state) return;
    state.totalUsageSeconds = Number(state.totalUsageSeconds || 0) + 60;
    window.__regenesisSessionStart = Date.now();
    if (typeof saveState === "function") saveState();
    if (currentView === "profile" && !currentProfileCategory && showUserInfoPanel) renderProfile();
}, 60000);

/* Cronómetros de misiones: se revisan cada segundo */
setInterval(tickTimers, 1000);

initialize();

/* =========================================================
   INITIAL DATE
========================================================= */

document
    .getElementById("eventDate")
    .value =
    selectedCalendarDate;
