// API de Frankfurter (ECB data) para tasas de cambio históricas
const FRANKFURTER_API = 'https://api.frankfurter.app'

export async function getExchangeRates() {
  // Intentar cargar desde localStorage primero
  const cached = localStorage.getItem('exchangeRates')
  if (cached) {
    try {
      const { rates, date } = JSON.parse(cached)
      const cacheDate = new Date(date)
      const now = new Date()
      // Si tiene menos de 24 horas, usar cache
      if (now - cacheDate < 24 * 60 * 60 * 1000) {
        return rates
      }
    } catch (e) {
      console.error('Error loading cached rates:', e)
    }
  }

  // Si no hay cache válido, obtener tasas actuales
  // Nota: Para tasas históricas específicas, se llamará a getHistoricalRate
  const rates = {}
  
  try {
    const response = await fetch(`${FRANKFURTER_API}/latest?from=USD`)
    const data = await response.json()
    rates['USD'] = 1
    Object.keys(data.rates).forEach(currency => {
      rates[currency] = 1 / data.rates[currency] // Convertir a USD
    })
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    // Retornar tasas por defecto si falla
    rates['USD'] = 1
    rates['EUR'] = 1.1
    rates['GBP'] = 1.27
  }

  return rates
}

export async function getHistoricalRate(fromCurrency, toCurrency, date) {
  // La API de Frankfurter solo tiene datos históricos hasta hoy
  // Para fechas futuras, usar la tasa más reciente disponible
  const transactionDate = new Date(date)
  const today = new Date()
  
  // Si la fecha es futura, usar la tasa más reciente
  if (transactionDate > today) {
    return await getLatestRate(fromCurrency, toCurrency)
  }

  try {
    const dateStr = transactionDate.toISOString().split('T')[0]
    const response = await fetch(
      `${FRANKFURTER_API}/${dateStr}?from=${fromCurrency}&to=${toCurrency}`
    )
    
    if (!response.ok) {
      // Si no hay datos para esa fecha, usar la más reciente
      return await getLatestRate(fromCurrency, toCurrency)
    }

    const data = await response.json()
    return data.rates[toCurrency]
  } catch (error) {
    console.error(`Error fetching historical rate for ${date}:`, error)
    // Fallback a tasa más reciente
    return await getLatestRate(fromCurrency, toCurrency)
  }
}

async function getLatestRate(fromCurrency, toCurrency) {
  try {
    const response = await fetch(
      `${FRANKFURTER_API}/latest?from=${fromCurrency}&to=${toCurrency}`
    )
    const data = await response.json()
    return data.rates[toCurrency]
  } catch (error) {
    console.error('Error fetching latest rate:', error)
    // Tasas aproximadas por defecto
    const defaultRates = {
      'EUR': 1.1,
      'GBP': 1.27,
      'MXN': 0.06,
      'CLP': 0.0011,
      'CAD': 0.74,
    }
    return defaultRates[toCurrency] || 1
  }
}

export function convertToUSD(amount, fromCurrency, date, ratesCache = {}) {
  if (fromCurrency === 'USD') {
    return amount
  }

  // Intentar usar cache primero
  const cacheKey = `${fromCurrency}_${date}`
  if (ratesCache[cacheKey]) {
    return amount * ratesCache[cacheKey]
  }

  // Si no hay en cache, usar tasa aproximada
  // En producción, esto debería llamar a getHistoricalRate
  const defaultRates = {
    'EUR': 1.1,
    'GBP': 1.27,
    'MXN': 0.06,
    'CLP': 0.0011,
    'CAD': 0.74,
    'AUD': 0.67,
    'JPY': 0.0067,
    'CNY': 0.14,
    'BRL': 0.20,
    'ARS': 0.0012,
  }

  const rate = defaultRates[fromCurrency] || 1
  return amount * rate
}


