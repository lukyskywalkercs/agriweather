// Datos ficticios realistas para Almacén de Naranjas "CitrusVall"

export const warehouse = {
  name: "CitrusVall S.L.",
  location: "Vall d'Uixó, Castellón",
  coords: { lat: 39.8119, lng: -0.2341 },
  employees: 47,
  vehicles: {
    commercial: 3,
    trucks: 8,
    forklifts: 6
  }
}

export const weatherAlert = {
  date: "2026-01-18",
  dateDisplay: "Jueves 18 Enero 2026",
  daysUntil: 3,
  alertLevel: "high", // low, medium, high, severe
  events: [
    {
      type: "rain",
      intensity: "heavy",
      start: "10:00",
      end: "14:00",
      precipitation: "15mm",
      windSpeed: "25km/h"
    },
    {
      type: "rain",
      intensity: "light",
      start: "18:00",
      end: "20:00",
      precipitation: "5mm",
      windSpeed: "15km/h"
    }
  ],
  temperature: {
    min: 8,
    max: 14
  },
  source: "AEMET + ECMWF (precisión 72h: ~78%)"
}

export const savings = {
  fuel: {
    liters: 15,
    euros: 18.00,
    percentage: 18
  },
  time: {
    hours: 2.75,
    value: 165
  },
  co2: {
    kg: 39.75
  },
  operational: {
    total: 510.50,
    breakdown: {
      commercial: 18.00,
      logistics: 134.50,
      hr: 330.00,
      maintenance: 28.00
    }
  },
  projections: {
    monthly: 2040,
    annual: 24480
  }
}

export const commercialRoutes = [
  {
    id: 1,
    vehicleId: "1234-ABC",
    driver: "Juan Pérez",
    zone: "Norte",
    original: {
      clients: ["Cliente A - Lugo", "Cliente B - Ourense", "Cliente C - Pontevedra"],
      distance: 285,
      fuel: 28.5,
      cost: 34.20,
      duration: "11h 00min",
      schedule: [
        { time: "08:00", action: "Salida Almacén" },
        { time: "09:00", action: "Cliente A", status: "normal" },
        { time: "11:00", action: "→ Cliente B", status: "warning" },
        { time: "13:00", action: "Cliente B (bajo lluvia)", status: "danger" },
        { time: "14:30", action: "→ Cliente C" },
        { time: "16:00", action: "Cliente C" },
        { time: "19:00", action: "Llegada Almacén" }
      ]
    },
    optimized: {
      clients: ["Cliente B - Ourense", "Cliente C - Pontevedra", "Cliente A - Lugo"],
      distance: 245,
      fuel: 24.5,
      cost: 29.40,
      duration: "9h 15min",
      schedule: [
        { time: "08:00", action: "Salida Almacén" },
        { time: "09:30", action: "Cliente B", status: "success" },
        { time: "10:00-14:00", action: "Parada estratégica (evita lluvia)", status: "info" },
        { time: "14:15", action: "→ Cliente C" },
        { time: "15:30", action: "Cliente C", status: "success" },
        { time: "17:00", action: "→ Cliente A" },
        { time: "18:15", action: "Cliente A", status: "success" },
        { time: "19:30", action: "Llegada Almacén" }
      ],
      saved: {
        distance: 40,
        fuel: 4.0,
        cost: 4.80,
        rainTime: "4h 00min"
      }
    }
  },
  {
    id: 2,
    vehicleId: "5678-DEF",
    driver: "María González",
    zone: "Centro",
    original: {
      clients: ["Cliente D - Zamora", "Cliente E - Valladolid", "Cliente F - Salamanca"],
      distance: 320,
      fuel: 32.0,
      cost: 38.40,
      duration: "12h 00min"
    },
    optimized: {
      clients: ["Cliente E - Valladolid", "Cliente F - Salamanca", "Cliente D - Zamora"],
      distance: 275,
      fuel: 27.5,
      cost: 33.00,
      duration: "10h 00min",
      saved: {
        distance: 45,
        fuel: 4.5,
        cost: 5.40,
        rainTime: "4h 00min"
      }
    }
  },
  {
    id: 3,
    vehicleId: "9012-GHI",
    driver: "Carlos Martínez",
    zone: "Sur",
    original: {
      clients: ["Cliente G - Cáceres", "Cliente H - Plasencia"],
      distance: 240,
      fuel: 24.0,
      cost: 28.80,
      duration: "8h 30min"
    },
    optimized: {
      clients: ["Cliente H - Plasencia", "Cliente G - Cáceres"],
      distance: 220,
      fuel: 22.0,
      cost: 26.40,
      duration: "8h 00min",
      saved: {
        distance: 20,
        fuel: 2.0,
        cost: 2.40,
        rainTime: "4h 30min"
      }
    }
  }
]

export const departments = [
  {
    id: "comercial",
    name: "Comercial",
    icon: "briefcase",
    manager: "Ana Martínez",
    email: "ventas@citrusvall.com",
    actions: [
      {
        id: "com-1",
        type: "action",
        title: "Reprogramar 8 visitas comerciales",
        description: "Mover visitas del jueves 18/01 (día lluvia) al viernes 19/01 y lunes 22/01. Clientes ya contactados y confirmados."
      },
      {
        id: "com-2",
        type: "success",
        title: "Reorganizar rutas vehículos comerciales",
        description: "Rutas alternativas calculadas: Reduce 85km y 2.5h de conducción. Ahorro: 287€ en gasolina + dietas."
      },
      {
        id: "com-3",
        type: "info",
        title: "Notificar a 3 comerciales",
        description: "Enviar WhatsApp a Carlos (Valencia), María (Alicante) y Pedro (Murcia) con nuevas rutas y horarios."
      }
    ],
    savings: 287.00,
    impact: "high"
  },
  {
    id: "logistica",
    name: "Logística",
    icon: "truck",
    manager: "Roberto Sánchez",
    email: "logistica@citrusvall.com",
    actions: [
      {
        id: "log-1",
        type: "warning",
        title: "Pausar 8 expediciones programadas",
        description: "Expediciones del jueves 18/01 a las 10:00-15:00. Riesgo de retrasos en carretera por lluvia intensa."
      },
      {
        id: "log-2",
        type: "action",
        title: "Reorganizar carga de camiones",
        description: "Concentrar expediciones en viernes 19/01 (mañana) y lunes 22/01. Optimiza 3 rutas en 2 para ahorrar 1 camión."
      },
      {
        id: "log-3",
        type: "success",
        title: "Ahorro en combustible",
        description: "Al reducir 1 camión (250km ruta) se ahorran 180€ en gasoil + 1 conductor."
      }
    ],
    savings: 180.00,
    impact: "high"
  },
  {
    id: "rrhh",
    name: "Recursos Humanos",
    icon: "users",
    manager: "Carmen López",
    email: "rrhh@citrusvall.com",
    actions: [
      {
        id: "rrhh-1",
        type: "action",
        title: "Modificar 4 turnos de almacén",
        description: "Reubicar personal del turno mañana (10:00-15:00 del 18/01) al turno tarde (15:00-20:00) para compensar la pausa."
      },
      {
        id: "rrhh-2",
        type: "info",
        title: "Notificar a 12 trabajadores",
        description: "Enviar aviso con 72h de antelación sobre cambio de turno (según convenio). Incluir razón: optimización meteorológica."
      },
      {
        id: "rrhh-3",
        type: "warning",
        title: "NO contratar temporeros ETT",
        description: "La reorganización permite cubrir demanda sin personal extra. Ahorro: 850€ en contratación + gestoría."
      }
    ],
    savings: 850.00,
    impact: "medium"
  },
  {
    id: "calidad",
    name: "Calidad",
    icon: "shield-check",
    manager: "Javier Ruiz",
    email: "calidad@citrusvall.com",
    actions: [
      {
        id: "cal-1",
        type: "info",
        title: "Inspecciones reprogramadas",
        description: "Las 3 inspecciones de producto del 18/01 se mueven al 19/01 sin afectar plazos de entrega."
      },
      {
        id: "cal-2",
        type: "success",
        title: "Control de cámaras frigoríficas",
        description: "Sin expediciones el 18/01 mañana, aprovechar para mantenimiento preventivo de cámaras (ahorrar futura avería)."
      }
    ],
    savings: 0,
    impact: "low"
  }
]

export const historicalData = [
  { month: "Jul", sinSistema: 2100, conSistema: 3250, ahorro: 1150 },
  { month: "Ago", sinSistema: 2400, conSistema: 3800, ahorro: 1400 },
  { month: "Sep", sinSistema: 1900, conSistema: 3200, ahorro: 1300 },
  { month: "Oct", sinSistema: 2600, conSistema: 4100, ahorro: 1500 },
  { month: "Nov", sinSistema: 2800, conSistema: 4500, ahorro: 1700 },
  { month: "Dic", sinSistema: 3100, conSistema: 5200, ahorro: 2100 },
]

export const upcomingAlerts = [
  {
    date: "2026-01-18",
    type: "rain",
    severity: "high",
    summary: "Lluvia intensa 10:00-14:00"
  },
  {
    date: "2026-01-23",
    type: "wind",
    severity: "medium",
    summary: "Viento fuerte 40km/h"
  },
  {
    date: "2026-01-28",
    type: "rain",
    severity: "low",
    summary: "Lluvia ligera tarde"
  }
]

