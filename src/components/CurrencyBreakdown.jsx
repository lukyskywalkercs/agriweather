import './CurrencyBreakdown.css'

const CURRENCY_FLAGS = {
  'USD': '🇺🇸',
  'EUR': '🇪🇺',
  'GBP': '🇬🇧',
  'MXN': '🇲🇽',
  'CLP': '🇨🇱',
  'CAD': '🇨🇦',
  'AUD': '🇦🇺',
  'JPY': '🇯🇵',
  'CNY': '🇨🇳',
  'BRL': '🇧🇷',
  'ARS': '🇦🇷',
  'CHF': '🇨🇭',
  'SEK': '🇸🇪',
  'NOK': '🇳🇴',
  'DKK': '🇩🇰',
  'PLN': '🇵🇱',
  'TRY': '🇹🇷',
  'INR': '🇮🇳',
  'KRW': '🇰🇷',
  'SGD': '🇸🇬',
  'HKD': '🇭🇰',
  'NZD': '🇳🇿',
  'ZAR': '🇿🇦',
  'RUB': '🇷🇺',
}

function CurrencyBreakdown({ breakdown }) {
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const currencies = Object.entries(breakdown)
    .map(([currency, data]) => ({
      currency,
      total: data.total,
      count: data.count,
      flag: CURRENCY_FLAGS[currency] || '💱'
    }))
    .sort((a, b) => b.total - a.total)

  if (currencies.length === 0) {
    return null
  }

  return (
    <div className="currency-breakdown">
      <h3>Gastos por Moneda</h3>
      <div className="currency-grid">
        {currencies.map(({ currency, total, count, flag }) => (
          <div key={currency} className="currency-card">
            <div className="currency-header">
              <span className="currency-flag">{flag}</span>
              <span className="currency-code">{currency}</span>
            </div>
            <div className="currency-amount">
              {formatCurrency(total, currency)}
            </div>
            <div className="currency-count">
              {count} {count === 1 ? 'transacción' : 'transacciones'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CurrencyBreakdown


