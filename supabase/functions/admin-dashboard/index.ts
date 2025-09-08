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

    // Get dashboard statistics
    const [
      { count: totalStudents, error: studentsError },
      { count: totalCourses, error: coursesError },
      { data: registrations, error: registrationsError },
      { data: profiles, error: profilesError }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('course_registrations').select('status'),
      supabase.from('profiles').select('department, fees_paid')
    ])

    if (studentsError || coursesError || registrationsError || profilesError) {
      console.error('Dashboard query errors:', { studentsError, coursesError, registrationsError, profilesError })
      throw new Error('Failed to fetch dashboard data')
    }

    // Calculate registration rate
    const activeRegistrations = registrations?.filter(r => r.status === 'active').length || 0
    const registrationRate = totalStudents > 0 ? Math.round((activeRegistrations / totalStudents) * 100) : 0

    // Calculate department distribution
    const departmentCounts = profiles?.reduce((acc: Record<string, number>, profile) => {
      const dept = profile.department || 'Unknown'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate fees statistics
    const feesPaid = profiles?.filter(p => p.fees_paid).length || 0
    const feesUnpaid = (totalStudents || 0) - feesPaid

    const dashboardData = {
      totalStudents: totalStudents || 0,
      totalCourses: totalCourses || 0,
      registrationRate,
      activeRegistrations,
      feesPaid,
      feesUnpaid,
      departmentDistribution: Object.entries(departmentCounts)
        .map(([name, count]) => ({ name, students: count }))
        .sort((a, b) => b.students - a.students),
      lastUpdated: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(dashboardData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('admin-dashboard error', e)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})