const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminKey = process.env.ADMIN_API_KEY

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
}

const computeTrialDay = (trialStartIso) => {
  if (!trialStartIso) return 1
  const diff = Math.max(0, Date.now() - Date.parse(trialStartIso))
  return Math.min(7, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1)
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: 'Method not allowed' }
  if (!supabase) return { statusCode: 500, headers, body: 'Supabase not configured' }

  if (!adminKey || event.headers['x-admin-key'] !== adminKey) {
    return { statusCode: 401, headers, body: 'Unauthorized' }
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id,name,email,trial_start,feedback_seen,created_at,last_seen')
      .order('created_at', { ascending: false })

    if (error) throw error

    const { data: orchards, error: orchErr } = await supabase
      .from('orchards')
      .select('id,user_id,last_timestamp')

    if (orchErr) throw orchErr

    const lastByUser = {}
    orchards.forEach(o => {
      if (!o.last_timestamp) return
      const prev = lastByUser[o.user_id]
      if (!prev || new Date(o.last_timestamp) > new Date(prev)) {
        lastByUser[o.user_id] = o.last_timestamp
      }
    })

    const sessionsByUser = {}
    try {
      const { data: sessions, error: sessionsErr } = await supabase
        .from('user_sessions')
        .select('user_id,duration_seconds,ended_at')
      if (sessionsErr) throw sessionsErr
      sessions.forEach(session => {
        const entry = sessionsByUser[session.user_id] || { totalSeconds: 0, lastEndedAt: null }
        entry.totalSeconds += Number(session.duration_seconds || 0)
        if (session.ended_at && (!entry.lastEndedAt || new Date(session.ended_at) > new Date(entry.lastEndedAt))) {
          entry.lastEndedAt = session.ended_at
        }
        sessionsByUser[session.user_id] = entry
      })
    } catch (err) {
      console.warn('user_sessions not available', err?.message || err)
    }

    const enriched = users.map(u => ({
      ...u,
      trial_day: computeTrialDay(u.trial_start),
      last_activity: lastByUser[u.id] || u.last_seen || u.created_at,
      total_session_seconds: sessionsByUser[u.id]?.totalSeconds || 0,
      last_session_at: sessionsByUser[u.id]?.lastEndedAt || null,
    }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        total_users: enriched.length,
        users: enriched,
      }),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: 'Server error' }
  }
}
