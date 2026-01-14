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
    const { userId, orchard, decision } = JSON.parse(event.body || '{}')
    if (!userId || !orchard || !decision) return { statusCode: 400, headers, body: 'Missing data' }
    const { name, lat, lon, id } = orchard

    // Limit of 10 orchards per user (FREE)
    if (!id) {
      const { count, error: countErr } = await supabase
        .from('orchards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      if (countErr) throw countErr
      if ((count || 0) >= 10) {
        return { statusCode: 400, headers, body: 'Límite de 10 huertos alcanzado en la versión actual.' }
      }
    }

    // Upsert orchard
    const orchardPayload = {
      user_id: userId,
      name: name || 'Huerto sin nombre',
      lat,
      lon,
      last_verdict: decision.verdict,
      last_level: decision.level,
      last_timestamp: decision.timestamp,
    }

    let orchardId = id
    if (id) {
      const { error } = await supabase
        .from('orchards')
        .update(orchardPayload)
        .eq('id', id)
      if (error) throw error
      orchardId = id
    } else {
      const { data, error } = await supabase
        .from('orchards')
        .insert(orchardPayload)
        .select('id')
        .single()
      if (error) throw error
      orchardId = data.id
    }

    // Update last_seen
    await supabase.from('users').update({ last_seen: new Date().toISOString() }).eq('id', userId)

    // Insert history
    const { error: histErr } = await supabase
      .from('orchard_history')
      .insert({
        orchard_id: orchardId,
        verdict: decision.verdict,
        timestamp: decision.timestamp,
      })
    if (histErr) throw histErr

    // Return refreshed list
    const { data: orchards, error: orchErr } = await supabase
      .from('orchards')
      .select('id,name,lat,lon,last_verdict,last_level,last_timestamp')
      .eq('user_id', userId)
      .order('last_timestamp', { ascending: false })
    if (orchErr) throw orchErr

    let histories = []
    if (orchards.length) {
      const ids = orchards.map(o => o.id)
      const { data: hist, error: histErr2 } = await supabase
        .from('orchard_history')
        .select('orchard_id,verdict,timestamp')
        .in('orchard_id', ids)
        .order('timestamp', { ascending: false })
        .limit(100)
      if (histErr2) throw histErr2
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ orchards: orchardsWithHistory }),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: 'Server error' }
  }
}
