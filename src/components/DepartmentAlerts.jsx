import React from 'react'
import { Briefcase, Truck, Users, ShieldCheck, Mail, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import './DepartmentAlerts.css'

const iconMap = {
  briefcase: Briefcase,
  truck: Truck,
  users: Users,
  'shield-check': ShieldCheck
}

const actionIconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  action: AlertTriangle
}

function DepartmentAlerts({ departments, compact = false }) {
  return (
    <div className={`department-alerts ${compact ? 'compact' : ''}`}>
      {departments.map(dept => {
        const Icon = iconMap[dept.icon] || Briefcase
        const impactClass = dept.impact === 'high' ? 'high' : dept.impact === 'medium' ? 'medium' : 'low'
        
        return (
          <div key={dept.id} className={`department-card ${impactClass}`}>
            <div className="department-header">
              <div className="department-icon">
                <Icon size={24} />
              </div>
              <div className="department-info">
                <h4>{dept.name}</h4>
                <p>{dept.manager} • <Mail size={14} /> {dept.email}</p>
              </div>
              {dept.savings > 0 && (
                <div className="department-savings">
                  +{dept.savings.toFixed(2)}€
                </div>
              )}
            </div>

            <div className="department-actions">
              {dept.actions.map((action, idx) => {
                const ActionIcon = actionIconMap[action.type] || Info
                
                return (
                  <div key={idx} className={`action-item ${action.type}`}>
                    <div className="action-icon">
                      <ActionIcon size={18} />
                    </div>
                    <div className="action-content">
                      <div className="action-title">{action.title}</div>
                      <div className="action-description">{action.description}</div>
                    </div>
                    {action.button && (
                      <button className="action-button">
                        {action.button}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DepartmentAlerts


