/* =========================================================
   HABITS
========================================================= */

function renderHabits() {

    const container =
        document.getElementById(
            "habitList"
        );

    container.innerHTML = "";

    if (state.habits.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";

        empty.innerHTML = `
            <div class="empty-state-title">
                ${t("noHabits")}
            </div>

            <div class="empty-state-text">
                ${t("noHabitsText")}
            </div>
        `;

        container.appendChild(empty);

        return;

    }

    state.habits.forEach(
        (habit, index) => {

            const completed =
                state.completedHabitsToday
                    .includes(index);

            const card =
                document.createElement("div");

            card.className =
                "habit-card";

            const info =
                document.createElement("div");

            info.className =
                "habit-info";

            const name =
                document.createElement("div");

            name.className =
                "habit-name";

            name.textContent =
                habit.name;

            const meta =
                document.createElement("div");

            meta.className =
                "habit-meta";

            const frequency =
                habit.frequency === "daily"
                    ? t("daily")
                    : t("weekly");

            meta.appendChild(
                createRankBadge(habit.rank)
            );

            meta.appendChild(
                document.createTextNode(
                    " " +
                    frequency +
                    " · +" +
                    habit.xp +
                    " XP"
                )
            );

            info.appendChild(name);

            info.appendChild(meta);

            const actions =
                document.createElement("div");

            actions.className =
                "mission-actions";

            const complete =
                document.createElement("button");

            complete.className =
                "complete-button" +
                (completed
                    ? " completed"
                    : "");

            complete.textContent =
                completed
                    ? t("completed")
                    : t("complete");

            complete.onclick = () => {

                completeHabit(index);

            };

            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-button";

            deleteButton.textContent =
                t("delete");

            deleteButton.onclick = () => {

                deleteHabit(index);

            };

            actions.appendChild(
                complete
            );

            actions.appendChild(
                deleteButton
            );

            card.appendChild(info);

            card.appendChild(actions);

            container.appendChild(card);

        }
    );

}

function createHabit() {

    const name =
        document
            .getElementById("habitName")
            .value
            .trim()
            .slice(0, 80);

    const frequency =
        document
            .getElementById("habitFrequency")
            .value;

    const minutes =
        readOptionalMinutes("habitMinutes");

    const effort =
        Number(
            document
                .getElementById("habitEffort")
                .value
        );

    if (!name || !minutes.ok) {
        return;
    }

    const reward =
        buildReward(
            minutes.value,
            effort,
            {
                custom: true,
                weekly: frequency === "weekly"
            }
        );

    state.habits.push({

        name,

        frequency,

        minutes: reward.minutes,

        effort: reward.effort,

        score: reward.score,

        rank: reward.rank,

        xp: reward.xp

    });

    document
        .getElementById("habitName")
        .value = "";

    saveState();

    renderHabits();

}

function completeHabit(index) {

    if (
        state.completedHabitsToday
            .includes(index)
    ) {

        return;

    }

    state.completedHabitsToday.push(
        index
    );

    const xp = state.habits[index].xp;

    addGeneralXP(xp);

    saveState();

    updateTopBar();

    renderHabits();

    updateRankPreview();

}

function deleteHabit(index) {

    askConfirm(
        state.language === "es"
            ? "¿Eliminar este hábito?"
            : "Delete this habit?",
        t("delete"),
        () => removeHabit(index)
    );

}

function removeHabit(index) {

    state.completedHabitsToday =
        state.completedHabitsToday
            .filter(
                value => value !== index
            )
            .map(
                value =>
                    value > index
                        ? value - 1
                        : value
            );

    state.habits.splice(
        index,
        1
    );

    saveState();

    renderHabits();

}
