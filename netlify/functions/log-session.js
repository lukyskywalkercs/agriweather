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
    const { userId, sessionId, startedAt, endedAt, durationSeconds, reason } = JSON.parse(event.body || '{}')
    if (!userId || !startedAt || !endedAt) {
      return { statusCode: 400, headers, body: 'Missing required fields' }
    }

    const duration = Number(durationSeconds)
    const safeDuration = Number.isFinite(duration) ? Math.max(1, Math.round(duration)) : null

    const { error: insertErr } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId || null,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: safeDuration,
        reason: reason || null,
      })

    if (insertErr) throw insertErr

    await supabase
      .from('users')
      .update({ last_seen: endedAt })
      .eq('id', userId)

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: 'Server error' }
  }
}
