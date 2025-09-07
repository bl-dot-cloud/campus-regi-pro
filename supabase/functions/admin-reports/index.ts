import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const adminKeyHeader = req.headers.get('x-admin-key')
    const adminPassword = Deno.env.get('ADMIN_PASSWORD')

    if (!adminKeyHeader || !adminPassword || adminKeyHeader !== adminPassword) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Return raw data for client-side aggregation to minimize changes
    const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*')
    if (profilesErr) throw profilesErr

    const { data: courses, error: coursesErr } = await supabase.from('courses').select('*')
    if (coursesErr) throw coursesErr

    const { data: registrations, error: regsErr } = await supabase.from('course_registrations').select('*')
    if (regsErr) throw regsErr

    return new Response(
      JSON.stringify({ profiles, courses, registrations }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('admin-reports error', e)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})