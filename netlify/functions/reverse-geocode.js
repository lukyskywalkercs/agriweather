const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: 'Method not allowed' }

  const { lat, lon } = event.queryStringParameters || {}
  if (!lat || !lon) return { statusCode: 400, headers, body: 'Missing coordinates' }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&accept-language=es&email=lucaslucas197739@gmail.com`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'agriweather/1.0 (contact: lucaslucas197739@gmail.com)',
        'Accept': 'application/json',
      },
    })
    if (!res.ok) return { statusCode: 502, headers, body: 'Geocoding error' }
    const data = await res.json()
    const province = data?.address?.province || data?.address?.state || null
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ province }),
    }
  } catch (err) {
    return { statusCode: 500, headers, body: 'Server error' }
  }
}
