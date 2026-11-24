/* =========================================================
   PROFILE
========================================================= */

let showUserInfoPanel = true;

function openProfile(showUserInfo = true) {

    showUserInfoPanel = showUserInfo;

    skillCarouselIndex = SKILL_BANNER_ORDER.indexOf("Origen");

    currentView = "profile";

    hideAllViews();

    document
        .getElementById("profileView")
        .classList.remove("hidden");

    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });

    currentProfileCategory = null;

    currentStat = null;

    renderProfile();

}

function renderProfile() {

    document
        .getElementById("profileName")
        .textContent =
        state.username;

    const race = getRaceData(state.race);

    document
        .getElementById("profileRace")
        .textContent =
        race
            ? race.icon + " " + getRaceDisplayName(race, state.language === "en" ? "en" : "es")
            : "";

    document
        .getElementById("profileLevel")
        .textContent =
        state.level;

    document
        .getElementById("profileXP")
        .textContent =
        state.xp;

    const container =
        document.getElementById(
            "profileContent"
        );

    container.innerHTML = "";

    if (!currentProfileCategory && showUserInfoPanel) {
        const missionList = Array.isArray(state.customMissions) ? state.customMissions : [];
        const habitList = Array.isArray(state.habits) ? state.habits : [];
        const completedMissions = Array.isArray(state.completedToday) ? state.completedToday.length : 0;
        const completedHabits = Array.isArray(state.completedHabitsToday) ? state.completedHabitsToday.length : 0;
        const usageSeconds = Number(state.totalUsageSeconds || 0) + Math.max(0, Math.floor((Date.now() - (window.__regenesisSessionStart || Date.now())) / 1000));
        const usageText = `${Math.floor(usageSeconds / 3600)} h ${Math.floor((usageSeconds % 3600) / 60)} min`;

        const dashboard = document.createElement("section");
        dashboard.className = "profile-dashboard";
        dashboard.innerHTML = `
          <h2 style="margin:0 0 12px;font-size:16px;">RESUMEN DE ACTIVIDAD</h2>
          <div class="category-grid" style="margin-bottom:24px;">
            <div class="category-card"><div class="category-icon">⏱️</div><div class="category-name">Tiempo de uso</div><div class="category-stats">${usageText}</div></div>
            <div class="category-card"><div class="category-icon">🎯</div><div class="category-name">Misiones completadas</div><div class="category-stats">${completedMissions}</div></div>
            <div class="category-card"><div class="category-icon">✅</div><div class="category-name">Hábitos completados</div><div class="category-stats">${completedHabits}</div></div>
            <div class="category-card"><div class="category-icon">🛠️</div><div class="category-name">Misiones creadas</div><div class="category-stats">${missionList.length}</div></div>
            <div class="category-card"><div class="category-icon">🌱</div><div class="category-name">Hábitos creados</div><div class="category-stats">${habitList.length}</div></div>
          </div>`;
        container.appendChild(dashboard);
        return;
    }

    renderSkillCarousel();

}

function openCategory(category) {

    currentProfileCategory =
        category;

    renderProfile();

}

function renderCategoryStats() {

    const container =
        document.getElementById(
            "profileContent"
        );

    const header =
        document.createElement("div");

    header.className =
        "subpage-header";

    const back =
        document.createElement("button");

    back.className =
        "back-button";

    back.textContent =
        t("back");

    back.onclick = () => {

        currentProfileCategory = null;

        renderProfile();

    };

    const title =
        document.createElement("div");

    title.className =
        "skill-tree-title";

    title.textContent =
        currentProfileCategory;

    header.appendChild(back);

    header.appendChild(title);

    container.appendChild(header);

    const grid =
        document.createElement("div");

    grid.className =
        "stat-grid";

    categories[
        currentProfileCategory
    ].stats.forEach(stat => {

        const data =
            state.stats[stat];

        const card =
            document.createElement("div");

        card.className =
            "stat-card";

        card.onclick = () => {

            openSkillTree(stat);

        };

        card.innerHTML = `

            <div class="stat-name">
                ${stat}
            </div>

            <div class="stat-level">
                ${t("level")} ${data.level}
            </div>

            <div class="stat-xp">
                ${data.xp} / ${xpRequired(data.level)} XP
            </div>

        `;

        grid.appendChild(card);

    });

    container.appendChild(grid);

}

/* =========================================================
   CARRUSEL DE ÁRBOLES DE HABILIDAD
   5 paneles: Cuerpo, Mente, Origen (tu raza), Alma, Unión.
   Todos los árboles se ven y se usan a la vez, sin navegar entre
   ellos; solo cambia qué panel está centrado en pantalla.
========================================================= */

/* =========================================================
   SKILL TREE
========================================================= */

function openSkillTree(stat) {

    currentStat = stat;

    currentView = "stat";

    hideAllViews();

    document
        .getElementById("statView")
        .classList.remove("hidden");

    renderSkillTree();

}

function renderSkillTree() {

    if (!currentStat) {
        return;
    }

    const isOrigenTree = currentStat === getOrigenTreeKey();

    const originRace = isOrigenTree ? getRaceData(state.race) : null;

    document
        .getElementById("statViewTitle")
        .textContent =
        isOrigenTree
            ? "Origen · " + (originRace ? getRaceDisplayName(originRace) : "-")
            : currentStat;

    const container =
        document.getElementById(
            "skillTreeContainer"
        );

    container.innerHTML = "";

    const points =
        document.createElement("div");

    points.className =
        "skill-points";

    points.textContent =
        state.skillPoints +
        " " +
        (
            state.language === "es"
                ? "PUNTOS"
                : "POINTS"
        );

    const treeHeader =
        document.createElement("div");

    treeHeader.className =
        "skill-tree-header";

    treeHeader.appendChild(points);

    container.appendChild(
        treeHeader
    );

    const tree =
        document.createElement("div");

    tree.className =
        "skill-tree";

    const svgNS =
        "http://www.w3.org/2000/svg";

    const svg =
        document.createElementNS(
            svgNS,
            "svg"
        );

    svg.classList.add(
        "skill-lines"
    );

    svg.setAttribute(
        "viewBox",
        "0 0 100 500"
    );

    connections.forEach(
        ([from, to]) => {

            const line =
                document.createElementNS(
                    svgNS,
                    "line"
                );

            line.classList.add(
                "skill-line"
            );

            line.setAttribute(
                "x1",
                positions[from].x
            );

            line.setAttribute(
                "y1",
                positions[from].y
            );

            line.setAttribute(
                "x2",
                positions[to].x
            );

            line.setAttribute(
                "y2",
                positions[to].y
            );

            svg.appendChild(line);

        }
    );

    tree.appendChild(svg);

    if (!state.unlocked[currentStat]) {

        state.unlocked[currentStat] = [];

    }

    const nodes = isOrigenTree
        ? (getOrigenNodes() || skillNodes)
        : skillNodes;

    nodes.forEach(
        (node, index) => {

            const element =
                document.createElement("div");

            const unlocked =
                state.unlocked[
                    currentStat
                ].includes(index);

            const available =
                isSkillAvailable(index);

            element.className =
                "skill-node " +
                (
                    unlocked
                        ? "unlocked"
                        : available
                            ? "available"
                            : "locked"
                );

            element.style.left =
                positions[index].x + "%";

            element.style.top =
                positions[index].y + "px";

            element.innerHTML = `

                <div class="skill-icon">
                    ${node.icon}
                </div>

                <div class="skill-name">
                    ${skillNodeLabel(node)}
                </div>

                <div class="skill-cost">
                    ${node.cost} ${state.language === "es" ? "PTS" : "PTS"}
                </div>

            `;

            const description = skillNodeDesc(node);

            if (description) {
                element.title = description;
            }

            if (
                available &&
                !unlocked
            ) {

                element.onclick = () => {

                    if (unlockSkill(index, nodes)) {
                        renderSkillTree();
                    }

                };

            }

            tree.appendChild(
                element
            );

        }
    );

    container.appendChild(tree);

}

function isSkillAvailable(index, key) {

    key = key || currentStat;

    if (index === 0) {
        return true;
    }

    /* La tabla larga de 10 nodos: sus 6 primeras conexiones son iguales
       a las de la tabla antigua, así que el árbol viejo no cambia */
    const parents =
        LONG_TREE_CONNECTIONS
            .filter(
                connection =>
                    connection[1] === index
            )
            .map(
                connection =>
                    connection[0]
            );

    return parents.some(
        parent =>
            state.unlocked[key]?.includes(parent)
    );

}

/* Devuelve true si se ha desbloqueado. Ya no repinta nada por sí sola:
   quien la llama decide qué repintar (un único árbol, no la página entera) */
function unlockSkill(index, nodes, key) {

    key = key || currentStat;

    if (!isSkillAvailable(index, key)) {
        return false;
    }

    const node =
        (nodes || skillNodes)[index];

    if (
        state.skillPoints <
        node.cost
    ) {

        return false;

    }

    if (
        state.unlocked[key]?.includes(index)
    ) {

        return false;

    }

    if (!state.unlocked[key]) {

        state.unlocked[key] = [];

    }

    state.skillPoints -=
        node.cost;

    state.unlocked[key].push(index);

    saveState();

    return true;

}

/* =========================================================
   PROFILE BACK BUTTON FROM SKILL TREE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            currentView === "stat"
        ) {

            openProfile();

        }

    }
);
