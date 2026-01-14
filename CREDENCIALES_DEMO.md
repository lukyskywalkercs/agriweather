# 🔐 Credenciales de Acceso - AgriWeather Pro

*Desarrollado por [Lind Informática](https://www.lindinformatica.com)*

## Acceso Rápido (Botones en Login)

En la página de login encontrarás **5 botones de acceso rápido** para probar diferentes roles:

### 1. 👔 Director General
**Ve TODO el sistema completo:**
- Todos los departamentos
- Todas las recomendaciones
- Panel de análisis histórico
- Rutas comerciales

**Credenciales:**
- Usuario: `director`
- Contraseña: `demo`

---

### 2. 💼 Jefe Comercial (Ana Martínez)
**Solo ve su departamento:**
- Reprogramación de visitas comerciales
- Rutas alternativas de vehículos
- Notificaciones a comerciales
- Ahorro estimado: 287€

**Credenciales:**
- Usuario: `comercial`
- Contraseña: `demo`

---

### 3. 🚚 Jefe Logística (Roberto Sánchez)
**Solo ve su departamento:**
- Pausar/reorganizar expediciones
- Optimización de carga de camiones
- Ahorro en combustible
- Ahorro estimado: 180€

**Credenciales:**
- Usuario: `logistica`
- Contraseña: `demo`

---

### 4. 👥 Jefe RRHH (Carmen López)
**Solo ve su departamento:**
- Modificación de turnos
- Notificaciones a trabajadores
- Optimización de plantilla (sin contratar ETT)
- Ahorro estimado: 850€

**Credenciales:**
- Usuario: `rrhh`
- Contraseña: `demo`

---

### 5. ✅ Jefe Calidad (Javier Ruiz)
**Solo ve su departamento:**
- Inspecciones reprogramadas
- Mantenimiento preventivo de cámaras
- Ahorro estimado: 0€ (optimización preventiva)

**Credenciales:**
- Usuario: `calidad`
- Contraseña: `demo`

---

## 🎯 Flujo de Uso Recomendado

1. **Empieza como Director General** para ver todo el sistema
2. **Prueba como Jefe Comercial** para ver la experiencia de un jefe de departamento específico
3. **Explora cada departamento** para entender las recomendaciones específicas

---

## 💡 Funcionalidades Interactivas

### Panel de Recomendaciones IA
- Cada recomendación tiene botones **"Aprobar"** y **"Rechazar"**
- Puedes **deshacer** tu decisión en los primeros 5 segundos
- La IA sugiere, **TÚ DECIDES**

### Card de Previsión Meteorológica
- Muestra el evento climático con **3 días de antelación**
- Botón destacado: **"Ver Panel de Recomendaciones IA"**
- Toggle para mostrar/ocultar el panel completo

---

## 📱 Próximamente
Los roles sin implementar (si añades más en el futuro) mostrarán una página de **"Próximamente"** con:
- Información de contacto
- Features planificadas
- Botón para volver al dashboard

---

## 🛠️ Desarrollo
Para probar localmente:
```bash
npm run dev
```

El servidor arrancará en `http://localhost:5173` (o el siguiente puerto disponible).

