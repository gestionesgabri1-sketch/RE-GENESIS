/* =========================================================
   MISSIONS
========================================================= */

function getAllMissions() {

    return [

        ...state.customMissions.map(
            (mission, index) => ({

                ...mission,

                custom: true,

                id: index

            })
        ),

        ...baseMissions
            .map((mission, index) => ({

                ...mission,

                custom: false,

                id: index

            }))
            .filter(mission =>
                state.dailyMissionIds.includes(
                    mission.id
                )
            )

    ];

}

function getMissionCompletionId(mission) {

    if (mission.custom) {

        return "custom-" + mission.id;

    }

    return "base-" + mission.id;

}

function renderMissions() {

    renderDailyOdds();

    renderAscensionBanner();

    const container =
        document.getElementById(
            "missionList"
        );

    container.innerHTML = "";

    timerRefs = {};

    const missions =
        getAllMissions();

    missions.forEach(mission => {

        const completionId =
            getMissionCompletionId(
                mission
            );

        const completed =
            state.completedToday.includes(
                completionId
            );

        const card =
            document.createElement("div");

        card.className =
            "mission-card" +
            (completed ? " completed" : "");

        const info =
            document.createElement("div");

        info.className =
            "mission-info";

        const title =
            document.createElement("div");

        title.className =
            "mission-title";

        title.textContent =
            mission.title;

        const meta =
            document.createElement("div");

        meta.className =
            "mission-meta";

        const stat =
            document.createElement("span");

        stat.textContent =
            mission.stat;

        const xp =
            document.createElement("span");

        xp.className =
            "mission-xp";

        xp.textContent =
            "+" + mission.xp + " XP";

        meta.appendChild(
            createRankBadge(mission.rank)
        );

        meta.appendChild(stat);

        meta.appendChild(xp);

        /* Misiones con tiempo: se hacen con cronómetro en vez de completarlas de golpe */
        const minutes = getMissionMinutes(mission);

        const timed = minutes > 0 && !completed;

        const timer = timed ? state.timers[completionId] : null;

        if (minutes > 0) {

            const duration =
                document.createElement("span");

            duration.textContent =
                "⏱ " + formatMinutes(minutes);

            meta.appendChild(duration);

        }

        if (mission.kind === "count") {

            const goal =
                document.createElement("span");

            goal.textContent =
                "🎯 " +
                getMissionProgress(mission) +
                " / " +
                mission.target +
                (mission.unit ? " " + mission.unit : "");

            meta.appendChild(goal);

        }

        info.appendChild(title);

        info.appendChild(meta);

        if (timer) {

            const box =
                document.createElement("div");

            box.className =
                "mission-timer" +
                (timer.endsAt ? "" : " paused");

            const time =
                document.createElement("div");

            time.className =
                "mission-timer-time";

            const track =
                document.createElement("div");

            track.className =
                "mission-timer-track";

            const fill =
                document.createElement("div");

            fill.className =
                "mission-timer-fill";

            track.appendChild(fill);

            box.appendChild(time);

            box.appendChild(track);

            info.appendChild(box);

            timerRefs[completionId] = { time, fill };

            updateTimerDisplay(completionId);

        }

        if (mission.kind === "count" && !completed) {

            const bar =
                document.createElement("div");

            bar.className =
                "mission-count-bar";

            const track =
                document.createElement("div");

            track.className =
                "mission-timer-track";

            const fill =
                document.createElement("div");

            fill.className =
                "mission-timer-fill";

            fill.style.width =
                Math.min(
                    100,
                    (getMissionProgress(mission) / mission.target) * 100
                ) + "%";

            track.appendChild(fill);

            bar.appendChild(track);

            info.appendChild(bar);

        }

        const actions =
            document.createElement("div");

        actions.className =
            "mission-actions";

        const complete =
            document.createElement("button");

        complete.className =
            "complete-button" +
            (completed ? " completed" : "");

        if (timed) {

            /* Empezar -> pausar / reanudar. Se completa sola al llegar a cero */
            complete.textContent =
                !timer
                    ? t("timerStart")
                    : timer.endsAt
                        ? t("timerPause")
                        : t("timerResume");

            complete.onclick = () => {

                if (!timer) {
                    startMissionTimer(mission);
                } else if (timer.endsAt) {
                    pauseMissionTimer(mission);
                } else {
                    resumeMissionTimer(mission);
                }

            };

        } else if (mission.kind === "count" && !completed) {

            /* Conteo: hay que pulsar el botón tantas veces como indique el objetivo.
               Al llegar al objetivo la misión se completa sola. */
            const alreadyReached =
                getMissionProgress(mission) >= mission.target;

            complete.textContent =
                alreadyReached
                    ? t("complete")
                    : "+1";

            complete.onclick = () => {

                if (getMissionProgress(mission) < mission.target) {

                    setMissionProgress(
                        mission,
                        getMissionProgress(mission) + 1
                    );

                }

                if (getMissionProgress(mission) >= mission.target) {

                    completeMission(mission);

                } else {

                    renderMissions();

                }

            };

            /* Deshacer una pulsación por error */
            if (getMissionProgress(mission) > 0) {

                const undo =
                    document.createElement("button");

                undo.className = "plus-button";

                undo.textContent = "−1";

                undo.title = t("countUndo");

                undo.setAttribute("aria-label", t("countUndo"));

                undo.onclick = () => {

                    setMissionProgress(
                        mission,
                        Math.max(0, getMissionProgress(mission) - 1)
                    );

                    renderMissions();

                };

                actions.appendChild(undo);

            }

        } else {

            complete.textContent =
                completed
                    ? t("completed")
                    : t("complete");

            complete.onclick = () => {

                completeMission(
                    mission
                );

            };

        }

        actions.appendChild(
            complete
        );

        if (timer) {

            const cancelTimer =
                document.createElement("button");

            cancelTimer.className =
                "delete-button";

            cancelTimer.textContent =
                t("timerCancel");

            cancelTimer.onclick = () => {

                cancelMissionTimer(mission);

            };

            actions.appendChild(cancelTimer);

        }

        if (mission.custom) {

            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-button";

            deleteButton.textContent =
                t("delete");

            deleteButton.onclick = () => {

                deleteMission(
                    mission.id
                );

            };

            actions.appendChild(
                deleteButton
            );

        }

        card.appendChild(info);

        card.appendChild(actions);

        container.appendChild(card);

    });

}

function completeMission(mission) {

    const id =
        getMissionCompletionId(
            mission
        );

    if (
        state.completedToday.includes(id)
    ) {

        return;

    }

    if (
        mission.kind === "count" &&
        getMissionProgress(mission) < mission.target
    ) {

        alert(t("countNotReached"));

        return;

    }

    state.completedToday.push(id);

    delete state.timers[id];

    const xp = mission.xp;

    addGeneralXP(xp);

    addStatXP(
        mission.stat,
        xp
    );

    saveState();

    updateTopBar();

    renderMissions();

    updateRankPreview();

}

function readOptionalMinutes(id) {

    const raw =
        document
            .getElementById(id)
            .value
            .toString()
            .trim();

    if (raw === "") {
        return { ok: true, value: null };
    }

    const value = Number(raw);

    if (!(value > 0)) {
        return { ok: false, value: null };
    }

    return { ok: true, value };

}

/* Código de pruebas: escribir "RE:Genesis" como nombre de una misión
   (en vez de crearla) sube el nivel general, el de todas las
   estadísticas y los puntos de habilidad al máximo, para poder
   probar el árbol de habilidades y demás sin tener que jugar horas. */
const DEBUG_MAX_CODE = /^re\s*:\s*genesis$/i;

const DEBUG_MAX_LEVEL = 99;

function applyDebugMaxLevels() {

    state.level = DEBUG_MAX_LEVEL;

    state.xp = 0;

    state.skillPoints = 999;

    allStats.forEach(stat => {

        state.stats[stat] = {
            level: DEBUG_MAX_LEVEL,
            xp: 0,
            points: 999
        };

    });

    saveState();

    updateTopBar();

    renderMissions();

    updateRankPreview();

    if (currentView === "profile") {

        renderProfile();

    }

    alert(t("debugMaxApplied"));

}

function createMission() {

    const nameInput =
        document.getElementById("missionName");

    if (DEBUG_MAX_CODE.test(nameInput.value.trim())) {

        nameInput.value = "";

        applyDebugMaxLevels();

        return;

    }

    const name =
        nameInput
            .value
            .trim()
            .slice(0, 80);

    const stat =
        document
            .getElementById("missionStat")
            .value;

    const kind =
        document
            .getElementById("missionKind")
            .value === "count"
                ? "count"
                : "normal";

    const minutes =
        readOptionalMinutes("missionMinutes");

    const effort =
        Number(
            document
                .getElementById("missionEffort")
                .value
        );

    if (
        !name ||
        !allStats.includes(stat) ||
        !minutes.ok
    ) {
        return;
    }

    let target = null;

    let unit = "";

    if (kind === "count") {

        target =
            Number(
                document
                    .getElementById("missionTarget")
                    .value
            );

        if (!(target > 0)) {
            return;
        }

        unit =
            document
                .getElementById("missionUnit")
                .value
                .trim()
                .slice(0, 20);

    }

    const reward =
        buildReward(
            minutes.value,
            effort,
            { custom: true, kind, target }
        );

    const mission = {

        title: name,

        stat: stat,

        kind: kind,

        minutes: reward.minutes,

        effort: reward.effort,

        score: reward.score,

        rank: reward.rank,

        xp: reward.xp

    };

    if (kind === "count") {

        mission.target = reward.target;

        mission.unit = unit;

    }

    state.customMissions.unshift(mission);

    /* Los índices de las misiones propias se desplazan */
    const shifted = {};

    Object.keys(state.missionProgress).forEach(key => {

        if (key.startsWith("custom-")) {

            shifted[
                "custom-" +
                (Number(key.replace("custom-", "")) + 1)
            ] = state.missionProgress[key];

        } else {

            shifted[key] = state.missionProgress[key];

        }

    });

    state.missionProgress = shifted;

    state.completedToday =
        state.completedToday.map(id => {

            if (String(id).startsWith("custom-")) {

                return "custom-" + (
                    Number(id.replace("custom-", "")) + 1
                );

            }

            return id;

        });

    document
        .getElementById("missionName")
        .value = "";

    saveState();

    renderMissions();

}

function deleteMission(index) {

    askConfirm(
        state.language === "es"
            ? "¿Eliminar esta misión?"
            : "Delete this mission?",
        t("delete"),
        () => removeMission(index)
    );

}

function removeMission(index) {

    const id =
        "custom-" + index;

    state.completedToday =
        state.completedToday
            .filter(
                completionId =>
                    completionId !== id
            )
            .map(
                completionId => {

                    if (
                        completionId.startsWith(
                            "custom-"
                        )
                    ) {

                        const oldIndex =
                            Number(
                                completionId
                                    .replace(
                                        "custom-",
                                        ""
                                    )
                            );

                        if (
                            oldIndex > index
                        ) {

                            return (
                                "custom-" +
                                (oldIndex - 1)
                            );

                        }

                    }

                    return completionId;

                }
            );

    const shiftedProgress = {};

    Object.keys(state.missionProgress).forEach(key => {

        if (key.startsWith("custom-")) {

            const oldIndex =
                Number(key.replace("custom-", ""));

            if (oldIndex === index) {
                return;
            }

            shiftedProgress[
                "custom-" +
                (oldIndex > index ? oldIndex - 1 : oldIndex)
            ] = state.missionProgress[key];

        } else {

            shiftedProgress[key] = state.missionProgress[key];

        }

    });

    state.missionProgress = shiftedProgress;

    const shiftedTimers = {};

    Object.keys(state.timers).forEach(key => {

        if (key.startsWith("custom-")) {

            const oldIndex =
                Number(key.replace("custom-", ""));

            if (oldIndex === index) {
                return;
            }

            shiftedTimers[
                "custom-" +
                (oldIndex > index ? oldIndex - 1 : oldIndex)
            ] = state.timers[key];

        } else {

            shiftedTimers[key] = state.timers[key];

        }

    });

    state.timers = shiftedTimers;

    state.customMissions.splice(
        index,
        1
    );

    saveState();

    renderMissions();

}

/* =========================================================
   MISSION STAT SELECT
========================================================= */

function renderStatsSelect() {

    const select =
        document.getElementById(
            "missionStat"
        );

    select.innerHTML = "";

    allStats.forEach(stat => {

        const option =
            document.createElement("option");

        option.value = stat;

        option.textContent = stat;

        select.appendChild(option);

    });

}
