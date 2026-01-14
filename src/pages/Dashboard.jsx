import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, ArrowLeft, LogOut, TrendingUp, Users, Truck, Briefcase, ShieldCheck } from 'lucide-react'
import WeatherCard from '../components/WeatherCard'
import ActionCard from '../components/ActionCard'
import SavingsCard from '../components/SavingsCard'
import RoutesOptimizer from '../components/RoutesOptimizer'
import ImpactChart from '../components/ImpactChart'
import { weatherAlert, savings, commercialRoutes, departments, historicalData } from '../data/mockData'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [showRecommendations, setShowRecommendations] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      console.log('User loaded:', parsedUser)
    } else {
      navigate('/login')
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    navigate('/login')
  }

  const handleActionApprove = (action) => {
    console.log('Aprobado:', action)
    // En producción: enviar al backend
  }

  const handleActionReject = (action) => {
    console.log('Rechazado:', action)
    // En producción: enviar al backend
  }

  if (!user) return null

  // Determinar qué puede ver el usuario
  const isDirector = user.role === 'director'
  const userDepartments = isDirector 
    ? departments 
    : departments.filter(dept => dept.id === user.role)

  console.log('Is Director?', isDirector, 'Visible departments:', userDepartments.length)

  const getDepartmentIcon = (iconName) => {
    const icons = {
      briefcase: Briefcase,
      truck: Truck,
      users: Users,
      'shield-check': ShieldCheck
    }
    return icons[iconName] || Briefcase
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <button className="btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Inicio
          </button>
          <div className="dashboard-logo">
            <Cloud size={32} />
            <div>
              <div className="dashboard-title">AgriWeather Pro</div>
              <div className="dashboard-subtitle">CitrusVall S.L.</div>
            </div>
          </div>
          <div className="dashboard-user-section">
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.department}</div>
              {isDirector && <div className="director-badge">👔 Vista Global</div>}
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-container">
          
          {/* Weather Alert Card */}
          <WeatherCard 
            alert={weatherAlert} 
            onViewRecommendations={() => setShowRecommendations(!showRecommendations)} 
          />

          {/* Quick Savings Overview */}
          <div className="savings-overview-compact">
            <div className="savings-overview-header">
              <TrendingUp size={24} />
              <div>
                <h3>Ahorro Total Estimado con Plan IA</h3>
                <p className="savings-disclaimer">Sujeto a tu aprobación final</p>
              </div>
            </div>
            <div className="savings-overview-grid">
              <div className="savings-quick-card">
                <div className="savings-quick-value">510,50€</div>
                <div className="savings-quick-label">Este evento</div>
              </div>
              <div className="savings-quick-card">
                <div className="savings-quick-value">2.040€</div>
                <div className="savings-quick-label">Proyección mensual</div>
              </div>
              <div className="savings-quick-card success">
                <div className="savings-quick-value">24.480€</div>
                <div className="savings-quick-label">Proyección anual</div>
              </div>
            </div>
          </div>

          {/* Recommendations Panel */}
          {showRecommendations && (
            <div className="recommendations-panel">
              <h2>📊 Panel de Recomendaciones IA</h2>
              <p className="recommendations-disclaimer">
                ⚠️ <strong>Importante:</strong> La IA sugiere estas acciones basadas en la predicción meteorológica. 
                <strong> Tú tienes la última palabra.</strong> Puedes aprobar, rechazar o modificar cada acción individualmente.
              </p>

              {/* Departamentos y sus acciones */}
              {userDepartments.map((dept) => {
                const Icon = getDepartmentIcon(dept.icon)
                return (
                  <div key={dept.id} className="department-section">
                    <div className="department-header">
                      <div className="department-icon">
                        <Icon size={24} />
                      </div>
                      <div className="department-info">
                        <h3>{dept.name}</h3>
                        <p>Jefe: {dept.manager} • {dept.email}</p>
                      </div>
                      {dept.savings > 0 && (
                        <div className="department-savings">
                          <TrendingUp size={20} />
                          Ahorro: <strong>{dept.savings.toFixed(2)}€</strong>
                        </div>
                      )}
                    </div>

                    <div className="actions-list">
                      {dept.actions.map((action) => (
                        <ActionCard
                          key={action.id}
                          action={action}
                          onApprove={handleActionApprove}
                          onReject={handleActionReject}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="dashboard-tabs">
            <button 
              className={`tab-btn ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              📊 Resumen
            </button>
            {(isDirector || user.role === 'comercial') && (
              <button 
                className={`tab-btn ${activeSection === 'routes' ? 'active' : ''}`}
                onClick={() => setActiveSection('routes')}
              >
                🚗 Rutas Alternativas
              </button>
            )}
            {isDirector && (
              <button 
                className={`tab-btn ${activeSection === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveSection('analytics')}
              >
                📈 Histórico
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeSection === 'overview' && (
            <div className="tab-content">
              <SavingsCard savings={savings} />
            </div>
          )}

          {activeSection === 'routes' && (
            <div className="tab-content">
              <RoutesOptimizer routes={commercialRoutes} />
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="tab-content">
              <ImpactChart data={historicalData} />
              
              <div className="analytics-summary">
                <h3>Resumen Últimos 6 Meses</h3>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-value">8.150€</div>
                    <div className="analytics-label">Total ahorrado</div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-value">14 días</div>
                    <div className="analytics-label">Eventos optimizados</div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-value">582€</div>
                    <div className="analytics-label">Ahorro medio/evento</div>
                  </div>
                  <div className="analytics-card success">
                    <div className="analytics-value">+48%</div>
                    <div className="analytics-label">ROI vs inversión</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
