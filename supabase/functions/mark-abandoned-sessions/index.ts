import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find active sessions with no activity in last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    const { data: staleSessions, error: fetchError } = await supabase
      .from('multiplications_app_learning_sessions')
      .select('id, student_id, session_name, last_activity_at')
      .eq('status', 'active')
      .lt('last_activity_at', thirtyMinutesAgo)

    if (fetchError) {
      console.error('Error fetching stale sessions:', fetchError)
      throw fetchError
    }

    console.log(`Found ${staleSessions?.length || 0} stale sessions to abandon`)

    if (staleSessions && staleSessions.length > 0) {
      // Mark them as abandoned
      const { error: updateError } = await supabase
        .from('multiplications_app_learning_sessions')
        .update({ 
          status: 'abandoned',
          updated_at: new Date().toISOString()
        })
        .in('id', staleSessions.map(s => s.id))

      if (updateError) {
        console.error('Error updating sessions:', updateError)
        throw updateError
      }

      console.log(`Successfully marked ${staleSessions.length} sessions as abandoned`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        abandonedCount: staleSessions?.length || 0,
        message: `Marked ${staleSessions?.length || 0} sessions as abandoned`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in mark-abandoned-sessions:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
