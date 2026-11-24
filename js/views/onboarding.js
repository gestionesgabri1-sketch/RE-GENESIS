/* =========================================================
   ONBOARDING (configuración inicial y preferencias de uso)
========================================================= */

function onbLang() {

    return state.language === "en" ? "en" : "es";

}

function onbEl(tag, className, text) {

    const node = document.createElement(tag);

    if (className) {
        node.className = className;
    }

    if (text !== undefined) {
        node.textContent = text;
    }

    return node;

}

function getRaceData(id) {

    return RACES.find(race => race.id === id) || null;

}

function pickRandomRace() {

    return RACES[Math.floor(Math.random() * RACES.length)];

}

/* Animación de "tirada": va pasando por razas y aterriza en la ya sorteada */
function getGoalById(id) {

    return ONBOARDING_GOALS.find(goal => goal.id === id);

}

/* Deja el perfil siempre válido: solo ids conocidos y metas de áreas elegidas */
function sanitizeProfile(profile) {

    const validAreas = ONBOARDING_AREAS.map(area => area.id);

    const validGoals = ONBOARDING_GOALS.map(goal => goal.id);

    const areas = Array.isArray(profile && profile.areas)
        ? profile.areas.filter(id => validAreas.includes(id))
        : [];

    const goals = Array.isArray(profile && profile.goals)
        ? profile.goals.filter(
            id =>
                validGoals.includes(id) &&
                areas.includes(getGoalById(id).area)
        )
        : [];

    return {
        areas: [...new Set(areas)],
        goals: [...new Set(goals)]
    };

}

/* ---------- Adaptación de las misiones diarias ---------- */

/* Cada área suma +1 a sus stats y cada meta +2 a las suyas */
function getProfileStatBoosts() {

    const profile = state.profile || { areas: [], goals: [] };

    const boosts = {};

    ONBOARDING_AREAS.forEach(area => {

        if (profile.areas.includes(area.id)) {

            area.stats.forEach(stat => {
                boosts[stat] = (boosts[stat] || 0) + 1;
            });

        }

    });

    ONBOARDING_GOALS.forEach(goal => {

        if (profile.goals.includes(goal.id)) {

            goal.stats.forEach(stat => {
                boosts[stat] = (boosts[stat] || 0) + 2;
            });

        }

    });

    return boosts;

}

/* Las misiones con "area" (gaming) solo salen si el usuario eligió esa área */
function isMissionEligible(mission) {

    if (!mission.area) {
        return true;
    }

    const profile = state.profile || { areas: [], goals: [] };

    return profile.areas.includes(mission.area);

}

/* Peso de una misión al mezclar: 1 sin preferencias, hasta 12 */
function getMissionWeight(mission, boosts) {

    const profile = state.profile || { areas: [], goals: [] };

    let weight = 1 + (boosts[mission.stat] || 0);

    if (mission.area && profile.areas.includes(mission.area)) {
        weight += 2;
    }

    if (mission.goal && profile.goals.includes(mission.goal)) {
        weight += 4;
    }

    return Math.min(weight, 12);

}

/* ---------- Abrir / cerrar ---------- */

function setOnbInert(value) {

    document
        .querySelectorAll(
            "body > header, body > nav, body > main, #settingsMenu"
        )
        .forEach(element => {
            element.inert = value;
        });

}

function reducedMotion() {

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;

}

function clearOnbTimers() {

    onboarding.timers.forEach(clearTimeout);

    onboarding.timers = [];

}

/* ---------- Abrir / cerrar ---------- */

function openOnboarding(editing, raceOnly) {

    const hasName =
        state.username &&
        state.username !== "PLAYER";

    onboarding.open = true;

    onboarding.editing = !!editing;

    onboarding.raceOnly = !!raceOnly;

    clearOnbTimers();

    onboarding.steps = ONBOARDING_STEPS.slice();

    onboarding.step = 0;

    onboarding.draft = {
        name: (editing || hasName) ? state.username : "",
        race: state.race,
        areas: [...state.profile.areas],
        goals: [...state.profile.goals],
        count: state.dailyMissionCount || 5
    };

    document
        .getElementById("settingsMenu")
        .classList.add("hidden");

    document
        .getElementById("onboardingOverlay")
        .classList.remove("hidden");

    document.body.classList.add("onb-lock");

    setOnbInert(true);

    if (editing) {

        setOnbPhase("wizard");

    } else if (raceOnly) {

        /* Partida sin raza (guardado anterior a esta función): directos
           a la secuencia de "recuperar el origen", sin pedir de nuevo
           el nombre ni el botón de despertar */
        setOnbPhase("loading");

    } else {

        setOnbPhase("awaken");

    }

}

function closeOnboarding() {

    onboarding.open = false;

    clearOnbTimers();

    document
        .getElementById("onboardingOverlay")
        .classList.add("hidden");

    document
        .getElementById("onboardingOverlay")
        .classList.remove("onb-cinematic");

    document.body.classList.remove("onb-lock");

    setOnbInert(false);

}

/* ---------- Cortina negra de entrada a la app ---------- */

function showAppRevealCurtain() {

    const curtain = document.getElementById("appRevealCurtain");

    curtain.classList.remove("hidden", "fade-out");

    /* Fuerza el navegador a aplicar el estado opaco antes de animar */
    void curtain.offsetWidth;

}

function fadeInAppFromCurtain() {

    const curtain = document.getElementById("appRevealCurtain");

    const pause = reducedMotion() ? 0 : 260;

    const fade = reducedMotion() ? 60 : 1150;

    setTimeout(() => {

        curtain.classList.add("fade-out");

        setTimeout(() => {

            curtain.classList.add("hidden");

        }, fade);

    }, pause);

}

/* ---------- Fin del asistente ---------- */

function finishOnboarding() {

    const draft = onboarding.draft;

    const profile = sanitizeProfile({
        areas: draft.areas,
        goals: draft.goals
    });

    const name =
        draft.name.trim() ||
        state.username ||
        "PLAYER";

    const changed =
        !state.onboarded ||
        JSON.stringify(profile) !== JSON.stringify(state.profile) ||
        draft.count !== state.dailyMissionCount;

    state.username = name;

    state.race = getRaceData(draft.race)
        ? draft.race
        : pickRandomRace().id;

    state.profile = profile;

    state.dailyMissionCount = draft.count;

    state.onboarded = true;

    /* Si cambió el perfil, las misiones de hoy se generan de nuevo */
    if (changed) {

        state.dailyMissionIds = [];

        state.dailyMissionsDate = "";

        ensureDailyMissions();

    }

    saveState();

    /* Al terminar por primera vez (o al recuperar la raza de una
       partida antigua) la vuelta a la app se ve tras una pantalla
       negra; al editar preferencias desde el menú, no hace falta:
       ya estabas dentro de la app */
    const cinematic = !onboarding.editing;

    if (cinematic) {
        showAppRevealCurtain();
    }

    closeOnboarding();

    document.getElementById("nameInput").value = state.username;

    updateTopBar();

    renderMissions();

    if (currentView === "profile") {

        renderProfile();

    }

    if (cinematic) {
        fadeInAppFromCurtain();
    }

}

/* ---------- Navegación del asistente (pasos: áreas, metas, ritmo) ---------- */

function isOnbStepValid() {

    const step = onboarding.steps[onboarding.step];

    if (step === "areas") {
        return onboarding.draft.areas.length > 0;
    }

    return true;

}

function updateOnbNext() {

    const next = document.getElementById("onbNext");

    if (!next) {
        return;
    }

    const valid = isOnbStepValid();

    next.disabled = !valid;

    const hint = document.getElementById("onbHint");

    if (hint) {
        hint.classList.toggle("hidden", valid);
    }

}

function onbNext() {

    if (!isOnbStepValid()) {
        return;
    }

    const draft = onboarding.draft;

    /* Al salir de las áreas se descartan metas de áreas desmarcadas */
    draft.goals = draft.goals.filter(
        id => draft.areas.includes(getGoalById(id).area)
    );

    if (onboarding.step >= onboarding.steps.length - 1) {

        finishOnboarding();

        return;

    }

    onboarding.step++;

    document.getElementById("onboardingOverlay").scrollTop = 0;

    renderOnboarding(true);

}

function onbBack() {

    if (onboarding.step === 0) {
        return;
    }

    onboarding.step--;

    document.getElementById("onboardingOverlay").scrollTop = 0;

    renderOnboarding(true);

}

function toggleOnbItem(list, id, button) {

    const index = list.indexOf(id);

    if (index === -1) {
        list.push(id);
    } else {
        list.splice(index, 1);
    }

    const selected = index === -1;

    button.classList.toggle("selected", selected);

    button.setAttribute("aria-pressed", String(selected));

    updateOnbNext();

}

/* ---------- Fases cinematográficas ---------- */

function setOnbPhase(phase) {

    clearOnbTimers();

    onboarding.phase = phase;

    document
        .getElementById("onboardingOverlay")
        .classList.toggle("onb-cinematic", phase !== "wizard");

    renderOnboarding(true);

    if (phase === "loading") {

        runAwakenLoadingSequence();

    } else if (phase === "blackout") {

        onboarding.timers.push(
            setTimeout(
                () => setOnbPhase("race"),
                reducedMotion() ? 80 : 950
            )
        );

    }

}

function runAwakenLoadingSequence() {

    if (!onboarding.draft.race) {
        onboarding.draft.race = pickRandomRace().id;
    }

    const lines = document.querySelectorAll(".awaken-loading-line");

    const fill = document.getElementById("awakenProgressFill");

    if (reducedMotion()) {

        lines.forEach(line => line.classList.add("show"));

        if (fill) {
            fill.style.transitionDuration = "0s";
            fill.style.width = "100%";
        }

        onboarding.timers.push(setTimeout(() => setOnbPhase("blackout"), 150));

        return;

    }

    if (fill) {

        requestAnimationFrame(() => {
            fill.style.width = "100%";
        });

    }

    const delays = [200, 950, 1700, 2450];

    delays.forEach((delay, index) => {

        onboarding.timers.push(
            setTimeout(() => {

                lines.forEach(line => line.classList.remove("current"));

                const line = lines[index];

                if (line) {
                    line.classList.add("show", "current");
                }

            }, delay)
        );

    });

    onboarding.timers.push(setTimeout(() => setOnbPhase("blackout"), 3150));

}

/* ---------- Pintado ---------- */

function renderOnboarding(animate) {

    const root = document.getElementById("onboardingContent");

    root.innerHTML = "";

    if (onboarding.phase === "awaken") {

        renderAwakenButtonPhase(root);

    } else if (onboarding.phase === "name") {

        renderAwakenNamePhase(root);

    } else if (onboarding.phase === "loading") {

        renderAwakenLoadingPhase(root);

    } else if (onboarding.phase === "blackout") {

        root.appendChild(onbEl("div", "awaken-screen"));

    } else if (onboarding.phase === "race") {

        renderAwakenRacePhase(root, animate);

    } else {

        renderOnboardingWizard(root, animate);

    }

}

function renderAwakenButtonPhase(root) {

    const screen = onbEl("div", "awaken-screen");

    const button = onbEl("button", "awaken-button");

    button.type = "button";

    button.setAttribute("aria-label", t("awakenButton"));

    button.onclick = () => setOnbPhase("name");

    const logo = document.createElement("img");

    logo.src = AWAKEN_LOGO_SRC;

    logo.alt = "";

    logo.draggable = false;

    button.appendChild(logo);

    screen.appendChild(button);

    root.appendChild(screen);

    /* Sin autofoco aquí: el aro de foco quedaría marcado sobre el logo
       nada más cargar. Con el tabulador se sigue pudiendo alcanzar. */

}

function renderAwakenNamePhase(root) {

    const draft = onboarding.draft;

    const screen = onbEl("div", "awaken-screen");

    const card = onbEl("div", "awaken-card");

    card.appendChild(onbEl("p", "awaken-line", t("awakenLine")));

    const input = onbEl("input", "awaken-name-input");

    input.type = "text";

    input.id = "awakenNameInput";

    input.maxLength = 20;

    input.autocomplete = "off";

    input.spellcheck = false;

    input.placeholder = t("onbNamePlaceholder");

    input.value = draft.name;

    input.setAttribute("aria-label", t("onbNameTitle"));

    const confirm = onbEl("button", "awaken-confirm", t("onbNext"));

    confirm.type = "button";

    confirm.disabled = draft.name.trim().length === 0;

    function confirmName() {

        if (confirm.disabled) {
            return;
        }

        draft.name = input.value.trim();

        setOnbPhase("loading");

    }

    input.oninput = () => {

        draft.name = input.value;

        confirm.disabled = draft.name.trim().length === 0;

    };

    input.onkeydown = event => {

        if (event.key === "Enter") {
            event.preventDefault();
            confirmName();
        }

    };

    confirm.onclick = confirmName;

    card.appendChild(input);

    const langRow = onbEl("div", "awaken-lang");

    ["es", "en"].forEach(code => {

        const option = onbEl(
            "button",
            "awaken-lang-option" + (state.language === code ? " active" : ""),
            code === "es" ? "ESP" : "ENG"
        );

        option.type = "button";

        option.onclick = () => {
            setLanguage(code);
            renderOnboarding(false);
        };

        langRow.appendChild(option);

    });

    card.appendChild(langRow);

    card.appendChild(confirm);

    screen.appendChild(card);

    root.appendChild(screen);

    input.focus({ preventScroll: true });

}

function renderAwakenLoadingPhase(root) {

    const screen = onbEl("div", "awaken-screen");

    const box = onbEl("div", "awaken-loading");

    box.setAttribute("aria-live", "polite");

    AWAKEN_LOADING_KEYS.forEach(key => {

        box.appendChild(onbEl("div", "awaken-loading-line", t(key)));

    });

    const track = onbEl("div", "awaken-progress");

    const fill = onbEl("div", "awaken-progress-fill");

    fill.id = "awakenProgressFill";

    track.appendChild(fill);

    box.appendChild(track);

    screen.appendChild(box);

    root.appendChild(screen);

}

function renderAwakenRacePhase(root, animate) {

    const draft = onboarding.draft;

    if (!draft.race) {
        draft.race = pickRandomRace().id;
    }

    const race = getRaceData(draft.race);

    const lang = onbLang();

    const screen = onbEl("div", "awaken-screen");

    const box = onbEl("div", "onb-race revealed" + (animate ? " pop" : ""));

    box.setAttribute("aria-live", "polite");

    box.appendChild(onbEl("div", "onb-race-icon", race.icon));

    box.appendChild(onbEl("div", "onb-race-name", race[lang]));

    box.appendChild(onbEl("p", "onb-race-desc", race.desc[lang]));

    screen.appendChild(box);

    const confirm = onbEl("button", "awaken-confirm", t("onbNext"));

    confirm.type = "button";

    confirm.onclick = () => {

        if (onboarding.raceOnly) {

            finishOnboarding();

        } else {

            onboarding.step = 0;

            setOnbPhase("wizard");

        }

    };

    screen.appendChild(confirm);

    root.appendChild(screen);

    confirm.focus({ preventScroll: true });

}

function renderOnboardingWizard(root, animate) {

    const lang = onbLang();

    const draft = onboarding.draft;

    const stepId = onboarding.steps[onboarding.step];

    const isLast = onboarding.step === onboarding.steps.length - 1;

    /* Cabecera */
    const top = onbEl("div", "onb-top");

    top.appendChild(onbEl("div", "onb-brand", "RE:GENESIS"));

    if (onboarding.editing) {

        const cancel = onbEl("button", "small-button", t("onbCancel"));

        cancel.type = "button";

        cancel.onclick = closeOnboarding;

        top.appendChild(cancel);

    }

    root.appendChild(top);

    /* Progreso */
    const progress = onbEl("div", "onb-progress");

    progress.setAttribute("aria-hidden", "true");

    onboarding.steps.forEach((step, index) => {

        progress.appendChild(
            onbEl("span", index <= onboarding.step ? "done" : "")
        );

    });

    root.appendChild(progress);

    root.appendChild(
        onbEl(
            "div",
            "onb-step-label",
            t("onbStep")
                .replace("{n}", onboarding.step + 1)
                .replace("{total}", onboarding.steps.length)
        )
    );

    /* Contenido del paso */
    const body = onbEl("div", "onb-body" + (animate ? " enter" : ""));

    const title = (key) => {

        const heading = onbEl("h1", "onb-title", t(key));

        heading.id = "onbTitle";

        heading.tabIndex = -1;

        body.appendChild(heading);

    };

    const subtitle = (key) => {
        body.appendChild(onbEl("p", "onb-sub", t(key)));
    };

    if (stepId === "areas") {

        title("onbAreasTitle");

        subtitle("onbAreasSub");

        const grid = onbEl("div", "onb-options");

        ONBOARDING_AREAS.forEach(area => {

            const selected = draft.areas.includes(area.id);

            const button = onbEl(
                "button",
                "onb-option" + (selected ? " selected" : "")
            );

            button.type = "button";

            button.setAttribute("aria-pressed", String(selected));

            button.appendChild(onbEl("span", "onb-check", "✓"));

            button.appendChild(onbEl("span", "onb-option-icon", area.icon));

            button.appendChild(onbEl("span", "onb-option-name", area[lang]));

            button.appendChild(onbEl("span", "onb-option-desc", area.desc[lang]));

            button.onclick = () => toggleOnbItem(draft.areas, area.id, button);

            grid.appendChild(button);

        });

        body.appendChild(grid);

        const hint = onbEl("p", "onb-hint", t("onbAreasHint"));

        hint.id = "onbHint";

        body.appendChild(hint);

    }

    if (stepId === "goals") {

        title("onbGoalsTitle");

        subtitle("onbGoalsSub");

        ONBOARDING_AREAS
            .filter(area => draft.areas.includes(area.id))
            .forEach(area => {

                const group = onbEl("div", "onb-group");

                group.appendChild(
                    onbEl("div", "onb-group-title", area.icon + " " + area[lang])
                );

                const chips = onbEl("div", "onb-chips");

                ONBOARDING_GOALS
                    .filter(goal => goal.area === area.id)
                    .forEach(goal => {

                        const selected = draft.goals.includes(goal.id);

                        const chip = onbEl(
                            "button",
                            "onb-chip" + (selected ? " selected" : ""),
                            goal[lang]
                        );

                        chip.type = "button";

                        chip.setAttribute("aria-pressed", String(selected));

                        chip.onclick = () => toggleOnbItem(draft.goals, goal.id, chip);

                        chips.appendChild(chip);

                    });

                group.appendChild(chips);

                body.appendChild(group);

            });

        body.appendChild(onbEl("p", "onb-hint", t("onbGoalsHint")));

    }

    if (stepId === "pace") {

        title("onbPaceTitle");

        subtitle("onbPaceSub");

        const grid = onbEl("div", "onb-options onb-pace");

        ONBOARDING_PACES.forEach(pace => {

            const selected = draft.count === pace.count;

            const button = onbEl(
                "button",
                "onb-option" + (selected ? " selected" : "")
            );

            button.type = "button";

            button.setAttribute("aria-pressed", String(selected));

            button.appendChild(onbEl("span", "onb-pace-number", String(pace.count)));

            button.appendChild(onbEl("span", "onb-pace-unit", t("onbPaceUnit")));

            button.appendChild(onbEl("span", "onb-option-name", t(pace.key)));

            button.onclick = () => {

                draft.count = pace.count;

                grid.querySelectorAll(".onb-option").forEach(other => {

                    const isThis = other === button;

                    other.classList.toggle("selected", isThis);

                    other.setAttribute("aria-pressed", String(isThis));

                });

            };

            grid.appendChild(button);

        });

        body.appendChild(grid);

        /* Resumen del perfil */
        const summary = onbEl("div", "card onb-summary");

        const row = (label, value) => {

            const line = onbEl("div", "onb-summary-row");

            line.appendChild(onbEl("div", "onb-summary-label", label));

            line.appendChild(onbEl("div", "onb-summary-value", value));

            summary.appendChild(line);

        };

        const chosenAreas = ONBOARDING_AREAS
            .filter(area => draft.areas.includes(area.id))
            .map(area => area.icon + " " + area[lang])
            .join(", ");

        const chosenGoals = ONBOARDING_GOALS
            .filter(goal => draft.goals.includes(goal.id))
            .map(goal => goal[lang])
            .join(", ");

        row(t("onbSummaryPlayer"), draft.name.trim() || state.username);

        const chosenRace = getRaceData(draft.race);

        if (chosenRace) {
            row(t("onbSummaryRace"), chosenRace.icon + " " + getRaceDisplayName(chosenRace, lang));
        }

        row(t("onbSummaryAreas"), chosenAreas || "-");

        row(t("onbSummaryGoals"), chosenGoals || t("onbSummaryNoGoals"));

        body.appendChild(summary);

    }

    root.appendChild(body);

    /* Pie con navegación */
    const footer = onbEl("div", "onb-footer");

    if (onboarding.step > 0) {

        const back = onbEl("button", "small-button", t("onbBack"));

        back.type = "button";

        back.onclick = onbBack;

        footer.appendChild(back);

    }

    const right = onbEl("div", "onb-footer-right");

    if (!isLast) {

        const skip = onbEl(
            "button",
            "onb-skip",
            onboarding.editing ? t("onbSkipSave") : t("onbSkip")
        );

        skip.type = "button";

        skip.onclick = finishOnboarding;

        right.appendChild(skip);

    }

    const next = onbEl(
        "button",
        "primary-button onb-next",
        isLast
            ? (onboarding.editing ? t("onbSave") : t("onbStart"))
            : t("onbNext")
    );

    next.type = "button";

    next.id = "onbNext";

    next.onclick = onbNext;

    right.appendChild(next);

    footer.appendChild(right);

    root.appendChild(footer);

    updateOnbNext();

    if (animate) {

        const target = document.getElementById("onbTitle");

        if (target) {
            target.focus({ preventScroll: true });
        }

    }

}

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            onboarding.open &&
            onboarding.editing
        ) {

            closeOnboarding();

        }

    }
);
