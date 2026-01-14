import { convertToUSD, getHistoricalRate } from './currencyConverter'

// Procesadores específicos por categoría
const processors = {
  uber: processUberData,
  amazon: processAmazonData,
  streaming: processStreamingData,
  delivery: processDeliveryData,
  viajes: processViajesData,
  supermercado: processSupermercadoData,
  gasolina: processGasolinaData,
  banco: processBancoData,
  suscripciones: processSuscripcionesData,
  transporte: processTransporteData,
  compras: processComprasData,
}

export async function processImportedData(rawData, categoryId, exchangeRates) {
  const processor = processors[categoryId] || processGenericData
  return await processor(rawData, exchangeRates)
}

// Procesador genérico para datos CSV/JSON estándar
async function processGenericData(data, exchangeRates) {
  if (Array.isArray(data)) {
    return await processArrayData(data, exchangeRates)
  }
  
  if (typeof data === 'object' && data.transactions) {
    return await processArrayData(data.transactions, exchangeRates)
  }

  // Intentar parsear como CSV si es string
  if (typeof data === 'string') {
    const lines = data.split('\n').filter(line => line.trim())
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const obj = {}
        headers.forEach((header, i) => {
          obj[header] = values[i] || ''
        })
        return obj
      })
      return await processArrayData(rows, exchangeRates)
    }
  }

  throw new Error('Formato de datos no reconocido')
}

async function processArrayData(data, exchangeRates) {
  const transactions = []
  let historicalRatesCount = 0

  for (const item of data) {
    try {
      // Intentar detectar campos comunes
      const amount = parseFloat(
        item.amount || item.cantidad || item.price || item.total || item.value || 0
      )
      const currency = (
        item.currency || item.moneda || item.currency_code || 'USD'
      ).toUpperCase()
      const date = item.date || item.fecha || item.created_at || item.timestamp || new Date().toISOString()
      
      // Convertir a USD
      let amountUSD = amount
      if (currency !== 'USD') {
        try {
          // Intentar obtener tasa histórica
          const rate = await getHistoricalRate(currency, 'USD', date)
          if (rate) {
            amountUSD = amount * rate
            historicalRatesCount++
          } else {
            // Fallback a conversión simple
            amountUSD = convertToUSD(amount, currency, date, exchangeRates)
          }
        } catch (error) {
          // Fallback a conversión simple si falla la API
          amountUSD = convertToUSD(amount, currency, date, exchangeRates)
        }
      }

      transactions.push({
        date,
        amount,
        currency,
        amountUSD,
        description: item.description || item.descripcion || item.name || item.title || '',
        distance: parseFloat(item.distance || item.distancia || 0),
        category: item.category || item.categoria || '',
      })
    } catch (error) {
      console.warn('Error processing transaction:', error, item)
    }
  }

  return {
    transactions: transactions.sort((a, b) => new Date(a.date) - new Date(b.date)),
    usingHistoricalRates: historicalRatesCount > 0,
    historicalRatesCount,
  }
}

// Procesadores específicos
async function processUberData(data, exchangeRates) {
  // Formato esperado de datos de Uber (JSON export)
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (e) {
      return await processGenericData(data, exchangeRates)
    }
  }

  const transactions = []
  let historicalRatesCount = 0

  // Uber puede tener diferentes estructuras
  const rides = data.trips || data.rides || data.data || (Array.isArray(data) ? data : [])

  for (const ride of rides) {
    try {
      const amount = parseFloat(ride.fare || ride.amount || ride.total || 0)
      const currency = (ride.currency || ride.currency_code || 'USD').toUpperCase()
      const date = ride.begin_trip_time || ride.request_time || ride.date || ride.created_at
      const distance = parseFloat(ride.distance || ride.distance_km || 0)

      let amountUSD = amount
      if (currency !== 'USD') {
        try {
          const rate = await getHistoricalRate(currency, 'USD', date)
          if (rate) {
            amountUSD = amount * rate
            historicalRatesCount++
          } else {
            amountUSD = convertToUSD(amount, currency, date, exchangeRates)
          }
        } catch (error) {
          amountUSD = convertToUSD(amount, currency, date, exchangeRates)
        }
      }

      transactions.push({
        date,
        amount,
        currency,
        amountUSD,
        description: `Viaje de ${ride.begin_address || 'origen'} a ${ride.dropoff_address || 'destino'}`,
        distance,
        category: 'transporte',
      })
    } catch (error) {
      console.warn('Error processing Uber ride:', error, ride)
    }
  }

  return {
    transactions: transactions.sort((a, b) => new Date(a.date) - new Date(b.date)),
    usingHistoricalRates: historicalRatesCount > 0,
    historicalRatesCount,
  }
}

async function processAmazonData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

async function processStreamingData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

async function processDeliveryData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

async function processViajesData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

async function processSupermercadoData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

async function processGasolinaData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

async function processBancoData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

async function processSuscripcionesData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

async function processTransporteData(data, exchangeRates) {
  return await processUberData(data, exchangeRates)
}

async function processComprasData(data, exchangeRates) {
  return await processGenericData(data, exchangeRates)
}

