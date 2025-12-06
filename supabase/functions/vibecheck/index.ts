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
    const { kedaiName, reviews, rating, priceLevel } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log(`Analyzing vibe for: ${kedaiName}`);

    const reviewTexts = reviews?.map((r: any) => `"${r.text}" - ${r.rating}⭐`).join('\n') || 'No reviews available';

    const systemPrompt = `You are a brutally honest Malaysian food critic AI called "VibeCheck Makan". 
Your job is to analyze a restaurant's vibe based on reviews and give a verdict.

You must respond in JSON format with these fields:
- vibeScore: number from 1-100 (100 = amazing vibe, 1 = run away)
- verdict: "🔥 CERTIFIED SLAP" | "✅ SOLID CHOICE" | "😐 MEH" | "🚩 RED FLAGS" | "💀 AVOID"
- summary: 1-2 sentences in casual Malaysian English (mix BM/English)
- greenFlags: array of 2-3 positive points (empty if none)
- redFlags: array of 2-3 concerns (empty if none)
- bestFor: who should go here (e.g., "Date night", "Family gathering", "Solo makan")
- avoidIf: who should avoid (e.g., "You're in a rush", "Vegetarian")

Be real and honest. If reviews mention slow service, food quality issues, or hygiene concerns - flag them.
If reviews are glowing - celebrate it. No sugarcoating.`;

    const userPrompt = `Analyze this kedai's vibe:

Restaurant: ${kedaiName}
Rating: ${rating || 'Unknown'}/5
Price Level: ${priceLevel || 'Unknown'}

Customer Reviews:
${reviewTexts}

Give me the real vibe check.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Gemini response:', content);

    // Parse JSON from response
    let vibeCheck;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        vibeCheck = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback response
      vibeCheck = {
        vibeScore: 70,
        verdict: "✅ SOLID CHOICE",
        summary: "Looks decent based on what we got, geng!",
        greenFlags: ["Has reviews"],
        redFlags: [],
        bestFor: "Anyone looking for a meal",
        avoidIf: "You need specific info"
      };
    }

    return new Response(JSON.stringify(vibeCheck), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in vibecheck function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      vibeScore: 0,
      verdict: "❓ UNKNOWN",
      summary: "Tak dapat analyze, cuba lagi later.",
      greenFlags: [],
      redFlags: [],
      bestFor: "Unknown",
      avoidIf: "Unknown"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
