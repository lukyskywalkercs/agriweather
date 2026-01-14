import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, Lock, User } from 'lucide-react'
import './Login.css'

// Usuarios demo
const DEMO_USERS = {
  'comercial': { password: 'demo', role: 'comercial', name: 'Ana Martínez', department: 'Comercial' },
  'logistica': { password: 'demo', role: 'logistica', name: 'Roberto Sánchez', department: 'Logística' },
  'rrhh': { password: 'demo', role: 'rrhh', name: 'Carmen López', department: 'Recursos Humanos' },
  'calidad': { password: 'demo', role: 'calidad', name: 'Javier Ruiz', department: 'Calidad' },
  'director': { password: 'demo', role: 'director', name: 'Director General', department: 'Dirección' }
}

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    
    const user = DEMO_USERS[username.toLowerCase()]
    
    if (user && user.password === password) {
      // Guardar sesión
      sessionStorage.setItem('user', JSON.stringify(user))
      navigate('/dashboard')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  const handleDemoLogin = (role) => {
    const user = DEMO_USERS[role]
    sessionStorage.setItem('user', JSON.stringify(user))
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Cloud size={48} />
          <h1>AgriWeather Pro</h1>
          <p>Sistema de Optimización Meteorológica</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>
              <User size={20} />
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Introduce tu usuario"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={20} />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-demo">
          <h3>🎭 Demo - Acceso Rápido</h3>
          <p>Prueba el sistema desde diferentes roles:</p>
          <div className="demo-buttons">
            <button onClick={() => handleDemoLogin('director')} className="demo-btn director">
              👔 Director General<br/><small>(ve todo)</small>
            </button>
            <button onClick={() => handleDemoLogin('comercial')} className="demo-btn comercial">
              💼 Jefe Comercial<br/><small>(solo su área)</small>
            </button>
            <button onClick={() => handleDemoLogin('logistica')} className="demo-btn logistica">
              🚚 Jefe Logística<br/><small>(solo su área)</small>
            </button>
            <button onClick={() => handleDemoLogin('rrhh')} className="demo-btn rrhh">
              👥 Jefe RRHH<br/><small>(solo su área)</small>
            </button>
            <button onClick={() => handleDemoLogin('calidad')} className="demo-btn calidad">
              ✅ Jefe Calidad<br/><small>(solo su área)</small>
            </button>
          </div>
          <p className="demo-note">
            💡 Cada jefe solo ve su departamento. El director ve todo.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login


