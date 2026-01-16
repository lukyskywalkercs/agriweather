# 🌦️ AgriWeather Pro

**Sistema Inteligente de Gestión Meteorológica para Almacenes de Cítricos**  
*Desarrollado por [Lind Informática](https://www.lindinformatica.com)*

Tu asistente IA que monitoriza el tiempo 24/7 y te ayuda a tomar mejores decisiones operativas. Sistema en alerta permanente con predicción a 48 horas.

---

## 🚀 Caso de Uso: CitrusVall S.L. (Almacén de Naranjas)

**Situación:** Sistema detecta lluvia intensa en 48h (Jueves 18 Enero, 10:00-14:00)

**IA te ayuda a decidir:**
- 📊 Análisis de impacto en rutas comerciales programadas
- 📊 Sugerencias de reorganización de expediciones de camiones
- 📊 Propuestas de optimización de turnos del equipo
- 📊 Recomendaciones de inspecciones y mantenimiento preventivo

**Tú apruebas cada acción.** La IA sugiere, tú decides. Sistema diseñado para mejorar la toma de decisiones con datos reales.

---

## 🎯 Características Principales

### 1. **Predicción Meteorológica (48h)**
- Open-Meteo (precipitación, humedad, viento, temperatura)
- RainViewer (radar)
- OpenStreetMap/Nominatim (mapas y geocodificación)

### 📌 Fuentes reales utilizadas
- **Open-Meteo**: previsión horaria (precipitación, humedad, viento, temperatura).
- **RainViewer**: radar de lluvia en tiempo casi real.
- **OpenStreetMap**: tiles de mapa base.
- **Nominatim**: geocodificación de localidades.

### 2. **IA Multi-Agente**
- **Agente Comercial:** Optimiza rutas y visitas
- **Agente Logística:** Reorganiza expediciones
- **Agente RRHH:** Ajusta turnos sin despidos
- **Agente Calidad:** Planifica inspecciones

### 3. **Dashboard Interactivo**
- **Card de Previsión Destacada:** Icono + panel de recomendaciones
- **Acciones Aprobables:** Botones Aprobar/Rechazar en cada recomendación
- **Vista por Roles:** Cada jefe solo ve su departamento
- **Director General:** Ve todo el sistema completo
- **Deshacer Decisiones:** Cambia de opinión en cualquier momento


## 💻 Instalación y Desarrollo

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone <url-repo>
cd web-finances

# Instalar dependencias
npm install

# Iniciar servidor desarrollo
npm run dev
```

El servidor arrancará en `http://localhost:5173`

### Compilar para producción
```bash
npm run build
```

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  - Panel operativo                       │
│  - Decisiones de recolección             │
│  - Componentes: WeatherCard, ActionCard│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│        Backend (Netlify Functions)      │
│  - Endpoints serverless                 │
│  - Persistencia en Supabase             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│       Integraciones Externas            │
│  - Open-Meteo (predicción 48h)          │
│  - RainViewer (radar)                   │
│  - OpenStreetMap/Nominatim (mapas)      │
└─────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18
- Vite
- React Leaflet
- Leaflet

**Backend:**
- Netlify Functions
- Supabase

**Integraciones:**
- Open-Meteo
- RainViewer
- OpenStreetMap/Nominatim

---

## 📞 Contacto y Demo

**Desarrollado por: Lind Informática**

- 🌐 Web: [www.lindinformatica.com](https://www.lindinformatica.com)
- 📧 Email: contacto@lindinformatica.com
- 💼 LinkedIn: [linkedin.com/company/lindinformatica](https://linkedin.com/company/lindinformatica)
- 🐙 GitHub: [github.com/lindinformatica](https://github.com/lindinformatica)

**¿Quieres una demo personalizada para tu almacén?**
Contacta con nosotros y descubre cómo tomar mejores decisiones basadas en datos meteorológicos.

---

## 👥 Créditos

**AgriWeather Pro** - Desarrollado por **Lind Informática**  
Sistema inteligente de gestión meteorológica para almacenes de cítricos.  
Diseñado para revolucionar la toma de decisiones en el sector agrícola.

