/* =========================================================
   CALENDAR
========================================================= */

function renderCalendar() {

    const grid =
        document.getElementById(
            "calendarGrid"
        );

    const monthTitle =
        document.getElementById(
            "calendarMonth"
        );

    grid.innerHTML = "";

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();

    const locale =
        state.language === "es"
            ? "es-ES"
            : "en-US";

    monthTitle.textContent =
        currentCalendarDate.toLocaleDateString(
            locale,
            {
                month: "long",
                year: "numeric"
            }
        );

    const weekdays =
        state.language === "es"
            ? [
                "L",
                "M",
                "X",
                "J",
                "V",
                "S",
                "D"
            ]
            : [
                "M",
                "T",
                "W",
                "T",
                "F",
                "S",
                "S"
            ];

    weekdays.forEach(day => {

        const element =
            document.createElement("div");

        element.className =
            "calendar-weekday";

        element.textContent =
            day;

        grid.appendChild(element);

    });

    const firstDay =
        new Date(
            year,
            month,
            1
        );

    let start =
        firstDay.getDay();

    start =
        start === 0
            ? 6
            : start - 1;

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    for (
        let i = 0;
        i < start;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day empty";

        grid.appendChild(empty);

    }

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const element =
            document.createElement("div");

        element.className =
            "calendar-day";

        const dateString =
            year +
            "-" +
            String(month + 1)
                .padStart(2, "0") +
            "-" +
            String(day)
                .padStart(2, "0");

        if (
            dateString ===
            getLocalDateString()
        ) {

            element.classList.add(
                "today"
            );

        }

        if (
            dateString ===
            selectedCalendarDate
        ) {

            element.classList.add(
                "selected"
            );

        }

        const number =
            document.createElement("div");

        number.className =
            "calendar-day-number";

        number.textContent =
            day;

        element.appendChild(number);

        const hasEvent =
            state.events.some(
                event =>
                    event.date ===
                    dateString
            );

        if (hasEvent) {

            const dot =
                document.createElement("div");

            dot.className =
                "event-dot";

            element.appendChild(dot);

        }

        element.onclick = () => {

            selectCalendarDate(
                dateString
            );

        };

        grid.appendChild(element);

    }

    renderEvents();

}

function changeMonth(amount) {

    /* Siempre el día 1: con setMonth, el 31 de enero + 1 mes saltaba a marzo */
    currentCalendarDate =
        new Date(
            currentCalendarDate.getFullYear(),
            currentCalendarDate.getMonth() + amount,
            1
        );

    renderCalendar();

}

function selectCalendarDate(dateString) {

    selectedCalendarDate =
        dateString;

    document
        .getElementById("eventDate")
        .value =
        dateString;

    renderCalendar();

    openEventCreator();

}

function openEventCreator() {

    const creator =
        document.getElementById(
            "eventCreator"
        );

    creator.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

/* OJO: no llamarla createEvent. En un onclick del HTML, ese nombre se resuelve
   como document.createEvent (función del navegador) y la nuestra nunca se ejecuta. */
function addCalendarEvent() {

    const name =
        document
            .getElementById("eventName")
            .value
            .trim();

    const date =
        document
            .getElementById("eventDate")
            .value;

    const time =
        document
            .getElementById("eventTime")
            .value;

    if (!name || !date) {
        return;
    }

    state.events.push({

        id:
            Date.now().toString() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2),

        name,

        date,

        time

    });

    selectedCalendarDate =
        date;

    document
        .getElementById("eventName")
        .value = "";

    saveState();

    renderCalendar();

}

function renderEvents() {

    const container =
        document.getElementById(
            "eventList"
        );

    container.innerHTML = "";

    const events =
        state.events.filter(
            event =>
                event.date ===
                selectedCalendarDate
        );

    if (events.length === 0) {

        container.innerHTML = `
            <div class="empty-state" style="margin-top:16px;">
                <div class="empty-state-title">
                    ${t("noEvents")}
                </div>

                <div class="empty-state-text">
                    ${t("noEventsText")}
                </div>
            </div>
        `;

        return;

    }

    const list =
        document.createElement("div");

    list.className =
        "event-list";

    events.forEach(event => {

        const item =
            document.createElement("div");

        item.className =
            "event-item";

        const info =
            document.createElement("div");

        const name =
            document.createElement("div");

        name.className =
            "event-name";

        name.textContent =
            event.name;

        const time =
            document.createElement("div");

        time.className =
            "event-time";

        time.textContent =
            event.time || "";

        info.appendChild(name);

        info.appendChild(time);

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-button";

        deleteButton.textContent =
            t("delete");

        deleteButton.onclick = () => {

            deleteEvent(
                event.id
            );

        };

        item.appendChild(info);

        item.appendChild(
            deleteButton
        );

        list.appendChild(item);

    });

    container.appendChild(list);

}

function deleteEvent(id) {

    state.events =
        state.events.filter(
            event =>
                event.id !== id
        );

    saveState();

    renderCalendar();

}
