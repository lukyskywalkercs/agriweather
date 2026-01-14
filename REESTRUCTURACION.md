# 🍊 REESTRUCTURACIÓN: CitrusAlert

**Sistema de alertas meteorológicas para almacenes de naranjas**  
*Desarrollado por Lind Informática*

---

## 🎯 CONCEPTO SIMPLIFICADO

### ❌ LO QUE ELIMINAMOS (demasiado complejo):
- Dashboard con 5 roles diferentes
- Integración con ERP (SAP, Navision, etc.)
- Gestión de turnos automática
- WhatsApp Business API (al principio)
- Sistema de aprobación multi-departamento
- Base de datos compleja

### ✅ LO QUE MANTENEMOS (viable y útil):
- **Predicción meteorológica 72h** (API AEMET)
- **Alertas automáticas por email**
- **Recomendaciones específicas para cítricos** (IA con GPT)
- **Dashboard simple** (1 usuario = dueño del almacén)
- **Landing profesional**

---

## 🏗️ ARQUITECTURA REAL

### **Frontend (React - Ya lo tienes casi)**
```
Landing Page
    ↓
Registro Simple (email + ubicación + datos almacén)
    ↓
Dashboard Único
    ├── Card Clima 72h
    ├── Alertas Activas
    └── Historial de Alertas
```

### **Backend (Python Flask - NUEVO)**
```python
# Estructura simple
app/
├── __init__.py           # Flask app
├── routes.py             # API endpoints
├── weather_service.py    # Consulta AEMET
├── ai_service.py         # GPT para recomendaciones
├── email_service.py      # Envío de alertas
└── scheduler.py          # Cron jobs

models/
├── user.py              # Solo tabla users
└── alert.py             # Solo tabla alerts

config.py
requirements.txt
run.py
```

### **Base de Datos (SQLite → PostgreSQL después)**
```sql
-- Solo 2 tablas

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    warehouse_location TEXT,  -- "Castellón"
    warehouse_size TEXT,      -- "pequeño/mediano/grande"
    vehicles_count INTEGER,   -- Nº de vehículos
    employees_count INTEGER,  -- Nº de empleados
    created_at TIMESTAMP
);

CREATE TABLE alerts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    date TEXT,
    event_type TEXT,          -- "rain/wind/frost"
    severity TEXT,            -- "low/medium/high"
    recommendations TEXT,     -- JSON con recomendaciones IA
    sent_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔄 FLUJO COMPLETO (REAL)

### 1️⃣ **Usuario se registra (Landing)**
```
Formulario simple:
- Nombre del almacén
- Email
- Ubicación (ciudad)
- Tamaño (pequeño/mediano/grande)
- Nº vehículos
- Nº empleados
```

### 2️⃣ **Sistema monitoriza clima (Automático cada 6h)**
```python
# scheduler.py
@cron.scheduled_job('interval', hours=6)
def check_weather_for_all_users():
    users = User.query.all()
    for user in users:
        weather = aemet_api.get_forecast(user.location, days=3)
        
        # Detectar eventos
        if weather.rain > 15:  # mm
            generate_alert(user, weather, 'rain')
        if weather.wind > 40:  # km/h
            generate_alert(user, weather, 'wind')
        if weather.temp_min < 3:  # °C (heladas)
            generate_alert(user, weather, 'frost')
```

### 3️⃣ **IA genera recomendaciones (GPT-3.5)**
```python
# ai_service.py
def generate_citrus_recommendations(user, weather_event):
    prompt = f"""
    Eres un experto en gestión de almacenes de cítricos.
    
    DATOS DEL ALMACÉN:
    - Ubicación: {user.location}
    - Tamaño: {user.warehouse_size}
    - Vehículos: {user.vehicles_count}
    - Empleados: {user.employees_count}
    
    EVENTO METEOROLÓGICO:
    - Tipo: {weather_event.type}
    - Intensidad: {weather_event.description}
    - Fecha: {weather_event.date}
    - Duración: {weather_event.duration}
    
    TAREA:
    Dame 4-5 recomendaciones ESPECÍFICAS y ACCIONABLES para este almacén.
    Enfócate en:
    - Gestión de expediciones
    - Protección de producto
    - Seguridad del equipo
    - Optimización de rutas
    
    Formato: Lista numerada, máximo 2 líneas por punto.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Eres un experto en almacenes de cítricos."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    return response.choices[0].message.content
```

### 4️⃣ **Usuario recibe email**
```
Asunto: ⚠️ Alerta CitrusAlert - Lluvia intensa en 48h

Hola [Nombre Almacén],

🌧️ Hemos detectado LLUVIA INTENSA en Castellón
📅 Fecha: Jueves 18 Enero, 10:00-15:00
💧 Cantidad: 25mm
💨 Viento: 40 km/h

🧠 RECOMENDACIONES PARA TU ALMACÉN:

1. Reprogramar expediciones: Adelantar envíos del jueves al miércoles tarde o posponer al viernes.

2. Proteger producto exterior: Cubrir pallets en zona descubierta antes de las 9:00h del jueves.

3. Rutas comerciales: Evitar zona norte (A-7) entre 10:00-15:00. Alternativa: AP-7.

4. Personal: Reorganizar equipo de carga exterior a tareas interiores durante las horas de lluvia.

5. Inspección post-lluvia: Revisar cámaras frigoríficas y controles de humedad a las 16:00h.

---
Ver más detalles en tu Dashboard:
https://citrusAlert.app/dashboard

CitrusAlert - Lind Informática
```

### 5️⃣ **Usuario abre Dashboard**
```
Dashboard simple con:
- Card grande: Próximo evento (72h)
- Lista: Recomendaciones IA
- Historial: Alertas pasadas
- Config: Editar datos del almacén
```

---

## 🛠️ STACK TECNOLÓGICO REAL

### Frontend (React)
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.294.0"
}
```

### Backend (Python Flask)
```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
APScheduler==3.10.4
openai==1.3.0
requests==2.31.0
python-dotenv==1.0.0
```

### APIs Externas
- **AEMET API** (gratis, oficial española)
- **OpenAI API** (GPT-3.5: ~0.002€/alerta)

### Hosting (Gratis al principio)
- **Frontend:** Netlify (gratis)
- **Backend:** Railway / Render (gratis hasta 500h/mes)
- **BD:** Railway PostgreSQL (gratis 500MB)

---

## 📊 MVP - PLAN DE 6 SEMANAS

### **Semana 1: Landing + Registro**
- [ ] Landing page simplificada (1 página)
- [ ] Formulario de registro
- [ ] Página de confirmación

### **Semana 2: Backend Base**
- [ ] Setup Flask
- [ ] Modelos SQLite (users, alerts)
- [ ] Endpoint registro
- [ ] Endpoint login simple

### **Semana 3: Integración AEMET**
- [ ] Conectar API AEMET
- [ ] Parsear predicciones 72h
- [ ] Detectar eventos (lluvia, viento, heladas)

### **Semana 4: IA con GPT**
- [ ] Integrar OpenAI API
- [ ] Prompt específico para cítricos
- [ ] Generar recomendaciones

### **Semana 5: Notificaciones**
- [ ] Sistema de email (SendGrid/Mailgun)
- [ ] Cron job cada 6h
- [ ] Plantilla email HTML

### **Semana 6: Dashboard + Deploy**
- [ ] Dashboard simple (React)
- [ ] Historial de alertas
- [ ] Deploy frontend (Netlify)
- [ ] Deploy backend (Railway)

---

## 💰 COSTOS REALES

### Desarrollo (0€ - lo haces tú)
- Tiempo: 6 semanas
- Stack: Todo open source

### Operación (primeros 6 meses)
- **Hosting:** 0€ (tier gratis Railway + Netlify)
- **OpenAI API:** ~3€/mes (100 alertas × 0.002€ × 5 usuarios)
- **Email:** 0€ (SendGrid: 100 emails/día gratis)
- **Dominio:** 12€/año (.app)
- **TOTAL:** ~15€/año hasta tener clientes

### Cuando tengas clientes (10 almacenes)
- Hosting: 15€/mes (Railway Pro)
- OpenAI: 30€/mes
- Email: 10€/mes
- **TOTAL:** ~55€/mes
- **Pricing cliente:** 49€/mes/almacén
- **Ingresos:** 490€/mes
- **Beneficio:** 435€/mes

---

## 🎯 FEATURES MVP (Lo mínimo viable)

### ✅ INCLUIR:
1. Registro simple
2. Predicción AEMET 72h
3. Detección de eventos (lluvia/viento/heladas)
4. Recomendaciones IA (GPT)
5. Email de alertas
6. Dashboard básico
7. Historial

### ❌ DEJAR PARA V2:
- WhatsApp (empezar con email)
- App móvil
- Múltiples usuarios/roles
- Integración ERP
- Análisis histórico avanzado
- Optimización de rutas con mapas

---

## 📱 INTERFAZ SIMPLIFICADA

### Landing (1 página)
```
Hero:
  "CitrusAlert - Tu asistente meteorológico para almacenes de cítricos"
  
Problema:
  "¿Lluvia inesperada? ¿Heladas? ¿Expediciones canceladas?"
  
Solución:
  "Te avisamos 72h antes con recomendaciones específicas para tu almacén"
  
CTA:
  [Probar Gratis 30 Días]
```

### Dashboard (1 página)
```
Header: Logo + Logout

Main:
  [Card Grande: Próxima Alerta]
    - Icono clima
    - Fecha/hora
    - Descripción
    
  [Recomendaciones IA]
    1. ...
    2. ...
    3. ...
    
  [Historial]
    - Alerta 1
    - Alerta 2
    - ...
    
Footer: Config + Soporte
```

---

## 🚀 LANZAMIENTO

### Fase 1: Beta Cerrada (1-2 almacenes)
- Tu propio almacén (si tienes)
- 1 cliente de prueba
- Validar que funciona
- Ajustar recomendaciones IA

### Fase 2: Lanzamiento Local (5-10 almacenes)
- Comarca Castellón
- Pricing: 39€/mes
- Soporte directo por WhatsApp

### Fase 3: Escalar (20+ almacenes)
- Toda Comunidad Valenciana
- Pricing: 49€/mes
- Onboarding automatizado

---

## ✅ VENTAJAS DE ESTA ARQUITECTURA

1. **Viable para 1 persona:** Todo lo puedes hacer tú
2. **Costos bajos:** ~15€/año hasta tener clientes
3. **IA "real":** GPT genera recomendaciones de verdad
4. **Específico:** 100% enfocado a cítricos
5. **Escalable:** Fácil añadir más almacenes
6. **Rápido:** MVP en 6 semanas

---

## 🎯 PRÓXIMOS PASOS

**¿Quieres que empiece a reestructurar el código?**

1. Simplificar Landing
2. Eliminar sistema de roles
3. Crear backend Flask desde cero
4. Dashboard simple de 1 usuario
5. Integrar AEMET (API real)
6. Conectar GPT para recomendaciones

**Dime si te parece bien y empiezo YA.**


