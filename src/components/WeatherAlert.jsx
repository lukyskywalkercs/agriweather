import React from 'react'
import { CloudRain, Wind, Thermometer, AlertTriangle } from 'lucide-react'
import './WeatherAlert.css'

function WeatherAlert({ alert }) {
  const alertLevelConfig = {
    low: { color: '#3b82f6', label: 'Aviso' },
    medium: { color: '#f59e0b', label: 'Precaución' },
    high: { color: '#ef4444', label: 'Alerta Alta' },
    severe: { color: '#dc2626', label: 'Alerta Severa' }
  }

  const config = alertLevelConfig[alert.alertLevel]

  return (
    <div className="weather-alert" style={{ borderLeftColor: config.color }}>
      <div className="weather-alert-header">
        <div className="weather-alert-icon" style={{ backgroundColor: config.color }}>
          <AlertTriangle size={28} />
        </div>
        <div className="weather-alert-title">
          <h2>{config.label} Meteorológica</h2>
          <p>{alert.dateDisplay}</p>
        </div>
        <div className="weather-alert-countdown">
          <div className="countdown-value">{alert.daysUntil}</div>
          <div className="countdown-label">días</div>
        </div>
      </div>

      <div className="weather-alert-body">
        <div className="weather-events">
          {alert.events.map((event, index) => (
            <div key={index} className="weather-event">
              <CloudRain size={24} />
              <div className="event-details">
                <div className="event-time">{event.start} - {event.end}</div>
                <div className="event-description">
                  Lluvia {event.intensity === 'heavy' ? 'intensa' : 'ligera'} - {event.precipitation}
                </div>
              </div>
              <div className="event-wind">
                <Wind size={18} />
                <span>{event.windSpeed}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="weather-details">
          <div className="weather-detail">
            <Thermometer size={20} />
            <span>Temperatura: {alert.temperature.min}°C - {alert.temperature.max}°C</span>
          </div>
          <div className="weather-source">
            Fuente: {alert.source}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherAlert


