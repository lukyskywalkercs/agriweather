# 🌦️ AgriWeather Pro

**Sistema Inteligente de Gestión Meteorológica para Almacenes de Cítricos**  
*Desarrollado por [Lind Informática](https://www.lindinformatica.com)*

Tu asistente IA que monitoriza el tiempo 24/7 y te ayuda a tomar mejores decisiones sobre rutas, turnos y expediciones. Sistema en alerta permanente con predicción a 72 horas.

---

## 🚀 Caso de Uso: CitrusVall S.L. (Almacén de Naranjas)

**Situación:** Sistema detecta lluvia intensa en 72h (Jueves 18 Enero, 10:00-14:00)

**IA te ayuda a decidir:**
- 📊 Análisis de impacto en rutas comerciales programadas
- 📊 Sugerencias de reorganización de expediciones de camiones
- 📊 Propuestas de optimización de turnos del equipo
- 📊 Recomendaciones de inspecciones y mantenimiento preventivo

**Tú apruebas cada acción.** La IA sugiere, tú decides. Sistema diseñado para mejorar la toma de decisiones con datos reales.

---

## 🎯 Características Principales

### 1. **Predicción Meteorológica (72h)**
- Integración con AEMET + ECMWF
- Precisión ~78% a 3 días
- Alertas automáticas por WhatsApp/SMS

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

### 4. **Autenticación por Roles**
- 5 roles diferentes: Director, Comercial, Logística, RRHH, Calidad
- Acceso rápido con botones demo
- Datos aislados por departamento

---

## 🔐 Credenciales Demo

| Rol | Usuario | Contraseña | Vista |
|-----|---------|------------|-------|
| 👔 Director General | `director` | `demo` | **TODO** |
| 💼 Jefe Comercial | `comercial` | `demo` | Solo Comercial |
| 🚚 Jefe Logística | `logistica` | `demo` | Solo Logística |
| 👥 Jefe RRHH | `rrhh` | `demo` | Solo RRHH |
| ✅ Jefe Calidad | `calidad` | `demo` | Solo Calidad |

**Ver detalles completos:** [CREDENCIALES_DEMO.md](./CREDENCIALES_DEMO.md)

---

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
│  - Login con roles                      │
│  - Dashboard interactivo                │
│  - Componentes: WeatherCard, ActionCard│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│      Backend (Futuro - Python Flask)    │
│  - API REST                             │
│  - Autenticación JWT                    │
│  - Base de datos PostgreSQL             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│       Integraciones Externas            │
│  - AEMET API (predicción España)        │
│  - ECMWF (precisión Europa)             │
│  - WhatsApp Business API                │
│  - ERP Cliente (SAP/Navision/A3/Sage)   │
└─────────────────────────────────────────┘
```

---

## 🧩 Componentes Clave

### `WeatherCard.jsx`
Card destacada con previsión meteorológica:
- Icono de clima
- Countdown de días hasta el evento
- Botón: **"Ver Panel de Recomendaciones IA"**
- Toggle del panel completo

### `ActionCard.jsx`
Tarjeta interactiva para cada recomendación IA:
- Estados: `pending`, `approved`, `rejected`
- Botones: **Aprobar** / **Rechazar**
- Opción de **Deshacer** (5 segundos)
- Indicador visual de estado

### `Dashboard.jsx`
Panel principal con:
- Filtrado por rol (director ve todo, jefes solo su área)
- Tabs: Resumen / Rutas Alternativas / Histórico
- Lista de acciones por departamento
- Gráficas de ahorro

---

## 📱 Integración WhatsApp Business

**Coste estimado (verificar con Meta):**
- Conversaciones de utilidad: ~0.003-0.01€
- Primeras 1000 conversaciones/mes: GRATIS
- Ahorro vs SMS: ~92%

**Ejemplo:**
- 50 empleados × 4 avisos/mes = 200 notificaciones
- Coste estimado: **1,20€/mes** vs 16€/mes en SMS

**Verificar precios actuales:** [business.whatsapp.com/pricing](https://business.whatsapp.com/pricing)

---

## 🔌 Integración ERP

El sistema puede integrarse con:
- **SAP Business One / S/4HANA** (API REST/OData)
- **Microsoft Dynamics Navision** (Web Services)
- **Sage 200 / A3** (API REST/SOAP)
- **Odoo / ERP custom** (API REST)

**Datos necesarios:**
- Empleados activos + turnos
- Vehículos + rutas asignadas
- Inventario en tiempo real
- Expediciones programadas

**Ver detalles técnicos:** [RESPUESTAS_TECNICAS.md](./RESPUESTAS_TECNICAS.md)

---

## 🎯 Sectores Objetivo

### ✅ Alta Viabilidad
1. **Agricultura intensiva** (naranjas, hortalizas, invernaderos)
2. **Construcción** (obras al aire libre)
3. **Logística y transporte** (rutas nacionales/internacionales)
4. **Eventos al aire libre** (bodas, festivales, ferias)

### ⚠️ Viabilidad Media
5. **Turismo** (hoteles con actividades exteriores)
6. **Retail** (centros comerciales con parking/terrazas)
7. **Energía** (parques solares, eólicos)

---

## 📈 ROI y Pricing

### Modelo SaaS (recomendado)
- **Instalación:** 0€
- **Mensualidad:** 150-500€/mes según tamaño empresa
  - Starter (1-25 empleados): 150€/mes
  - Business (26-100 empleados): 300€/mes
  - Enterprise (100+ empleados): 500€/mes

### ROI Típico
- **Inversión anual:** 1.800-6.000€
- **Ahorro promedio:** 12.000-40.000€/año
- **ROI:** +200% a +500%

---

## 📝 Próximos Pasos

### MVP (actual)
- ✅ Frontend completo con roles
- ✅ Dashboard interactivo
- ✅ Componentes visuales
- ✅ Datos ficticios realistas

### Fase 1 (1-2 meses)
- [ ] Backend con autenticación JWT
- [ ] Integración AEMET API real
- [ ] Base de datos PostgreSQL
- [ ] WhatsApp Business API

### Fase 2 (3-4 meses)
- [ ] Integración ERP (SAP, Navision, etc.)
- [ ] IA real (modelos de optimización)
- [ ] Notificaciones push
- [ ] App móvil (React Native)

### Fase 3 (6+ meses)
- [ ] Machine Learning predictivo
- [ ] Históricos y analytics avanzados
- [ ] API pública para partners
- [ ] Marketplace de integraciones

---

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18
- Vite
- React Router
- Lucide React (iconos)
- Recharts (gráficas)

**Backend (futuro):**
- Python 3.11+ / Flask
- PostgreSQL
- JWT Authentication
- Redis (caché)

**Integraciones:**
- AEMET API
- ECMWF
- WhatsApp Business API
- APIs ERP

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

## 📄 Licencia

Este proyecto es un MVP/Demo. Los derechos de uso comercial están reservados a Lind Informática.

---

## 👥 Créditos

**AgriWeather Pro** - Desarrollado por **Lind Informática**  
Sistema inteligente de gestión meteorológica para almacenes de cítricos.  
Diseñado para revolucionar la toma de decisiones en el sector agrícola.

---

**⚠️ IMPORTANTE:** Este es un sistema DEMO con datos ficticios. Las integraciones con APIs meteorológicas reales, WhatsApp y ERPs requieren implementación adicional y contratos con proveedores.
