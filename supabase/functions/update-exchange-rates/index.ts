import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch exchange rates from businessonline.ge API
    const currencies = ['USD', 'EUR']
    const updatedRates: Array<{ code: string; rate: number }> = []

    for (const currency of currencies) {
      try {
        const response = await fetch(`https://api.businessonline.ge/api/rates/nbg/${currency}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.error(`Failed to fetch ${currency} rate:`, response.statusText)
          continue
        }

        // The API returns a plain number string, parse it directly
        const responseText = await response.text()
        const rate = parseFloat(responseText)

        if (!isNaN(rate) && rate > 0) {
          updatedRates.push({ code: currency, rate })
          
          // Update the currency in the database
          const { error: updateError } = await supabaseClient
            .from('currencies')
            .update({ 
              rate: rate,
              updated_at: new Date().toISOString()
            })
            .eq('code', currency)

          if (updateError) {
            console.error(`Error updating ${currency}:`, updateError)
          } else {
            console.log(`Successfully updated ${currency} rate to ${rate}`)
          }
        } else {
          console.error(`Invalid rate for ${currency}:`, responseText)
        }
      } catch (error) {
        console.error(`Error fetching ${currency}:`, error)
      }
    }

    // Update GEL rate to 1.0 if it's somehow not set
    await supabaseClient
      .from('currencies')
      .update({ rate: 1.0, updated_at: new Date().toISOString() })
      .eq('code', 'GEL')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedRates.length} currencies`,
        rates: updatedRates 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in update-exchange-rates:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

