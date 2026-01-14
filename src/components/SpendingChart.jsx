import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './SpendingChart.css'

function SpendingChart({ data }) {
  const chartData = useMemo(() => {
    const grouped = {}
    
    data.forEach(transaction => {
      const date = new Date(transaction.date)
      const year = date.getFullYear()
      const month = date.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      
      if (!grouped[key]) {
        grouped[key] = { date: key, amount: 0, count: 0 }
      }
      grouped[key].amount += transaction.amountUSD || 0
      grouped[key].count += 1
    })

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
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
        <h3>Gastos por Mes</h3>
        <p className="no-data">No hay datos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <h3>Gastos por Mes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis 
            dataKey="date" 
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
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SpendingChart


