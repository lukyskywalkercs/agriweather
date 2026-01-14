import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Cloud, Brain, TrendingUp, Zap, CheckCircle, AlertTriangle, ArrowRight, Calendar, Users, Truck, Github, Linkedin, Mail, Globe } from 'lucide-react'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="orange-float orange-1">🍊</div>
          <div className="orange-float orange-2">🍊</div>
          <div className="orange-float orange-3">🍊</div>
        </div>
        
        <nav className="navbar">
          <div className="navbar-content">
            <div className="logo">
              <Cloud size={32} />
              <span>AgriWeather Pro</span>
            </div>
            <button className="btn-demo" onClick={() => navigate('/login')}>
              Probar Demo <ArrowRight size={18} />
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} />
            Sistema IA en alerta permanente
          </div>
          
          <h1 className="hero-title">
            Gestión inteligente para tu<br />
            <span className="gradient-text">almacén de naranjas</span>
          </h1>
          
          <p className="hero-subtitle">
            Tu asistente IA que monitoriza el tiempo 24/7 y te ayuda a tomar mejores decisiones sobre rutas, turnos y expediciones. Siempre un paso adelante.
          </p>

          <div className="hero-cta">
            <button className="btn-primary-large" onClick={() => navigate('/login')}>
              <Brain size={24} />
              Ver Demo Interactiva
            </button>
            <p className="cta-note">Sin registro • 2 minutos • 5 roles diferentes</p>
          </div>

          <div className="hero-preview">
            <img src="/preview-dashboard.png" alt="Dashboard Preview" className="preview-image" />
            <div className="preview-overlay">
              <div className="preview-alert">
                <AlertTriangle size={20} />
                <span>Lluvia detectada en 72h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <div className="container">
          <h2>¿Te suena familiar?</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">🌧️</div>
              <h3>Lluvia inesperada</h3>
              <p>Cancelaciones de última hora, rutas improvisadas, caos en la planificación</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">📞</div>
              <h3>Avisos manuales</h3>
              <p>Llamar uno por uno a comerciales, transportistas y equipo de almacén</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">📊</div>
              <h3>Decisiones sin datos</h3>
              <p>¿Adelanto las expediciones? ¿Cambio turnos? Sin información clara, decides a ciegas</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Brain size={18} />
              Cómo funciona
            </div>
            <h2>Sistema en alerta permanente</h2>
            <p>Predicción meteorológica → Análisis IA → Recomendaciones personalizadas</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Cloud size={32} />
              </div>
              <h3>Monitorización 24/7</h3>
              <p>El sistema consulta AEMET y ECMWF constantemente. Detecta eventos meteorológicos con <strong>72h de antelación</strong>.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Brain size={32} />
              </div>
              <h3>Análisis inteligente</h3>
              <p>La IA analiza tus datos: rutas comerciales, turnos, expediciones programadas. Calcula el <strong>impacto real</strong> del evento.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <AlertTriangle size={32} />
              </div>
              <h3>Recomendaciones claras</h3>
              <p>Recibes sugerencias concretas por departamento: <strong>qué hacer, cuándo y por qué</strong>. Tú apruebas cada acción.</p>
            </div>
          </div>

          <div className="workflow-visual">
            <div className="workflow-item">
              <Calendar size={24} />
              <span>Lluvia prevista jueves 10:00-14:00</span>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-item">
              <Brain size={24} />
              <span>IA sugiere: reprogramar 8 visitas + reorganizar 3 rutas</span>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-item success">
              <CheckCircle size={24} />
              <span>Tú decides: Aprobar, rechazar o modificar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <h2>Diseñado para almacenes de cítricos</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Truck size={28} />
              </div>
              <h3>Rutas comerciales</h3>
              <p>Optimiza rutas de vehículos comerciales evitando zonas de lluvia. Calcula alternativas con menor kilometraje.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={28} />
              </div>
              <h3>Gestión de turnos</h3>
              <p>Reorganiza equipos según el clima. Reubica personal de exterior a interior sin perder productividad.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Calendar size={28} />
              </div>
              <h3>Expediciones programadas</h3>
              <p>Reprograma cargas y envíos. Adelanta o pospone expediciones según las previsiones meteorológicas.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Brain size={28} />
              </div>
              <h3>Decisiones basadas en datos</h3>
              <p>Cada recomendación viene con datos reales: km ahorrados, horas optimizadas, recursos reorganizados.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <CheckCircle size={28} />
              </div>
              <h3>Tú tienes el control</h3>
              <p>La IA sugiere, tú apruebas. Cada acción es revisable, modificable y cancelable en cualquier momento.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={28} />
              </div>
              <h3>Notificaciones instantáneas</h3>
              <p>Alertas por WhatsApp a cada departamento. Cada jefe recibe solo lo que le afecta, cuando le afecta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="container">
          <h2>Un dashboard para cada responsable</h2>
          <p className="section-subtitle">Cada jefe de departamento ve solo su área. El director general supervisa todo.</p>
          
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon director">👔</div>
              <h3>Director General</h3>
              <p>Vista completa de todos los departamentos, análisis histórico y métricas globales.</p>
            </div>

            <div className="role-card">
              <div className="role-icon comercial">💼</div>
              <h3>Jefe Comercial</h3>
              <p>Rutas optimizadas, visitas reprogramadas, contactos con clientes.</p>
            </div>

            <div className="role-card">
              <div className="role-icon logistica">🚚</div>
              <h3>Jefe Logística</h3>
              <p>Expediciones, carga de camiones, optimización de flotas.</p>
            </div>

            <div className="role-card">
              <div className="role-icon rrhh">👥</div>
              <h3>Jefe RRHH</h3>
              <p>Turnos, notificaciones a empleados, reorganización de plantilla.</p>
            </div>

            <div className="role-card">
              <div className="role-icon calidad">✅</div>
              <h3>Jefe Calidad</h3>
              <p>Inspecciones, mantenimiento preventivo, controles de cámaras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Prueba el sistema ahora mismo</h2>
            <p>Demo interactiva con 5 roles diferentes. Sin registro, sin compromiso.</p>
            <button className="btn-cta-large" onClick={() => navigate('/login')}>
              <Brain size={24} />
              Acceder a la Demo
              <ArrowRight size={24} />
            </button>
            <div className="cta-features">
              <div className="cta-feature">
                <CheckCircle size={18} />
                <span>2 minutos</span>
              </div>
              <div className="cta-feature">
                <CheckCircle size={18} />
                <span>Datos reales</span>
              </div>
              <div className="cta-feature">
                <CheckCircle size={18} />
                <span>100% interactivo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <Cloud size={32} />
                <span>AgriWeather Pro</span>
              </div>
              <p>Sistema inteligente de gestión meteorológica para almacenes de cítricos</p>
            </div>

            <div className="footer-company">
              <h4>Desarrollado por</h4>
              <div className="company-name">Lind Informática</div>
              <div className="company-links">
                <a href="https://www.lindinformatica.com" target="_blank" rel="noopener noreferrer">
                  <Globe size={18} />
                  lindinformatica.com
                </a>
                <a href="mailto:contacto@lindinformatica.com">
                  <Mail size={18} />
                  contacto@lindinformatica.com
                </a>
                <a href="https://github.com/lindinformatica" target="_blank" rel="noopener noreferrer">
                  <Github size={18} />
                  GitHub
                </a>
                <a href="https://linkedin.com/company/lindinformatica" target="_blank" rel="noopener noreferrer">
                  <Linkedin size={18} />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Lind Informática. Todos los derechos reservados.</p>
            <p className="footer-note">Demo con datos ficticios. Sistema diseñado para CitrusVall S.L., Castellón.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
