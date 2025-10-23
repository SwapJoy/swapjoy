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
    const { itemId } = await req.json()
    
    if (!itemId) {
      return new Response(
        JSON.stringify({ error: 'Item ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get item details
    const { data: item, error: itemError } = await supabaseClient
      .from('items')
      .select('title, description, category_id')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return new Response(
        JSON.stringify({ error: 'Item not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get category name
    const { data: category, error: categoryError } = await supabaseClient
      .from('categories')
      .select('name')
      .eq('id', item.category_id)
      .single()

    if (categoryError || !category) {
      return new Response(
        JSON.stringify({ error: 'Category not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create text for embedding
    const text = `${item.title}. ${item.description}. Category: ${category.name}`
    
    // Generate embedding using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002'
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate embedding' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: embeddingData } = await openaiResponse.json()
    const embedding = embeddingData[0].embedding

    // Store embedding in database
    const { error: updateError } = await supabaseClient
      .from('items')
      .update({ embedding })
      .eq('id', itemId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to store embedding' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        itemId,
        embeddingLength: embedding.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-embedding function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
