import React, { useEffect, useMemo, useState } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
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

function analyzeDataQuality(hourly, expectedHours = 48) {
  const keys = ['precipitation', 'relativehumidity_2m', 'temperature_2m', 'windspeed_10m', 'time']
  const lengths = keys.map(key => (hourly?.[key]?.length ? hourly[key].length : 0))
  const minLen = Math.min(...lengths)
  const length = Math.min(minLen, expectedHours)
  let missingHours = 0

  for (let i = 0; i < expectedHours; i++) {
    const hasAll = keys.every(key => {
      const value = hourly?.[key]?.[i]
      return value !== undefined && value !== null && !Number.isNaN(value)
    })
    if (!hasAll) missingHours += 1
  }

  const timeSeries = (hourly?.time || []).slice(0, length)
  let maxGap = 0
  for (let i = 1; i < timeSeries.length; i++) {
    const prev = Date.parse(timeSeries[i - 1])
    const curr = Date.parse(timeSeries[i])
    if (Number.isFinite(prev) && Number.isFinite(curr)) {
      const diff = Math.abs(curr - prev) / (1000 * 60 * 60)
      if (diff > maxGap) maxGap = diff
    }
  }
  const lowResolution = maxGap > 1.5

  const blockHours = 6
  const blocks = Math.floor(length / blockHours)
  const blockAverages = (series = []) => {
    const avgs = []
    for (let i = 0; i < blocks; i++) {
      const slice = series.slice(i * blockHours, i * blockHours + blockHours)
      if (!slice.length) continue
      const avg = slice.reduce((acc, val) => acc + Number(val || 0), 0) / slice.length
      avgs.push(avg)
    }
    return avgs
  }

  const range = values => (values.length ? Math.max(...values) - Math.min(...values) : 0)
  const precipRange = range(blockAverages(hourly?.precipitation))
  const humidityRange = range(blockAverages(hourly?.relativehumidity_2m))
  const windRange = range(blockAverages(hourly?.windspeed_10m))
  const unstable = precipRange >= 0.6 || humidityRange >= 18 || windRange >= 18

  return { missingHours, lowResolution, unstable }
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
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [demoName, setDemoName] = useState('')
  const [demoSurname, setDemoSurname] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoStatus, setDemoStatus] = useState('')
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')
  const [trialStart, setTrialStart] = useState(null)
  const [feedbackSeen, setFeedbackSeen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [showWeekly, setShowWeekly] = useState(false)
  const [editOrchardId, setEditOrchardId] = useState(null)
  const [editOrchardName, setEditOrchardName] = useState('')
  const [editOrchardCoords, setEditOrchardCoords] = useState('')
  const [lastQueryAt, setLastQueryAt] = useState(null)
  const [provinceName, setProvinceName] = useState('—')
  const [systemStatus, setSystemStatus] = useState('idle')
  const [systemNote, setSystemNote] = useState('')
  const [confidenceLevel, setConfidenceLevel] = useState('Alta')
  const [confidenceReason, setConfidenceReason] = useState('')
  const [dataSource, setDataSource] = useState('Open-Meteo')
  const [dataTimestamp, setDataTimestamp] = useState(null)
  const [lastValidDecision, setLastValidDecision] = useState(null)
  const [lastValidForecast, setLastValidForecast] = useState(null)
  const [lastValidAt, setLastValidAt] = useState(null)
  const [showTech, setShowTech] = useState(false)
  const [radarTimestamp, setRadarTimestamp] = useState(null)
  const [radarError, setRadarError] = useState('')

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
  const activeDecision = useMemo(() => {
    if (systemStatus === 'no-data') return null
    if (systemStatus === 'timeout' && lastValidDecision) return lastValidDecision
    return decision
  }, [decision, lastValidDecision, systemStatus])
  const activeForecast = useMemo(() => {
    if (systemStatus === 'no-data') return null
    if (systemStatus === 'timeout' && lastValidForecast) return lastValidForecast
    return forecast
  }, [forecast, lastValidForecast, systemStatus])
  const stability = useMemo(() => {
    if (!activeForecast) return '—'
    const isStable = activeForecast.summary.maxPrecip <= 0.2 && activeForecast.summary.avgHumidity < 70
    return isStable ? 'Alta' : 'Media'
  }, [activeForecast])
  const contextTime = useMemo(() => {
    if (selectedOrchard?.lastDecision?.timestamp) {
      return new Date(selectedOrchard.lastDecision.timestamp).toLocaleString()
    }
    return lastQueryAt || '—'
  }, [lastQueryAt, selectedOrchard])
  const lastUpdateText = useMemo(() => {
    if (!dataTimestamp) return '—'
    return new Date(dataTimestamp).toLocaleString()
  }, [dataTimestamp])

  useEffect(() => {
    setRegisterOpen(true)
  }, [])

  const handleDemoSubmit = event => {
    event.preventDefault()
    setDemoStatus('Enviando solicitud...')
    const payload = new URLSearchParams({
      'form-name': 'demo-request',
      nombre: demoName,
      apellidos: demoSurname,
      email: demoEmail,
    })
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
    })
      .then(res => {
        if (!res.ok) throw new Error('network')
        setDemoStatus('Solicitud enviada. Te contactamos pronto.')
        setDemoName('')
        setDemoSurname('')
        setDemoEmail('')
      })
      .catch(() => {
        setDemoStatus('No se pudo enviar. Inténtalo de nuevo.')
      })
  }

  useEffect(() => {
    if (!userId) return
    const fetchForecast = async () => {
      setLoading(true)
      setError('')
      setSystemNote('')
      setSystemStatus('loading')
      let timeoutId
      try {
        const controller = new AbortController()
        timeoutId = setTimeout(() => controller.abort(), 7000)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,cloudcover&forecast_days=2&timezone=auto`
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error('No se pudo obtener la previsión')
        const data = await res.json()
        if (!data?.hourly) throw new Error('Datos incompletos')
        const windows = findDryWindows(data.hourly)
        const cloudcoverSeries = Array.isArray(data.hourly.cloudcover)
          ? data.hourly.cloudcover.slice(0, 48)
          : []
        const avgCloudcover = cloudcoverSeries.length
          ? cloudcoverSeries.reduce((a, b) => a + b, 0) / cloudcoverSeries.length
          : null
        const quality = analyzeDataQuality(data.hourly)
        const fetchedAt = new Date().toISOString()
        let status = 'ok'
        let confidence = 'Alta'
        let note = ''
        let reason = ''
        if (quality.missingHours > 0) {
          status = 'partial'
          confidence = 'Limitada'
          reason = `${quality.missingHours} horas sin datos en la previsión.`
          note = `Confianza limitada: ${reason}`
        } else if (quality.unstable) {
          status = 'unstable'
          confidence = 'Media'
          note = 'Escenario inestable: ventanas cortas y riesgo de cambio.'
        } else if (quality.lowResolution) {
          status = 'low-res'
          confidence = 'Media'
          note = 'Resolución meteorológica media.'
        }
        setForecast({
          summary: {
            maxPrecip: Math.max(...data.hourly.precipitation.slice(0, 48)),
            avgHumidity: data.hourly.relativehumidity_2m.slice(0, 48).reduce((a, b) => a + b, 0) / 48,
            maxWind: Math.max(...data.hourly.windspeed_10m.slice(0, 48)),
            minTemp: Math.min(...data.hourly.temperature_2m.slice(0, 48)),
            avgCloudcover,
          },
          hourly: data.hourly,
          windows,
        })
        const evalResult = evaluateDecision(data.hourly, windows)
        setDecision(evalResult)
        setLastValidDecision(evalResult)
        setLastValidForecast({
          summary: {
            maxPrecip: Math.max(...data.hourly.precipitation.slice(0, 48)),
            avgHumidity: data.hourly.relativehumidity_2m.slice(0, 48).reduce((a, b) => a + b, 0) / 48,
            maxWind: Math.max(...data.hourly.windspeed_10m.slice(0, 48)),
            minTemp: Math.min(...data.hourly.temperature_2m.slice(0, 48)),
            avgCloudcover,
          },
          hourly: data.hourly,
          windows,
        })
        setLastValidAt(fetchedAt)
        setDataTimestamp(fetchedAt)
        setDataSource('Open-Meteo')
        setConfidenceLevel(confidence)
        setConfidenceReason(reason || note)
        setSystemStatus(status)
        setSystemNote(note)
        setLastQueryAt(new Date().toLocaleString())
        await updateOrchardRecord(evalResult)
        setMetrics(prev => ({ ...prev, queries: prev.queries + 1 }))
      } catch (err) {
        if (err.name === 'AbortError') {
          if (lastValidDecision && lastValidForecast) {
            setDecision(lastValidDecision)
            setForecast(lastValidForecast)
            setDataTimestamp(lastValidAt)
            setSystemStatus('timeout')
            setSystemNote('Latencia alta: se mantiene el último resultado fiable.')
            setConfidenceLevel('Limitada')
            setConfidenceReason('Tiempo de respuesta superado; se mantiene el último cálculo fiable.')
            setLastQueryAt(lastValidAt ? new Date(lastValidAt).toLocaleString() : null)
            return
          }
          setSystemStatus('no-data')
          setSystemNote('Datos no disponibles temporalmente.')
          setConfidenceLevel('Limitada')
          setConfidenceReason('Sin datos meteorológicos actuales.')
          setForecast(null)
          setDecision(null)
          setDataTimestamp(null)
          setLastQueryAt(null)
          return
        }
        setSystemStatus('no-data')
        setSystemNote('Datos no disponibles temporalmente.')
        setConfidenceLevel('Limitada')
        setConfidenceReason('Sin datos meteorológicos actuales.')
        setForecast(null)
        setDecision(null)
        setDataTimestamp(null)
        setLastQueryAt(null)
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
        setLoading(false)
      }
    }
    fetchForecast()
  }, [coords])

  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const res = await fetch('https://tilecache.rainviewer.com/api/maps.json')
        if (!res.ok) throw new Error('No se pudo cargar el radar')
        const times = await res.json()
        if (!Array.isArray(times) || !times.length) throw new Error('Radar sin datos')
        setRadarTimestamp(times[times.length - 1])
        setRadarError('')
      } catch (err) {
        setRadarError('Radar no disponible')
      }
    }
    fetchRadar()
  }, [])

  useEffect(() => {
    if (!coords?.lat || !coords?.lon) return
    const fetchProvince = async () => {
      try {
        const url = `/.netlify/functions/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('No se pudo obtener la provincia')
        const data = await res.json()
        const name = data?.province || '—'
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
    const confidenceClass = confidenceLevel === 'Alta' ? 'confidence-high' : confidenceLevel === 'Media' ? 'confidence-medium' : 'confidence-limited'
    if (!activeDecision) return `status neutral ${confidenceClass}`
    return `status ${activeDecision.level} ${confidenceClass}`
  }, [activeDecision, confidenceLevel])

  const statusIcon = useMemo(() => {
    if (systemStatus === 'no-data' || systemStatus === 'timeout') return <Clock size={28} />
    if (!activeDecision) return null
    if (activeDecision.level === 'green') return <CheckCircle size={28} />
    if (activeDecision.level === 'amber') return <AlertTriangle size={28} />
    return <Octagon size={28} />
  }, [activeDecision, systemStatus])

  const primaryRisk = useMemo(() => {
    if (!activeForecast) return '—'
    const { maxPrecip, avgHumidity, maxWind } = activeForecast.summary
    if (maxPrecip >= 1) return 'Lluvia'
    if (avgHumidity >= 85) return 'Humedad'
    if (maxWind >= 35) return 'Viento'
    return 'Bajo'
  }, [activeForecast])

  const radarUpdatedAt = useMemo(() => {
    if (!radarTimestamp) return '—'
    return new Date(radarTimestamp * 1000).toLocaleString()
  }, [radarTimestamp])

  const windowsCount = activeDecision?.windows?.length
  const firstWindow = activeDecision?.windows?.[0] || null
  const firstWindow24 = useMemo(() => {
    if (!activeDecision?.windows?.length) return null
    const now = Date.now()
    return activeDecision.windows.find(w => (Date.parse(w.start) - now) / (1000 * 60 * 60) <= 24) || null
  }, [activeDecision])
  const firstWindow48 = useMemo(() => {
    if (!activeDecision?.windows?.length) return null
    const now = Date.now()
    return activeDecision.windows.find(w => {
      const hours = (Date.parse(w.start) - now) / (1000 * 60 * 60)
      return hours > 24 && hours <= 48
    }) || null
  }, [activeDecision])
  const nextWindow = firstWindow24 || firstWindow48 || firstWindow

  const sealText = useMemo(() => {
    if (systemStatus === 'no-data') return ''
    if (systemStatus === 'timeout') return 'Última recomendación mantenida por latencia'
    if (!activeDecision) return ''
    if (systemStatus === 'partial') return 'Recomendación condicionada (datos parciales)'
    if (systemStatus === 'unstable') return 'Escenario inestable: ventanas cortas'
    if (systemStatus === 'low-res') return 'Resolución meteorológica media'
    if (activeDecision.level === 'red') return 'No se recomienda recolectar hoy'
    if (activeDecision.level === 'amber') return 'Recomendación condicionada: espera la ventana segura'
    return 'Se recomienda recolectar hoy'
  }, [activeDecision, systemStatus])

  const nextWindowText = useMemo(() => {
    if (systemStatus === 'no-data') return 'Sin actualización meteorológica actual.'
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
  }, [nextWindow, systemStatus])
  const validityUntil = useMemo(() => {
    if (activeForecast?.hourly?.time?.[47]) return new Date(activeForecast.hourly.time[47]).toLocaleString()
    const ts = Date.now() + 48 * 60 * 60 * 1000
    return new Date(ts).toLocaleString()
  }, [activeForecast])

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
    if (!registerEmail.trim() || !registerPassword.trim()) {
      setRegisterError('Usuario y contraseña son obligatorios.')
      return
    }
    const effectiveName = registerName.trim() || registerEmail.trim()
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
      setSystemStatus('idle')
      setSystemNote('')
      setConfidenceLevel('Alta')
      setConfidenceReason('')
      setDataTimestamp(null)
      setLastValidDecision(null)
      setLastValidForecast(null)
      setLastValidAt(null)
      setShowTech(false)
      
      const res = await fetch('/.netlify/functions/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: effectiveName, email: registerEmail.trim() }),
      })
      if (!res.ok) throw new Error('No se pudo guardar tus datos.')
      const payload = await res.json()
      setUserId(payload.userId)
      setUserName(payload.userName || effectiveName)
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
    setSystemStatus('idle')
    setSystemNote('')
    setConfidenceLevel('Alta')
    setConfidenceReason('')
    setDataTimestamp(null)
    setLastValidDecision(null)
    setLastValidForecast(null)
    setLastValidAt(null)
    setShowTech(false)
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
          <button className="save-btn" type="button" onClick={() => setDemoOpen(true)}>
            Pide tu usuario
          </button>
          <p className="badge">Día {trialDay} de 7 de prueba gratuita</p>
          {trialExpired && (
            <p className="trial-warning">Prueba finalizada: el resultado principal sigue activo; funciones avanzadas limitadas.</p>
          )}
        </div>
      </header>

      <section className="panel">
        <div className="control-row">
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

        <div className="map-section">
          <div className="map-card">
            <div className="map-header">
              <div className="map-title">
                <p>Mapa meteorológico</p>
                <span>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</span>
              </div>
              <div className="map-layers">
                <span className="map-layer-pill">Radar de lluvia</span>
              </div>
            </div>
            {systemStatus === 'no-data' ? (
              <div className="map-empty">
                <p className="map-error">Datos meteorológicos no disponibles</p>
                <p className="muted">Mapa desactivado; se mantiene la última recomendación válida.</p>
              </div>
            ) : !activeForecast ? (
              <div className="map-empty">
                <p className="muted">Cargando datos meteorológicos...</p>
              </div>
            ) : radarError ? (
              <div className="map-empty">
                <p className="map-error">{radarError}</p>
                <p className="muted">No se pudo cargar el radar de lluvia.</p>
              </div>
            ) : (
              <>
                <div className="map-wrapper">
                  <MapContainer center={[coords.lat, coords.lon]} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                    <MapController center={[coords.lat, coords.lon]} />
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {radarTimestamp && (
                      <TileLayer
                        attribution='&copy; RainViewer'
                        url={`https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/256/{z}/{x}/{y}/2/1_1.png`}
                        opacity={0.7}
                      />
                    )}
                    <Circle
                      center={[coords.lat, coords.lon]}
                      radius={6000}
                      pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.18 }}
                    />
                    <Marker position={[coords.lat, coords.lon]} icon={markerIcon}>
                      <Popup>Huerto cítrico</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="map-legend">
                  <div>
                    <p className="metric-label">Radar de lluvia</p>
                    <p className="metric-value">Actualizado: {radarUpdatedAt}</p>
                  </div>
                  <span className="map-legend-note">RainViewer</span>
                </div>
              </>
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
          </div>
        </div>

        <div className="decision-row">
          <div className={`${cardClass} primary decision-card`}>
            <div className="status-head">
              <p className="status-label title-lg">Decisión operativa</p>
              {statusIcon}
            </div>
            <div className="confidence-row">
              <span className={`confidence-pill ${confidenceLevel === 'Alta' ? 'high' : confidenceLevel === 'Media' ? 'medium' : 'limited'}`}>
                Confianza {confidenceLevel}
              </span>
              {systemNote && <span className="confidence-note">{systemNote}</span>}
            </div>
            <h2>{systemStatus === 'no-data' ? 'Datos no disponibles temporalmente' : activeDecision ? activeDecision.verdict : 'Introduce coordenadas'}</h2>
            {sealText && <p className="seal">{sealText}</p>}
            {systemStatus === 'no-data' ? (
              <>
                {lastValidDecision && (
                  <p className="status-reason">
                    Última recomendación válida: {lastValidDecision.verdict}
                  </p>
                )}
                <p className="validity">Última actualización fiable: {lastValidAt ? new Date(lastValidAt).toLocaleString() : '—'}</p>
              </>
            ) : (
              <>
                <p className="validity">Válida hasta {validityUntil}</p>
                <p className="next-window">{nextWindowText}</p>
                <p className="status-reason">{activeDecision ? activeDecision.reason : 'Esperando ubicación válida.'}</p>
                {systemStatus === 'timeout' && (
                  <p className="status-reason">Última actualización fiable: {lastUpdateText}</p>
                )}
              </>
            )}
            <div className="summary">
              <p className="summary-title">Resumen rápido</p>
              <p className="summary-description">
                Validez de la recomendación, riesgo principal y ventanas de secado críticas para decidir.
              </p>
              <div className="summary-grid">
                <div>
                  <p className="metric-label">Riesgo principal</p>
                  <p className="metric-value">{primaryRisk}</p>
                </div>
                <div>
                  <p className="metric-label">Ventanas (48h)</p>
                  <p className="metric-value">{windowsCount === undefined || windowsCount === null ? '—' : windowsCount}</p>
                </div>
              </div>
            </div>
            <div className="cta-inline">Este criterio puede adaptarse a la operativa concreta de cada almacén.</div>
          </div>
        </div>

        <div className="support-section">
          <div className="support-head">
            <p className="status-label title-lg">Justificación técnica</p>
          </div>
          <div className="support-grid">
            <div className="info-card">
              <p className="status-label">Contexto de la consulta</p>
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
              <div className="context-row">
                <span className="context-label">Riesgo principal</span>
                <span className="context-value">{primaryRisk}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-head">
                <p className="status-label">Info ventana de secado</p>
                <button className="ghost-btn" type="button" onClick={() => setShowCalc(!showCalc)}>
                  {showCalc ? 'Ocultar detalle' : 'Ver detalle'}
                </button>
              </div>
              <p className="muted">Resumen activo basado en 48h. Detalle disponible bajo demanda.</p>
              {showCalc && (
                <>
                  <ul className="info-list">
                    <li>Se calcula con la previsión real de las próximas 48 h (Open-Meteo).</li>
                    <li>Tramos de 6 h con lluvia ≤ 0.1 mm/h y humedad &lt; 85%, deslizándose hora a hora.</li>
                    <li>Mostramos la 1ª ventana que empieza en &lt;24 h y la 1ª que empieza entre 24–48 h.</li>
                    <li>Si no hay ventana: suele ser por lluvia prevista (pico {activeForecast ? `${activeForecast.summary.maxPrecip.toFixed(1)} mm` : '—'}) o humedad media {activeForecast ? `${activeForecast.summary.avgHumidity.toFixed(0)}%` : '—'}.</li>
                  </ul>
                  <ul className="status-meta">
                    <li>Ventana de secado buscada: ≥ 6 h sin lluvia</li>
                    <li>Fuente: Open-Meteo (48 h, horario local)</li>
                  </ul>
                </>
              )}
            </div>

            {!trialExpired && (
              <div className="dry-section">
                <div className="dry-compact">
                  <p className="status-label">Ventana de secado</p>
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
                          No detectada. Posible causa: lluvia prevista (pico {activeForecast ? activeForecast.summary.maxPrecip.toFixed(1) : '—'} mm) o humedad media {activeForecast ? activeForecast.summary.avgHumidity.toFixed(0) : '—'}%.
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
                          No detectada. Posible causa: lluvia prevista (pico {activeForecast ? activeForecast.summary.maxPrecip.toFixed(1) : '—'} mm) o humedad media {activeForecast ? activeForecast.summary.avgHumidity.toFixed(0) : '—'}%.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="trace-card trace-full">
              <p className="status-label">Trazabilidad y respaldo</p>
              <button className="ghost-btn" type="button" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? 'Ocultar detalle horario' : 'Ver detalle horario'}
              </button>
              {showDetails && activeDecision?.windows?.length ? (
                <div className="dry-section">
                  <div className="dry-header">
                    <div>
                      <p className="status-label">Ventanas detectadas</p>
                    </div>
                    <p className="chip">Criterio: 6 h seguidas con lluvia &lt;= 0.1 mm/h y humedad &lt; 85%</p>
                  </div>
                  <ul className="dry-list">
                    {activeDecision.windows.slice(0, 6).map((win, idx) => (
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
              ) : showDetails && !activeDecision?.windows?.length ? (
                <p className="dry-empty">Aún no se detectan 6 horas seguidas suficientemente secas en las próximas 48 h.</p>
              ) : null}

              <button className="ghost-btn" type="button" onClick={() => setShowMetrics(!showMetrics)}>
                {showMetrics ? 'Ocultar métricas' : 'Ver métricas (48h)'}
              </button>
              {showMetrics && (
                <div className="metrics">
                  <p className="metrics-note">Datos agregados de la previsión real (próximas 48 h, Open-Meteo).</p>
                  <div>
                    <p className="metric-label">Precipitación máx.</p>
                    <p className="metric-value">
                      {activeForecast ? `${activeForecast.summary.maxPrecip.toFixed(1)} mm` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="metric-label">Humedad media</p>
                    <p className="metric-value">
                      {activeForecast ? `${activeForecast.summary.avgHumidity.toFixed(0)} %` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="metric-label">Viento máx.</p>
                    <p className="metric-value">
                      {activeForecast ? `${activeForecast.summary.maxWind.toFixed(0)} km/h` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="metric-label">Temp. mínima</p>
                    <p className="metric-value">
                      {activeForecast ? `${activeForecast.summary.minTemp.toFixed(0)} °C` : '—'}
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
                    {selectedOrchard && activeDecision ? (
                      <div className="weekly-content">
                        <div className="weekly-item">
                          <span className="weekly-label">Huerto:</span>
                          <span className="weekly-value">{selectedOrchard.name}</span>
                        </div>
                        <div className="weekly-item">
                          <span className="weekly-label">Recomendación actual:</span>
                          <span className={`weekly-value pill ${activeDecision.level}`}>{activeDecision.verdict}</span>
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
            </div>
          </div>

          <button className="ghost-btn" type="button" onClick={() => setShowTech(!showTech)}>
            {showTech ? 'Ocultar detalle técnico' : 'Ver detalle técnico'}
          </button>
          {showTech && (
            <div className="tech-card">
              <p className="status-label">Detalle técnico</p>
              <div className="tech-row">
                <span className="tech-label">Fuente</span>
                <span className="tech-value">{dataSource}</span>
              </div>
              <div className="tech-row">
                <span className="tech-label">Timestamp</span>
                <span className="tech-value">{lastUpdateText}</span>
              </div>
              <div className="tech-row">
                <span className="tech-label">Confianza</span>
                <span className="tech-value">{confidenceLevel}</span>
              </div>
              <div className="tech-row">
                <span className="tech-label">Estado</span>
                <span className="tech-value">{systemStatus === 'ok' ? 'Normal' : systemStatus === 'partial' ? 'Datos incompletos' : systemStatus === 'unstable' ? 'Escenario inestable' : systemStatus === 'low-res' ? 'Resolución media' : systemStatus === 'timeout' ? 'Latencia' : systemStatus === 'no-data' ? 'Sin datos' : '—'}</span>
              </div>
              {confidenceReason && (
                <p className="tech-note">{confidenceReason}</p>
              )}
            </div>
          )}
        </div>

        <footer className="footer">
          <p className="note">SaaS desarrollado por LIND Informática · Decisiones operativas basadas en datos reales.</p>
          <p className="note"><a href="https://www.lindinformatica.com" title="https://www.lindinformatica.com">www.lindinformatica.com</a> · Almassora (Castelló) · +34 689 388 980</p>
          <p className="note">Tots els drets reservats· 2026</p>
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
              <label>Usuario (correo)</label>
              <input
                type="email"
                value={registerEmail}
                onChange={e => {
                  setRegisterEmail(e.target.value)
                  setRegisterName(e.target.value)
                }}
                placeholder="tuemail@ejemplo.com"
                required
              />
              <label>Contraseña</label>
              <input
                type="password"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {registerError && <p className="error">{registerError}</p>}
              <button type="submit" className="save-btn" disabled={registerLoading}>
                {registerLoading ? 'Guardando...' : 'Continuar'}
              </button>
            </form>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                setRegisterOpen(false)
                setDemoOpen(true)
              }}
            >
              No tengo usuario, pedir acceso
            </button>
          </div>
        </div>
      )}

      {demoOpen && (
        <div className="feedback-backdrop">
          <div className="demo-card">
            <div className="feedback-head">
              <p className="status-label">Pide tu usuario</p>
              <button className="close-btn" onClick={() => setDemoOpen(false)}>×</button>
            </div>
            <p className="muted">Te enviaremos usuario y contraseña a tu correo.</p>
            <form className="feedback-form" onSubmit={handleDemoSubmit}>
              <label>Nombre</label>
              <input
                type="text"
                value={demoName}
                onChange={e => setDemoName(e.target.value)}
                required
              />
              <label>Apellidos</label>
              <input
                type="text"
                value={demoSurname}
                onChange={e => setDemoSurname(e.target.value)}
                required
              />
              <label>Correo electrónico</label>
              <input
                type="email"
                value={demoEmail}
                onChange={e => setDemoEmail(e.target.value)}
                required
              />
              {demoStatus && <p className="muted">{demoStatus}</p>}
              <button type="submit" className="save-btn">Enviar solicitud</button>
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
