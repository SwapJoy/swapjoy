import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { query, limit = 30 } = await req.json();
    const q = (query || '').trim();
    if (!q) return new Response(JSON.stringify({ items: [] }), { headers: { 'Content-Type': 'application/json' }, status: 200 });

    // Generate query embedding using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: q, model: 'text-embedding-3-small' }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      return new Response(JSON.stringify({ error: errorData.message || 'OpenAI error' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
    }

    const embJson = await openaiResponse.json();
    const embedding = embJson?.data?.[0]?.embedding;
    if (!embedding || !Array.isArray(embedding)) {
      return new Response(JSON.stringify({ error: 'Invalid embedding' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
    }

    // Query Postgres for nearest neighbors with image join
    const { data, error } = await supabaseClient
      .rpc('match_items', {
        query_embedding: embedding,
        match_threshold: 0.05,
        match_count: limit,
        min_value: 0,
        exclude_user_id: null,
      });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
    }

    // Enrich with primary image in a single query (if not included)
    let items = Array.isArray(data) ? data : [];
    const ids = items.map((it: any) => it.id);
    if (ids.length > 0) {
      const { data: rows } = await supabaseClient
        .from('items')
        .select('id, title, description, price, currency, item_images(image_url)')
        .in('id', ids);
      const map = new Map<string, any>();
      (rows || []).forEach((r: any) => map.set(r.id, r));
      items = items.map((it: any) => ({ ...map.get(it.id), similarity: it.similarity }));
    }

    return new Response(JSON.stringify({ items }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as any).message || 'Unknown error' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
});


