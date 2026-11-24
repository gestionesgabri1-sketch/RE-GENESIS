const skillNodes = [

    {
        name: "Fundamento",
        icon: "✦",
        cost: 1
    },

    {
        name: "Mejora I",
        icon: "◆",
        cost: 1
    },

    {
        name: "Mejora II",
        icon: "◆",
        cost: 1
    },

    {
        name: "Especialización",
        icon: "★",
        cost: 2
    },

    {
        name: "Maestría I",
        icon: "◇",
        cost: 2
    },

    {
        name: "Maestría II",
        icon: "◇",
        cost: 3
    }

];

const positions = [

    {
        x: 50,
        y: 20
    },

    {
        x: 20,
        y: 150
    },

    {
        x: 80,
        y: 150
    },

    {
        x: 50,
        y: 280
    },

    {
        x: 20,
        y: 410
    },

    {
        x: 80,
        y: 410
    }

];

const connections = [

    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5]

];

const RACE_SKILL_TREES = {

    human: [
        { name: { es: "Voluntad de Hierro", en: "Iron Will" }, icon: "🔥", cost: 1,
          desc: { es: "Sin dones heredados: tu fuerza nace de decidir, una y otra vez.", en: "No inherited gifts: your strength comes from choosing, again and again." } },
        { name: { es: "Adaptación", en: "Adaptation" }, icon: "🧩", cost: 1,
          desc: { es: "Aprendes de cada golpe más rápido que cualquier otra estirpe.", en: "You learn from every setback faster than any other bloodline." } },
        { name: { es: "Ingenio", en: "Ingenuity" }, icon: "💡", cost: 1,
          desc: { es: "Encuentras una salida donde otros solo ven un muro.", en: "You find a way out where others only see a wall." } },
        { name: { es: "Determinación Inquebrantable", en: "Unbreakable Resolve" }, icon: "🎯", cost: 2,
          desc: { es: "Ya no dudas: solo avanzas.", en: "You no longer hesitate: you only move forward." } },
        { name: { es: "Potencial Ilimitado", en: "Limitless Potential" }, icon: "🌟", cost: 2,
          desc: { es: "Sin techo marcado por la sangre, puedes llegar a cualquier parte.", en: "With no ceiling set by blood, you can reach anywhere." } },
        { name: { es: "Legado Humano", en: "Human Legacy" }, icon: "🏆", cost: 2,
          desc: { es: "Lo que construyes hoy queda para quien venga después.", en: "What you build today remains for whoever comes next." } },
        { name: { es: "Corazón Indomable", en: "Indomitable Heart" }, icon: "💗", cost: 1,
          desc: { es: "Ni la derrota más dura te apaga por dentro.", en: "Not even the hardest defeat puts you out inside." } },
        { name: { es: "Visión de Futuro", en: "Vision of the Future" }, icon: "🔭", cost: 1,
          desc: { es: "Ves quién puedes llegar a ser, no solo quién eres hoy.", en: "You see who you can become, not just who you are today." } },
        { name: { es: "Espíritu Colectivo", en: "Collective Spirit" }, icon: "🤝", cost: 2,
          desc: { es: "Sabes que se llega más lejos acompañado.", en: "You know you go further together." } },
        { name: { es: "Trascendencia Humana", en: "Human Transcendence" }, icon: "🌅", cost: 3,
          desc: { es: "Sin dones de nacimiento, te conviertes en leyenda por decisión propia.", en: "With no gift at birth, you become a legend by choice alone." } }
    ],

    elf: [
        { name: { es: "Sentidos Élficos", en: "Elven Senses" }, icon: "🍃", cost: 1,
          desc: { es: "Percibes detalles que a los demás se les escapan.", en: "You notice details that escape everyone else." } },
        { name: { es: "Agilidad Ancestral", en: "Ancestral Agility" }, icon: "🏹", cost: 1,
          desc: { es: "Tu cuerpo responde con la ligereza de generaciones de práctica.", en: "Your body answers with the lightness of generations of practice." } },
        { name: { es: "Sabiduría Antigua", en: "Ancient Wisdom" }, icon: "📖", cost: 1,
          desc: { es: "Aprendes con la paciencia de quien tiene siglos por delante.", en: "You learn with the patience of one who has centuries ahead." } },
        { name: { es: "Gracia del Bosque", en: "Grace of the Forest" }, icon: "🌿", cost: 2,
          desc: { es: "Te mueves por la vida sin forzar nada.", en: "You move through life without forcing anything." } },
        { name: { es: "Reflejos Perfectos", en: "Perfect Reflexes" }, icon: "🌙", cost: 2,
          desc: { es: "Reaccionas antes de que el problema termine de formarse.", en: "You react before the problem has even finished forming." } },
        { name: { es: "Ojo del Vidente", en: "Seer's Eye" }, icon: "👁️", cost: 2,
          desc: { es: "Ves el patrón completo donde otros solo ven el momento.", en: "You see the whole pattern where others only see the moment." } },
        { name: { es: "Paso Silencioso", en: "Silent Step" }, icon: "🌫️", cost: 1,
          desc: { es: "Te mueves sin dejar más rastro del necesario.", en: "You move without leaving more trace than needed." } },
        { name: { es: "Memoria del Bosque", en: "Memory of the Forest" }, icon: "🌳", cost: 1,
          desc: { es: "Recuerdas cada lección como si el bosque mismo te la contara.", en: "You remember every lesson as if the forest itself told it to you." } },
        { name: { es: "Arco Perfecto", en: "Perfect Bow" }, icon: "🏹", cost: 2,
          desc: { es: "Cuando apuntas, ya sabes que has acertado.", en: "When you aim, you already know you've hit the mark." } },
        { name: { es: "Alma Eterna del Bosque", en: "Eternal Soul of the Forest" }, icon: "🍃", cost: 3,
          desc: { es: "Tu paciencia se ha vuelto tan antigua como los árboles.", en: "Your patience has grown as old as the trees themselves." } }
    ],

    angel: [
        { name: { es: "Luz Interior", en: "Inner Light" }, icon: "✨", cost: 1,
          desc: { es: "Una calma serena que no se apaga con el ruido de fuera.", en: "A serene calm that doesn't fade with the noise outside." } },
        { name: { es: "Disciplina Celestial", en: "Celestial Discipline" }, icon: "🕊️", cost: 1,
          desc: { es: "Cumples lo que prometiste, aunque nadie más lo vea.", en: "You keep what you promised, even when no one else sees it." } },
        { name: { es: "Voluntad de Proteger", en: "Will to Protect" }, icon: "🛡️", cost: 1,
          desc: { es: "Cuidas de los demás sin esperar nada a cambio.", en: "You look after others without expecting anything back." } },
        { name: { es: "Gracia Serena", en: "Serene Grace" }, icon: "🌤️", cost: 2,
          desc: { es: "Ni el caos a tu alrededor te saca de tu centro.", en: "Not even the chaos around you shakes your center." } },
        { name: { es: "Alas de Luz", en: "Wings of Light" }, icon: "👼", cost: 2,
          desc: { es: "Te alzas justo cuando los demás más lo necesitan.", en: "You rise exactly when others need it most." } },
        { name: { es: "Bendición Eterna", en: "Eternal Blessing" }, icon: "☀️", cost: 2,
          desc: { es: "Tu presencia, sola, ya mejora lo que toca.", en: "Your presence alone already improves what it touches." } },
        { name: { es: "Juicio Justo", en: "Fair Judgment" }, icon: "⚖️", cost: 1,
          desc: { es: "Decides con la cabeza fría y el corazón puesto.", en: "You decide with a cool head and your heart in the right place." } },
        { name: { es: "Escudo Sagrado", en: "Sacred Shield" }, icon: "🛡️", cost: 1,
          desc: { es: "Te interpones sin dudarlo cuando alguien lo necesita.", en: "You step in without hesitation when someone needs it." } },
        { name: { es: "Voz Celestial", en: "Celestial Voice" }, icon: "📯", cost: 2,
          desc: { es: "Cuando hablas, hasta el caos se detiene a escuchar.", en: "When you speak, even chaos stops to listen." } },
        { name: { es: "Ascensión", en: "Ascension" }, icon: "🌟", cost: 3,
          desc: { es: "Tu disciplina serena se ha convertido en algo casi divino.", en: "Your serene discipline has become something almost divine." } }
    ],

    demon: [
        { name: { es: "Fuego Interior", en: "Inner Fire" }, icon: "🔥", cost: 1,
          desc: { es: "Una ambición que no se conforma con lo suficiente.", en: "An ambition that never settles for enough." } },
        { name: { es: "Ambición sin Límites", en: "Boundless Ambition" }, icon: "😈", cost: 1,
          desc: { es: "Cada techo que alcanzas es solo el siguiente suelo.", en: "Every ceiling you reach is just the next floor." } },
        { name: { es: "Instinto Feroz", en: "Fierce Instinct" }, icon: "👹", cost: 1,
          desc: { es: "Sabes exactamente cuándo atacar el problema.", en: "You know exactly when to strike at the problem." } },
        { name: { es: "Voluntad Infernal", en: "Infernal Will" }, icon: "⛓️", cost: 2,
          desc: { es: "Nada te doblega mientras quede algo por conseguir.", en: "Nothing bends you while there's still something to win." } },
        { name: { es: "Dominio Absoluto", en: "Absolute Dominance" }, icon: "👑", cost: 2,
          desc: { es: "Impones tu ritmo en vez de seguir el de los demás.", en: "You set the pace instead of following someone else's." } },
        { name: { es: "Pacto de Poder", en: "Pact of Power" }, icon: "🩸", cost: 2,
          desc: { es: "Cada sacrificio de hoy compra tu versión más fuerte de mañana.", en: "Every sacrifice today buys your stronger self tomorrow." } },
        { name: { es: "Astucia Retorcida", en: "Twisted Cunning" }, icon: "🐍", cost: 1,
          desc: { es: "Encuentras el atajo que nadie más se atreve a tomar.", en: "You find the shortcut no one else dares to take." } },
        { name: { es: "Furia Contenida", en: "Contained Fury" }, icon: "💢", cost: 1,
          desc: { es: "Guardas el fuego hasta el momento exacto de soltarlo.", en: "You hold the fire until the exact moment to release it." } },
        { name: { es: "Tirano de Uno Mismo", en: "Tyrant of the Self" }, icon: "🗡️", cost: 2,
          desc: { es: "Eres más duro contigo que cualquier rival podría serlo.", en: "You're harder on yourself than any rival could ever be." } },
        { name: { es: "Ascenso al Trono", en: "Rise to the Throne" }, icon: "🔱", cost: 3,
          desc: { es: "Ya no persigues el poder: lo ejerces con naturalidad.", en: "You no longer chase power: you wield it naturally." } }
    ],

    drakari: [
        { name: { es: "Sangre de Dragón", en: "Dragon Blood" }, icon: "🐉", cost: 1,
          desc: { es: "Llevas en las venas la fuerza de una estirpe antigua.", en: "You carry the strength of an ancient bloodline in your veins." } },
        { name: { es: "Escamas de Acero", en: "Scales of Steel" }, icon: "🛡️", cost: 1,
          desc: { es: "Los golpes que a otros derriban, a ti apenas te rozan.", en: "Blows that would floor others barely graze you." } },
        { name: { es: "Furia Ancestral", en: "Ancestral Fury" }, icon: "🔥", cost: 1,
          desc: { es: "Cuando te exiges de verdad, nada se te resiste.", en: "When you truly push yourself, nothing resists you." } },
        { name: { es: "Orgullo de Estirpe", en: "Pride of Bloodline" }, icon: "👑", cost: 2,
          desc: { es: "No aceptas una versión mediocre de ti mismo.", en: "You won't accept a mediocre version of yourself." } },
        { name: { es: "Aliento de Dragón", en: "Dragon's Breath" }, icon: "💨", cost: 2,
          desc: { es: "Cuando avanzas, arrasas con la excusa que te frenaba.", en: "When you push forward, you burn through the excuse that held you back." } },
        { name: { es: "Corazón de Wyrm", en: "Heart of the Wyrm" }, icon: "💎", cost: 2,
          desc: { es: "Un orgullo tan antiguo que ya es imposible de romper.", en: "A pride so ancient it can no longer be broken." } },
        { name: { es: "Garras Afiladas", en: "Sharpened Claws" }, icon: "🐾", cost: 1,
          desc: { es: "Cada intento deja una marca más profunda que el anterior.", en: "Every attempt leaves a deeper mark than the last." } },
        { name: { es: "Vuelo Ancestral", en: "Ancestral Flight" }, icon: "🪽", cost: 1,
          desc: { es: "Te elevas por encima del problema en vez de cargar con él.", en: "You rise above the problem instead of carrying it." } },
        { name: { es: "Rugido de Guerra", en: "War Roar" }, icon: "📢", cost: 2,
          desc: { es: "Tu determinación se nota antes de que digas una palabra.", en: "Your determination shows before you say a word." } },
        { name: { es: "Soberano Dracónico", en: "Draconic Sovereign" }, icon: "🐲", cost: 3,
          desc: { es: "Ya no sigues la estirpe: la estirpe te sigue a ti.", en: "You no longer follow the bloodline: the bloodline follows you." } }
    ],

    vampire: [
        { name: { es: "Sangre Eterna", en: "Eternal Blood" }, icon: "🩸", cost: 1,
          desc: { es: "El tiempo juega a tu favor, no en tu contra.", en: "Time works for you, not against you." } },
        { name: { es: "Elegancia Nocturna", en: "Nocturnal Elegance" }, icon: "🌙", cost: 1,
          desc: { es: "Haces que lo difícil se vea sencillo.", en: "You make the difficult look effortless." } },
        { name: { es: "Constancia Inmortal", en: "Immortal Constancy" }, icon: "⏳", cost: 1,
          desc: { es: "Un día más, siempre un día más, sin excepción.", en: "One more day, always one more day, no exceptions." } },
        { name: { es: "Encanto Hipnótico", en: "Hypnotic Charm" }, icon: "🥀", cost: 2,
          desc: { es: "Cuando hablas, los demás se detienen a escuchar.", en: "When you speak, others stop to listen." } },
        { name: { es: "Señor de la Noche", en: "Lord of the Night" }, icon: "🦇", cost: 2,
          desc: { es: "Prosperas justo en las horas en que otros se rinden.", en: "You thrive in exactly the hours others give up." } },
        { name: { es: "Inmortalidad", en: "Immortality" }, icon: "🌑", cost: 2,
          desc: { es: "Tu constancia ya no depende de la motivación de un solo día.", en: "Your consistency no longer depends on a single day's motivation." } },
        { name: { es: "Sed Controlada", en: "Controlled Thirst" }, icon: "🍷", cost: 1,
          desc: { es: "Dominas el impulso en vez de dejar que él te domine a ti.", en: "You master the urge instead of letting it master you." } },
        { name: { es: "Velo de Sombras", en: "Veil of Shadows" }, icon: "🌑", cost: 1,
          desc: { es: "Pasas por lo difícil sin que se note el esfuerzo.", en: "You get through the hard part without it showing." } },
        { name: { es: "Memoria de Siglos", en: "Memory of Centuries" }, icon: "📜", cost: 2,
          desc: { es: "Has visto pasar suficientes fracasos como para no temerles ya.", en: "You've seen enough failures pass by to no longer fear them." } },
        { name: { es: "Soberano Eterno", en: "Eternal Sovereign" }, icon: "🏰", cost: 3,
          desc: { es: "El tiempo dejó de ser un enemigo: ahora es tu aliado más fiel.", en: "Time stopped being an enemy: now it's your most loyal ally." } }
    ]

};

/* =========================================================
   ASCENSIÓN
   Una vez tu raza ha evolucionado (p.ej. Ángel -> Arcángel), puede
   aparecer de forma aleatoria una misión especial de un solo uso.
   Completarla sustituye tu raza y tu árbol de Origen para siempre
   por una de sus 3 formas superiores (una luminosa, una neutra/de
   poder y una oscura).
========================================================= */

const ASCENSION_PATHS = {

    "angel": [
        {
            id: "seraph",
            es: "Serafín",
            en: "Seraph",
            icon: "✨",
            missionTitle: { es: "Ascensión: Luz Eterna", en: "Ascension: Eternal Light" },
            flavor: { es: "Arde con la luz más pura hasta convertirte en llama viva.", en: "Burn with the purest light until you become a living flame." },
            tree: [
                { name: { es: "Llama Sagrada", en: "Sacred Flame" }, icon: "🔥", cost: 1 },
                { name: { es: "Visión Divina", en: "Divine Sight" }, icon: "👁️", cost: 1 },
                { name: { es: "Pureza Absoluta", en: "Absolute Purity" }, icon: "🤍", cost: 1 },
                { name: { es: "Coro Celestial", en: "Celestial Choir" }, icon: "🎶", cost: 2 },
                { name: { es: "Fuego Purificador", en: "Purifying Fire" }, icon: "🔆", cost: 1 },
                { name: { es: "Presencia Radiante", en: "Radiant Presence" }, icon: "🌞", cost: 1 },
                { name: { es: "Juicio Divino", en: "Divine Judgment" }, icon: "⚖️", cost: 2 },
                { name: { es: "Alas de Seis Plumas", en: "Six-Winged Wings" }, icon: "🕊️", cost: 2 },
                { name: { es: "Voz del Cielo", en: "Voice of Heaven" }, icon: "📯", cost: 2 },
                { name: { es: "Serafín Eterno", en: "Eternal Seraph" }, icon: "✨", cost: 3 }
            ]
        },
        {
            id: "cherub",
            es: "Querubín",
            en: "Cherub",
            icon: "💫",
            missionTitle: { es: "Ascensión: Inocencia Divina", en: "Ascension: Divine Innocence" },
            flavor: { es: "Protege sin pedir nada a cambio, con la pureza de lo que nunca se corrompe.", en: "Protect without asking anything back, with the purity of what never corrupts." },
            tree: [
                { name: { es: "Mirada Inocente", en: "Innocent Gaze" }, icon: "👶", cost: 1 },
                { name: { es: "Custodia Silenciosa", en: "Silent Guardianship" }, icon: "🛡️", cost: 1 },
                { name: { es: "Risa Celestial", en: "Celestial Laughter" }, icon: "😊", cost: 1 },
                { name: { es: "Círculo de Protección", en: "Circle of Protection" }, icon: "⭕", cost: 2 },
                { name: { es: "Memoria Pura", en: "Pure Memory" }, icon: "💭", cost: 1 },
                { name: { es: "Vuelo Gracioso", en: "Graceful Flight" }, icon: "🪽", cost: 1 },
                { name: { es: "Amor Incondicional", en: "Unconditional Love" }, icon: "💗", cost: 2 },
                { name: { es: "Canción de Cuna Eterna", en: "Eternal Lullaby" }, icon: "🎵", cost: 2 },
                { name: { es: "Guardián de las Almas", en: "Guardian of Souls" }, icon: "🕯️", cost: 2 },
                { name: { es: "Querubín Eterno", en: "Eternal Cherub" }, icon: "💫", cost: 3 }
            ]
        },
        {
            id: "fallen",
            es: "Ángel Caído",
            en: "Fallen Angel",
            icon: "🖤",
            missionTitle: { es: "Ascensión: La Caída", en: "Ascension: The Fall" },
            flavor: { es: "Pierde el cielo y gana algo que ningún ángel se atreve a nombrar.", en: "Lose heaven and gain something no angel dares to name." },
            tree: [
                { name: { es: "Primer Pecado", en: "First Sin" }, icon: "🖤", cost: 1 },
                { name: { es: "Alas Quebradas", en: "Broken Wings" }, icon: "🦴", cost: 1 },
                { name: { es: "Ira Contenida", en: "Contained Wrath" }, icon: "😤", cost: 1 },
                { name: { es: "Pacto Roto", en: "Broken Pact" }, icon: "⛓️", cost: 2 },
                { name: { es: "Sombra del Cielo", en: "Shadow of Heaven" }, icon: "🌑", cost: 1 },
                { name: { es: "Desprecio Divino", en: "Divine Contempt" }, icon: "👁️", cost: 1 },
                { name: { es: "Fuego Negro", en: "Black Fire" }, icon: "🔥", cost: 2 },
                { name: { es: "Corona Caída", en: "Fallen Crown" }, icon: "👑", cost: 2 },
                { name: { es: "Voluntad Rebelde", en: "Rebel Will" }, icon: "⚔️", cost: 2 },
                { name: { es: "Ángel Caído Eterno", en: "Eternal Fallen Angel" }, icon: "🖤", cost: 3 }
            ]
        },
    ],

    "human": [
        {
            id: "chosen",
            es: "Elegido",
            en: "The Chosen One",
            icon: "🌟",
            missionTitle: { es: "Ascensión: El Elegido", en: "Ascension: The Chosen" },
            flavor: { es: "El destino te señala entre todos los demás.", en: "Fate singles you out among everyone else." },
            tree: [
                { name: { es: "Despertar del Destino", en: "Awakening of Destiny" }, icon: "🌟", cost: 1 },
                { name: { es: "Voluntad Inquebrantable", en: "Unbreakable Will" }, icon: "🔥", cost: 1 },
                { name: { es: "Favor del Destino", en: "Favor of Fate" }, icon: "🍀", cost: 1 },
                { name: { es: "Camino Trazado", en: "Charted Path" }, icon: "🗺️", cost: 2 },
                { name: { es: "Coraje Legendario", en: "Legendary Courage" }, icon: "🦁", cost: 1 },
                { name: { es: "Marca del Elegido", en: "Mark of the Chosen" }, icon: "✴️", cost: 1 },
                { name: { es: "Liderazgo Innato", en: "Innate Leadership" }, icon: "🏅", cost: 2 },
                { name: { es: "Voz que Inspira", en: "Voice that Inspires" }, icon: "📣", cost: 2 },
                { name: { es: "Sacrificio Heroico", en: "Heroic Sacrifice" }, icon: "💪", cost: 2 },
                { name: { es: "El Elegido Eterno", en: "The Eternal Chosen One" }, icon: "🌟", cost: 3 }
            ]
        },
        {
            id: "demigod",
            es: "Semidiós",
            en: "Demigod",
            icon: "⚡",
            missionTitle: { es: "Ascensión: Sangre Divina", en: "Ascension: Divine Blood" },
            flavor: { es: "Algo más que humano corre ahora por tus venas.", en: "Something more than human now runs through your veins." },
            tree: [
                { name: { es: "Chispa Divina", en: "Divine Spark" }, icon: "⚡", cost: 1 },
                { name: { es: "Fuerza Sobrehumana", en: "Superhuman Strength" }, icon: "💪", cost: 1 },
                { name: { es: "Resistencia Mítica", en: "Mythic Endurance" }, icon: "🛡️", cost: 1 },
                { name: { es: "Sangre de los Dioses", en: "Blood of the Gods" }, icon: "🩸", cost: 2 },
                { name: { es: "Dominio Elemental", en: "Elemental Dominion" }, icon: "🌪️", cost: 1 },
                { name: { es: "Cuerpo Perfeccionado", en: "Perfected Body" }, icon: "🏛️", cost: 1 },
                { name: { es: "Voluntad Inmortal", en: "Immortal Will" }, icon: "♾️", cost: 2 },
                { name: { es: "Poder Desatado", en: "Unleashed Power" }, icon: "⚡", cost: 2 },
                { name: { es: "Legado Mítico", en: "Mythic Legacy" }, icon: "📜", cost: 2 },
                { name: { es: "Semidiós Eterno", en: "Eternal Demigod" }, icon: "⚡", cost: 3 }
            ]
        },
        {
            id: "corrupted",
            es: "Corrompido",
            en: "Corrupted",
            icon: "🌑",
            missionTitle: { es: "Ascensión: La Grieta", en: "Ascension: The Crack" },
            flavor: { es: "Una grieta diminuta basta para que entre toda la oscuridad.", en: "One tiny crack is enough for all the darkness to get in." },
            tree: [
                { name: { es: "Primera Grieta", en: "First Crack" }, icon: "🌑", cost: 1 },
                { name: { es: "Hambre de Poder", en: "Hunger for Power" }, icon: "🖤", cost: 1 },
                { name: { es: "Desconfianza Total", en: "Total Distrust" }, icon: "👁️", cost: 1 },
                { name: { es: "Máscara Rota", en: "Broken Mask" }, icon: "🎭", cost: 2 },
                { name: { es: "Ambición sin Fondo", en: "Bottomless Ambition" }, icon: "🕳️", cost: 1 },
                { name: { es: "Crueldad Fría", en: "Cold Cruelty" }, icon: "❄️", cost: 1 },
                { name: { es: "Pacto con la Sombra", en: "Pact with the Shadow" }, icon: "🤝", cost: 2 },
                { name: { es: "Corazón de Piedra", en: "Heart of Stone" }, icon: "🪨", cost: 2 },
                { name: { es: "Voluntad Corrupta", en: "Corrupted Will" }, icon: "⛓️", cost: 2 },
                { name: { es: "El Corrompido Eterno", en: "The Eternal Corrupted One" }, icon: "🌑", cost: 3 }
            ]
        },
    ],

    "elf": [
        {
            id: "star",
            es: "Elfo de las Estrellas",
            en: "Star Elf",
            icon: "🌠",
            missionTitle: { es: "Ascensión: Sendero Estelar", en: "Ascension: Starpath" },
            flavor: { es: "Dejas de pertenecer al bosque para pertenecer al cielo.", en: "You stop belonging to the forest and start belonging to the sky." },
            tree: [
                { name: { es: "Susurro de las Estrellas", en: "Whisper of the Stars" }, icon: "🌠", cost: 1 },
                { name: { es: "Pasos entre Mundos", en: "Steps Between Worlds" }, icon: "🌀", cost: 1 },
                { name: { es: "Ojos de Constelación", en: "Constellation Eyes" }, icon: "✨", cost: 1 },
                { name: { es: "Luz Ancestral", en: "Ancestral Light" }, icon: "💠", cost: 2 },
                { name: { es: "Danza Astral", en: "Astral Dance" }, icon: "🌌", cost: 1 },
                { name: { es: "Memoria de los Astros", en: "Memory of the Stars" }, icon: "🔭", cost: 1 },
                { name: { es: "Velo Celeste", en: "Celestial Veil" }, icon: "🪄", cost: 2 },
                { name: { es: "Camino de Luz", en: "Path of Light" }, icon: "🛤️", cost: 2 },
                { name: { es: "Corona de Constelaciones", en: "Crown of Constellations" }, icon: "👑", cost: 2 },
                { name: { es: "Elfo Estelar Eterno", en: "Eternal Star Elf" }, icon: "🌠", cost: 3 }
            ]
        },
        {
            id: "guardian",
            es: "Guardián Ancestral",
            en: "Ancestral Guardian",
            icon: "🌲",
            missionTitle: { es: "Ascensión: Raíces Eternas", en: "Ascension: Eternal Roots" },
            flavor: { es: "Tus raíces ya son tan profundas como las del bosque mismo.", en: "Your roots now run as deep as the forest's own." },
            tree: [
                { name: { es: "Raíz Profunda", en: "Deep Root" }, icon: "🌱", cost: 1 },
                { name: { es: "Voz del Bosque", en: "Voice of the Forest" }, icon: "🌳", cost: 1 },
                { name: { es: "Piel de Corteza", en: "Bark Skin" }, icon: "🪵", cost: 1 },
                { name: { es: "Pacto con la Tierra", en: "Pact with the Earth" }, icon: "🌍", cost: 2 },
                { name: { es: "Guardián Silente", en: "Silent Guardian" }, icon: "🛡️", cost: 1 },
                { name: { es: "Floración Eterna", en: "Eternal Bloom" }, icon: "🌸", cost: 1 },
                { name: { es: "Sabiduría de Siglos", en: "Wisdom of Centuries" }, icon: "📖", cost: 2 },
                { name: { es: "Manto de Hojas", en: "Mantle of Leaves" }, icon: "🍂", cost: 2 },
                { name: { es: "Corazón del Bosque", en: "Heart of the Forest" }, icon: "💚", cost: 2 },
                { name: { es: "Guardián Ancestral Eterno", en: "Eternal Ancestral Guardian" }, icon: "🌲", cost: 3 }
            ]
        },
        {
            id: "dark",
            es: "Elfo Oscuro",
            en: "Dark Elf",
            icon: "🕷️",
            missionTitle: { es: "Ascensión: Sombra del Bosque", en: "Ascension: Shadow of the Forest" },
            flavor: { es: "El mismo bosque que te crio ahora te teme.", en: "The same forest that raised you now fears you." },
            tree: [
                { name: { es: "Primer Susurro Oscuro", en: "First Dark Whisper" }, icon: "🕷️", cost: 1 },
                { name: { es: "Veneno Sutil", en: "Subtle Poison" }, icon: "🧪", cost: 1 },
                { name: { es: "Paso entre Sombras", en: "Step Between Shadows" }, icon: "🌑", cost: 1 },
                { name: { es: "Desprecio por la Luz", en: "Contempt for Light" }, icon: "🌚", cost: 2 },
                { name: { es: "Telaraña de Mentiras", en: "Web of Lies" }, icon: "🕸️", cost: 1 },
                { name: { es: "Frialdad Calculada", en: "Calculated Coldness" }, icon: "❄️", cost: 1 },
                { name: { es: "Pacto con la Noche", en: "Pact with the Night" }, icon: "🌃", cost: 2 },
                { name: { es: "Corte de Espinas", en: "Court of Thorns" }, icon: "🥀", cost: 2 },
                { name: { es: "Voluntad Cruel", en: "Cruel Will" }, icon: "⚔️", cost: 2 },
                { name: { es: "Elfo Oscuro Eterno", en: "Eternal Dark Elf" }, icon: "🕷️", cost: 3 }
            ]
        },
    ],

    "demon": [
        {
            id: "abyss",
            es: "Señor del Abismo",
            en: "Abyss Lord",
            icon: "🌋",
            missionTitle: { es: "Ascensión: El Abismo", en: "Ascension: The Abyss" },
            flavor: { es: "Dejas de temer al vacío: ahora el vacío te obedece.", en: "You stop fearing the void: now the void obeys you." },
            tree: [
                { name: { es: "Grieta del Abismo", en: "Crack of the Abyss" }, icon: "🌋", cost: 1 },
                { name: { es: "Hambre Infinita", en: "Infinite Hunger" }, icon: "🖤", cost: 1 },
                { name: { es: "Legión Propia", en: "Own Legion" }, icon: "👥", cost: 1 },
                { name: { es: "Trono de Cenizas", en: "Throne of Ashes" }, icon: "🪑", cost: 2 },
                { name: { es: "Fuego del Abismo", en: "Fire of the Abyss" }, icon: "🔥", cost: 1 },
                { name: { es: "Dominio Absoluto", en: "Absolute Dominion" }, icon: "👑", cost: 1 },
                { name: { es: "Pacto de Sangre", en: "Blood Pact" }, icon: "🩸", cost: 2 },
                { name: { es: "Ejército de Sombras", en: "Army of Shadows" }, icon: "🌑", cost: 2 },
                { name: { es: "Corona de Cenizas", en: "Crown of Ashes" }, icon: "👑", cost: 2 },
                { name: { es: "Señor del Abismo Eterno", en: "Eternal Abyss Lord" }, icon: "🌋", cost: 3 }
            ]
        },
        {
            id: "devourer",
            es: "Devorador de Almas",
            en: "Soul Eater",
            icon: "👹",
            missionTitle: { es: "Ascensión: Hambre Eterna", en: "Ascension: Eternal Hunger" },
            flavor: { es: "Ningún festín vuelve a ser suficiente.", en: "No feast is ever enough again." },
            tree: [
                { name: { es: "Primer Bocado", en: "First Bite" }, icon: "👹", cost: 1 },
                { name: { es: "Sed de Almas", en: "Thirst for Souls" }, icon: "👻", cost: 1 },
                { name: { es: "Garras Afiladas", en: "Sharp Claws" }, icon: "🗡️", cost: 1 },
                { name: { es: "Festín Oscuro", en: "Dark Feast" }, icon: "🍽️", cost: 2 },
                { name: { es: "Voz de los Devorados", en: "Voice of the Devoured" }, icon: "🗣️", cost: 1 },
                { name: { es: "Hambre sin Fondo", en: "Bottomless Hunger" }, icon: "🕳️", cost: 1 },
                { name: { es: "Cuerpo de Mil Almas", en: "Body of a Thousand Souls" }, icon: "💀", cost: 2 },
                { name: { es: "Terror Puro", en: "Pure Terror" }, icon: "😱", cost: 2 },
                { name: { es: "Devoción Oscura", en: "Dark Devotion" }, icon: "🖤", cost: 2 },
                { name: { es: "Devorador Eterno", en: "Eternal Devourer" }, icon: "👹", cost: 3 }
            ]
        },
        {
            id: "redeemed",
            es: "Demonio Redimido",
            en: "Redeemed Demon",
            icon: "🕊️",
            missionTitle: { es: "Ascensión: La Redención", en: "Ascension: Redemption" },
            flavor: { es: "Hasta el fuego más oscuro puede aprender a arder distinto.", en: "Even the darkest fire can learn to burn differently." },
            tree: [
                { name: { es: "Primera Duda", en: "First Doubt" }, icon: "🕊️", cost: 1 },
                { name: { es: "Lágrima de Fuego", en: "Tear of Fire" }, icon: "💧", cost: 1 },
                { name: { es: "Recuerdo de la Luz", en: "Memory of the Light" }, icon: "✨", cost: 1 },
                { name: { es: "Perdón a Medias", en: "Half Forgiveness" }, icon: "🤍", cost: 2 },
                { name: { es: "Cadenas Rotas", en: "Broken Chains" }, icon: "⛓️", cost: 1 },
                { name: { es: "Corazón Dividido", en: "Divided Heart" }, icon: "💔", cost: 1 },
                { name: { es: "Camino de Vuelta", en: "Path Back" }, icon: "🛤️", cost: 2 },
                { name: { es: "Voluntad Redimida", en: "Redeemed Will" }, icon: "🕊️", cost: 2 },
                { name: { es: "Paz Encontrada", en: "Peace Found" }, icon: "🙏", cost: 2 },
                { name: { es: "Demonio Redimido Eterno", en: "Eternal Redeemed Demon" }, icon: "🕊️", cost: 3 }
            ]
        },
    ],

    "drakari": [
        {
            id: "celestial",
            es: "Dragón Celestial",
            en: "Celestial Dragon",
            icon: "⭐",
            missionTitle: { es: "Ascensión: Escamas de Estrella", en: "Ascension: Starscale" },
            flavor: { es: "Tus escamas ya no reflejan la luz: la contienen.", en: "Your scales no longer reflect the light: they hold it." },
            tree: [
                { name: { es: "Escama de Estrella", en: "Starscale" }, icon: "⭐", cost: 1 },
                { name: { es: "Aliento de Luz", en: "Breath of Light" }, icon: "🌟", cost: 1 },
                { name: { es: "Vuelo entre Nubes", en: "Flight Among Clouds" }, icon: "☁️", cost: 1 },
                { name: { es: "Rugido Celestial", en: "Celestial Roar" }, icon: "📢", cost: 2 },
                { name: { es: "Corona de Constelaciones", en: "Crown of Constellations" }, icon: "👑", cost: 1 },
                { name: { es: "Sabiduría Milenaria", en: "Millennial Wisdom" }, icon: "📜", cost: 1 },
                { name: { es: "Garras de Luz", en: "Claws of Light" }, icon: "✨", cost: 2 },
                { name: { es: "Presencia Luminosa", en: "Luminous Presence" }, icon: "💫", cost: 2 },
                { name: { es: "Guardián del Cielo", en: "Guardian of the Sky" }, icon: "🛡️", cost: 2 },
                { name: { es: "Dragón Celestial Eterno", en: "Eternal Celestial Dragon" }, icon: "⭐", cost: 3 }
            ]
        },
        {
            id: "storm",
            es: "Señor de las Tormentas",
            en: "Storm Lord",
            icon: "⛈️",
            missionTitle: { es: "Ascensión: Tormenta Eterna", en: "Ascension: Eternal Storm" },
            flavor: { es: "El cielo deja de avisar antes de la tormenta: ahora la tormenta eres tú.", en: "The sky stops warning before the storm: now you are the storm." },
            tree: [
                { name: { es: "Primer Trueno", en: "First Thunder" }, icon: "⛈️", cost: 1 },
                { name: { es: "Alas de Viento", en: "Wind Wings" }, icon: "🌬️", cost: 1 },
                { name: { es: "Garras Eléctricas", en: "Electric Claws" }, icon: "⚡", cost: 1 },
                { name: { es: "Rugido de Tormenta", en: "Storm Roar" }, icon: "🌪️", cost: 2 },
                { name: { es: "Piel de Tormenta", en: "Storm Skin" }, icon: "🌩️", cost: 1 },
                { name: { es: "Vuelo en la Tempestad", en: "Flight in the Tempest" }, icon: "🌀", cost: 1 },
                { name: { es: "Corazón de Rayo", en: "Heart of Lightning" }, icon: "⚡", cost: 2 },
                { name: { es: "Dominio del Cielo", en: "Dominion of the Sky" }, icon: "☁️", cost: 2 },
                { name: { es: "Furia Desatada", en: "Unleashed Fury" }, icon: "💥", cost: 2 },
                { name: { es: "Señor de las Tormentas Eterno", en: "Eternal Storm Lord" }, icon: "⛈️", cost: 3 }
            ]
        },
        {
            id: "corrupted_dragon",
            es: "Dragón Corrupto",
            en: "Corrupted Dragon",
            icon: "☠️",
            missionTitle: { es: "Ascensión: Escamas Podridas", en: "Ascension: Rotten Scales" },
            flavor: { es: "El orgullo de tu estirpe se ha vuelto hambre de ruina.", en: "The pride of your bloodline has turned into a hunger for ruin." },
            tree: [
                { name: { es: "Primera Grieta en las Escamas", en: "First Crack in the Scales" }, icon: "☠️", cost: 1 },
                { name: { es: "Aliento Venenoso", en: "Venomous Breath" }, icon: "☣️", cost: 1 },
                { name: { es: "Hambre de Ruina", en: "Hunger for Ruin" }, icon: "🕳️", cost: 1 },
                { name: { es: "Garras Oxidadas", en: "Rusted Claws" }, icon: "🗡️", cost: 2 },
                { name: { es: "Rugido de Ruina", en: "Roar of Ruin" }, icon: "💀", cost: 1 },
                { name: { es: "Escamas Negras", en: "Black Scales" }, icon: "🖤", cost: 1 },
                { name: { es: "Corazón Podrido", en: "Rotten Heart" }, icon: "🫀", cost: 2 },
                { name: { es: "Dominio de la Destrucción", en: "Dominion of Destruction" }, icon: "💥", cost: 2 },
                { name: { es: "Sombra Draconiana", en: "Draconian Shadow" }, icon: "🌑", cost: 2 },
                { name: { es: "Dragón Corrupto Eterno", en: "Eternal Corrupted Dragon" }, icon: "☠️", cost: 3 }
            ]
        },
    ],

    "vampire": [
        {
            id: "blood_lord",
            es: "Señor de Sangre",
            en: "Blood Lord",
            icon: "🩸",
            missionTitle: { es: "Ascensión: Sangre Primigenia", en: "Ascension: Primordial Blood" },
            flavor: { es: "Tu sangre deja de ser tuya para ser ley.", en: "Your blood stops being yours and becomes law." },
            tree: [
                { name: { es: "Primera Gota", en: "First Drop" }, icon: "🩸", cost: 1 },
                { name: { es: "Sed Insaciable", en: "Insatiable Thirst" }, icon: "🧛", cost: 1 },
                { name: { es: "Dominio sobre la Sangre", en: "Dominion over Blood" }, icon: "💉", cost: 1 },
                { name: { es: "Corte Real", en: "Royal Court" }, icon: "🏰", cost: 2 },
                { name: { es: "Vasallos Eternos", en: "Eternal Vassals" }, icon: "⚜️", cost: 1 },
                { name: { es: "Poder de Sangre", en: "Blood Power" }, icon: "🩸", cost: 1 },
                { name: { es: "Voluntad de Sangre", en: "Blood Will" }, icon: "🗡️", cost: 2 },
                { name: { es: "Corona Carmesí", en: "Crimson Crown" }, icon: "👑", cost: 2 },
                { name: { es: "Reino de la Noche", en: "Kingdom of Night" }, icon: "🌃", cost: 2 },
                { name: { es: "Señor de Sangre Eterno", en: "Eternal Blood Lord" }, icon: "🩸", cost: 3 }
            ]
        },
        {
            id: "noble",
            es: "Noble Eterno",
            en: "Eternal Noble",
            icon: "👑",
            missionTitle: { es: "Ascensión: Linaje Eterno", en: "Ascension: Eternal Lineage" },
            flavor: { es: "La elegancia de siglos se convierte, por fin, en corona.", en: "Centuries of elegance finally become a crown." },
            tree: [
                { name: { es: "Primer Título", en: "First Title" }, icon: "👑", cost: 1 },
                { name: { es: "Elegancia Inmortal", en: "Immortal Elegance" }, icon: "🎩", cost: 1 },
                { name: { es: "Corte de Nobles", en: "Court of Nobles" }, icon: "🏛️", cost: 1 },
                { name: { es: "Palabra que Obliga", en: "Binding Word" }, icon: "📜", cost: 2 },
                { name: { es: "Encanto Real", en: "Royal Charm" }, icon: "💎", cost: 1 },
                { name: { es: "Linaje Puro", en: "Pure Lineage" }, icon: "⚜️", cost: 1 },
                { name: { es: "Dominio Social", en: "Social Dominion" }, icon: "🎭", cost: 2 },
                { name: { es: "Memoria de Siglos", en: "Memory of Centuries" }, icon: "📖", cost: 2 },
                { name: { es: "Trono de Marfil", en: "Ivory Throne" }, icon: "🪑", cost: 2 },
                { name: { es: "Noble Eterno Supremo", en: "Supreme Eternal Noble" }, icon: "👑", cost: 3 }
            ]
        },
        {
            id: "nosferatu",
            es: "Nosferatu",
            en: "Nosferatu",
            icon: "🧟",
            missionTitle: { es: "Ascensión: La Bestia", en: "Ascension: The Beast" },
            flavor: { es: "Lo que queda cuando la elegancia se rompe del todo.", en: "What remains when elegance breaks completely." },
            tree: [
                { name: { es: "Primera Mutación", en: "First Mutation" }, icon: "🧟", cost: 1 },
                { name: { es: "Garras Monstruosas", en: "Monstrous Claws" }, icon: "🦴", cost: 1 },
                { name: { es: "Hambre Bestial", en: "Beastly Hunger" }, icon: "🩸", cost: 1 },
                { name: { es: "Piel Putrefacta", en: "Rotting Skin" }, icon: "🫠", cost: 2 },
                { name: { es: "Fuerza Inhumana", en: "Inhuman Strength" }, icon: "💪", cost: 1 },
                { name: { es: "Terror Nocturno", en: "Nocturnal Terror" }, icon: "😱", cost: 1 },
                { name: { es: "Instinto Primitivo", en: "Primitive Instinct" }, icon: "🐺", cost: 2 },
                { name: { es: "Cuerpo Irreconocible", en: "Unrecognizable Body" }, icon: "👹", cost: 2 },
                { name: { es: "Voluntad Bestial", en: "Beastly Will" }, icon: "🩸", cost: 2 },
                { name: { es: "Nosferatu Eterno", en: "Eternal Nosferatu" }, icon: "🧟", cost: 3 }
            ]
        },
    ],

};

/* Probabilidad, cada día, de que se ofrezca una misión de ascensión
   (una vez ya has evolucionado y todavía no has ascendido) */
const ASCENSION_CHANCE = 0.3;

/* =========================================================
   ORIGEN: ÁRBOLES DE HABILIDAD POR RAZA
   Misma forma de árbol y el mismo coste por nodo que cualquier
   estadística (ver skillNodes/positions/connections), pero el
   contenido de cada nodo cambia por completo según tu raza.
========================================================= */

/* Disposición larga de 10 nodos (raíz, dos ramas, fusión, dos ramas,
   fusión, dos ramas, remate final) en % — la usan Origen y las 4
   categorías. Coordenadas en tanto por ciento, no en píxeles. */
const LONG_TREE_POSITIONS = [
    { x: 50, y: 6 },
    { x: 25, y: 20 },
    { x: 75, y: 20 },
    { x: 50, y: 34 },
    { x: 25, y: 48 },
    { x: 75, y: 48 },
    { x: 50, y: 62 },
    { x: 25, y: 76 },
    { x: 75, y: 76 },
    { x: 50, y: 92 }
];

const LONG_TREE_CONNECTIONS = [
    [0, 1], [0, 2],
    [1, 3], [2, 3],
    [3, 4], [3, 5],
    [4, 6], [5, 6],
    [6, 7], [6, 8],
    [7, 9], [8, 9]
];

function getAscensionPath(raceId, pathId) {

    const paths = ASCENSION_PATHS[raceId];

    if (!paths) {
        return null;
    }

    return paths.find(path => path.id === pathId) || null;

}

function getActiveAscension() {

    if (
        state.ascension &&
        state.ascension.race === state.race
    ) {

        return getAscensionPath(state.race, state.ascension.path);

    }

    return null;

}

/* Se llama cada vez que se comprueban las misiones del día: decide si
   hoy toca ofrecer una misión de ascensión, y cuál de las 3 */
function maybeOfferAscension() {

    if (state.ascension) {

        state.dailyAscensionOffer = null;

        return;

    }

    const paths = ASCENSION_PATHS[state.race];

    if (!state.race || !paths || !isRaceEvolved()) {

        state.dailyAscensionOffer = null;

        return;

    }

    const today = getLocalDateString();

    if (
        state.dailyAscensionOffer &&
        state.dailyAscensionOffer.date === today
    ) {

        return;

    }

    const random = seededRandom("ascension-" + today + "-" + state.race);

    const offered = random() < ASCENSION_CHANCE
        ? paths[Math.floor(random() * paths.length)].id
        : null;

    state.dailyAscensionOffer = {
        date: today,
        pathId: offered
    };

    saveState();

}

function renderAscensionBanner() {

    const box = document.getElementById("ascensionBanner");

    if (!box) {
        return;
    }

    box.innerHTML = "";

    const offer = state.dailyAscensionOffer;

    if (
        !offer ||
        !offer.pathId ||
        offer.date !== getLocalDateString() ||
        state.ascension
    ) {

        return;

    }

    const path = getAscensionPath(state.race, offer.pathId);

    if (!path) {
        return;
    }

    const lang = onbLang();

    const card = onbEl("div", "ascension-card");

    card.appendChild(onbEl("div", "ascension-kicker", t("ascensionKicker")));

    const headRow = onbEl("div", "ascension-head");

    headRow.appendChild(onbEl("div", "ascension-card-icon", path.icon));

    const textCol = onbEl("div", "ascension-text");

    textCol.appendChild(
        onbEl("div", "ascension-card-title", path.missionTitle[lang])
    );

    textCol.appendChild(
        onbEl("div", "ascension-card-flavor", path.flavor[lang])
    );

    headRow.appendChild(textCol);

    card.appendChild(headRow);

    card.appendChild(onbEl("p", "ascension-warning", t("ascensionWarning")));

    const button = onbEl("button", "primary-button ascension-button", t("complete"));

    button.type = "button";

    button.onclick = () => completeAscensionMission(offer.pathId);

    card.appendChild(button);

    box.appendChild(card);

}

function completeAscensionMission(pathId) {

    if (state.ascension) {
        return;
    }

    const path = getAscensionPath(state.race, pathId);

    if (!path) {
        return;
    }

    const fromText = getRaceDisplayName(getRaceData(state.race));

    state.ascension = {
        race: state.race,
        path: pathId
    };

    state.dailyAscensionOffer = null;

    saveState();

    refreshRaceLabels();

    renderMissions();

    if (currentView === "profile") {

        renderProfile();

    }

    showAscensionDialog(path, fromText);

}

/* Clave de guardado del árbol de Origen: distinta para cada raza (y,
   tras ascender, para cada ruta de ascensión), por si en el futuro la
   raza pudiera cambiar sin perder el resto del progreso */
function getOrigenTreeKey() {

    const ascension = getActiveAscension();

    return "Origen:" + (state.race || "sin_raza") +
        (ascension ? ":" + ascension.id : "");

}

function getOrigenNodes() {

    const ascension = getActiveAscension();

    if (ascension) {
        return ascension.tree;
    }

    return RACE_SKILL_TREES[state.race] || null;

}

/* Nombre y descripción de un nodo: bilingües en los árboles de raza,
   texto plano (solo español) en los árboles de estadística de siempre */
function skillNodeLabel(node) {

    return typeof node.name === "object"
        ? node.name[onbLang()]
        : node.name;

}

function skillNodeDesc(node) {

    if (!node.desc) {
        return "";
    }

    return typeof node.desc === "object"
        ? node.desc[onbLang()]
        : node.desc;

}

/* =========================================================
   ÁRBOLES DE CATEGORÍA (Cuerpo, Mente, Alma, Unión)
   Un único árbol por categoría, más largo que el de una sola
   estadística. Cada nodo cuesta puntos de una o varias de las
   estadísticas de esa categoría (no del pozo compartido de Origen):
   subir de nivel una estadística da puntos de ESA estadística.
========================================================= */

const CATEGORY_SKILL_TREES = {

    "Cuerpo": [
        { name: "Instinto Físico", icon: "💪", cost: { "Fuerza": 1 },
          desc: "El primer paso: notar que el cuerpo también se entrena." },
        { name: "Golpe Certero", icon: "👊", cost: { "Fuerza": 1 },
          desc: "Cada esfuerzo cuenta más cuando va bien dirigido." },
        { name: "Paso Firme", icon: "🦶", cost: { "Agilidad": 1 },
          desc: "Te mueves con un equilibrio que antes no tenías." },
        { name: "Cuerpo Templado", icon: "🔥", cost: { "Fuerza": 1, "Agilidad": 1 },
          desc: "La fuerza y la soltura empiezan a ir de la mano." },
        { name: "Resistencia de Hierro", icon: "🛡️", cost: { "Resistencia": 1 },
          desc: "Aguantas donde antes te habrías rendido." },
        { name: "Reflejos Rápidos", icon: "⚡", cost: { "Agilidad": 1 },
          desc: "Reaccionas antes de pensarlo." },
        { name: "Vigor Inquebrantable", icon: "❤️‍🔥", cost: { "Resistencia": 1, "Vitalidad": 1 },
          desc: "Tu cuerpo ya no se rinde a la primera señal de cansancio." },
        { name: "Aliento Eterno", icon: "🌬️", cost: { "Vitalidad": 1 },
          desc: "Cuidas tu cuerpo como el motor que realmente es." },
        { name: "Fuerza de Voluntad Física", icon: "🏋️", cost: { "Fuerza": 1, "Resistencia": 1 },
          desc: "Ya no necesitas motivación: solo apareces y entrenas." },
        { name: "Cuerpo Perfecto", icon: "👑", cost: { "Fuerza": 1, "Resistencia": 1, "Vitalidad": 1, "Agilidad": 1 },
          desc: "Fuerza, aguante, vitalidad y agilidad, todo trabajando junto." }
    ],

    "Mente": [
        { name: "Chispa Mental", icon: "🧠", cost: { "Inteligencia": 1 },
          desc: "Una idea que antes no se te habría ocurrido." },
        { name: "Foco Absoluto", icon: "🎯", cost: { "Concentración": 1 },
          desc: "El ruido de alrededor deja de distraerte tan fácil." },
        { name: "Idea Brillante", icon: "💡", cost: { "Creatividad": 1 },
          desc: "Encuentras ángulos que a otros se les escapan." },
        { name: "Mente Afilada", icon: "🔍", cost: { "Inteligencia": 1, "Concentración": 1 },
          desc: "Piensas rápido y sin perder detalle." },
        { name: "Visión Creativa", icon: "🎨", cost: { "Creatividad": 1, "Concentración": 1 },
          desc: "Sostienes una idea el tiempo suficiente para hacerla real." },
        { name: "Razonamiento Profundo", icon: "📚", cost: { "Inteligencia": 1 },
          desc: "Ya no te conformas con la primera respuesta." },
        { name: "Flujo Creativo", icon: "🌊", cost: { "Creatividad": 1 },
          desc: "Las ideas llegan sin tener que forzarlas." },
        { name: "Claridad Total", icon: "🌟", cost: { "Concentración": 1 },
          desc: "Ves con nitidez lo que antes se veía borroso." },
        { name: "Genio en Ascenso", icon: "🧩", cost: { "Inteligencia": 1, "Creatividad": 1 },
          desc: "Combinas lógica e imaginación como pocos." },
        { name: "Mente Maestra", icon: "👁️", cost: { "Inteligencia": 1, "Creatividad": 1, "Concentración": 1 },
          desc: "Inteligencia, creatividad y foco, actuando como una sola cosa." }
    ],

    "Alma": [
        { name: "Primer Paso", icon: "🕯️", cost: { "Disciplina": 1 },
          desc: "Empezar sin esperar a tener ganas." },
        { name: "Voluntad Firme", icon: "🔥", cost: { "Voluntad": 1 },
          desc: "Sostienes el esfuerzo más allá del primer impulso." },
        { name: "Corazón Valiente", icon: "🦁", cost: { "Valentía": 1 },
          desc: "Actúas aunque el miedo siga ahí." },
        { name: "Espíritu Templado", icon: "⚔️", cost: { "Disciplina": 1, "Voluntad": 1 },
          desc: "La rutina y las ganas dejan de pelearse entre sí." },
        { name: "Paso Constante", icon: "🪨", cost: { "Constancia": 1 },
          desc: "Un día más, incluso cuando no apetece." },
        { name: "Coraje Sereno", icon: "🛡️", cost: { "Valentía": 1, "Disciplina": 1 },
          desc: "Afrontas lo difícil con la cabeza fría." },
        { name: "Alma Inquebrantable", icon: "⛓️", cost: { "Voluntad": 1, "Constancia": 1 },
          desc: "Nada de lo que te propones se queda a medias." },
        { name: "Fuego Interior", icon: "🔥", cost: { "Voluntad": 1 },
          desc: "Una motivación que ya no depende del día que tengas." },
        { name: "Determinación Total", icon: "🎯", cost: { "Disciplina": 1, "Constancia": 1 },
          desc: "Cumples lo que decides, una y otra vez." },
        { name: "Alma Trascendente", icon: "✨", cost: { "Disciplina": 1, "Voluntad": 1, "Valentía": 1, "Constancia": 1 },
          desc: "Disciplina, voluntad, valentía y constancia, ya inseparables." }
    ],

    "Unión": [
        { name: "Primera Impresión", icon: "✨", cost: { "Carisma": 1 },
          desc: "La gente empieza a notar cuando entras en una sala." },
        { name: "Escucha Activa", icon: "👂", cost: { "Empatía": 1 },
          desc: "Escuchas de verdad, no solo esperas tu turno para hablar." },
        { name: "Palabra Precisa", icon: "💬", cost: { "Comunicación": 1 },
          desc: "Dices justo lo que querías decir, sin rodeos." },
        { name: "Conexión Genuina", icon: "🤝", cost: { "Carisma": 1, "Empatía": 1 },
          desc: "La gente se siente cómoda contigo con facilidad." },
        { name: "Discurso Claro", icon: "🎤", cost: { "Comunicación": 1, "Carisma": 1 },
          desc: "Cuando hablas en grupo, te siguen sin esfuerzo." },
        { name: "Corazón Abierto", icon: "💗", cost: { "Empatía": 1 },
          desc: "Entiendes lo que el otro siente antes de que lo diga." },
        { name: "Puente Emocional", icon: "🌉", cost: { "Empatía": 1, "Comunicación": 1 },
          desc: "Sabes poner en palabras lo que otros no saben explicar." },
        { name: "Presencia Magnética", icon: "🌟", cost: { "Carisma": 1 },
          desc: "Atraes sin necesidad de esforzarte en ello." },
        { name: "Diplomacia", icon: "🕊️", cost: { "Carisma": 1, "Comunicación": 1 },
          desc: "Encuentras el acuerdo donde otros solo ven un choque." },
        { name: "Vínculo Verdadero", icon: "💞", cost: { "Carisma": 1, "Empatía": 1, "Comunicación": 1 },
          desc: "Carisma, empatía y comunicación, formando lazos que duran." }
    ]

};

/* Un nodo de categoría está disponible si su(s) nodo(s) padre en el
   árbol ya están desbloqueados (misma forma de árbol para las 4) */
function isCategorySkillAvailable(category, index) {

    if (index === 0) {
        return true;
    }

    const parents =
        LONG_TREE_CONNECTIONS
            .filter(connection => connection[1] === index)
            .map(connection => connection[0]);

    return parents.some(
        parent => state.unlocked[category]?.includes(parent)
    );

}

/* A diferencia de Origen, el coste no es un número del pozo
   compartido: es un objeto {Estadística: cantidad}, y se paga de
   los puntos propios de cada estadística implicada */
function canAffordCategorySkill(node) {

    return Object.entries(node.cost).every(
        ([stat, amount]) => (state.stats[stat]?.points || 0) >= amount
    );

}

function unlockCategorySkill(category, index) {

    if (!isCategorySkillAvailable(category, index)) {
        return false;
    }

    const node = CATEGORY_SKILL_TREES[category][index];

    if (state.unlocked[category]?.includes(index)) {
        return false;
    }

    if (!canAffordCategorySkill(node)) {
        return false;
    }

    Object.entries(node.cost).forEach(([stat, amount]) => {

        state.stats[stat].points -= amount;

    });

    if (!state.unlocked[category]) {

        state.unlocked[category] = [];

    }

    state.unlocked[category].push(index);

    saveState();

    return true;

}

/* Texto del coste de un nodo, p.ej. "Disciplina 1" o "Disciplina 1 + Voluntad 1" */
function categorySkillCostLabel(node) {

    return Object.entries(node.cost)
        .map(([stat, amount]) => stat + " " + amount)
        .join(" + ");

}

function paintCategorySkillTree(container, category) {

    container.innerHTML = "";

    if (!state.unlocked[category]) {

        state.unlocked[category] = [];

    }

    const nodes = CATEGORY_SKILL_TREES[category];

    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");

    svg.classList.add("skill-tree-svg");

    svg.setAttribute("viewBox", "0 0 100 100");

    svg.setAttribute("preserveAspectRatio", "none");

    LONG_TREE_CONNECTIONS.forEach(([from, to]) => {

        const line = document.createElementNS(svgNS, "line");

        line.setAttribute("x1", LONG_TREE_POSITIONS[from].x);

        line.setAttribute("y1", LONG_TREE_POSITIONS[from].y);

        line.setAttribute("x2", LONG_TREE_POSITIONS[to].x);

        line.setAttribute("y2", LONG_TREE_POSITIONS[to].y);

        if (state.unlocked[category].includes(from) && state.unlocked[category].includes(to)) {

            line.classList.add("active");

        }

        svg.appendChild(line);

    });

    container.appendChild(svg);

    nodes.forEach((node, index) => {

        const unlocked = state.unlocked[category].includes(index);

        const available = isCategorySkillAvailable(category, index);

        const affordable = canAffordCategorySkill(node);

        const orb = document.createElement("div");

        orb.className =
            "skill-orb " +
            (unlocked ? "unlocked" : available ? "available" : "locked");

        orb.style.left = LONG_TREE_POSITIONS[index].x + "%";

        orb.style.top = LONG_TREE_POSITIONS[index].y + "%";

        orb.textContent = node.icon;

        const costLabel = categorySkillCostLabel(node);

        orb.title = node.name + " · " + costLabel + " — " + node.desc;

        if (available && !unlocked) {

            orb.setAttribute("role", "button");

            orb.tabIndex = 0;

            orb.classList.toggle("unaffordable", !affordable);

            const attempt = () => {

                if (unlockCategorySkill(category, index)) {

                    paintCategorySkillTree(container, category);

                    refreshCategoryPointsDisplay(category);

                }

            };

            orb.onclick = attempt;

            orb.onkeydown = event => {

                if (event.key === "Enter" || event.key === " ") {

                    event.preventDefault();

                    attempt();

                }

            };

        }

        const label = onbEl("div", "skill-orb-label", node.name);

        label.appendChild(onbEl("div", "skill-orb-cost", costLabel));

        orb.appendChild(label);

        container.appendChild(orb);

    });

}

/* Actualiza el desglose de puntos por estadística del panel de una
   categoría (se llama tras un desbloqueo, sin repintar el árbol entero) */
function refreshCategoryPointsDisplay(category) {

    const el = document.getElementById("skillPoints-" + category.replace(/[^a-zA-Z0-9]/g, "_"));

    if (!el) {
        return;
    }

    el.innerHTML = "";

    categories[category].stats.forEach(stat => {

        el.appendChild(
            onbEl("span", "skill-points-chip", stat + " " + (state.stats[stat].points || 0))
        );

    });

}

/* =========================================================
   EVOLUCIÓN DE LA RAZA
   Al desbloquear la última habilidad del árbol de Origen, la raza
   pasa a su forma superior (Ángel -> Arcángel, etc.). No se guarda
   aparte: se deduce de lo desbloqueado, así que también vale para
   partidas que ya tenían ese último nodo.
========================================================= */

function isRaceEvolved() {

    const nodes = getOrigenNodes();

    if (!nodes) {
        return false;
    }

    return !!state.unlocked[getOrigenTreeKey()]?.includes(nodes.length - 1);

}

/* Nombre con el que se muestra una raza: la ascensión por delante del
   título evolucionado, y este por delante del nombre base */
function getRaceDisplayName(race, lang) {

    if (!race) {
        return "-";
    }

    lang = lang || onbLang();

    if (race.id === state.race) {

        const ascension = getActiveAscension();

        if (ascension) {
            return ascension[lang];
        }

        if (race.evolved && isRaceEvolved()) {
            return race.evolved[lang];
        }

    }

    return race[lang];

}

/* Icono con el que se muestra tu raza: el de la ascensión, si la hay */
function getRaceDisplayIcon(race) {

    if (!race) {
        return "";
    }

    const ascension = getActiveAscension();

    return ascension ? ascension.icon : race.icon;

}

function refreshRaceLabels() {

    const race = getRaceData(state.race);

    if (!race) {
        return;
    }

    const icon = getRaceDisplayIcon(race);

    const profileRace = document.getElementById("profileRace");

    if (profileRace) {

        profileRace.textContent = icon + " " + getRaceDisplayName(race);

    }

    const origenIcon = document.getElementById("origenBannerIcon");

    if (origenIcon) {
        origenIcon.textContent = icon;
    }

    document
        .querySelectorAll(".skill-banner-sub")
        .forEach(el => {

            el.textContent = getRaceDisplayName(race);

            el.classList.toggle("evolved", isRaceEvolved());

        });

    updateTopBar();

}

/* Aviso genérico de "tu título ha cambiado": lo usan tanto la
   evolución normal (Ángel -> Arcángel) como la ascensión */
function showTitleChangeDialog(icon, kickerKey, fromText, toText, extraClass) {

    const previous = document.getElementById("evolutionDialog");

    if (previous) {
        previous.remove();
    }

    const opener = document.activeElement;

    const overlay = onbEl("div", "confirm-overlay");

    overlay.id = "evolutionDialog";

    overlay.setAttribute("role", "alertdialog");

    overlay.setAttribute("aria-modal", "true");

    overlay.setAttribute("aria-labelledby", "evolutionName");

    const box = onbEl(
        "div",
        "card confirm-box evolution-box" + (extraClass ? " " + extraClass : "")
    );

    box.appendChild(onbEl("div", "evolution-icon", icon));

    box.appendChild(onbEl("div", "evolution-kicker", t(kickerKey)));

    const name = onbEl("div", "evolution-name", toText);

    name.id = "evolutionName";

    box.appendChild(name);

    box.appendChild(
        onbEl("div", "evolution-from", fromText + " → " + toText)
    );

    const ok = onbEl("button", "primary-button evolution-ok", t("onbNext"));

    ok.type = "button";

    function close() {

        overlay.remove();

        document.removeEventListener("keydown", onKey, true);

        if (opener && opener.isConnected && opener.focus) {
            opener.focus();
        }

    }

    function onKey(event) {

        if (event.key === "Escape") {

            event.stopPropagation();

            close();

        }

        /* Un único botón: el foco no se escapa del aviso */
        if (event.key === "Tab") {

            event.preventDefault();

            ok.focus();

        }

    }

    ok.onclick = close;

    overlay.onclick = event => {

        if (event.target === overlay) {
            close();
        }

    };

    document.addEventListener("keydown", onKey, true);

    box.appendChild(ok);

    overlay.appendChild(box);

    document.body.appendChild(overlay);

    ok.focus();

}

function showEvolutionDialog(race) {

    const lang = onbLang();

    showTitleChangeDialog(
        race.icon,
        "evolutionKicker",
        race[lang],
        race.evolved[lang]
    );

}

function showAscensionDialog(path, fromText) {

    const lang = onbLang();

    showTitleChangeDialog(
        path.icon,
        "ascensionDialogKicker",
        fromText,
        path[lang],
        "ascension-box"
    );

}

function onRaceEvolved() {

    refreshRaceLabels();

    /* Si ya has ascendido, completar tu árbol actual (el de la
       ascensión) no vuelve a mostrar el aviso de "evolución base":
       ese paso ya quedó atrás */
    if (getActiveAscension()) {
        return;
    }

    const race = getRaceData(state.race);

    if (!race || !race.evolved) {
        return;
    }

    /* Un instante para ver cómo se ilumina el último nodo antes del aviso */
    setTimeout(() => showEvolutionDialog(race), reducedMotion() ? 0 : 450);

    maybeOfferAscension();

}

function skillTreeContainerId(key) {

    return "tree-" + key.replace(/[^a-zA-Z0-9]/g, "_");

}

/* Dibuja un único árbol (genérico de estadística, o de raza) dentro
   del contenedor dado. showLabels añade el nombre bajo cada nodo:
   se usa en el árbol grande de Origen, no en los pequeños de cada
   estadística (ahí el nombre va en el title, para no saturar). */
function paintSkillTree(container, key, nodes, showLabels) {

    container.innerHTML = "";

    if (!state.unlocked[key]) {

        state.unlocked[key] = [];

    }

    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");

    svg.classList.add("skill-tree-svg");

    svg.setAttribute("viewBox", "0 0 100 100");

    svg.setAttribute("preserveAspectRatio", "none");

    LONG_TREE_CONNECTIONS.forEach(([from, to]) => {

        const line = document.createElementNS(svgNS, "line");

        line.setAttribute("x1", LONG_TREE_POSITIONS[from].x);

        line.setAttribute("y1", LONG_TREE_POSITIONS[from].y);

        line.setAttribute("x2", LONG_TREE_POSITIONS[to].x);

        line.setAttribute("y2", LONG_TREE_POSITIONS[to].y);

        if (state.unlocked[key].includes(from) && state.unlocked[key].includes(to)) {

            line.classList.add("active");

        }

        svg.appendChild(line);

    });

    container.appendChild(svg);

    nodes.forEach((node, index) => {

        const unlocked = state.unlocked[key].includes(index);

        const available = isSkillAvailable(index, key);

        const orb = document.createElement("div");

        orb.className =
            "skill-orb " +
            (unlocked ? "unlocked" : available ? "available" : "locked");

        orb.style.left = LONG_TREE_POSITIONS[index].x + "%";

        orb.style.top = LONG_TREE_POSITIONS[index].y + "%";

        orb.textContent = node.icon;

        const label = skillNodeLabel(node);

        const desc = skillNodeDesc(node);

        orb.title =
            label + " · " + node.cost + " PTS" +
            (desc ? " — " + desc : "");

        if (available && !unlocked) {

            orb.setAttribute("role", "button");

            orb.tabIndex = 0;

            const attempt = () => {

                if (unlockSkill(index, nodes, key)) {

                    paintSkillTree(container, key, nodes, showLabels);

                    document
                        .querySelectorAll(".skill-banner-points")
                        .forEach(el => {

                            el.textContent =
                                state.skillPoints + " " +
                                (state.language === "es" ? "PUNTOS" : "POINTS");

                        });

                    if (key === getOrigenTreeKey() && index === nodes.length - 1) {

                        onRaceEvolved();

                    }

                }

            };

            orb.onclick = attempt;

            orb.onkeydown = event => {

                if (event.key === "Enter" || event.key === " ") {

                    event.preventDefault();

                    attempt();

                }

            };

        }

        if (showLabels) {

            orb.appendChild(
                onbEl("div", "skill-orb-label", label)
            );

        }

        container.appendChild(orb);

    });

}

function renderSkillCarousel() {

    const container = document.getElementById("profileContent");

    container.innerHTML = "";

    const wrap = onbEl("div", "skill-carousel-wrap");

    const prevBtn = onbEl("button", "skill-carousel-arrow prev", "‹");

    prevBtn.type = "button";

    prevBtn.setAttribute("aria-label", t("skillPrev"));

    prevBtn.onclick = () => scrollSkillCarousel(-1);

    const nextBtn = onbEl("button", "skill-carousel-arrow next", "›");

    nextBtn.type = "button";

    nextBtn.setAttribute("aria-label", t("skillNext"));

    nextBtn.onclick = () => scrollSkillCarousel(1);

    const track = onbEl("div", "skill-carousel");

    track.id = "skillCarouselTrack";

    const lang = onbLang();

    SKILL_BANNER_ORDER.forEach(category => {

        const banner = onbEl("div", "skill-banner");

        banner.style.setProperty("--banner-color", SKILL_BANNER_COLOR[category]);

        banner.style.setProperty("--banner-glow", SKILL_BANNER_COLOR[category] + "55");

        const isOrigen = category === "Origen";

        const race = isOrigen ? getRaceData(state.race) : null;

        const header = onbEl("div", "skill-banner-header");

        const bannerIcon = onbEl(
            "div",
            "skill-banner-icon",
            isOrigen ? (race ? getRaceDisplayIcon(race) : categories.Origen.icon) : categories[category].icon
        );

        if (isOrigen) {
            bannerIcon.id = "origenBannerIcon";
        }

        header.appendChild(bannerIcon);

        header.appendChild(onbEl("div", "skill-banner-name", category));

        if (isOrigen) {

            header.appendChild(
                onbEl(
                    "div",
                    "skill-banner-sub" + (isRaceEvolved() ? " evolved" : ""),
                    race ? getRaceDisplayName(race, lang) : "-"
                )
            );

        }

        header.appendChild(onbEl("div", "skill-banner-rule"));

        banner.appendChild(header);

        if (isOrigen) {

            banner.appendChild(
                onbEl(
                    "div",
                    "skill-banner-points",
                    state.skillPoints + " " + (state.language === "es" ? "PUNTOS" : "POINTS")
                )
            );

            const nodes = getOrigenNodes();

            if (nodes) {

                const key = getOrigenTreeKey();

                const treeBox = onbEl("div", "origin-skill-tree");

                treeBox.id = skillTreeContainerId(key);

                banner.appendChild(treeBox);

                paintSkillTree(treeBox, key, nodes, true);

            } else {

                banner.appendChild(onbEl("p", "onb-hint", t("originNoRace")));

            }

        } else {

            /* En vez del pozo compartido, aquí se ve cuánto tienes
               ahorrado de cada estadística de la categoría */
            const pointsRow = onbEl("div", "skill-points-row");

            pointsRow.id = "skillPoints-" + category.replace(/[^a-zA-Z0-9]/g, "_");

            categories[category].stats.forEach(stat => {

                pointsRow.appendChild(
                    onbEl(
                        "span",
                        "skill-points-chip",
                        stat + " " + (state.stats[stat].points || 0)
                    )
                );

            });

            banner.appendChild(pointsRow);

            const treeBox = onbEl("div", "origin-skill-tree");

            treeBox.id = skillTreeContainerId(category);

            banner.appendChild(treeBox);

            paintCategorySkillTree(treeBox, category);

        }

        track.appendChild(banner);

    });

    wrap.appendChild(prevBtn);

    wrap.appendChild(track);

    wrap.appendChild(nextBtn);

    container.appendChild(wrap);

    const dots = onbEl("div", "skill-carousel-dots");

    SKILL_BANNER_ORDER.forEach((category, index) => {

        const dot = onbEl("button", "skill-dot");

        dot.type = "button";

        dot.setAttribute("aria-label", category);

        dot.onclick = () => scrollSkillCarouselTo(index);

        dots.appendChild(dot);

    });

    container.appendChild(dots);

    track.addEventListener("scroll", updateSkillCarouselActive, { passive: true });

    /* Coloca el panel recordado (Origen al entrar), sin animación */
    requestAnimationFrame(() => {

        track.scrollLeft = skillCarouselIndex * track.clientWidth;

        updateSkillCarouselActive();

    });

}

function scrollSkillCarousel(direction) {

    const track = document.getElementById("skillCarouselTrack");

    if (!track) {
        return;
    }

    track.scrollBy({
        left: direction * track.clientWidth,
        behavior: reducedMotion() ? "auto" : "smooth"
    });

}

function scrollSkillCarouselTo(index) {

    const track = document.getElementById("skillCarouselTrack");

    if (!track) {
        return;
    }

    track.scrollTo({
        left: index * track.clientWidth,
        behavior: reducedMotion() ? "auto" : "smooth"
    });

}

function updateSkillCarouselActive() {

    const track = document.getElementById("skillCarouselTrack");

    if (!track) {
        return;
    }

    const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));

    /* Con el carrusel oculto (clientWidth 0) el scroll no significa nada */
    if (track.clientWidth > 0) {
        skillCarouselIndex = index;
    }

    document
        .querySelectorAll(".skill-banner")
        .forEach((banner, i) => {

            banner.classList.toggle("active", i === index);

        });

    document
        .querySelectorAll(".skill-dot")
        .forEach((dot, i) => {

            dot.classList.toggle("active", i === index);

        });

}
