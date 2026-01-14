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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' }
  if (!supabase) return { statusCode: 500, headers, body: 'Supabase not configured' }

  try {
    const { userId, feedbackSeen } = JSON.parse(event.body || '{}')
    if (!userId) return { statusCode: 400, headers, body: 'User required' }

    const updates = {}
    if (typeof feedbackSeen === 'boolean') updates.feedback_seen = feedbackSeen

    if (Object.keys(updates).length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
    }

    const { error } = await supabase.from('users').update(updates).eq('id', userId)
    if (error) throw error

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: 'Server error' }
  }
}
