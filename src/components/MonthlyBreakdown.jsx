import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './MonthlyBreakdown.css'

function MonthlyBreakdown({ data }) {
  const chartData = useMemo(() => {
    const grouped = {}
    
    data.forEach(transaction => {
      const date = new Date(transaction.date)
      const year = date.getFullYear()
      const month = date.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      
      if (!grouped[key]) {
        grouped[key] = { month: key, amount: 0 }
      }
      grouped[key].amount += transaction.amountUSD || 0
    })

    return Object.values(grouped)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12) // Últimos 12 meses
  }, [data])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Desglose Mensual</h3>
        <p className="no-data">No hay datos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <h3>Desglose Mensual (Últimos 12 meses)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis 
            dataKey="month" 
            stroke="#a0a0a0"
            tick={{ fill: '#a0a0a0' }}
          />
          <YAxis 
            stroke="#a0a0a0"
            tick={{ fill: '#a0a0a0' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value) => formatCurrency(value)}
          />
          <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MonthlyBreakdown


