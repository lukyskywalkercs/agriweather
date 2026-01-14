import './StatsCards.css'

function StatsCards({ totalSpent, totalCount, averageSpent, totalDistance, category }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(Math.round(num))
  }

  return (
    <div className="stats-cards">
      <div className="stat-card primary">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <h3>TOTAL GASTADO (USD)</h3>
          <p className="stat-value">{formatCurrency(totalSpent)}</p>
          <p className="stat-subtitle">Tasas históricas - Convertido a USD</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>TOTAL {category.id === 'transporte' ? 'VIAJES' : 'TRANSACCIONES'}</h3>
          <p className="stat-value">{formatNumber(totalCount)}</p>
          <p className="stat-subtitle">{category.id === 'transporte' ? 'Viajes completados' : 'Transacciones realizadas'}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📈</div>
        <div className="stat-content">
          <h3>PROMEDIO (USD)</h3>
          <p className="stat-value">{formatCurrency(averageSpent)}</p>
          <p className="stat-subtitle">Por {category.id === 'transporte' ? 'viaje' : 'transacción'}</p>
        </div>
      </div>

      {totalDistance > 0 && (
        <div className="stat-card">
          <div className="stat-icon">🛣️</div>
          <div className="stat-content">
            <h3>DISTANCIA TOTAL</h3>
            <p className="stat-value">{formatNumber(totalDistance)}</p>
            <p className="stat-subtitle">Kilómetros recorridos</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsCards


