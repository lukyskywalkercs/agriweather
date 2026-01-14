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

const computeTrialDay = (trialStartIso) => {
  if (!trialStartIso) return 1
  const diff = Math.max(0, Date.now() - Date.parse(trialStartIso))
  return Math.min(7, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1)
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' }
  if (!supabase) return { statusCode: 500, headers, body: 'Supabase not configured' }

  try {
    const { name, email } = JSON.parse(event.body || '{}')
    if (!name || !email) return { statusCode: 400, headers, body: 'Name and email required' }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return { statusCode: 400, headers, body: 'Invalid email' }

    const { data: existing, error: selectErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (selectErr) throw selectErr

    let user = existing
    if (!existing) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          email: email.toLowerCase(),
          trial_start: new Date().toISOString(),
          feedback_seen: false,
          last_seen: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      user = data
    } else {
      const { data, error } = await supabase
        .from('users')
        .update({ name: name.trim(), last_seen: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      user = data
    }

    const { data: orchards, error: orchErr } = await supabase
      .from('orchards')
      .select('id,name,lat,lon,last_verdict,last_level,last_timestamp')
      .eq('user_id', user.id)
      .order('last_timestamp', { ascending: false })

    if (orchErr) throw orchErr

    let histories = []
    if (orchards.length) {
      const ids = orchards.map(o => o.id)
      const { data: hist, error: histErr } = await supabase
        .from('orchard_history')
        .select('orchard_id,verdict,timestamp')
        .in('orchard_id', ids)
        .order('timestamp', { ascending: false })
        .limit(100)
      if (histErr) throw histErr
      histories = hist
    }

    const orchardsWithHistory = orchards.map(o => ({
      id: o.id,
      name: o.name,
      lat: o.lat,
      lon: o.lon,
      lastDecision: o.last_verdict ? { verdict: o.last_verdict, level: o.last_level, timestamp: o.last_timestamp } : null,
      history: histories.filter(h => h.orchard_id === o.id).slice(0, 3),
    }))

    const trialDay = computeTrialDay(user.trial_start)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        userId: user.id,
        userName: user.name,
        trialStart: user.trial_start,
        trialDay,
        feedbackSeen: user.feedback_seen,
        orchards: orchardsWithHistory,
      }),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: 'Server error' }
  }
}
