/* =========================================================
   CRONÓMETRO DE MISIONES
   Cada misión con tiempo tiene un timer:
   { duration (s), endsAt (ms, null si está en pausa), remaining (s) }
   Se guarda la hora de fin, no los segundos, para que siga bien
   en segundo plano y al recargar la página.
========================================================= */

/* "Leer durante 60 minutos" -> 60 · "Estudiar 2 horas" -> 120 · sin tiempo -> 0 */
function parseMissionMinutes(title) {

    const words = {
        un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, diez: 10
    };

    const text = String(title).toLowerCase();

    const value = raw => (
        isNaN(raw) ? words[raw] : Number(raw)
    );

    let match = text.match(
        /\b(\d+|un|una|dos|tres|cuatro|cinco|diez)\s*(minutos?|min)\b/
    );

    if (match) {
        return value(match[1]);
    }

    match = text.match(
        /\b(\d+|un|una|dos|tres|cuatro|cinco)\s*horas?\b/
    );

    if (match) {
        return value(match[1]) * 60;
    }

    return 0;

}

/* Minutos de la misión si usa cronómetro; 0 si se completa de golpe */
function getMissionMinutes(mission) {

    if (mission.kind === "count") {
        return 0;
    }

    const minutes = Number(mission.minutes);

    return isFinite(minutes) && minutes > 0
        ? Math.round(minutes)
        : 0;

}

function formatMinutes(minutes) {

    if (minutes >= 60) {

        const hours = Math.floor(minutes / 60);

        const rest = minutes % 60;

        return hours + " h" + (rest ? " " + rest + " min" : "");

    }

    return minutes + " min";

}

function formatTimer(totalSeconds) {

    const seconds = Math.max(0, Math.round(totalSeconds));

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const rest = seconds % 60;

    const pad = number => String(number).padStart(2, "0");

    return hours > 0
        ? hours + ":" + pad(minutes) + ":" + pad(rest)
        : pad(minutes) + ":" + pad(rest);

}

function getTimerRemaining(timer) {

    if (timer.endsAt) {

        return Math.max(
            0,
            Math.ceil((timer.endsAt - Date.now()) / 1000)
        );

    }

    return timer.remaining;

}

/* Limpia los cronómetros guardados por si el archivo está incompleto o manipulado */
function sanitizeTimers(raw) {

    const clean = {};

    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return clean;
    }

    Object.keys(raw).forEach(id => {

        const item = raw[id];

        if (!item || typeof item !== "object") {
            return;
        }

        const duration = Number(item.duration);

        if (!isFinite(duration) || duration <= 0 || duration > 14400) {
            return;
        }

        const remaining = Number(item.remaining);

        let endsAt = null;

        if (item.endsAt !== null && item.endsAt !== undefined) {

            endsAt = Number(item.endsAt);

            if (!isFinite(endsAt)) {
                return;
            }

            /* Una hora de fin imposible (más lejos que la duración) se recorta */
            endsAt = Math.min(endsAt, Date.now() + duration * 1000);

        }

        clean[id] = {
            duration,
            endsAt,
            remaining:
                isFinite(remaining) && remaining >= 0
                    ? Math.min(remaining, duration)
                    : duration
        };

    });

    return clean;

}

function findMissionByCompletionId(id) {

    return getAllMissions().find(
        mission => getMissionCompletionId(mission) === id
    );

}

function startMissionTimer(mission) {

    const id = getMissionCompletionId(mission);

    const minutes = getMissionMinutes(mission);

    if (
        !minutes ||
        state.completedToday.includes(id) ||
        state.timers[id]
    ) {
        return;
    }

    const duration = minutes * 60;

    state.timers[id] = {
        duration,
        endsAt: Date.now() + duration * 1000,
        remaining: duration
    };

    saveState();

    renderMissions();

    refreshTimerTitle();

}

function pauseMissionTimer(mission) {

    const id = getMissionCompletionId(mission);

    const timer = state.timers[id];

    if (!timer || !timer.endsAt) {
        return;
    }

    timer.remaining = getTimerRemaining(timer);

    timer.endsAt = null;

    saveState();

    renderMissions();

    refreshTimerTitle();

}

function resumeMissionTimer(mission) {

    const id = getMissionCompletionId(mission);

    const timer = state.timers[id];

    if (!timer || timer.endsAt) {
        return;
    }

    timer.endsAt = Date.now() + timer.remaining * 1000;

    saveState();

    renderMissions();

    refreshTimerTitle();

}

function cancelMissionTimer(mission) {

    askConfirm(
        t("timerCancelConfirm"),
        t("timerCancelSure"),
        () => {

            delete state.timers[getMissionCompletionId(mission)];

            saveState();

            renderMissions();

            refreshTimerTitle();

        }
    );

}

function updateTimerDisplay(id) {

    const ref = timerRefs[id];

    const timer = state.timers[id];

    if (!ref || !timer) {
        return;
    }

    const remaining = getTimerRemaining(timer);

    ref.time.textContent = formatTimer(remaining);

    ref.fill.style.width =
        Math.min(
            100,
            Math.max(0, (1 - remaining / timer.duration) * 100)
        ) + "%";

}

/* El tiempo restante también se ve en la pestaña del navegador */
function refreshTimerTitle() {

    let lowest = null;

    Object.values(state.timers).forEach(timer => {

        if (!timer.endsAt) {
            return;
        }

        const remaining = getTimerRemaining(timer);

        if (lowest === null || remaining < lowest) {
            lowest = remaining;
        }

    });

    document.title =
        lowest === null
            ? "RE:GENESIS"
            : "⏱ " + formatTimer(lowest) + " · RE:GENESIS";

}

function playTimerSound() {

    try {

        const AudioCtx =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioCtx) {
            return;
        }

        const context = new AudioCtx();

        [660, 880].forEach((frequency, index) => {

            const oscillator = context.createOscillator();

            const gain = context.createGain();

            const start = context.currentTime + index * 0.18;

            oscillator.frequency.value = frequency;

            oscillator.connect(gain);

            gain.connect(context.destination);

            gain.gain.setValueAtTime(0.0001, start);

            gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);

            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

            oscillator.start(start);

            oscillator.stop(start + 0.18);

        });

        setTimeout(() => context.close(), 700);

    } catch (error) {

        /* Sin sonido no pasa nada: la misión se completa igualmente */

    }

}

function tickTimers() {

    const ids = Object.keys(state.timers);

    if (ids.length === 0) {
        return;
    }

    const finished = [];

    let changed = false;

    ids.forEach(id => {

        const timer = state.timers[id];

        const mission = findMissionByCompletionId(id);

        /* La misión ya no existe (cambió el sorteo del día) o ya está hecha */
        if (!mission || state.completedToday.includes(id)) {

            delete state.timers[id];

            changed = true;

            return;

        }

        updateTimerDisplay(id);

        if (timer.endsAt && getTimerRemaining(timer) <= 0) {
            finished.push(mission);
        }

    });

    if (changed) {

        saveState();

        renderMissions();

    }

    if (finished.length > 0) {

        playTimerSound();

        finished.forEach(mission => completeMission(mission));

    }

    refreshTimerTitle();

}
