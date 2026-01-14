import React, { useState } from 'react'
import { Car, MapPin, Clock, Fuel, Navigation, CheckCircle, AlertCircle } from 'lucide-react'
import './RoutesOptimizer.css'

function RoutesOptimizer({ routes }) {
  const [selectedRoute, setSelectedRoute] = useState(routes[0]?.id || null)
  
  const route = routes.find(r => r.id === selectedRoute)

  return (
    <div className="routes-optimizer">
      <div className="routes-header">
        <h3>Rutas Comerciales - Plan Propuesto para Jueves 18 Enero</h3>
        <p>🤖 IA sugiere estas modificaciones. <strong>Tú decides si aprobar.</strong></p>
        <div className="routes-summary">
          <div className="summary-stat">
            <strong>3 rutas</strong> afectadas por lluvia
          </div>
          <div className="summary-stat success">
            <strong>-65km</strong> totales optimizados
          </div>
          <div className="summary-stat success">
            <strong>-10.5L</strong> gasoil ahorrado
          </div>
          <div className="summary-stat success">
            <strong>12h</strong> evitadas bajo lluvia
          </div>
        </div>
      </div>

      <div className="routes-selector">
        {routes.map(r => (
          <button
            key={r.id}
            className={`route-btn ${selectedRoute === r.id ? 'active' : ''}`}
            onClick={() => setSelectedRoute(r.id)}
          >
            <Car size={20} />
            <div>
              <div className="route-btn-title">Coche {r.id} - {r.zone}</div>
              <div className="route-btn-subtitle">{r.vehicleId} • {r.driver}</div>
            </div>
          </button>
        ))}
      </div>

      {route && (
        <div className="route-comparison">
          <div className="route-column original">
            <div className="route-column-header">
              <AlertCircle size={20} />
              <h4>Ruta Original</h4>
              <span className="route-badge danger">Sin optimizar</span>
            </div>
            
            <div className="route-stats">
              <div className="route-stat">
                <Navigation size={16} />
                <span>{route.original.distance} km</span>
              </div>
              <div className="route-stat">
                <Fuel size={16} />
                <span>{route.original.fuel} L</span>
              </div>
              <div className="route-stat">
                <Clock size={16} />
                <span>{route.original.duration}</span>
              </div>
            </div>

            <div className="route-clients">
              <h5>Clientes</h5>
              {route.original.clients.map((client, idx) => (
                <div key={idx} className="route-client">
                  <MapPin size={16} />
                  <span>{client}</span>
                </div>
              ))}
            </div>

            {route.original.schedule && (
              <div className="route-schedule">
                <h5>Horario</h5>
                {route.original.schedule.map((item, idx) => (
                  <div key={idx} className={`schedule-item ${item.status || ''}`}>
                    <span className="schedule-time">{item.time}</span>
                    <span className="schedule-action">{item.action}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="route-cost">
              <span>Coste gasoil:</span>
              <strong>{route.original.cost}€</strong>
            </div>
          </div>

          <div className="route-column optimized">
            <div className="route-column-header">
              <CheckCircle size={20} />
              <h4>Ruta Optimizada</h4>
              <span className="route-badge success">Con IA</span>
            </div>
            
            <div className="route-stats">
              <div className="route-stat">
                <Navigation size={16} />
                <span>{route.optimized.distance} km</span>
              </div>
              <div className="route-stat">
                <Fuel size={16} />
                <span>{route.optimized.fuel} L</span>
              </div>
              <div className="route-stat">
                <Clock size={16} />
                <span>{route.optimized.duration}</span>
              </div>
            </div>

            <div className="route-clients">
              <h5>Clientes (reordenados)</h5>
              {route.optimized.clients.map((client, idx) => (
                <div key={idx} className="route-client success">
                  <MapPin size={16} />
                  <span>{client}</span>
                </div>
              ))}
            </div>

            {route.optimized.schedule && (
              <div className="route-schedule">
                <h5>Horario Optimizado</h5>
                {route.optimized.schedule.map((item, idx) => (
                  <div key={idx} className={`schedule-item ${item.status || ''}`}>
                    <span className="schedule-time">{item.time}</span>
                    <span className="schedule-action">{item.action}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="route-cost success">
              <span>Coste gasoil:</span>
              <strong>{route.optimized.cost}€</strong>
            </div>
          </div>
        </div>
      )}

      {route && route.optimized.saved && (
        <div className="route-savings">
          <h4>Ahorro de Esta Ruta</h4>
          <div className="route-savings-grid">
            <div className="saving-badge">
              <Navigation size={20} />
              <div>
                <div className="saving-badge-value">-{route.optimized.saved.distance} km</div>
                <div className="saving-badge-label">Menos distancia</div>
              </div>
            </div>
            <div className="saving-badge">
              <Fuel size={20} />
              <div>
                <div className="saving-badge-value">-{route.optimized.saved.fuel} L</div>
                <div className="saving-badge-label">Menos combustible</div>
              </div>
            </div>
            <div className="saving-badge success">
              <Clock size={20} />
              <div>
                <div className="saving-badge-value">{route.optimized.saved.rainTime}</div>
                <div className="saving-badge-label">Evita lluvia</div>
              </div>
            </div>
            <div className="saving-badge success">
              <CheckCircle size={20} />
              <div>
                <div className="saving-badge-value">{route.optimized.saved.cost}€</div>
                <div className="saving-badge-label">Ahorro total</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoutesOptimizer

