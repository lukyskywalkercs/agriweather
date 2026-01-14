import React from 'react'
import { CheckCircle, X, Fuel, Clock, Leaf, TrendingUp, Mail, MessageSquare } from 'lucide-react'
import './ApprovalPanel.css'

function ApprovalPanel({ savings, onApprove, approved }) {
  if (approved) {
    return (
      <div className="approval-panel approved">
        <div className="approval-success-icon">
          <CheckCircle size={48} />
        </div>
        <h3>Plan Aprobado y Ejecutado</h3>
        <p>Todas las acciones han sido activadas automáticamente</p>
        <div className="approval-actions-list">
          <div className="approval-action-item">
            <CheckCircle size={20} />
            <span>Emails enviados a 4 jefes de departamento</span>
          </div>
          <div className="approval-action-item">
            <CheckCircle size={20} />
            <span>WhatsApp enviado a 3 conductores con rutas sugeridas</span>
          </div>
          <div className="approval-action-item">
            <CheckCircle size={20} />
            <span>Calendario logística actualizado</span>
          </div>
          <div className="approval-action-item">
            <CheckCircle size={20} />
            <span>Turnos reorganizados - 100% plantilla productiva</span>
          </div>
          <div className="approval-action-item">
            <CheckCircle size={20} />
            <span>Protocolo calidad activado</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="approval-panel">
      <div className="approval-header">
        <h3>¿Aprobar Plan Optimizado?</h3>
        <p>Revisa el ahorro estimado antes de ejecutar las acciones</p>
      </div>

      <div className="approval-summary">
        <div className="approval-total">
          <div className="approval-total-label">Ahorro Total Estimado</div>
          <div className="approval-total-value">{savings.operational.total.toFixed(2)}€</div>
          <div className="approval-total-detail">Jueves 18 Enero 2026</div>
        </div>

        <div className="approval-breakdown">
          <div className="approval-item">
            <Fuel size={20} />
            <div>
              <div className="approval-item-value">{savings.fuel.liters}L</div>
              <div className="approval-item-label">Combustible</div>
            </div>
          </div>
          <div className="approval-item">
            <Clock size={20} />
            <div>
              <div className="approval-item-value">{savings.time.hours}h</div>
              <div className="approval-item-label">Tiempo</div>
            </div>
          </div>
          <div className="approval-item">
            <Leaf size={20} />
            <div>
              <div className="approval-item-value">{savings.co2.kg}kg</div>
              <div className="approval-item-label">CO₂</div>
            </div>
          </div>
          <div className="approval-item">
            <TrendingUp size={20} />
            <div>
              <div className="approval-item-value">{(savings.projections.annual / 1000).toFixed(1)}k€</div>
              <div className="approval-item-label">Anual</div>
            </div>
          </div>
        </div>
      </div>

      <div className="approval-note">
        <Mail size={20} />
        <div>
          <strong>Al aprobar, cada jefe de departamento recibirá:</strong>
          <ul>
            <li>Email con plan sugerido para su área</li>
            <li>WhatsApp a conductores con rutas propuestas</li>
            <li>Notificación a RRHH con turnos sugeridos</li>
            <li>Cada jefe aprueba/rechaza su parte</li>
          </ul>
          <p style="margin-top: 0.75rem; font-size: 0.9rem; opacity: 0.9;">
            ⚠️ Este botón solo envía las sugerencias. No ejecuta cambios automáticamente.
          </p>
        </div>
      </div>

      <div className="approval-buttons">
        <button className="btn-approve" onClick={onApprove}>
          <CheckCircle size={24} />
          Enviar Plan a Jefes de Departamento
        </button>
        <button className="btn-reject">
          <X size={24} />
          Rechazar
        </button>
      </div>

      <div className="approval-footer">
        <MessageSquare size={16} />
        <span>Clientes ya contactados (pendiente confirmación final)</span>
      </div>
    </div>
  )
}

export default ApprovalPanel

