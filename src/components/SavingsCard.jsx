import React from 'react'
import { Fuel, Clock, Leaf, TrendingUp } from 'lucide-react'
import './SavingsCard.css'

function SavingsCard({ savings }) {
  return (
    <div className="savings-card">
      <div className="savings-header">
        <h3>Ahorro Estimado - Jueves 18 Enero</h3>
        <div className="savings-total">
          <span className="savings-total-value">{savings.operational.total.toFixed(2)}€</span>
          <span className="savings-total-label">Total optimización</span>
        </div>
      </div>

      <div className="savings-grid">
        <div className="saving-item">
          <div className="saving-icon fuel">
            <Fuel size={24} />
          </div>
          <div className="saving-content">
            <div className="saving-label">Combustible</div>
            <div className="saving-value">{savings.fuel.liters}L</div>
            <div className="saving-detail">{savings.fuel.euros.toFixed(2)}€ (-{savings.fuel.percentage}%)</div>
          </div>
        </div>

        <div className="saving-item">
          <div className="saving-icon time">
            <Clock size={24} />
          </div>
          <div className="saving-content">
            <div className="saving-label">Tiempo</div>
            <div className="saving-value">{savings.time.hours}h</div>
            <div className="saving-detail">{savings.time.value}€ valor</div>
          </div>
        </div>

        <div className="saving-item">
          <div className="saving-icon eco">
            <Leaf size={24} />
          </div>
          <div className="saving-content">
            <div className="saving-label">CO₂ reducido</div>
            <div className="saving-value">{savings.co2.kg}kg</div>
            <div className="saving-detail">Impacto ambiental</div>
          </div>
        </div>

        <div className="saving-item">
          <div className="saving-icon trend">
            <TrendingUp size={24} />
          </div>
          <div className="saving-content">
            <div className="saving-label">Proyección anual</div>
            <div className="saving-value">{(savings.projections.annual / 1000).toFixed(1)}k€</div>
            <div className="saving-detail">{savings.projections.monthly}€/mes</div>
          </div>
        </div>
      </div>

      <div className="savings-breakdown">
        <h4>Desglose por Departamento</h4>
        <div className="breakdown-list">
          <div className="breakdown-item">
            <span className="breakdown-name">Comercial</span>
            <span className="breakdown-value">{savings.operational.breakdown.commercial.toFixed(2)}€</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-name">Logística</span>
            <span className="breakdown-value">{savings.operational.breakdown.logistics.toFixed(2)}€</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-name">RRHH</span>
            <span className="breakdown-value">{savings.operational.breakdown.hr.toFixed(2)}€</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-name">Mantenimiento</span>
            <span className="breakdown-value">{savings.operational.breakdown.maintenance.toFixed(2)}€</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SavingsCard


