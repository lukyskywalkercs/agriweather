import React from 'react'
import { Cloud, CloudRain, Wind, AlertTriangle, ChevronRight } from 'lucide-react'
import './WeatherCard.css'

function WeatherCard({ alert, onViewRecommendations }) {
  const getWeatherIcon = () => {
    if (alert.events.some(e => e.intensity === 'heavy')) {
      return <CloudRain size={48} />
    }
    return <Cloud size={48} />
  }

  return (
    <div className="weather-card-compact">
      <div className="weather-card-header">
        <div className="weather-icon-large">
          {getWeatherIcon()}
        </div>
        <div className="weather-info">
          <div className="weather-alert-badge">
            <AlertTriangle size={16} />
            ALERTA METEOROLÓGICA
          </div>
          <h2>{alert.dateDisplay}</h2>
          <div className="weather-countdown-compact">
            <span className="countdown-number">{alert.daysUntil}</span>
            <span>días</span>
          </div>
        </div>
      </div>

      <div className="weather-events-compact">
        {alert.events.map((event, idx) => (
          <div key={idx} className="weather-event-compact">
            <CloudRain size={20} />
            <div>
              <strong>{event.start} - {event.end}</strong>
              <span>Lluvia {event.intensity === 'heavy' ? 'intensa' : 'ligera'} ({event.precipitation})</span>
            </div>
            <div className="event-wind-compact">
              <Wind size={16} />
              {event.windSpeed}
            </div>
          </div>
        ))}
      </div>

      <button className="btn-recommendations" onClick={onViewRecommendations}>
        <AlertTriangle size={20} />
        Ver Panel de Recomendaciones IA
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

export default WeatherCard


