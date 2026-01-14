import React, { useEffect, useMemo, useState } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { CheckCircle, AlertTriangle, Octagon, MapPin, Save, Clock, Printer, LogOut, Trash2, Edit3, ChevronDown, ChevronUp } from 'lucide-react'

const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const DEFAULT_COORDS = { lat: 39.4699, lon: -0.3763 } // Valencia

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

function parseCoords(input) {
  const cleaned = input.replace(/\s+/g, '')
  const parts = cleaned.split(',')
  if (parts.length !== 2) throw new Error('Usa el formato: latitud, longitud')
  const lat = Number(parts[0])
  const lon = Number(parts[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Coordenadas no numéricas')
  if (lat < -90 || lat > 90) throw new Error('Latitud fuera de rango')
  if (lon < -180 || lon > 180) throw new Error('Longitud fuera de rango')
  return { lat, lon }
}

function findDryWindows(hourly, windowHours = 6) {
  const limit = 48
  const precip = hourly.precipitation.slice(0, limit)
  const humidity = hourly.relativehumidity_2m.slice(0, limit)
  const wind = hourly.windspeed_10m.slice(0, limit)
  const temp = hourly.temperature_2m.slice(0, limit)
  const time = hourly.time.slice(0, limit)

  const windows = []
  for (let i = 0; i <= limit - windowHours; i++) {
    const slicePrecip = precip.slice(i, i + windowHours)
    const sliceHum = humidity.slice(i, i + windowHours)
    const sliceWind = wind.slice(i, i + windowHours)
    const sliceTemp = temp.slice(i, i + windowHours)
    const allDry = slicePrecip.every(p => p <= 0.1)
    const midHumidity = sliceHum.reduce((a, b) => a + b, 0) / sliceHum.length
    if (allDry && midHumidity < 85) {
      windows.push({
        start: time[i],
        end: time[i + windowHours - 1],
        avgHumidity: midHumidity,
        maxPrecip: Math.max(...slicePrecip),
        maxWind: Math.max(...sliceWind),
        minTemp: Math.min(...sliceTemp),
      })
    }
  }
  return windows
}

function evaluateDecision(hourly, windows) {
  const limit = 48
  const precip = hourly.precipitation.slice(0, limit)
  const humidity = hourly.relativehumidity_2m.slice(0, limit)
  const temp = hourly.temperature_2m.slice(0, limit)
  const wind = hourly.windspeed_10m.slice(0, limit)

  const maxPrecip = Math.max(...precip)
  const avgHumidity = humidity.reduce((a, b) => a + b, 0) / humidity.length
  const maxWind = Math.max(...wind)
  const minTemp = Math.min(...temp)

  const hasDryWindow = windows.length > 0

  if (maxPrecip >= 1 || avgHumidity >= 90) {
    return {
      verdict: 'NO RECOLECTAR',
      level: 'red',
      reason: `Lluvia prevista (pico ${maxPrecip.toFixed(1)} mm) o humedad alta (${avgHumidity.toFixed(0)}%). Riesgo de fruta mojada.`,
      windows,
    }
  }

  if (maxPrecip <= 0.1 && hasDryWindow) {
    return {
      verdict: 'RECOLECTAR',
      level: 'green',
      reason: `Sin lluvia significativa y ventana seca de al menos 6 h. Humedad media ${avgHumidity.toFixed(0)}%.`,
      windows,
    }
  }

  return {
    verdict: 'ESPERAR / VENTANA DE SECADO',
    level: 'amber',
    reason: `Precipitación ligera (${maxPrecip.toFixed(1)} mm) o humedad media ${avgHumidity.toFixed(0)}%. Busca la ventana corta de secado antes de cortar.`,
    windows,
  }
}

function App() {
  const [input, setInput] = useState('')
  const [coords, setCoords] = useState(DEFAULT_COORDS)
  const [orchardName, setOrchardName] = useState('Huerto actual')
  const [orchards, setOrchards] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [decision, setDecision] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trialDay, setTrialDay] = useState(1)
  const [metrics, setMetrics] = useState({ usersActive: 0, orchardsCreated: 0, queries: 0, daysUsed: 1 })
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState('5')
  const [feedbackComment, setFeedbackComment] = useState('')
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')
  const [trialStart, setTrialStart] = useState(null)
  const [feedbackSeen, setFeedbackSeen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [showWeekly, setShowWeekly] = useState(false)
  const [editOrchardId, setEditOrchardId] = useState(null)
  const [editOrchardName, setEditOrchardName] = useState('')
  const [editOrchardCoords, setEditOrchardCoords] = useState('')
  const [lastQueryAt, setLastQueryAt] = useState(null)
  const [provinceName, setProvinceName] = useState('—')

  useEffect(() => {
    if (!userId || feedbackSeen) return
    const timer = setTimeout(() => setFeedbackOpen(true), 5 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [userId, feedbackSeen])
  const selectedOrchard = useMemo(
    () => orchards.find(o => o.id === selectedId),
    [orchards, selectedId]
  )
  const trialExpired = trialDay > 7
  const compareResult = useMemo(() => {
    const a = orchards.find(o => o.id === compareA)
    const b = orchards.find(o => o.id === compareB)
    return { a, b }
  }, [compareA, compareB, orchards])
  const stability = useMemo(() => {
    if (!forecast) return '—'
    const isStable = forecast.summary.maxPrecip <= 0.2 && forecast.summary.avgHumidity < 70
    return isStable ? 'Alta' : 'Media'
  }, [forecast])
  const contextTime = useMemo(() => {
    if (selectedOrchard?.lastDecision?.timestamp) {
      return new Date(selectedOrchard.lastDecision.timestamp).toLocaleString()
    }
    return lastQueryAt || '—'
  }, [lastQueryAt, selectedOrchard])

  useEffect(() => {
    setRegisterOpen(true)
  }, [])

  useEffect(() => {
    if (!userId) return
    const fetchForecast = async () => {
      setLoading(true)
      setError('')
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m&forecast_days=2&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) throw new Error('No se pudo obtener la previsión')
        const data = await res.json()
        if (!data?.hourly) throw new Error('Datos incompletos')
        const windows = findDryWindows(data.hourly)
        setForecast({
          summary: {
            maxPrecip: Math.max(...data.hourly.precipitation.slice(0, 48)),
            avgHumidity: data.hourly.relativehumidity_2m.slice(0, 48).reduce((a, b) => a + b, 0) / 48,
            maxWind: Math.max(...data.hourly.windspeed_10m.slice(0, 48)),
            minTemp: Math.min(...data.hourly.temperature_2m.slice(0, 48)),
          },
          hourly: data.hourly,
          windows,
        })
        const evalResult = evaluateDecision(data.hourly, windows)
        setDecision(evalResult)
        setLastQueryAt(new Date().toLocaleString())
        await updateOrchardRecord(evalResult)
        setMetrics(prev => ({ ...prev, queries: prev.queries + 1 }))
      } catch (err) {
        setError(err.message || 'Error desconocido')
        setForecast(null)
        setDecision(null)
        setLastQueryAt(null)
      } finally {
        setLoading(false)
      }
    }
    fetchForecast()
  }, [coords])

  useEffect(() => {
    if (!coords?.lat || !coords?.lon) return
    const fetchProvince = async () => {
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${coords.lat}&longitude=${coords.lon}&language=es&count=1`
        const res = await fetch(url)
        if (!res.ok) throw new Error('No se pudo obtener la provincia')
        const data = await res.json()
        const name = data?.results?.[0]?.admin1 || '—'
        setProvinceName(name)
      } catch (err) {
        setProvinceName('—')
      }
    }
    fetchProvince()
  }, [coords])

  const updateOrchardRecord = async evalResult => {
    if (trialExpired || !userId) return
    const body = {
      userId,
      orchard: {
        id: selectedId,
        name: orchardName || 'Huerto sin nombre',
        lat: coords.lat,
        lon: coords.lon,
      },
      decision: {
        verdict: evalResult.verdict,
        level: evalResult.level,
        timestamp: new Date().toISOString(),
      },
    }
    try {
      const res = await fetch('/.netlify/functions/save-orchard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || 'No se pudo guardar el huerto')
      }
      const payload = await res.json()
      setOrchards(payload.orchards || [])
      if (!selectedId && payload.orchards?.length) setSelectedId(payload.orchards[0].id)
    } catch (err) {
      setError(err.message || 'Error al guardar huerto')
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    try {
      const parsed = parseCoords(input)
      setCoords(parsed)
    } catch (err) {
      setError(err.message)
    }
  }

  const cardClass = useMemo(() => {
    if (!decision) return 'status neutral'
    return `status ${decision.level}`
  }, [decision])

  const statusIcon = useMemo(() => {
    if (!decision) return null
    if (decision.level === 'green') return <CheckCircle size={28} />
    if (decision.level === 'amber') return <AlertTriangle size={28} />
    return <Octagon size={28} />
  }, [decision])

  const primaryRisk = useMemo(() => {
    if (!forecast) return '—'
    const { maxPrecip, avgHumidity, maxWind } = forecast.summary
    if (maxPrecip >= 1) return 'Lluvia'
    if (avgHumidity >= 85) return 'Humedad'
    if (maxWind >= 35) return 'Viento'
    return 'Bajo'
  }, [forecast])

  const windowsCount = decision?.windows?.length || 0
  const firstWindow = decision?.windows?.[0] || null
  const firstWindow24 = useMemo(() => {
    if (!decision?.windows?.length) return null
    const now = Date.now()
    return decision.windows.find(w => (Date.parse(w.start) - now) / (1000 * 60 * 60) <= 24) || null
  }, [decision])
  const firstWindow48 = useMemo(() => {
    if (!decision?.windows?.length) return null
    const now = Date.now()
    return decision.windows.find(w => {
      const hours = (Date.parse(w.start) - now) / (1000 * 60 * 60)
      return hours > 24 && hours <= 48
    }) || null
  }, [decision])
  const nextWindow = firstWindow24 || firstWindow48 || firstWindow

  const sealText = useMemo(() => {
    if (!decision) return ''
    if (decision.level === 'red') return 'No se recomienda recolectar hoy'
    if (decision.level === 'amber') return 'Recomendación condicionada: espera la ventana segura'
    return 'Se recomienda recolectar hoy'
  }, [decision])

  const nextWindowText = useMemo(() => {
    if (!nextWindow) return 'No hay ventana segura en las próximas 48 h.'
    const start = new Date(nextWindow.start)
    const end = new Date(nextWindow.end)
    const now = new Date()
    const sameDay = start.toDateString() === now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const isTomorrow = start.toDateString() === tomorrow.toDateString()
    const morning = start.getHours() < 12
    const dayLabel = sameDay ? 'hoy' : isTomorrow ? (morning ? 'mañana por la mañana' : 'mañana') : start.toLocaleDateString()
    return `Existe una ventana segura ${dayLabel} de ${start.toLocaleTimeString()} a ${end.toLocaleTimeString()}.`
  }, [nextWindow])
  const validityUntil = useMemo(() => {
    if (forecast?.hourly?.time?.[47]) return new Date(forecast.hourly.time[47]).toLocaleString()
    const ts = Date.now() + 48 * 60 * 60 * 1000
    return new Date(ts).toLocaleString()
  }, [forecast])

  const handleSaveOrchard = () => {
    if (trialExpired) return
    const parsed = parseCoords(input)
    setCoords(parsed)
    setSelectedId(null)
    setTimeout(() => {
      setSelectedId(`${parsed.lat},${parsed.lon}`)
    }, 0)
  }

  const handleSelectOrchard = orchard => {
    setSelectedId(orchard.id)
    setOrchardName(orchard.name)
    setInput(`${orchard.lat}, ${orchard.lon}`)
    setCoords({ lat: orchard.lat, lon: orchard.lon })
    setEditOrchardId(null)
    setEditOrchardName('')
    setEditOrchardCoords('')
  }

  const handleEditOrchard = orchard => {
    setEditOrchardId(orchard.id)
    setEditOrchardName(orchard.name)
    setEditOrchardCoords(`${orchard.lat}, ${orchard.lon}`)
  }

  const handleSaveEdit = async orchard => {
    try {
      const parsed = parseCoords(editOrchardCoords || '')
      const decision = orchard.lastDecision || {
        verdict: 'ESPERAR / VENTANA DE SECADO',
        level: 'amber',
        timestamp: new Date().toISOString(),
      }
      const body = {
        userId,
        orchard: {
          id: orchard.id,
          name: editOrchardName || 'Huerto sin nombre',
          lat: parsed.lat,
          lon: parsed.lon,
        },
        decision,
      }
      const res = await fetch('/.netlify/functions/save-orchard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || 'No se pudo guardar el huerto')
      }
      const payload = await res.json()
      setOrchards(payload.orchards || [])
      setSelectedId(orchard.id)
      setOrchardName(editOrchardName || 'Huerto sin nombre')
      setCoords({ lat: parsed.lat, lon: parsed.lon })
      setInput(`${parsed.lat}, ${parsed.lon}`)
      setEditOrchardId(null)
      setEditOrchardName('')
      setEditOrchardCoords('')
    } catch (err) {
      setError(err.message || 'Error al editar huerto')
    }
  }

  const handleCancelEdit = () => {
    setEditOrchardId(null)
    setEditOrchardName('')
    setEditOrchardCoords('')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleFeedbackSubmit = event => {
    event.preventDefault()
    setFeedbackSeen(true)
    fetch('/.netlify/functions/set-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, feedbackSeen: true }),
    }).catch(() => {})
    setFeedbackOpen(false)
  }

  const handleRegisterSubmit = async event => {
    event.preventDefault()
    setRegisterError('')
    if (!registerName.trim() || !registerEmail.trim()) {
      setRegisterError('Nombre y correo son obligatorios.')
      return
    }
    setRegisterLoading(true)
    try {
      // LIMPIAR ESTADO ANTES DE CARGAR NUEVOS DATOS (CRÍTICO PARA SEGURIDAD)
      setOrchards([])
      setSelectedId(null)
      setDecision(null)
      setForecast(null)
      setLastQueryAt(null)
      setProvinceName('—')
      setCoords(DEFAULT_COORDS)
      setInput(`${DEFAULT_COORDS.lat}, ${DEFAULT_COORDS.lon}`)
      
      const res = await fetch('/.netlify/functions/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName.trim(), email: registerEmail.trim() }),
      })
      if (!res.ok) throw new Error('No se pudo guardar tus datos.')
      const payload = await res.json()
      setUserId(payload.userId)
      setUserName(payload.userName || registerName.trim())
      setTrialStart(payload.trialStart)
      setTrialDay(payload.trialDay)
      setFeedbackSeen(Boolean(payload.feedbackSeen))
      setOrchards(payload.orchards || [])
      if (payload.orchards?.length) {
        setSelectedId(payload.orchards[0].id)
        setCoords({ lat: payload.orchards[0].lat, lon: payload.orchards[0].lon })
        setInput(`${payload.orchards[0].lat}, ${payload.orchards[0].lon}`)
      } else {
        setSelectedId(null)
        setCoords(DEFAULT_COORDS)
        setInput('')
      }
      setRegisterOpen(false)
    } catch (err) {
      setRegisterError(err.message || 'Error inesperado')
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleFeedbackClose = () => {
    setFeedbackSeen(true)
    fetch('/.netlify/functions/set-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, feedbackSeen: true }),
    }).catch(() => {})
    setFeedbackOpen(false)
  }

  const handleLogout = () => {
    setUserId(null)
    setUserName('')
    setOrchards([])
    setSelectedId(null)
    setCoords(DEFAULT_COORDS)
    setInput('')
    setDecision(null)
    setForecast(null)
    setLastQueryAt(null)
    setProvinceName('—')
    setRegisterOpen(true)
    setEditOrchardId(null)
    setEditOrchardName('')
    setEditOrchardCoords('')
  }

  const handleDeleteOrchard = async (orchardId, event) => {
    event.stopPropagation()
    if (!confirm('¿Eliminar este huerto?')) return
    try {
      const res = await fetch('/.netlify/functions/delete-orchard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orchardId }),
      })
      if (!res.ok) throw new Error('No se pudo eliminar')
      const payload = await res.json()
      setOrchards(payload.orchards || [])
      if (selectedId === orchardId) {
        setSelectedId(null)
        setCoords(DEFAULT_COORDS)
        setInput(`${DEFAULT_COORDS.lat}, ${DEFAULT_COORDS.lon}`)
      }
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <div className="hero-top">
            <p className="eyebrow">SaaS decisión cosecha cítricos · España 🍊</p>
            {userId && (
              <div className="user-info">
                <span className="user-name">{userName}</span>
                <button className="logout-btn" onClick={handleLogout} title="Desconectar">
                  <LogOut size={16} /> Desconectar
                </button>
              </div>
            )}
          </div>
          <h1>¿Recolectar en las próximas 48h?</h1>
          <p className="lede">
            Introduce las coordenadas del huerto y te mostramos una recomendación clara basada en previsión
            meteorológica real.
          </p>
          <p className="badge">Día {trialDay} de 7 de prueba gratuita</p>
          {trialExpired && (
            <p className="trial-warning">Prueba finalizada: el resultado principal sigue activo; funciones avanzadas limitadas.</p>
          )}
        </div>
      </header>

      <section className="panel">
        <div className="top-row">
          <div className="left-stack">
            <form className="coords-form" onSubmit={handleSubmit}>
              <label htmlFor="coords">Coordenadas (latitud, longitud)</label>
              <div className="input-row">
                <input
                  id="coords"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pega aquí desde Google Maps (ej. 39.4699, -0.3763)"
                  autoComplete="off"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Consultar'}
                </button>
              </div>
              <p className="coords-hint">Solo la primera vez por huerto. Guárdalo y después usa 'Mis huertos'.</p>
              {error && <p className="error">{error}</p>}
            </form>

            <div className="info-card">
              <p className="status-label title-lg">Contexto de la consulta</p>
              <div className="context-row">
                <span className="context-label">Fecha y hora</span>
                <span className="context-value">{contextTime}</span>
              </div>
              <div className="context-row">
                <span className="context-label">Validez</span>
                <span className="context-value">{validityUntil}</span>
              </div>
              <div className="context-row">
                <span className="context-label">Estabilidad meteorológica</span>
                <span className="context-value">{stability}</span>
              </div>
            </div>
          </div>

          <div className="orchard-card">
            <div className="orchard-header">
              <p className="status-label">Mis huertos</p>
              <span className="orchard-count">{orchards.length}/10</span>
            </div>
            <div className="orchard-name">
              <label htmlFor="orchard-name">Nombre del huerto</label>
              <input
                id="orchard-name"
                type="text"
                value={orchardName}
                onChange={e => setOrchardName(e.target.value)}
                placeholder="Huerto Naranjos Norte"
              />
            </div>
            <button className="save-btn" type="button" onClick={handleSaveOrchard} disabled={loading || trialExpired || !userId}>
              <Save size={18} /> Guardar huerto
            </button>
            <div className="orchard-list">
              {orchards.length === 0 && <p className="muted">Aún no hay huertos guardados.</p>}
              {orchards.map(o => (
                <div
                  key={o.id}
                  className={`orchard-item ${selectedId === o.id ? 'active' : ''}`}
                >
                  <button
                    className="orchard-item-btn"
                    onClick={() => handleSelectOrchard(o)}
                  >
                    <div>
                      <p className="orchard-title">{o.name}</p>
                      <p className="orchard-meta">{o.lat.toFixed(4)}, {o.lon.toFixed(4)}</p>
                    </div>
                    <div className={`pill ${o.lastDecision?.level || 'neutral'}`}>
                      {o.lastDecision?.verdict || '—'}
                    </div>
                  </button>
                  <button
                    className="edit-orchard-btn"
                    onClick={e => { e.stopPropagation(); handleEditOrchard(o) }}
                    title="Editar huerto"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="delete-orchard-btn"
                    onClick={e => handleDeleteOrchard(o.id, e)}
                    title="Eliminar huerto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {editOrchardId && (
              <div className="edit-panel">
                <p className="status-label">Editar huerto</p>
                <label>Nombre</label>
                <input
                  type="text"
                  value={editOrchardName}
                  onChange={e => setEditOrchardName(e.target.value)}
                  placeholder="Nuevo nombre"
                />
                <label>Coordenadas (lat, lon)</label>
                <input
                  type="text"
                  value={editOrchardCoords}
                  onChange={e => setEditOrchardCoords(e.target.value)}
                  placeholder="Pega aquí desde Google Maps"
                />
                <div className="edit-actions">
                  <button
                    className="save-btn"
                    type="button"
                    onClick={() => {
                      const orchard = orchards.find(x => x.id === editOrchardId)
                      if (orchard) handleSaveEdit(orchard)
                    }}
                    disabled={loading || trialExpired || !userId}
                  >
                    Guardar cambios
                  </button>
                  <button className="cancel-btn" type="button" onClick={handleCancelEdit}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="info-card">
          <p className="status-label title-lg">Info ventana de secado</p>
          <ul className="info-list">
            <li>Se calcula con la previsión real de las próximas 48 h (Open-Meteo).</li>
            <li>Tramos de 6 h con lluvia ≤ 0.1 mm/h y humedad &lt; 85%, deslizándose hora a hora (puede haber solapes si sigue seco).</li>
            <li>Mostramos la 1ª ventana que empieza en &lt;24 h y la 1ª que empieza entre 24–48 h.</li>
            <li>Si no hay ventana: suele ser por lluvia prevista (pico {forecast ? `${forecast.summary.maxPrecip.toFixed(1)} mm` : '—'}) o humedad media {forecast ? `${forecast.summary.avgHumidity.toFixed(0)}%` : '—'}.</li>
          </ul>
        </div>

        <div className="status-grid">
          <div className={cardClass}>
            <div className="status-head">
              <p className="status-label title-lg">Resultado principal</p>
              {statusIcon}
            </div>
            <h2>{decision ? decision.verdict : 'Introduce coordenadas'}</h2>
            {decision && <p className="seal">{sealText}</p>}
            <p className="validity">Válida hasta {validityUntil}</p>
            <p className="next-window">{nextWindowText}</p>
            <p className="status-reason">{decision ? decision.reason : 'Esperando ubicación válida.'}</p>
            <div className="summary">
              <p className="summary-title">Resumen rápido</p>
              <p className="summary-description">
                Decide en 5s: validez de la recomendación, riesgo principal y cuántas ventanas de secado hay (crítico para cortar fruta sin humedad).
              </p>
              <div className="summary-grid">
                <div>
                  <p className="metric-label">Validez</p>
                  <p className="metric-value">Próximas 48 h</p>
                </div>
                <div>
                  <p className="metric-label">Riesgo principal</p>
                  <p className="metric-value">{primaryRisk}</p>
                </div>
                <div>
                  <p className="metric-label">Ventanas secas</p>
                  <p className="metric-value">{decision?.windows?.length || 0}</p>
                </div>
                <div>
                  <p className="metric-label">Ventana &lt; 24h</p>
                  {firstWindow24 ? (
                    <p className={`metric-value highlight`}>
                      {new Date(firstWindow24.start).toLocaleDateString()} · {new Date(firstWindow24.start).toLocaleTimeString()} → {new Date(firstWindow24.end).toLocaleTimeString()}
                    </p>
                  ) : (
                    <p className="metric-value">No detectada</p>
                  )}
                </div>
                <div>
                  <p className="metric-label">Ventana &lt;= 48h</p>
                  {firstWindow48 ? (
                    <p className={`metric-value highlight`}>
                      {new Date(firstWindow48.start).toLocaleDateString()} · {new Date(firstWindow48.start).toLocaleTimeString()} → {new Date(firstWindow48.end).toLocaleTimeString()}
                    </p>
                  ) : (
                    <p className="metric-value">No detectada</p>
                  )}
                </div>
              </div>
              {(firstWindow24 || firstWindow48) && (
                <div className="biz-callout">
                  {firstWindow24
                    ? `Existe una ventana segura: ${new Date(firstWindow24.start).toLocaleDateString()} · ${new Date(firstWindow24.start).toLocaleTimeString()} → ${new Date(firstWindow24.end).toLocaleTimeString()}`
                    : firstWindow48
                    ? `Existe una ventana segura en 24–48h: ${new Date(firstWindow48.start).toLocaleDateString()} · ${new Date(firstWindow48.start).toLocaleTimeString()} → ${new Date(firstWindow48.end).toLocaleTimeString()}`
                    : 'Sin ventana segura en las próximas 48h.'}
                </div>
              )}
            </div>
            <ul className="status-meta">
              <li>Ventana de secado buscada: ≥ 6 h sin lluvia</li>
              <li>Fuente: Open-Meteo (48 h, horario local)</li>
            </ul>
            <div className="cta-inline">Este criterio puede adaptarse a la operativa concreta de cada almacén.</div>
          </div>

          <div className="map-card">
            <div className="map-header">
              <p>Ubicación del huerto</p>
              <span>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</span>
              <button className="toggle-btn" type="button" onClick={() => setShowMap(!showMap)}>
                {showMap ? 'Ocultar mapa' : 'Ver mapa del huerto'}
              </button>
            </div>
            <>
              {showMap && (
                <div className="map-wrapper">
                  <MapContainer center={[coords.lat, coords.lon]} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                    <MapController center={[coords.lat, coords.lon]} />
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coords.lat, coords.lon]} icon={markerIcon}>
                      <Popup>Huerto cítrico</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
              <div className="map-compact">
                <div>
                  <p className="metric-label">Huerto</p>
                  <p className="metric-value">{orchardName || 'Huerto sin nombre'}</p>
                </div>
                <div>
                  <p className="metric-label">Coordenadas</p>
                  <p className="metric-value">{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</p>
                </div>
                <div>
                  <p className="metric-label">Provincia</p>
                  <p className="metric-value">{provinceName}</p>
                </div>
              </div>
              <div className="map-name">
                <MapPin size={16} />
                <input
                  type="text"
                  value={orchardName}
                  onChange={e => setOrchardName(e.target.value)}
                  placeholder="Nombre visible del huerto"
                />
              </div>
            </>
          </div>
        </div>

        <div className="dry-section">
          {!trialExpired && (
            <div className="dry-compact">
              <p className="status-label">Próxima ventana de secado</p>
              <p className="next-window">{nextWindowText}</p>
              <div className="dry-highlight-row">
                <div className="dry-highlight">
                  <p className="metric-label">1ª ventana en 24h</p>
                  {firstWindow24 ? (
                    <p className="metric-value highlight">
                      {new Date(firstWindow24.start).toLocaleDateString()} · {new Date(firstWindow24.start).toLocaleTimeString()} → {new Date(firstWindow24.end).toLocaleTimeString()}
                    </p>
                  ) : (
                    <p className="metric-value">
                      No detectada. Posible causa: lluvia prevista (pico {forecast ? forecast.summary.maxPrecip.toFixed(1) : '—'} mm) o humedad media {forecast ? forecast.summary.avgHumidity.toFixed(0) : '—'}%.
                    </p>
                  )}
                </div>
                <div className="dry-highlight">
                  <p className="metric-label">1ª ventana 24–48h</p>
                  {firstWindow48 ? (
                    <p className="metric-value highlight">
                      {new Date(firstWindow48.start).toLocaleDateString()} · {new Date(firstWindow48.start).toLocaleTimeString()} → {new Date(firstWindow48.end).toLocaleTimeString()}
                    </p>
                  ) : (
                    <p className="metric-value">
                      No detectada. Posible causa: lluvia prevista (pico {forecast ? forecast.summary.maxPrecip.toFixed(1) : '—'} mm) o humedad media {forecast ? forecast.summary.avgHumidity.toFixed(0) : '—'}%.
                    </p>
                  )}
                </div>
              </div>
              <button className="ghost-btn" type="button" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? 'Ocultar ventanas detalladas' : 'Ver ventanas detalladas'}
              </button>
              {showDetails && decision?.windows?.length ? (
                <div className="dry-section">
                  <div className="dry-header">
                    <div>
                      <p className="status-label">Ventanas detectadas</p>
                    </div>
                    <p className="chip">Criterio: 6 h seguidas con lluvia &lt;= 0.1 mm/h y humedad &lt; 85%</p>
                  </div>
                  <ul className="dry-list">
                    {decision.windows.slice(0, 6).map((win, idx) => (
                      <li key={idx} className="dry-item">
                        <div className="dry-times">
                          <span>{new Date(win.start).toLocaleString()}</span>
                          <span>→</span>
                          <span>{new Date(win.end).toLocaleString()}</span>
                        </div>
                        <div className="dry-metrics">
                          <span>Humedad media: {win.avgHumidity.toFixed(0)}%</span>
                          <span>Precip máx: {win.maxPrecip.toFixed(1)} mm/h</span>
                          <span>Viento máx: {win.maxWind.toFixed(0)} km/h</span>
                          <span>Temp mín: {win.minTemp.toFixed(0)} °C</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : showDetails && !decision?.windows?.length ? (
                <p className="dry-empty">Aún no se detectan 6 horas seguidas suficientemente secas en las próximas 48 h.</p>
              ) : null}
            </div>
          )}
        </div>

        <button className="ghost-btn" type="button" onClick={() => setShowMetrics(!showMetrics)}>
          {showMetrics ? 'Ocultar métricas' : 'Ver métricas (48h)'}
        </button>
        {showMetrics && (
          <div className="metrics">
            <p className="metrics-note">Datos agregados de la previsión real (próximas 48 h, Open-Meteo).</p>
            <div>
              <p className="metric-label">Precipitación máx.</p>
              <p className="metric-value">
                {forecast ? `${forecast.summary.maxPrecip.toFixed(1)} mm` : '—'}
              </p>
            </div>
            <div>
              <p className="metric-label">Humedad media</p>
              <p className="metric-value">
                {forecast ? `${forecast.summary.avgHumidity.toFixed(0)} %` : '—'}
              </p>
            </div>
            <div>
              <p className="metric-label">Viento máx.</p>
              <p className="metric-value">
                {forecast ? `${forecast.summary.maxWind.toFixed(0)} km/h` : '—'}
              </p>
            </div>
            <div>
              <p className="metric-label">Temp. mínima</p>
              <p className="metric-value">
                {forecast ? `${forecast.summary.minTemp.toFixed(0)} °C` : '—'}
              </p>
            </div>
          </div>
        )}

        <button className="ghost-btn" type="button" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Ocultar histórico' : 'Ver histórico (últimas 3)'}
        </button>
        {showHistory && (
          <div className="history-card">
            <div className="history-head">
              <div className="history-title">
                <p className="status-label">Histórico (últimas 3)</p>
                <span className="history-orchard">{selectedOrchard?.name || 'Huerto no identificado'}</span>
              </div>
              <Clock size={16} />
            </div>
            {!trialExpired && selectedOrchard?.history?.length ? (
              <ul className="history-list">
                {selectedOrchard.history.map((h, idx) => (
                  <li key={idx}>
                    <span className={`pill ${h.verdict.includes('NO') ? 'red' : h.verdict.includes('ESPERAR') ? 'amber' : 'green'}`}>
                      {h.verdict}
                    </span>
                    <span>{new Date(h.timestamp).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : trialExpired ? (
              <p className="muted">Histórico desactivado tras la prueba. Contáctanos para más.</p>
            ) : (
              <p className="muted">Sin histórico aún.</p>
            )}
          </div>
        )}

        <button className="ghost-btn" type="button" onClick={() => setShowWeekly(!showWeekly)}>
          {showWeekly ? 'Ocultar resumen semanal' : 'Ver resumen semanal'}
        </button>
        {showWeekly && (
          <div className="summary-row">
            <div className="weekly-card">
              <p className="status-label">Resumen semanal básico</p>
              {selectedOrchard && decision ? (
                <div className="weekly-content">
                  <div className="weekly-item">
                    <span className="weekly-label">Huerto:</span>
                    <span className="weekly-value">{selectedOrchard.name}</span>
                  </div>
                  <div className="weekly-item">
                    <span className="weekly-label">Recomendación actual:</span>
                    <span className={`weekly-value pill ${decision.level}`}>{decision.verdict}</span>
                  </div>
                  <div className="weekly-item">
                    <span className="weekly-label">Riesgo principal:</span>
                    <span className="weekly-value">{primaryRisk}</span>
                  </div>
                  {selectedOrchard.history?.length > 0 && (
                    <>
                      <div className="weekly-item">
                        <span className="weekly-label">Última consulta:</span>
                        <span className="weekly-value">{new Date(selectedOrchard.history[0].timestamp).toLocaleString()}</span>
                      </div>
                      <div className="weekly-item">
                        <span className="weekly-label">Histórico reciente:</span>
                        <span className="weekly-value">{selectedOrchard.history.slice(0, 3).map(h => h.verdict).join(' → ')}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="muted">Consulta un huerto para generar su resumen.</p>
              )}
            </div>
          </div>
        )}

        <footer className="footer">
          <p className="note">SaaS desarrollado por LIND Informática.</p>
        </footer>
      </section>

      {registerOpen && (
        <div className="feedback-backdrop">
          <div className="register-card">
            <p className="status-label">Bienvenida/o</p>
            <h3>Identificación para el servicio</h3>
            <p className="muted">
              Solo se solicita una vez. Puedes usar datos ficticios. Se almacena en Supabase para operar el servicio; no enviaremos correos ni te añadiremos a ninguna newsletter. Cumplimos LOPD y política de cookies. Al continuar aceptas cookies operativas.
            </p>
            <form className="feedback-form" onSubmit={handleRegisterSubmit}>
              <label>Nombre</label>
              <input
                type="text"
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                placeholder="Tu nombre"
                required
              />
              <label>Correo electrónico</label>
              <input
                type="email"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                placeholder="tuemail@ejemplo.com"
                required
              />
              {registerError && <p className="error">{registerError}</p>}
              <button type="submit" className="save-btn" disabled={registerLoading}>
                {registerLoading ? 'Guardando...' : 'Continuar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {feedbackOpen && (
        <div className="feedback-backdrop">
          <div className="feedback-card">
            <div className="feedback-head">
              <p className="status-label">Feedback rápido</p>
              <button className="close-btn" onClick={handleFeedbackClose}>×</button>
            </div>
            <p className="muted">Ayúdanos a mejorar: valoración y comentario (solo se muestra una vez).</p>
            <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
              <label>Valoración (1-5)</label>
              <div className="stars">
                {[5, 4, 3, 2, 1].map(value => (
                  <button
                    key={value}
                    type="button"
                    className={`star-btn ${Number(feedbackRating) >= value ? 'active' : ''}`}
                    onClick={() => setFeedbackRating(String(value))}
                    aria-label={`Valoración ${value}`}
                  >
                    &#9733;
                  </button>
                ))}
              </div>
              <label>Comentarios</label>
              <textarea
                value={feedbackComment}
                onChange={e => setFeedbackComment(e.target.value)}
                placeholder="Qué te ayudaría a decidir más rápido..."
              />
              <button type="submit" className="save-btn">Enviar</button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
