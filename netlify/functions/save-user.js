const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase env vars missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' }
  }

  if (!supabase) {
    return { statusCode: 500, headers, body: 'Backend not configured' }
  }

  try {
    const { name, email } = JSON.parse(event.body || '{}')
    if (!name || !email) {
      return { statusCode: 400, headers, body: 'Name and email required' }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { statusCode: 400, headers, body: 'Invalid email' }
    }

    const { error } = await supabase
      .from('users')
      .upsert(
        { name: String(name).trim(), email: String(email).toLowerCase() },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Supabase insert error', error)
      return { statusCode: 500, headers, body: 'Failed to save user' }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('Handler error', err)
    return { statusCode: 500, headers, body: 'Server error' }
  }
}
