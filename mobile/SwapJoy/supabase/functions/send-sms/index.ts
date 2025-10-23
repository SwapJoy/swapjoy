import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, message } = await req.json()

    // For now, we'll simulate SMS sending
    // In production, integrate with a working SMS provider like:
    // - MessageBird (supports Georgia)
    // - Vonage (formerly Nexmo)
    // - AWS SNS
    // - Azure Communication Services

    console.log(`Simulated SMS to ${phone}: ${message}`)
    
    // Simulate success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully (simulated)',
        phone: phone 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
