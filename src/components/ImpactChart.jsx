import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './ImpactChart.css'

function ImpactChart({ data }) {
  return (
    <div className="impact-chart">
      <div className="chart-header">
        <h3>Impacto Histórico del Sistema</h3>
        <p>Comparativa ahorro con/sin AgriWeather Pro</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '14px', fontWeight: 600 }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '14px', fontWeight: 600 }}
              label={{ value: 'Ahorro (€)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="sinSistema" 
              name="Sin Sistema" 
              fill="#ef4444" 
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="conSistema" 
              name="Con AgriWeather Pro" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend-custom">
        <div className="legend-item loss">
          <div className="legend-color"></div>
          <div>
            <div className="legend-label">Sin Sistema</div>
            <div className="legend-description">Pérdidas por eventos climáticos no previstos</div>
          </div>
        </div>
        <div className="legend-item profit">
          <div className="legend-color"></div>
          <div>
            <div className="legend-label">Con AgriWeather Pro</div>
            <div className="legend-description">Ahorro optimizando operaciones 72h antes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImpactChart


