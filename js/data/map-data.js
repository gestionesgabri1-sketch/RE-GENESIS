/* =========================================================
   MAPA: DATOS
========================================================= */

const MAP_TILE_SIZE = 256;
const MAP_MIN_ZOOM = 2;
const MAP_MAX_ZOOM = 18;
const MAP_DEFAULT_VIEW = { lat: 30, lng: 10, zoom: 2 };

const PLACE_TYPES = [
    { id: "gym",    icon: "🏋️", es: "Gimnasio", en: "Gym" },
    { id: "park",   icon: "🌳", es: "Parque",   en: "Park" },
    { id: "sport",  icon: "⚽", es: "Deporte",  en: "Sports" },
    { id: "study",  icon: "📚", es: "Estudio",  en: "Study" },
    { id: "social", icon: "🍻", es: "Social",   en: "Social" },
    { id: "gaming", icon: "🎮", es: "Gaming",   en: "Gaming" },
    { id: "other",  icon: "📍", es: "Otro",     en: "Other" }
];

const ROUTE_TYPES = [
    { id: "run",  icon: "🏃", es: "Correr",       en: "Run" },
    { id: "walk", icon: "🚶", es: "Caminar",      en: "Walk" },
    { id: "bike", icon: "🚴", es: "Bici",         en: "Bike" },
    { id: "hike", icon: "🥾", es: "Senderismo",   en: "Hiking" }
];

/* Fuentes de teselas. No hay una que sirva para todo el mundo:
   OpenStreetMap bloquea las páginas abiertas desde un archivo local (sin "Referer")
   y CARTO exige clave gratuita. Por eso la fuente se puede cambiar en la app. */
const MAP_PROVIDERS = [
    {
        id: "esri",
        es: "Esri (sin clave)",
        en: "Esri (no key)",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        darkFilter: true,
        attribution: [["Esri, HERE, Garmin", "https://www.esri.com"], ["© OpenStreetMap", "https://www.openstreetmap.org/copyright"]]
    },
    {
        id: "osm",
        es: "OpenStreetMap",
        en: "OpenStreetMap",
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        darkFilter: true,
        attribution: [["© OpenStreetMap", "https://www.openstreetmap.org/copyright"]]
    },
    {
        id: "carto",
        es: "CARTO (clave gratuita)",
        en: "CARTO (free key)",
        url: "https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}{r}.png?key={key}",
        darkFilter: false,
        attribution: [["© OpenStreetMap", "https://www.openstreetmap.org/copyright"], ["© CARTO", "https://carto.com/attributions"]]
    },
    {
        id: "custom",
        es: "Personalizada",
        en: "Custom",
        url: "",
        darkFilter: false,
        attribution: [["© OpenStreetMap", "https://www.openstreetmap.org/copyright"]]
    }
];

/* =========================================================
   ZONAS Y PUNTOS DE INTERÉS
   Cada zona representa una ciudad o barrio: se revela entera al
   encontrar su monumento mientras se navega por el mapa. Las
   coordenadas del templo de Vic vienen de una fuente turística
   (Sygic Travel), no de un catastro oficial: si no coinciden
   exactamente con la puerta del edificio, se pueden ajustar aquí.
========================================================= */

const WORLD_ZONES = [
    {
        id: "vic",
        es: "Vic",
        en: "Vic",
        /* Centro aproximado de la ciudad (Plaça Major) */
        lat: 41.9301,
        lng: 2.2547,
        /* Radio en metros del área que se revela al desbloquear la zona:
           cubre el casco histórico y el ensanche, no el término municipal */
        radius: 1400,
        landmark: {
            id: "vic-temple",
            es: "Temple Romà de Vic",
            en: "Roman Temple of Vic",
            icon: "🏛️",
            lat: 41.929201,
            lng: 2.256856,
            /* Distancia, en metros, a la que se considera "estás aquí" */
            radius: 60
        }
    }
];

/* Constantes de la niebla de exploración. Se declaran aquí (y no junto al
   resto del código del mapa, más abajo) porque loadState() se ejecuta muy
   pronto al cargar la página, y necesita poder sanear estos datos ya. */
const FOG_ZOOM = 18;
const FOG_CELL_PX = 46;
const FOG_MAX_CELLS = 6000;
