/* =========================================================
   MAPA
   Mapa propio, sin librerías: teselas de CARTO / OpenStreetMap,
   arrastrar, zoom, lugares y rutas guardados en el estado.
========================================================= */

/* ---------- Utilidades y datos guardados ---------- */

function mapClamp(value, min, max) {

    return Math.min(max, Math.max(min, value));

}

function makeMapId(prefix) {

    return prefix +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 7);

}

function isValidLatLng(lat, lng) {

    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        isFinite(lat) &&
        isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
    );

}

function sanitizePlaces(raw) {

    if (!Array.isArray(raw)) {
        return [];
    }

    const types = PLACE_TYPES.map(type => type.id);

    return raw
        .map(item => {

            if (!item || typeof item !== "object") {
                return null;
            }

            if (!isValidLatLng(item.lat, item.lng)) {
                return null;
            }

            return {
                id: typeof item.id === "string" && item.id
                    ? item.id
                    : makeMapId("p"),
                name: String(item.name || "").trim().slice(0, 40) || "-",
                type: types.includes(item.type) ? item.type : "other",
                note: String(item.note || "").slice(0, 200),
                lat: item.lat,
                lng: item.lng
            };

        })
        .filter(Boolean)
        .slice(0, 500);

}

function sanitizeRoutes(raw) {

    if (!Array.isArray(raw)) {
        return [];
    }

    const types = ROUTE_TYPES.map(type => type.id);

    return raw
        .map(item => {

            if (!item || typeof item !== "object" || !Array.isArray(item.points)) {
                return null;
            }

            const points = item.points
                .filter(point => Array.isArray(point) && isValidLatLng(point[0], point[1]))
                .slice(0, 2000)
                .map(point => [point[0], point[1]]);

            if (points.length < 2) {
                return null;
            }

            return {
                id: typeof item.id === "string" && item.id
                    ? item.id
                    : makeMapId("r"),
                name: String(item.name || "").trim().slice(0, 40) || "-",
                type: types.includes(item.type) ? item.type : "walk",
                note: String(item.note || "").slice(0, 200),
                points
            };

        })
        .filter(Boolean)
        .slice(0, 200);

}

function sanitizeMapView(raw) {

    if (!raw || typeof raw !== "object") {
        return null;
    }

    if (!isValidLatLng(raw.lat, raw.lng) || typeof raw.zoom !== "number" || !isFinite(raw.zoom)) {
        return null;
    }

    return {
        lat: raw.lat,
        lng: raw.lng,
        zoom: mapClamp(Math.round(raw.zoom), MAP_MIN_ZOOM, MAP_MAX_ZOOM)
    };

}

function sanitizeMapSource(raw) {

    const id = raw && MAP_PROVIDERS.some(provider => provider.id === raw.id)
        ? raw.id
        : "esri";

    const key = raw && typeof raw.key === "string"
        ? raw.key.replace(/\s/g, "").slice(0, 120)
        : "";

    let url = raw && typeof raw.url === "string"
        ? raw.url.trim().slice(0, 400)
        : "";

    /* Solo plantillas https con {z}, {x} e {y} */
    if (!/^https:\/\//i.test(url) || !/\{z\}/.test(url) || !/\{x\}/.test(url) || !/\{y\}/.test(url)) {
        url = "";
    }

    return { id, key, url };

}

function getMapProvider() {

    return MAP_PROVIDERS.find(provider => provider.id === state.mapSource.id) ||
        MAP_PROVIDERS[0];

}

/* Plantilla de la fuente elegida, o null si falta la clave o la URL */
function getMapTileTemplate() {

    const provider = getMapProvider();

    const source = state.mapSource;

    if (provider.id === "custom") {
        return source.url || null;
    }

    if (provider.id === "carto") {

        if (!source.key) {
            return null;
        }

        return provider.url
            .replace("{style}", document.body.classList.contains("theme-white") ? "light_all" : "dark_all")
            .replace("{key}", encodeURIComponent(source.key));

    }

    return provider.url;

}

function buildMapTileUrl(template, zoom, tx, ty) {

    return template
        .replace("{s}", "abcd"[(tx + ty) % 4])
        .replace("{z}", zoom)
        .replace("{x}", tx)
        .replace("{y}", ty)
        .replace("{r}", window.devicePixelRatio > 1.5 ? "@2x" : "");

}

function getPlaceType(id) {

    return PLACE_TYPES.find(type => type.id === id) ||
        PLACE_TYPES[PLACE_TYPES.length - 1];

}

function getRouteType(id) {

    return ROUTE_TYPES.find(type => type.id === id) ||
        ROUTE_TYPES[0];

}

function getMapItem(selection) {

    if (!selection) {
        return null;
    }

    if (selection.kind === "place") {

        const data = state.places.find(place => place.id === selection.id);

        return data
            ? { kind: "place", data, type: getPlaceType(data.type) }
            : null;

    }

    const data = state.routes.find(route => route.id === selection.id);

    return data
        ? { kind: "route", data, type: getRouteType(data.type) }
        : null;

}

function mapDistanceKm(points) {

    const rad = Math.PI / 180;

    let km = 0;

    for (let i = 1; i < points.length; i++) {

        const [lat1, lng1] = points[i - 1];

        const [lat2, lng2] = points[i];

        const dLat = (lat2 - lat1) * rad;

        const dLng = (lng2 - lng1) * rad;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLng / 2) ** 2;

        km += 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));

    }

    return km;

}

function formatKm(km) {

    if (km < 1) {
        return Math.round(km * 1000) + " m";
    }

    return (km < 10 ? km.toFixed(2) : km.toFixed(1)) + " km";

}

function formatCoords(lat, lng) {

    return lat.toFixed(5) + ", " + lng.toFixed(5);

}

/* ---------- Proyección (Web Mercator, como OpenStreetMap) ---------- */

function mapProject(lat, lng, zoom) {

    const scale = MAP_TILE_SIZE * Math.pow(2, zoom);

    const sin = Math.sin(
        mapClamp(lat, -85.0511, 85.0511) * Math.PI / 180
    );

    return {
        x: (lng + 180) / 360 * scale,
        y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
    };

}

function mapUnproject(x, y, zoom) {

    const scale = MAP_TILE_SIZE * Math.pow(2, zoom);

    const n = Math.PI - 2 * Math.PI * y / scale;

    return {
        lat: 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
        lng: x / scale * 360 - 180
    };

}

function clampMapCenter(point) {

    return {
        lat: mapClamp(point.lat, -85, 85),
        lng: mapClamp(point.lng, -180, 180)
    };

}

function mapToScreen(lat, lng) {

    const c = mapProject(mapUI.center.lat, mapUI.center.lng, mapUI.zoom);

    const p = mapProject(lat, lng, mapUI.zoom);

    return {
        x: p.x - c.x + mapUI.width / 2,
        y: p.y - c.y + mapUI.height / 2
    };

}

function mapFromScreen(x, y) {

    const c = mapProject(mapUI.center.lat, mapUI.center.lng, mapUI.zoom);

    return mapUnproject(
        c.x + x - mapUI.width / 2,
        c.y + y - mapUI.height / 2,
        mapUI.zoom
    );

}

/* ---------- Vista: abrir, medir, mover, zoom ---------- */

function measureMap() {

    if (!mapUI.el) {
        return false;
    }

    mapUI.width = mapUI.el.clientWidth;

    mapUI.height = mapUI.el.clientHeight;

    return mapUI.width > 0 && mapUI.height > 0;

}

function initMap() {

    mapUI.el = document.getElementById("mapFrame");

    mapUI.tileLayer = document.getElementById("mapTiles");

    mapUI.markerLayer = document.getElementById("mapMarkers");

    mapUI.svg = document.getElementById("mapSvg");

    const view = state.mapView;

    mapUI.center = view
        ? { lat: view.lat, lng: view.lng }
        : { lat: MAP_DEFAULT_VIEW.lat, lng: MAP_DEFAULT_VIEW.lng };

    mapUI.zoom = view ? view.zoom : MAP_DEFAULT_VIEW.zoom;

    mapUI.tiles = {};

    mapUI.tileLayer.innerHTML = "";

    mapUI.tilesOk = 0;

    mapUI.tilesFailed = 0;

    /* Sin vista guardada pero con lugares: se encuadran al abrir */
    mapUI.needsFit = !view && (state.places.length + state.routes.length) > 0;

    if (!mapUI.bound) {

        bindMapEvents();

        mapUI.bound = true;

    }

    mapUI.ready = true;

}

function openMapView() {

    if (!mapUI.ready) {
        initMap();
    }

    measureMap();

    if (mapUI.needsFit) {

        fitMapToItems();

        mapUI.needsFit = false;

    }

    renderMapAll();

    resumeLiveLocation();

    if (mapUI.tracking && mapUI.me) {

        checkLandmarks(mapUI.me.lat, mapUI.me.lng);

    }

}

/* Tras "Reiniciar todo": el mapa se vuelve a montar desde cero al abrirlo */
function resetMapRuntime() {

    pauseLiveLocation();

    clearTimeout(mapUI.bannerTimer);

    clearTimeout(mapUI.unlockTimer);


    mapUI.tracking = false;

    mapUI.following = false;

    mapUI.firstFix = false;

    mapUI.meMarker = null;

    mapUI.ready = false;

    mapUI.mode = "browse";

    mapUI.pending = null;

    mapUI.draft = [];

    mapUI.selected = null;

    mapUI.me = null;

    mapUI.markers = [];

    mapUI.tiles = {};

    const tiles = document.getElementById("mapTiles");

    if (tiles) {
        tiles.innerHTML = "";
    }

}

function setMapView(lat, lng, zoom) {

    mapUI.zoom = mapClamp(Math.round(zoom), MAP_MIN_ZOOM, MAP_MAX_ZOOM);

    mapUI.center = clampMapCenter({ lat, lng });

    scheduleMapRender();

    scheduleMapSave();

}

function panMapBy(dx, dy) {

    if (mapUI.following) {

        mapUI.following = false;

        updateLocateButton();

    }

    const c = mapProject(mapUI.center.lat, mapUI.center.lng, mapUI.zoom);

    mapUI.center = clampMapCenter(
        mapUnproject(c.x + dx, c.y + dy, mapUI.zoom)
    );

    scheduleMapRender();

    scheduleMapSave();

}

/* Zoom manteniendo fijo el punto bajo el cursor o los dedos */
function zoomMapAt(delta, sx, sy) {

    if (!measureMap()) {
        return;
    }

    /* Siguiéndote, el zoom se hace sobre ti (el centro) y no sobre el cursor */
    if (mapUI.tracking && mapUI.following) {

        sx = mapUI.width / 2;

        sy = mapUI.height / 2;

    }

    const zoom = mapClamp(mapUI.zoom + delta, MAP_MIN_ZOOM, MAP_MAX_ZOOM);

    if (zoom === mapUI.zoom) {
        return;
    }

    const anchor = mapFromScreen(sx, sy);

    const p = mapProject(anchor.lat, anchor.lng, zoom);

    mapUI.center = clampMapCenter(
        mapUnproject(
            p.x - (sx - mapUI.width / 2),
            p.y - (sy - mapUI.height / 2),
            zoom
        )
    );

    mapUI.zoom = zoom;

    scheduleMapRender();

    scheduleMapSave();

}

function zoomMapButton(delta) {

    if (!mapUI.ready || !measureMap()) {
        return;
    }

    zoomMapAt(delta, mapUI.width / 2, mapUI.height / 2);

}

function fitMapToPoints(points) {

    if (!points.length || !measureMap()) {
        return;
    }

    const padding = 96;

    let chosen = MAP_MIN_ZOOM;

    let center = mapUI.center;

    for (let zoom = 16; zoom >= MAP_MIN_ZOOM; zoom--) {

        const projected = points.map(point => mapProject(point[0], point[1], zoom));

        const xs = projected.map(point => point.x);

        const ys = projected.map(point => point.y);

        const minX = Math.min(...xs);

        const maxX = Math.max(...xs);

        const minY = Math.min(...ys);

        const maxY = Math.max(...ys);

        chosen = zoom;

        center = mapUnproject((minX + maxX) / 2, (minY + maxY) / 2, zoom);

        if (
            maxX - minX <= mapUI.width - padding &&
            maxY - minY <= mapUI.height - padding
        ) {
            break;
        }

    }

    /* Un único punto no debe acercarse a lo loco */
    if (points.length === 1) {
        chosen = Math.min(chosen, 15);
    }

    setMapView(center.lat, center.lng, chosen);

}

function fitMapToItems() {

    const points = [];

    state.places.forEach(place => points.push([place.lat, place.lng]));

    state.routes.forEach(route => route.points.forEach(point => points.push(point)));

    fitMapToPoints(points);

}

function flyToMapItem(item) {

    if (mapUI.following) {

        mapUI.following = false;

        updateLocateButton();

    }

    if (item.kind === "place") {

        setMapView(item.data.lat, item.data.lng, Math.max(mapUI.zoom, 15));

    } else {

        fitMapToPoints(item.data.points);

    }

}

function scheduleMapSave() {

    clearTimeout(mapUI.saveTimer);

    mapUI.saveTimer = setTimeout(() => {

        state.mapView = {
            lat: mapUI.center.lat,
            lng: mapUI.center.lng,
            zoom: mapUI.zoom
        };

        saveState();

    }, 400);

}

/* ---------- Pintado del mapa ---------- */

function scheduleMapRender() {

    if (mapUI.frame) {
        return;
    }

    mapUI.frame = requestAnimationFrame(() => {

        mapUI.frame = 0;

        renderMapView();

    });

}

function createMapTile(zoom, tx, ty, template) {

    const image = document.createElement("img");

    image.className = "map-tile";

    image.alt = "";

    image.draggable = false;

    image.width = MAP_TILE_SIZE;

    image.height = MAP_TILE_SIZE;

    image.onload = () => {

        mapUI.tilesOk++;

        updateMapOfflineHint();

    };

    image.onerror = () => {

        mapUI.tilesFailed++;

        image.style.visibility = "hidden";

        updateMapOfflineHint();

    };

    image.src = buildMapTileUrl(template, zoom, tx, ty);

    return image;

}

function updateMapOfflineHint() {

    const hint = document.getElementById("mapOffline");

    if (!hint) {
        return;
    }

    const missing = getMapTileTemplate() === null;

    const failing = mapUI.tilesOk === 0 && mapUI.tilesFailed >= 2;

    hint.textContent = t(missing ? "mapSrcMissing" : "mapOffline");

    hint.classList.toggle("hidden", !(missing || failing));

}

/* Atribución obligatoria de la fuente elegida, y modo oscuro de los mapas claros */
function updateMapAttribution() {

    const box = document.getElementById("mapAttribution");

    if (!box) {
        return;
    }

    box.innerHTML = "";

    getMapProvider().attribution.forEach(([text, href], index) => {

        if (index > 0) {
            box.appendChild(document.createTextNode(" · "));
        }

        const link = document.createElement("a");

        link.href = href;

        link.target = "_blank";

        link.rel = "noopener";

        link.textContent = text;

        box.appendChild(link);

    });

    mapUI.el.classList.toggle(
        "tiles-invert",
        getMapProvider().darkFilter &&
        !document.body.classList.contains("theme-white")
    );

}

/* Descarta las teselas ya cargadas: cambió el tema o la fuente */
function refreshMapTiles() {

    if (!mapUI.ready) {
        return;
    }

    Object.values(mapUI.tiles).forEach(image => image.remove());

    mapUI.tiles = {};

    mapUI.tilesOk = 0;

    mapUI.tilesFailed = 0;

    updateMapAttribution();

    updateMapOfflineHint();

    scheduleMapRender();

    renderMapFog();

}

function refreshMapTheme() {

    refreshMapTiles();

}

function renderMapView() {

    if (!mapUI.ready || !measureMap()) {
        return;
    }

    const { width, height, zoom } = mapUI;

    const worldTiles = Math.pow(2, zoom);

    const c = mapProject(mapUI.center.lat, mapUI.center.lng, zoom);

    const left = c.x - width / 2;

    const top = c.y - height / 2;

    const x0 = Math.floor(left / MAP_TILE_SIZE);

    const x1 = Math.floor((left + width) / MAP_TILE_SIZE);

    const y0 = Math.max(0, Math.floor(top / MAP_TILE_SIZE));

    const y1 = Math.min(worldTiles - 1, Math.floor((top + height) / MAP_TILE_SIZE));

    const needed = new Set();

    const template = getMapTileTemplate();

    for (let ty = y0; ty <= y1 && template; ty++) {

        for (let tx = x0; tx <= x1; tx++) {

            if (tx < 0 || tx >= worldTiles) {
                continue;
            }

            const key = zoom + "/" + tx + "/" + ty;

            needed.add(key);

            let image = mapUI.tiles[key];

            if (!image) {

                image = createMapTile(zoom, tx, ty, template);

                mapUI.tiles[key] = image;

                mapUI.tileLayer.appendChild(image);

            }

            image.style.transform =
                "translate(" +
                Math.round(tx * MAP_TILE_SIZE - left) + "px," +
                Math.round(ty * MAP_TILE_SIZE - top) + "px)";

        }

    }

    Object.keys(mapUI.tiles).forEach(key => {

        if (!needed.has(key)) {

            mapUI.tiles[key].remove();

            delete mapUI.tiles[key];

        }

    });

    renderMapSvg();

    positionMapMarkers();

    renderMapFog();

}

function renderMapSvg() {

    const { width, height } = mapUI;

    const svg = mapUI.svg;

    svg.setAttribute("viewBox", "0 0 " + width + " " + height);

    const toPoints = points =>
        points
            .map(point => {

                const p = mapToScreen(point[0], point[1]);

                return p.x.toFixed(1) + "," + p.y.toFixed(1);

            })
            .join(" ");

    let html = "";

    /* Círculo de precisión del GPS (radio en metros → píxeles) */
    if (mapUI.me && typeof mapUI.me.acc === "number" && mapUI.me.acc > 0) {

        const metersPerPixel =
            156543.03392 *
            Math.cos(mapUI.me.lat * Math.PI / 180) /
            Math.pow(2, mapUI.zoom);

        const radius = mapUI.me.acc / metersPerPixel;

        if (radius > 12) {

            const p = mapToScreen(mapUI.me.lat, mapUI.me.lng);

            html +=
                '<circle class="map-accuracy" cx="' + p.x.toFixed(1) +
                '" cy="' + p.y.toFixed(1) + '" r="' + radius.toFixed(1) + '"/>';

        }

    }

    state.routes.forEach(route => {

        const selected =
            mapUI.selected &&
            mapUI.selected.kind === "route" &&
            mapUI.selected.id === route.id;

        const points = toPoints(route.points);

        html +=
            '<polyline class="map-line-halo" points="' + points + '"/>' +
            '<polyline class="map-line' + (selected ? " selected" : "") +
            '" points="' + points + '"/>';

    });

    if (mapUI.mode === "route" && mapUI.draft.length > 0) {

        const points = toPoints(mapUI.draft);

        html +=
            '<polyline class="map-line-halo" points="' + points + '"/>' +
            '<polyline class="map-line draft" points="' + points + '"/>';

        mapUI.draft.forEach(point => {

            const p = mapToScreen(point[0], point[1]);

            html +=
                '<circle class="map-vertex" cx="' + p.x.toFixed(1) +
                '" cy="' + p.y.toFixed(1) + '" r="5"/>';

        });

    }

    svg.innerHTML = html;

}

/* Marcadores: se reconstruyen cuando cambian los datos y se reposicionan al mover */
function syncMapMarkers() {

    if (!mapUI.markerLayer) {
        return;
    }

    mapUI.markerLayer.innerHTML = "";

    mapUI.markers = [];

    const add = (element, lat, lng) => {

        mapUI.markerLayer.appendChild(element);

        mapUI.markers.push({ element, lat, lng });

    };

    const pin = (className, icon, label) => {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "map-marker " + className;

        if (label) {
            button.setAttribute("aria-label", label);
        }

        const body = document.createElement("span");

        body.className = "map-marker-pin";

        const glyph = document.createElement("span");

        glyph.className = "map-marker-icon";

        glyph.textContent = icon;

        body.appendChild(glyph);

        button.appendChild(body);

        return button;

    };

    state.places.forEach(place => {

        const selected =
            mapUI.selected &&
            mapUI.selected.kind === "place" &&
            mapUI.selected.id === place.id;

        const marker = pin(
            selected ? "selected" : "",
            getPlaceType(place.type).icon,
            place.name
        );

        marker.onclick = () => {

            if (mapUI.mode === "browse") {

                selectMapItem({ kind: "place", id: place.id }, false);

            }

        };

        add(marker, place.lat, place.lng);

    });

    if (mapUI.mode === "place" && mapUI.pending) {

        add(
            pin("pending", getPlaceType(mapUI.form.type).icon, ""),
            mapUI.pending.lat,
            mapUI.pending.lng
        );

    }

    mapUI.meMarker = null;

    if (mapUI.me) {

        const dot = document.createElement("div");

        dot.className = "map-me" + (mapUI.tracking ? " live" : "");

        const arrow = document.createElement("span");

        arrow.className = "map-me-dir";

        dot.appendChild(arrow);

        add(dot, mapUI.me.lat, mapUI.me.lng);

        mapUI.meMarker = mapUI.markers[mapUI.markers.length - 1];

        applyMapHeading();

    }

}

function positionMapMarkers() {

    const { width, height } = mapUI;

    mapUI.markers.forEach(marker => {

        const p = mapToScreen(marker.lat, marker.lng);

        marker.element.style.transform =
            "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px)";

        marker.element.style.display =
            (p.x < -60 || p.x > width + 60 || p.y < -80 || p.y > height + 60)
                ? "none"
                : "";

    });

}

/* ---------- Interacción: arrastrar, pellizcar, rueda, teclado ---------- */

function bindMapEvents() {

    const frame = mapUI.el;

    const localPoint = event => {

        const rect = frame.getBoundingClientRect();

        return { x: event.clientX - rect.left, y: event.clientY - rect.top };

    };

    const onControl = event =>
        event.target.closest && event.target.closest(".map-control, .map-marker");

    frame.addEventListener("pointerdown", event => {

        if (onControl(event) || (event.pointerType === "mouse" && event.button !== 0)) {
            return;
        }

        measureMap();

        try {

            frame.setPointerCapture(event.pointerId);

        } catch (error) {

            /* Sin captura el arrastre sigue funcionando dentro del mapa */

        }

        mapUI.pointers.set(event.pointerId, localPoint(event));

        if (mapUI.pointers.size === 1) {

            const start = mapUI.pointers.get(event.pointerId);

            const c = mapProject(mapUI.center.lat, mapUI.center.lng, mapUI.zoom);

            mapUI.gesture = {
                type: "drag",
                startX: start.x,
                startY: start.y,
                cx: c.x,
                cy: c.y,
                moved: false
            };

        } else if (mapUI.pointers.size === 2) {

            const [a, b] = [...mapUI.pointers.values()];

            mapUI.gesture = {
                type: "pinch",
                dist: Math.hypot(a.x - b.x, a.y - b.y),
                moved: true
            };

        }

    });

    frame.addEventListener("pointermove", event => {

        if (!mapUI.pointers.has(event.pointerId)) {
            return;
        }

        const point = localPoint(event);

        mapUI.pointers.set(event.pointerId, point);

        const gesture = mapUI.gesture;

        if (!gesture) {
            return;
        }

        if (gesture.type === "drag" && mapUI.pointers.size === 1) {

            const dx = point.x - gesture.startX;

            const dy = point.y - gesture.startY;

            if (!gesture.moved && Math.hypot(dx, dy) < 5) {
                return;
            }

            gesture.moved = true;

            /* Arrastrar el mapa deja de seguirte; el botón pasa a "Centrar" */
            if (mapUI.following) {

                mapUI.following = false;

                updateLocateButton();

            }

            frame.classList.add("dragging");

            mapUI.center = clampMapCenter(
                mapUnproject(gesture.cx - dx, gesture.cy - dy, mapUI.zoom)
            );

            scheduleMapRender();

            scheduleMapSave();

        } else if (gesture.type === "pinch" && mapUI.pointers.size === 2) {

            const [a, b] = [...mapUI.pointers.values()];

            const dist = Math.hypot(a.x - b.x, a.y - b.y);

            const ratio = dist / gesture.dist;

            const mx = (a.x + b.x) / 2;

            const my = (a.y + b.y) / 2;

            if (ratio > 1.6) {

                zoomMapAt(1, mx, my);

                gesture.dist = dist;

            } else if (ratio < 1 / 1.6) {

                zoomMapAt(-1, mx, my);

                gesture.dist = dist;

            }

        }

    });

    const endPointer = event => {

        const point = mapUI.pointers.get(event.pointerId);

        const gesture = mapUI.gesture;

        mapUI.pointers.delete(event.pointerId);

        if (mapUI.pointers.size === 0) {

            if (
                gesture &&
                gesture.type === "drag" &&
                !gesture.moved &&
                event.type === "pointerup" &&
                point
            ) {

                handleMapTap(point.x, point.y);

            }

            mapUI.gesture = null;

            frame.classList.remove("dragging");

        } else if (mapUI.pointers.size === 1) {

            /* Tras un pellizco queda un dedo: sigue arrastrando, sin contar como toque */
            const rest = [...mapUI.pointers.values()][0];

            const c = mapProject(mapUI.center.lat, mapUI.center.lng, mapUI.zoom);

            mapUI.gesture = {
                type: "drag",
                startX: rest.x,
                startY: rest.y,
                cx: c.x,
                cy: c.y,
                moved: true
            };

        }

    };

    frame.addEventListener("pointerup", endPointer);

    frame.addEventListener("pointercancel", endPointer);

    frame.addEventListener(
        "wheel",
        event => {

            event.preventDefault();

            const now = Date.now();

            if (now - mapUI.lastWheel < 180) {
                return;
            }

            mapUI.lastWheel = now;

            const point = localPoint(event);

            zoomMapAt(event.deltaY < 0 ? 1 : -1, point.x, point.y);

        },
        { passive: false }
    );

    frame.addEventListener("dblclick", event => {

        if (mapUI.mode !== "browse" || onControl(event)) {
            return;
        }

        const point = localPoint(event);

        zoomMapAt(1, point.x, point.y);

    });

    frame.addEventListener("keydown", event => {

        const step = 80;

        const actions = {
            ArrowLeft: () => panMapBy(-step, 0),
            ArrowRight: () => panMapBy(step, 0),
            ArrowUp: () => panMapBy(0, -step),
            ArrowDown: () => panMapBy(0, step),
            "+": () => zoomMapButton(1),
            "=": () => zoomMapButton(1),
            "-": () => zoomMapButton(-1),
            "_": () => zoomMapButton(-1),
            Escape: () => {

                if (mapUI.mode !== "browse") {
                    setMapMode("browse");
                }

            }
        };

        if (actions[event.key] && event.target === frame) {

            event.preventDefault();

            actions[event.key]();

        }

    });

    if (window.ResizeObserver) {

        new ResizeObserver(() => scheduleMapRender()).observe(frame);

    }

    window.addEventListener("resize", () => scheduleMapRender());

}

/* ---------- Toques en el mapa ---------- */

function mapPointSegmentDistance(px, py, ax, ay, bx, by) {

    const dx = bx - ax;

    const dy = by - ay;

    const lengthSquared = dx * dx + dy * dy;

    let t = lengthSquared === 0
        ? 0
        : ((px - ax) * dx + (py - ay) * dy) / lengthSquared;

    t = mapClamp(t, 0, 1);

    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));

}

function findRouteAt(sx, sy) {

    let best = null;

    let bestDistance = 14;

    state.routes.forEach(route => {

        const screen = route.points.map(point => mapToScreen(point[0], point[1]));

        for (let i = 1; i < screen.length; i++) {

            const distance = mapPointSegmentDistance(
                sx, sy,
                screen[i - 1].x, screen[i - 1].y,
                screen[i].x, screen[i].y
            );

            if (distance < bestDistance) {

                bestDistance = distance;

                best = route;

            }

        }

    });

    return best;

}

function handleMapTap(sx, sy) {

    const geo = mapFromScreen(sx, sy);

    if (mapUI.mode === "place") {

        mapUI.pending = { lat: geo.lat, lng: geo.lng };

        syncMapMarkers();

        updateMapFormState();

        scheduleMapRender();

        document
            .getElementById("mapPanel")
            .scrollIntoView({ behavior: "smooth", block: "nearest" });

        return;

    }

    if (mapUI.mode === "route") {

        mapUI.draft.push([geo.lat, geo.lng]);

        updateMapFormState();

        scheduleMapRender();

        return;

    }

    const route = findRouteAt(sx, sy);

    selectMapItem(route ? { kind: "route", id: route.id } : null, false);

}

/* ---------- Modos, selección y ubicación ---------- */

function setMapMode(mode) {

    if (!mapUI.ready) {
        return;
    }

    if (mapUI.mode === mode) {
        mode = "browse";
    }

    mapUI.mode = mode;

    /* Al colocar lugares o dibujar rutas el mapa no debe moverse solo */
    if (mode !== "browse" && mapUI.following) {

        mapUI.following = false;

        updateLocateButton();

    }

    mapUI.pending = null;

    mapUI.draft = [];

    mapUI.selected = null;

    mapUI.form = {
        name: "",
        type: mode === "route" ? ROUTE_TYPES[0].id : "other",
        note: ""
    };

    renderMapAll();

}

function selectMapItem(selection, fly) {

    mapUI.selected = selection;

    syncMapMarkers();

    renderMapPanel();

    renderMapList();

    const item = getMapItem(selection);

    if (item && fly) {

        flyToMapItem(item);

        mapUI.el.scrollIntoView({ behavior: "smooth", block: "nearest" });

    } else if (item) {

        document
            .getElementById("mapPanel")
            .scrollIntoView({ behavior: "smooth", block: "nearest" });

    }

    scheduleMapRender();

}

function showMapMessage(text) {

    const box = document.getElementById("mapMessage");

    box.textContent = text;

    box.classList.remove("hidden");

    clearTimeout(mapUI.messageTimer);

    mapUI.messageTimer = setTimeout(hideMapMessage, 5000);

}

function hideMapMessage() {

    document.getElementById("mapMessage").classList.add("hidden");

}

/* ---------- Ubicación en tiempo real ----------
   Los datos del GPS solo viven en memoria: no se guardan ni se envían a ningún sitio. */

function updateLocateButton() {

    const button = document.getElementById("mapBtnLocate");

    if (!button) {
        return;
    }

    const live = mapUI.tracking && mapUI.following;

    document.getElementById("mapLocateIcon").textContent = live ? "📡" : "🎯";

    document.getElementById("mapLocateText").textContent = t(
        live
            ? "mapLive"
            : mapUI.tracking
                ? "mapRecenter"
                : "mapLocate"
    );

    button.classList.toggle("active", live);

    button.setAttribute("aria-pressed", String(live));

}

function renderMapLive() {

    const chip = document.getElementById("mapLive");

    if (!chip) {
        return;
    }

    chip.classList.toggle("hidden", !mapUI.tracking);

    if (!mapUI.tracking) {
        return;
    }

    if (!mapUI.me) {

        chip.textContent = t("mapSearching");

        return;

    }

    let text = "● " + t("mapLive");

    if (typeof mapUI.me.acc === "number" && isFinite(mapUI.me.acc)) {
        text += " · ±" + Math.round(mapUI.me.acc) + " m";
    }

    if (typeof mapUI.me.speed === "number" && mapUI.me.speed > 0.5) {
        text += " · " + (mapUI.me.speed * 3.6).toFixed(1) + " km/h";
    }

    chip.textContent = text;

}

/* Flecha de dirección: solo si te mueves y el dispositivo da el rumbo */
function applyMapHeading() {

    if (!mapUI.meMarker || !mapUI.me) {
        return;
    }

    const arrow = mapUI.meMarker.element.querySelector(".map-me-dir");

    const heading = mapUI.me.heading;

    const show =
        typeof heading === "number" &&
        isFinite(heading) &&
        typeof mapUI.me.speed === "number" &&
        mapUI.me.speed > 0.5;

    arrow.style.display = show ? "block" : "none";

    if (show) {
        arrow.style.transform = "rotate(" + heading + "deg)";
    }

}

function onLivePosition(position) {

    const c = position.coords;

    if (!isValidLatLng(c.latitude, c.longitude)) {
        return;
    }

    mapUI.me = {
        lat: c.latitude,
        lng: c.longitude,
        acc: c.accuracy,
        heading: c.heading,
        speed: c.speed
    };

    hideMapMessage();

    if (mapUI.meMarker) {

        mapUI.meMarker.lat = c.latitude;

        mapUI.meMarker.lng = c.longitude;

        applyMapHeading();

    } else {

        syncMapMarkers();

    }

    if (mapUI.following) {

        if (mapUI.firstFix) {

            setMapView(c.latitude, c.longitude, Math.max(mapUI.zoom, 16));

        } else {

            /* Seguir sin guardar la vista en cada actualización */
            mapUI.center = clampMapCenter({ lat: c.latitude, lng: c.longitude });

            scheduleMapRender();

        }

    } else {

        scheduleMapRender();

    }

    mapUI.firstFix = false;

    recordExploredCell(c.latitude, c.longitude);

    if (mapUI.ready) {

        checkLandmarks(c.latitude, c.longitude);

    }

    renderMapLive();

}

function onLiveError(error) {

    if (error.code === 1) {

        showMapMessage(t("mapGeoDenied"));

        stopLiveLocation();

        return;

    }

    if (error.code === 2) {
        showMapMessage(t("mapGeoUnavailable"));
    }

    /* Tiempo agotado: el seguimiento sigue esperando la señal */
    renderMapLive();

}

function beginLiveWatch() {

    if (mapUI.watchId !== null || !navigator.geolocation) {
        return;
    }

    mapUI.watchId = navigator.geolocation.watchPosition(
        onLivePosition,
        onLiveError,
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );

}

/* Al salir del mapa se pausa el GPS (batería); al volver se reanuda solo */
function pauseLiveLocation() {

    if (mapUI.watchId !== null && navigator.geolocation) {

        navigator.geolocation.clearWatch(mapUI.watchId);

    }

    mapUI.watchId = null;

}

function resumeLiveLocation() {

    if (mapUI.tracking && mapUI.watchId === null) {
        beginLiveWatch();
    }

}

function startLiveLocation() {

    if (!navigator.geolocation) {

        showMapMessage(t("mapNoGeo"));

        return;

    }

    if (window.isSecureContext === false) {

        showMapMessage(t("mapGeoInsecure"));

        return;

    }

    mapUI.tracking = true;

    mapUI.following = true;

    mapUI.firstFix = true;

    showMapMessage(t("mapLocating"));

    beginLiveWatch();

    updateLocateButton();

    renderMapLive();

}

function stopLiveLocation() {

    pauseLiveLocation();

    mapUI.tracking = false;

    mapUI.following = false;

    mapUI.firstFix = false;

    mapUI.me = null;

    mapUI.meMarker = null;

    if (mapUI.ready) {

        syncMapMarkers();

        updateLocateButton();

        renderMapLive();

        scheduleMapRender();

    }

}

/* Un solo botón: activar → volver a centrar (si arrastraste) → desactivar */
function locateMe() {

    if (!mapUI.ready) {
        return;
    }

    if (!mapUI.tracking) {

        startLiveLocation();

        return;

    }

    if (!mapUI.following) {

        mapUI.following = true;

        if (mapUI.me) {
            setMapView(mapUI.me.lat, mapUI.me.lng, Math.max(mapUI.zoom, 16));
        }

        updateLocateButton();

        return;

    }

    stopLiveLocation();

}

/* ---------- Panel inferior: formulario, detalle y lista ---------- */

function renderMapAll() {

    if (!mapUI.ready) {
        return;
    }

    const frame = mapUI.el;

    frame.setAttribute("aria-label", t("mapAria"));

    frame.classList.toggle("mode-place", mapUI.mode === "place");

    frame.classList.toggle("mode-route", mapUI.mode === "route");

    [["mapZoomIn", "mapZoomIn"], ["mapZoomOut", "mapZoomOut"]].forEach(([id, key]) => {

        const button = document.getElementById(id);

        button.setAttribute("aria-label", t(key));

        button.title = t(key);

    });

    const place = document.getElementById("mapBtnPlace");

    const route = document.getElementById("mapBtnRoute");

    place.classList.toggle("active", mapUI.mode === "place");

    place.setAttribute("aria-pressed", String(mapUI.mode === "place"));

    route.classList.toggle("active", mapUI.mode === "route");

    route.setAttribute("aria-pressed", String(mapUI.mode === "route"));

    const hint = document.getElementById("mapHint");

    hint.textContent =
        mapUI.mode === "place"
            ? t("mapHintPlace")
            : mapUI.mode === "route"
                ? t("mapHintRoute")
                : "";

    hint.classList.toggle("hidden", mapUI.mode === "browse");

    syncMapMarkers();

    renderMapPanel();

    renderMapList();

    renderMapSourcePanel();

    updateMapAttribution();

    updateMapOfflineHint();

    updateLocateButton();

    renderMapLive();

    scheduleMapRender();

}

/* ---------- Fuente del mapa ---------- */

function toggleMapSource() {

    if (!mapUI.ready) {
        return;
    }

    mapUI.showSource = !mapUI.showSource;

    renderMapSourcePanel();

}

function renderMapSourcePanel() {

    const holder = document.getElementById("mapSourcePanel");

    const button = document.getElementById("mapBtnSource");

    button.classList.toggle("active", mapUI.showSource);

    button.setAttribute("aria-expanded", String(mapUI.showSource));

    holder.innerHTML = "";

    if (!mapUI.showSource) {
        return;
    }

    const lang = onbLang();

    const draft = { ...state.mapSource };

    const card = onbEl("div", "card map-source");

    card.appendChild(onbEl("div", "settings-title", t("mapSourceTitle")));

    const select = onbEl("select");

    select.setAttribute("aria-label", t("mapSourceTitle"));

    MAP_PROVIDERS.forEach(provider => {

        const option = onbEl("option", "", provider[lang]);

        option.value = provider.id;

        option.selected = provider.id === draft.id;

        select.appendChild(option);

    });

    card.appendChild(select);

    const note = onbEl("p", "map-info");

    card.appendChild(note);

    const key = onbEl("input");

    key.type = "text";

    key.autocomplete = "off";

    key.spellcheck = false;

    key.placeholder = t("mapSourceKey");

    key.value = draft.key;

    key.oninput = () => { draft.key = key.value; };

    card.appendChild(key);

    const url = onbEl("input");

    url.type = "text";

    url.autocomplete = "off";

    url.spellcheck = false;

    url.placeholder = t("mapSourceUrl");

    url.value = draft.url;

    url.oninput = () => { draft.url = url.value; };

    card.appendChild(url);

    const notes = {
        esri: "mapSrcEsri",
        osm: "mapSrcOsm",
        carto: "mapSrcCarto",
        custom: "mapSrcCustom"
    };

    const syncFields = () => {

        note.textContent = t(notes[draft.id]);

        key.classList.toggle("hidden", draft.id !== "carto");

        url.classList.toggle("hidden", draft.id !== "custom");

    };

    select.onchange = () => {

        draft.id = select.value;

        syncFields();

    };

    syncFields();

    const actions = onbEl("div", "map-form-actions");

    const close = onbEl("button", "small-button", t("mapCancel"));

    close.type = "button";

    close.onclick = toggleMapSource;

    actions.appendChild(close);

    const apply = onbEl("button", "primary-button map-save", t("mapSourceApply"));

    apply.type = "button";

    apply.onclick = () => {

        state.mapSource = sanitizeMapSource(draft);

        saveState();

        mapUI.showSource = false;

        renderMapSourcePanel();

        refreshMapTiles();

    };

    actions.appendChild(apply);

    card.appendChild(actions);

    holder.appendChild(card);

}

function renderMapPanel() {

    const panel = document.getElementById("mapPanel");

    panel.innerHTML = "";

    if (mapUI.mode !== "browse") {

        panel.appendChild(buildMapForm());

        updateMapFormState();

        return;

    }

    const item = getMapItem(mapUI.selected);

    if (item) {

        panel.appendChild(buildMapDetails(item));

    } else {

        mapUI.selected = null;

    }

}

function buildMapForm() {

    const lang = onbLang();

    const isRoute = mapUI.mode === "route";

    const card = onbEl("div", "card map-form");

    card.appendChild(
        onbEl("div", "settings-title", t(isRoute ? "mapNewRoute" : "mapNewPlace"))
    );

    const info = onbEl("p", "map-info");

    info.id = "mapFormInfo";

    card.appendChild(info);

    const name = onbEl("input");

    name.type = "text";

    name.id = "mapFormName";

    name.maxLength = 40;

    name.autocomplete = "off";

    name.placeholder = t(isRoute ? "mapRouteName" : "mapPlaceName");

    name.value = mapUI.form.name;

    name.oninput = () => {

        mapUI.form.name = name.value;

        updateMapFormState();

    };

    card.appendChild(name);

    const chips = onbEl("div", "map-chips");

    (isRoute ? ROUTE_TYPES : PLACE_TYPES).forEach(type => {

        const selected = mapUI.form.type === type.id;

        const chip = onbEl(
            "button",
            "map-chip" + (selected ? " selected" : ""),
            type.icon + " " + type[lang]
        );

        chip.type = "button";

        chip.setAttribute("aria-pressed", String(selected));

        chip.onclick = () => {

            mapUI.form.type = type.id;

            chips.querySelectorAll(".map-chip").forEach(other => {

                const isThis = other === chip;

                other.classList.toggle("selected", isThis);

                other.setAttribute("aria-pressed", String(isThis));

            });

            if (!isRoute) {

                syncMapMarkers();

                scheduleMapRender();

            }

        };

        chips.appendChild(chip);

    });

    card.appendChild(chips);

    const note = onbEl("input");

    note.type = "text";

    note.maxLength = 200;

    note.autocomplete = "off";

    note.placeholder = t("mapNote");

    note.value = mapUI.form.note;

    note.oninput = () => {

        mapUI.form.note = note.value;

    };

    card.appendChild(note);

    const actions = onbEl("div", "map-form-actions");

    if (isRoute) {

        const undo = onbEl("button", "small-button", t("mapUndo"));

        undo.type = "button";

        undo.id = "mapFormUndo";

        undo.onclick = () => {

            mapUI.draft.pop();

            updateMapFormState();

            scheduleMapRender();

        };

        actions.appendChild(undo);

    }

    const cancel = onbEl("button", "small-button", t("mapCancel"));

    cancel.type = "button";

    cancel.onclick = () => setMapMode("browse");

    actions.appendChild(cancel);

    const save = onbEl("button", "primary-button map-save", t("mapSave"));

    save.type = "button";

    save.id = "mapFormSave";

    save.onclick = isRoute ? saveMapRoute : saveMapPlace;

    actions.appendChild(save);

    card.appendChild(actions);

    return card;

}

/* Actualiza texto y botones del formulario sin reconstruirlo (no pierde el foco) */
function updateMapFormState() {

    const info = document.getElementById("mapFormInfo");

    const save = document.getElementById("mapFormSave");

    if (!info || !save) {
        return;
    }

    const hasName = mapUI.form.name.trim().length > 0;

    if (mapUI.mode === "route") {

        const points = mapUI.draft.length;

        info.textContent =
            points < 2
                ? t("mapRouteNeed")
                : formatKm(mapDistanceKm(mapUI.draft)) + " · " +
                  points + " " + t("mapPoints");

        save.disabled = !(points >= 2 && hasName);

        const undo = document.getElementById("mapFormUndo");

        if (undo) {
            undo.disabled = points === 0;
        }

    } else {

        info.textContent =
            mapUI.pending
                ? formatCoords(mapUI.pending.lat, mapUI.pending.lng)
                : t("mapPlaceTapNeed");

        save.disabled = !(mapUI.pending && hasName);

    }

}

function saveMapPlace() {

    const name = mapUI.form.name.trim();

    if (!mapUI.pending || !name) {
        return;
    }

    const place = {
        id: makeMapId("p"),
        name: name.slice(0, 40),
        type: mapUI.form.type,
        note: mapUI.form.note.trim().slice(0, 200),
        lat: mapUI.pending.lat,
        lng: mapUI.pending.lng
    };

    state.places.push(place);

    saveState();

    mapUI.mode = "browse";

    mapUI.pending = null;

    mapUI.selected = { kind: "place", id: place.id };

    renderMapAll();

}

function saveMapRoute() {

    const name = mapUI.form.name.trim();

    if (mapUI.draft.length < 2 || !name) {
        return;
    }

    const route = {
        id: makeMapId("r"),
        name: name.slice(0, 40),
        type: mapUI.form.type,
        note: mapUI.form.note.trim().slice(0, 200),
        points: mapUI.draft.map(point => [point[0], point[1]])
    };

    state.routes.push(route);

    saveState();

    mapUI.mode = "browse";

    mapUI.draft = [];

    mapUI.selected = { kind: "route", id: route.id };

    renderMapAll();

}

function mapItemMeta(item) {

    const lang = onbLang();

    if (item.kind === "route") {

        return item.type[lang] + " · " +
            formatKm(mapDistanceKm(item.data.points)) + " · " +
            item.data.points.length + " " + t("mapPoints");

    }

    return item.type[lang];

}

function buildMapDetails(item) {

    const card = onbEl("div", "card map-details");

    const head = onbEl("div", "map-details-head");

    head.appendChild(onbEl("div", "map-badge", item.type.icon));

    const text = onbEl("div");

    text.appendChild(onbEl("div", "map-details-name", item.data.name));

    text.appendChild(onbEl("div", "map-details-meta", mapItemMeta(item)));

    head.appendChild(text);

    card.appendChild(head);

    if (item.kind === "place") {

        card.appendChild(
            onbEl(
                "div",
                "map-details-meta",
                formatCoords(item.data.lat, item.data.lng)
            )
        ).style.marginTop = "10px";

    }

    if (item.data.note) {

        card.appendChild(onbEl("p", "map-details-note", item.data.note));

    }

    const actions = onbEl("div", "map-form-actions");

    actions.style.marginTop = "14px";

    const center = onbEl("button", "small-button", t("mapCenter"));

    center.type = "button";

    center.onclick = () => {

        flyToMapItem(item);

        mapUI.el.scrollIntoView({ behavior: "smooth", block: "nearest" });

    };

    actions.appendChild(center);

    const remove = onbEl("button", "delete-button", t("delete"));

    remove.type = "button";

    remove.onclick = () => deleteMapItem({ kind: item.kind, id: item.data.id });

    actions.appendChild(remove);

    card.appendChild(actions);

    return card;

}

function deleteMapItem(selection) {

    const isRoute = selection.kind === "route";

    askConfirm(
        t(isRoute ? "mapDeleteRoute" : "mapDeletePlace"),
        t("delete"),
        () => {

            if (isRoute) {

                state.routes = state.routes.filter(route => route.id !== selection.id);

            } else {

                state.places = state.places.filter(place => place.id !== selection.id);

            }

            mapUI.selected = null;

            saveState();

            renderMapAll();

        }
    );

}

function renderMapList() {

    const box = document.getElementById("mapList");

    box.innerHTML = "";

    if (state.places.length === 0 && state.routes.length === 0) {

        box.appendChild(onbEl("div", "map-empty", t("mapEmpty")));

        return;

    }

    const editing = mapUI.mode !== "browse";

    const section = (titleKey, kind, list) => {

        if (list.length === 0) {
            return;
        }

        box.appendChild(onbEl("div", "map-list-title", t(titleKey)));

        list.forEach(data => {

            const item = getMapItem({ kind, id: data.id });

            const selected =
                mapUI.selected &&
                mapUI.selected.kind === kind &&
                mapUI.selected.id === data.id;

            const row = onbEl("button", "map-row" + (selected ? " selected" : ""));

            row.type = "button";

            row.disabled = editing;

            row.appendChild(onbEl("span", "map-row-icon", item.type.icon));

            const text = onbEl("span");

            text.appendChild(onbEl("div", "map-row-name", data.name));

            text.appendChild(onbEl("div", "map-row-meta", mapItemMeta(item)));

            row.appendChild(text);

            row.onclick = () => selectMapItem({ kind, id: data.id }, true);

            box.appendChild(row);

        });

    };

    section("mapPlaces", "place", state.places);

    section("mapRoutes", "route", state.routes);

}

/* =========================================================
   EXPLORACIÓN Y ZONAS
   Niebla de guerra: el mapa se revela por donde has caminado con
   "En vivo" activo, y una zona entera se desbloquea al encontrar
   su monumento. Todo se guarda solo en este dispositivo.
========================================================= */

function fogCellKey(lat, lng) {

    const p = mapProject(lat, lng, FOG_ZOOM);

    return Math.floor(p.x / FOG_CELL_PX) + ":" + Math.floor(p.y / FOG_CELL_PX);

}

function sanitizeExploredCells(raw) {

    if (!Array.isArray(raw)) {
        return [];
    }

    return [...new Set(
        raw.filter(cell => typeof cell === "string" && /^-?\d+:-?\d+$/.test(cell))
    )].slice(-FOG_MAX_CELLS);

}

function sanitizeStringList(raw, allowed) {

    if (!Array.isArray(raw)) {
        return [];
    }

    return [...new Set(raw.filter(id => allowed.includes(id)))];

}

function getZoneData(id) {

    return WORLD_ZONES.find(zone => zone.id === id) || null;

}

/* Registra la casilla donde estás; solo mientras te sigue en vivo */
function recordExploredCell(lat, lng) {

    const key = fogCellKey(lat, lng);

    if (state.exploredCells.includes(key)) {
        return false;
    }

    state.exploredCells.push(key);

    if (state.exploredCells.length > FOG_MAX_CELLS) {

        state.exploredCells.splice(
            0,
            state.exploredCells.length - FOG_MAX_CELLS
        );

    }

    scheduleMapSave();

    return true;

}

/* Distancia en metros entre dos puntos (haversine, ya usado para las rutas) */
function distanceMeters(lat1, lng1, lat2, lng2) {

    return mapDistanceKm([[lat1, lng1], [lat2, lng2]]) * 1000;

}

/* ---------- Niebla: pintado ---------- */

function ensureFogCanvas() {

    if (mapUI.fogCanvas) {
        return;
    }

    mapUI.fogCanvas = document.getElementById("mapFog");

    mapUI.fogCtx = mapUI.fogCanvas.getContext("2d");

}

function metersToPixels(meters, lat) {

    const metersPerPixel =
        156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, mapUI.zoom);

    return meters / metersPerPixel;

}

function renderMapFog() {

    ensureFogCanvas();

    const canvas = mapUI.fogCanvas;

    const ctx = mapUI.fogCtx;

    if (!canvas || !ctx || !mapUI.width || !mapUI.height) {
        return;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    const pixelWidth = Math.round(mapUI.width * ratio);

    const pixelHeight = Math.round(mapUI.height * ratio);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {

        canvas.width = pixelWidth;

        canvas.height = pixelHeight;

    }

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    ctx.clearRect(0, 0, mapUI.width, mapUI.height);

    ctx.fillStyle = document.body.classList.contains("theme-white")
        ? "rgba(20, 22, 26, 0.72)"
        : "rgba(0, 0, 0, 0.82)";

    ctx.fillRect(0, 0, mapUI.width, mapUI.height);

    ctx.globalCompositeOperation = "destination-out";

    const punch = (x, y, radius, soft) => {

        if (x < -radius || x > mapUI.width + radius || y < -radius || y > mapUI.height + radius) {
            return;
        }

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        gradient.addColorStop(0, "rgba(0,0,0,1)");

        gradient.addColorStop(soft ? 0.55 : 0.82, "rgba(0,0,0,1)");

        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(x, y, radius, 0, Math.PI * 2);

        ctx.fill();

    };

    /* Casillas ya recorridas y tu posición actual: un círculo suave por
       cada una, del mismo tamaño real (unos 20-25 m) sea cual sea el zoom.
       Solo se dibujan al acercar lo bastante (zoom >= FOG_REVEAL_MIN_ZOOM):
       a nivel de país o de mundo un punto de 20 m no se vería, y antes un
       suelo mínimo en píxeles hacía que, cuanto más se alejaba el mapa, más
       terreno real parecía "revelado" (a veces cientos de kilómetros). */
    const FOG_REVEAL_MIN_ZOOM = 12;

    if (mapUI.zoom >= FOG_REVEAL_MIN_ZOOM) {

        const scale = Math.pow(2, mapUI.zoom - FOG_ZOOM);

        const cellRadius = Math.max(FOG_CELL_PX * scale * 0.85, 3);

        const center = mapProject(mapUI.center.lat, mapUI.center.lng, mapUI.zoom);

        state.exploredCells.forEach(key => {

            const [cx, cy] = key.split(":").map(Number);

            const worldX = (cx + 0.5) * FOG_CELL_PX;

            const worldY = (cy + 0.5) * FOG_CELL_PX;

            const x = worldX * scale - center.x + mapUI.width / 2;

            const y = worldY * scale - center.y + mapUI.height / 2;

            punch(x, y, cellRadius, false);

        });

        if (mapUI.me) {

            const p = mapToScreen(mapUI.me.lat, mapUI.me.lng);

            punch(p.x, p.y, Math.max(cellRadius * 1.4, 5), true);

        }

    }

    /* Zonas desbloqueadas: reveladas enteras, sin depender de las casillas
       ni del zoom mínimo de arriba (un radio real en metros, así que a
       cualquier zoom ocupa siempre el mismo tamaño real en el mapa) */
    WORLD_ZONES.forEach(zone => {

        if (!state.unlockedZones.includes(zone.id)) {
            return;
        }

        const p = mapToScreen(zone.lat, zone.lng);

        punch(p.x, p.y, metersToPixels(zone.radius, zone.lat), true);

    });

    ctx.globalCompositeOperation = "source-over";

}

/* ---------- Aviso en pantalla ---------- */

function showMapBanner(icon, title, sub) {

    const box = document.getElementById("mapBanner");

    box.innerHTML = "";

    box.appendChild(onbEl("div", "map-banner-icon", icon));

    box.appendChild(onbEl("div", "map-banner-title", title));

    if (sub) {
        box.appendChild(onbEl("div", "map-banner-sub", sub));
    }

    box.classList.remove("hidden");

    box.classList.remove("pop");

    /* reinicia la animación aunque ya hubiera un aviso visible */
    void box.offsetWidth;

    box.classList.add("pop");

    clearTimeout(mapUI.bannerTimer);

    mapUI.bannerTimer = setTimeout(() => {

        box.classList.add("hidden");

    }, 5200);

}

/* Aviso del sistema operativo, además del de dentro de la app.
   Si el navegador lo bloquea o no existe, no pasa nada: el aviso
   de dentro de la app siempre se ve igualmente. */
function notifyLandmarkFound(landmark, lang) {

    try {

        if (!("Notification" in window)) {
            return;
        }

        const send = () => {

            new Notification(t("mapNotifyTitle"), {
                body: landmark[lang],
                icon: undefined,
                tag: "poi-" + landmark.id
            });

        };

        if (Notification.permission === "granted") {

            send();

        } else if (Notification.permission === "default" && !mapUI.notifyAsked) {

            mapUI.notifyAsked = true;

            Notification.requestPermission().then(permission => {

                if (permission === "granted") {
                    send();
                }

            }).catch(() => {});

        }

    } catch (error) {

        /* Sin aviso del sistema, el de dentro de la app basta */

    }

}

/* ---------- Descubrimiento de monumentos ---------- */

function unlockZone(zone) {

    if (state.unlockedZones.includes(zone.id)) {
        return;
    }

    state.unlockedZones.push(zone.id);

    saveState();

    showMapBanner(
        "🗺️",
        t("mapZoneUnlocked").replace("{zone}", zone[onbLang()]),
        t("mapZoneUnlockedSub")
    );

    scheduleMapRender();

}

/* Se llama con cada posición nueva del GPS mientras el mapa está abierto */
function checkLandmarks(lat, lng) {

    WORLD_ZONES.forEach(zone => {

        const landmark = zone.landmark;

        const distance = distanceMeters(lat, lng, landmark.lat, landmark.lng);

        if (distance > landmark.radius) {
            return;
        }

        if (state.unlockedZones.includes(zone.id)) {
            return;
        }

        const alreadyFound = state.landmarksFound.includes(landmark.id);

        /* Si el aviso de "encontrado" y el de "zona desbloqueada" llegaran
           en el mismo instante, el segundo taparía al primero sin dar
           tiempo a leerlo. Por eso, cuando el monumento es nuevo, el
           desbloqueo se muestra un segundo después. */
        if (!alreadyFound) {

            state.landmarksFound.push(landmark.id);

            saveState();

            const lang = onbLang();

            showMapBanner(
                landmark.icon,
                t("mapPoiFoundTitle"),
                landmark[lang]
            );

            notifyLandmarkFound(landmark, lang);

            clearTimeout(mapUI.unlockTimer);

            mapUI.unlockTimer = setTimeout(() => unlockZone(zone), 2600);

        } else {

            /* El monumento ya estaba encontrado de antes (por ejemplo, tras
               un estado guardado incompleto) pero la zona no llegó a
               desbloquearse: se hace ahora mismo, sin esperar. */
            unlockZone(zone);

        }

    });

}
