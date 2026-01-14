import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, ArrowLeft, Mail, Phone, Calendar } from 'lucide-react'
import './ComingSoon.css'

function ComingSoon() {
  const navigate = useNavigate()

  return (
    <div className="coming-soon">
      <div className="coming-soon-container">
        <Cloud size={64} className="coming-soon-icon" />
        <h1>Próximamente</h1>
        <p className="coming-soon-subtitle">
          Este módulo está en desarrollo y estará disponible muy pronto
        </p>

        <div className="coming-soon-features">
          <h2>¿Qué incluirá?</h2>
          <ul>
            <li><Calendar size={20} /> Vista de calendario con eventos climáticos</li>
            <li><Mail size={20} /> Historial de notificaciones enviadas</li>
            <li><Phone size={20} /> Configuración de alertas personalizadas</li>
            <li>📊 Reportes detallados por departamento</li>
            <li>🔧 Ajustes avanzados de optimización</li>
          </ul>
        </div>

        <div className="coming-soon-contact">
          <h3>¿Necesitas acceso anticipado?</h3>
          <p>Contacta con nuestro equipo para una demo personalizada</p>
          <div className="contact-buttons">
            <a href="mailto:demo@agriweather.pro" className="btn-contact">
              <Mail size={20} />
              demo@agriweather.pro
            </a>
            <a href="tel:+34900000000" className="btn-contact">
              <Phone size={20} />
              +34 900 00 00 00
            </a>
          </div>
        </div>

        <button className="btn-back-home" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
      </div>
    </div>
  )
}

export default ComingSoon


