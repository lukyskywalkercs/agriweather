import React, { useState } from 'react'
import { CheckCircle, X, AlertTriangle, Info, Undo2 } from 'lucide-react'
import './ActionCard.css'

function ActionCard({ action, onApprove, onReject }) {
  const [status, setStatus] = useState('pending') // pending, approved, rejected
  const [showUndo, setShowUndo] = useState(false)

  const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    action: AlertTriangle
  }

  const Icon = iconMap[action.type] || Info

  const handleApprove = () => {
    setStatus('approved')
    setShowUndo(true)
    if (onApprove) onApprove(action)
    setTimeout(() => setShowUndo(false), 5000)
  }

  const handleReject = () => {
    setStatus('rejected')
    setShowUndo(true)
    if (onReject) onReject(action)
    setTimeout(() => setShowUndo(false), 5000)
  }

  const handleUndo = () => {
    setStatus('pending')
    setShowUndo(false)
  }

  return (
    <div className={`action-card ${status}`}>
      <div className="action-card-icon">
        <Icon size={24} />
      </div>
      <div className="action-card-content">
        <h4>{action.title}</h4>
        <p>{action.description}</p>
        
        {status === 'pending' && (
          <div className="action-buttons">
            <button className="btn-approve" onClick={handleApprove}>
              <CheckCircle size={18} />
              Aprobar
            </button>
            <button className="btn-reject" onClick={handleReject}>
              <X size={18} />
              Rechazar
            </button>
          </div>
        )}

        {status === 'approved' && (
          <div className="action-result approved">
            <CheckCircle size={20} />
            <span>✅ Aprobado - Se notificará al equipo</span>
            {showUndo && (
              <button className="btn-undo" onClick={handleUndo}>
                <Undo2 size={16} />
                Deshacer
              </button>
            )}
          </div>
        )}

        {status === 'rejected' && (
          <div className="action-result rejected">
            <X size={20} />
            <span>❌ Rechazado - No se aplicará esta recomendación</span>
            {showUndo && (
              <button className="btn-undo" onClick={handleUndo}>
                <Undo2 size={16} />
                Deshacer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActionCard


