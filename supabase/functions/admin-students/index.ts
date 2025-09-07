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

    const { action, payload } = await req.json()

    if (action === 'list') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return new Response(JSON.stringify({ profiles: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'toggleFees') {
      const { id, fees_paid } = payload || {}
      if (!id || typeof fees_paid !== 'boolean') {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('profiles')
        .update({ fees_paid })
        .eq('id', id)

      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'createStudent') {
      const { email, password, fullName, matricNumber, department, level } = payload || {}
      if (!email || !password || !fullName || !matricNumber || !department || !level) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Check for existing matric number
      const { data: existing, error: existingErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('matric_number', matricNumber)
        .maybeSingle()
      if (existingErr) throw existingErr
      if (existing) {
        return new Response(JSON.stringify({ error: 'Matric number already exists' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Create user with email confirmed
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          matric_number: matricNumber,
          department,
          level,
        },
      })
      if (createErr) throw createErr

      const userId = created.user?.id
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Try to update profile if trigger created it; otherwise insert
      const { data: updateRes, error: updateErr } = await supabase
        .from('profiles')
        .update({
          admin_created: true,
          temporary_password: password,
          full_name: fullName,
          matric_number: matricNumber,
          department,
          level,
        })
        .eq('user_id', userId)
        .select('id')

      if (updateErr) throw updateErr

      if (!updateRes || updateRes.length === 0) {
        // Fallback insert if no row existed
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: fullName,
            matric_number: matricNumber,
            department,
            level,
            admin_created: true,
            temporary_password: password,
          })
        if (insertErr) throw insertErr
      }

      return new Response(JSON.stringify({ success: true, user_id: userId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('admin-students error', e)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})