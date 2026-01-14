import { useState, useMemo } from 'react'
import StatsCards from './StatsCards'
import SpendingChart from './SpendingChart'
import CurrencyBreakdown from './CurrencyBreakdown'
import MonthlyBreakdown from './MonthlyBreakdown'
import './Dashboard.css'

function Dashboard({ data, category, onReset }) {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedCurrency, setSelectedCurrency] = useState('all')

  const filteredData = useMemo(() => {
    let filtered = [...data.transactions]

    // Filtrar por período
    if (selectedPeriod !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (selectedPeriod) {
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        default:
          break
      }
      
      filtered = filtered.filter(t => new Date(t.date) >= filterDate)
    }

    // Filtrar por moneda
    if (selectedCurrency !== 'all') {
      filtered = filtered.filter(t => t.currency === selectedCurrency)
    }

    return filtered
  }, [data.transactions, selectedPeriod, selectedCurrency])

  const stats = useMemo(() => {
    const totalSpent = filteredData.reduce((sum, t) => sum + (t.amountUSD || 0), 0)
    const totalCount = filteredData.length
    const averageSpent = totalCount > 0 ? totalSpent / totalCount : 0
    const totalDistance = filteredData.reduce((sum, t) => sum + (t.distance || 0), 0)
    
    const currencyBreakdown = {}
    filteredData.forEach(t => {
      if (!currencyBreakdown[t.currency]) {
        currencyBreakdown[t.currency] = { total: 0, count: 0 }
      }
      currencyBreakdown[t.currency].total += t.amount
      currencyBreakdown[t.currency].count += 1
    })

    return {
      totalSpent,
      totalCount,
      averageSpent,
      totalDistance,
      currencyBreakdown
    }
  }, [filteredData])

  const dateRange = useMemo(() => {
    if (filteredData.length === 0) return 'Sin datos'
    const dates = filteredData.map(t => new Date(t.date)).sort((a, b) => a - b)
    const start = dates[0]
    const end = dates[dates.length - 1]
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()
    return `${startYear} a ${endYear}`
  }, [filteredData])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>{category.name} Dashboard</h1>
          <p className="dashboard-subtitle">
            {stats.totalCount} {category.id === 'transporte' ? 'viajes' : 'transacciones'} de {dateRange}
          </p>
        </div>
        <div className="dashboard-controls">
          <select
            className="period-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="all">Todo el período</option>
            <option value="year">Último año</option>
            <option value="month">Último mes</option>
            <option value="week">Última semana</option>
          </select>
          <select
            className="currency-select"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
          >
            <option value="all">Todas las monedas</option>
            {Object.keys(stats.currencyBreakdown).map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>

      {data.usingHistoricalRates && (
        <div className="info-banner">
          Usando tasas de cambio históricas del BCE para {data.historicalRatesCount} transacciones
        </div>
      )}

      <StatsCards
        totalSpent={stats.totalSpent}
        totalCount={stats.totalCount}
        averageSpent={stats.averageSpent}
        totalDistance={stats.totalDistance}
        category={category}
      />

      <div className="charts-grid">
        <SpendingChart data={filteredData} />
        <MonthlyBreakdown data={filteredData} />
      </div>

      <CurrencyBreakdown breakdown={stats.currencyBreakdown} />
    </div>
  )
}

export default Dashboard


