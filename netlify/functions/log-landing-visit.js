const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const getClientIp = (headersMap = {}) => {
  const forwarded = headersMap['x-forwarded-for'] || headersMap['X-Forwarded-For']
  if (forwarded) return forwarded.split(',')[0].trim()
  return headersMap['x-real-ip'] || headersMap['X-Real-IP'] || headersMap['client-ip'] || null
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' }
  if (!supabase) return { statusCode: 500, headers, body: 'Supabase not configured' }

  try {
    const { path, referrer, userAgent } = JSON.parse(event.body || '{}')
    const ip = getClientIp(event.headers || {})

    const { error } = await supabase
      .from('landing_visits')
      .insert({
        ip,
        path: path || null,
        referrer: referrer || null,
        user_agent: userAgent || null,
        visited_at: new Date().toISOString(),
      })

    if (error) throw error

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: 'Server error' }
  }
}
