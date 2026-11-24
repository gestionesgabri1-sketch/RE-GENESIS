/* =========================================================
   DATE
========================================================= */

function getLocalDateString() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}

function checkNewDay() {

    const today = getLocalDateString();

    if (state.lastDate !== today) {

        state.completedToday = [];

        state.completedHabitsToday = [];

        state.missionProgress = {};

        state.timers = {};

        state.daysConnected =
            (Number(state.daysConnected) || 0) + 1;

        state.lastDate = today;

        saveState();

    }

    ensureDailyMissions();

}
