import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { kedai } = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    console.log('Generating Manglish comment for:', kedai.name);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are a funny Malaysian food reviewer. Write in Manglish (Malaysian English mixed with Malay slang). 
Be casual, funny, and use words like "boss", "weh", "confirm", "lah", "geng", "tapau", "shiok", "sedap gila".
Keep responses to 1-2 sentences max. Be playful and relatable to Malaysians.`
          },
          {
            role: 'user',
            content: `Write a funny Manglish comment about this restaurant:
Name: ${kedai.name}
Area: ${kedai.area}
Signature dish: ${kedai.signature}
Price: ${kedai.price_level}`
          }
        ],
        max_tokens: 100,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const comment = data.choices[0]?.message?.content || "Sedap boss, try la!";

    console.log('Generated comment:', comment);

    return new Response(JSON.stringify({ comment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error generating comment:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      comment: "Weh this place confirm sedap, trust me bro! 🔥",
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});