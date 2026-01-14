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
    const { userId, orchardId } = JSON.parse(event.body || '{}')
    if (!userId || !orchardId) return { statusCode: 400, headers, body: 'Missing data' }

    // Verify ownership
    const { data: orchard, error: checkErr } = await supabase
      .from('orchards')
      .select('id')
      .eq('id', orchardId)
      .eq('user_id', userId)
      .single()
    if (checkErr || !orchard) return { statusCode: 403, headers, body: 'Not found or unauthorized' }

    // Delete (cascade will handle history)
    const { error: delErr } = await supabase
      .from('orchards')
      .delete()
      .eq('id', orchardId)
    if (delErr) throw delErr

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
