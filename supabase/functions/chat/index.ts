import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Budget to price filter mapping
const BUDGET_PRICE_MAP: Record<string, string[]> = {
  cheap: ['$', '$$'],
  moderate: ['$$', '$$$'],
  expensive: ['$$$', '$$$$'],
};

// Calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Format distance for display
function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

// Search restaurants using SerpAPI Google Maps
async function searchRestaurants(
  query: string, 
  filters?: { budget?: string; cuisine?: string },
  location?: { lat: number; lon: number }
): Promise<any[]> {
  const serpApiKey = Deno.env.get('SERPAPI_KEY');
  if (!serpApiKey) {
    console.log('SERPAPI_KEY not configured');
    return [];
  }

  try {
    // Build search query with cuisine filter
    let searchQuery = query;
    if (filters?.cuisine) {
      searchQuery = `${filters.cuisine} ${query}`;
    }
    searchQuery = `${searchQuery} restaurant`;
    
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Build URL with optional GPS coordinates for "near me" search
    let searchUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodedQuery}&hl=en&type=search&api_key=${serpApiKey}`;
    
    if (location?.lat && location?.lon) {
      // Add GPS coordinates for nearby search
      searchUrl += `&ll=@${location.lat},${location.lon},15z`;
      console.log('Searching near GPS:', location.lat, location.lon);
    } else {
      // Default to Malaysia
      searchUrl += `&gl=my`;
    }
    
    console.log('Searching Google Maps for:', searchQuery);
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.error('SerpAPI search error:', searchResponse.status);
      return [];
    }

    const searchData = await searchResponse.json();
    let places = searchData.local_results || [];
    
    console.log('Found places:', places.length);
    
    // Filter by budget/price level if specified
    if (filters?.budget && BUDGET_PRICE_MAP[filters.budget]) {
      const allowedPrices = BUDGET_PRICE_MAP[filters.budget];
      places = places.filter((p: any) => {
        if (!p.price) return true; // Include if no price info
        return allowedPrices.includes(p.price);
      });
      console.log('After budget filter:', places.length);
    }
    
    // Add distance if user location is available
    if (location?.lat && location?.lon) {
      places = places.map((p: any) => {
        const placeLat = p.gps_coordinates?.latitude;
        const placeLon = p.gps_coordinates?.longitude;
        if (placeLat && placeLon) {
          const distance = calculateDistance(location.lat, location.lon, placeLat, placeLon);
          return { ...p, distance, distanceFormatted: formatDistance(distance) };
        }
        return p;
      });
      
      // Sort by distance when location is available
      places.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));
    } else {
      // Sort by rating and reviews count
      places = places
        .filter((p: any) => p.rating && p.reviews)
        .sort((a: any, b: any) => {
          const scoreA = (a.rating || 0) * Math.log(a.reviews || 1);
          const scoreB = (b.rating || 0) * Math.log(b.reviews || 1);
          return scoreB - scoreA;
        });
    }
    
    return places.slice(0, 10);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return [];
  }
}

// Fetch reviews for a place using SerpAPI
async function fetchPlaceReviews(dataId: string): Promise<any[]> {
  const serpApiKey = Deno.env.get('SERPAPI_KEY');
  if (!serpApiKey || !dataId) return [];

  try {
    const reviewsUrl = `https://serpapi.com/search.json?engine=google_maps_reviews&data_id=${dataId}&hl=en&sort_by=qualityScore&api_key=${serpApiKey}`;
    console.log('Fetching reviews for:', dataId);
    
    const reviewsResponse = await fetch(reviewsUrl);
    if (!reviewsResponse.ok) {
      console.error('SerpAPI reviews error:', reviewsResponse.status);
      if (reviewsResponse.status === 429) {
        throw new Error('SERPAPI_RATE_LIMIT');
      }
      return [];
    }

    const reviewsData = await reviewsResponse.json();
    const reviews = reviewsData.reviews || [];
    
    // Return top 5 reviews
    return reviews.slice(0, 5).map((r: any) => ({
      name: r.user?.name || 'Anonymous',
      rating: r.rating || 5,
      text: r.snippet || r.text || 'Great food!',
      date: r.date || '',
      likes: r.likes || 0,
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, filters, location } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('Filters received:', filters);
    console.log('Location received:', location);
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all kedai from database as fallback
    const { data: kedaiList, error: dbError } = await supabase
      .from('kedai_makan_demo')
      .select('*');

    if (dbError) {
      console.error('Database error:', dbError);
    }

    console.log('User message:', message);

    // Build context with kedai database
    const kedaiContext = kedaiList?.map(k => 
      `- ${k.name} (${k.area}): ${k.signature}, Price: ${k.price_level}, Tags: ${k.tags.join(', ')}`
    ).join('\n') || 'No local database available';

    // Check if user has provided location
    const hasUserLocation = location?.lat && location?.lon;

    const systemPrompt = `You are "Makan Mana Geng" - a friendly and helpful Malaysian food recommendation assistant.

You're like a warm, knowledgeable friend who loves sharing the best makan spots. Mix English and Malay naturally but always be polite and encouraging. Never be rude or dismissive.

Personality traits:
- Friendly, warm, and supportive - like a good friend helping out
- Use casual Malaysian terms like "boss", "geng", "lah", "kan" warmly
- Be enthusiastic and positive about recommending food
- Give helpful suggestions, never mock or be sarcastic
- If you cannot help, apologize nicely and suggest alternatives
- Use emojis sparingly to keep it friendly 🍛

LOCATION RULES - VERY IMPORTANT:
1. If user specifies a LOCATION NAME (e.g., "Bangsar", "KL", "Petaling Jaya", "Damansara") - use SerpAPI to search that area directly. NO need for GPS location!
2. ONLY ask for GPS location when user says "near me", "nearby", "dekat sini", "sekitar sini" WITHOUT specifying any area name
3. If user already mentions a place name, NEVER ask them to enable location - just search that place!

${hasUserLocation ? 'User has shared their GPS location - perfect for "near me" searches!' : 'User has NOT shared GPS location. Only relevant if they ask for "near me" without specifying an area.'}

You have a local database of verified spots:
${kedaiContext}

IMPORTANT RULES:
1. Analyze user request for: location, food type, budget, vibe
2. ALWAYS respond with JSON block containing search query to find restaurants
3. Format: natural chat, then JSON with search_query
4. If user asks for "near me" AND did not specify any location AND GPS is NOT available, kindly ask them to enable location and set needs_location: true
5. If user specified a location name (Bangsar, KL, etc.) - SEARCH DIRECTLY using SerpAPI, do NOT ask for GPS!
6. If asking about places NOT in database, set use_serpapi: true
7. If asking about places IN database, set use_serpapi: false and list recommendations

JSON Format:
\`\`\`json
{"search_query": "cafe Bangsar", "use_serpapi": true, "recommendations": []}
\`\`\`

OR for database matches:
\`\`\`json
{"search_query": "", "use_serpapi": false, "recommendations": ["Restaurant Name 1", "Restaurant Name 2"]}
\`\`\`

OR ONLY if user says "near me" without any location AND GPS not available:
\`\`\`json
{"search_query": "", "use_serpapi": false, "recommendations": [], "needs_location": true}
\`\`\`

Always be helpful and encouraging! Make users feel welcome.`;

    // Build conversation history for Gemini format
    const conversationHistory = (history || []).map((h: any) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    // Call Gemini directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'Understood! I am Makan Mana Geng, ready to help find the best makan spots. How can I help you today, geng?' }]
          },
          ...conversationHistory,
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          message: "Alamak, ramai sangat orang tengah guna ni. Cuba lagi dalam beberapa minit ya! 😊",
          kedai: [],
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, ada masalah sikit. Cuba lagi ya!";

    console.log('AI Response:', aiResponse);

    // Parse JSON to determine search strategy
    let matchedKedai: any[] = [];
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        
        if (parsed.use_serpapi && parsed.search_query) {
          // Search using SerpAPI for new places with filters and location
          console.log('Using SerpAPI to search:', parsed.search_query, 'with filters:', filters, 'location:', location);
          const places = await searchRestaurants(parsed.search_query, filters, location);
          
          // Fetch reviews for top places (limit to 5 to save API calls)
          matchedKedai = await Promise.all(
            places.slice(0, 5).map(async (place: any) => {
              const reviews = await fetchPlaceReviews(place.data_id);
              return {
                id: place.place_id || place.data_id,
                name: place.title || place.name,
                area: place.address?.split(',')[1]?.trim() || 'Malaysia',
                signature: place.type || 'Restaurant',
                price_level: place.price || '$$',
                lat: place.gps_coordinates?.latitude || 0,
                lon: place.gps_coordinates?.longitude || 0,
                tags: place.types || [],
                reviews: reviews,
                rating: place.rating,
                totalReviews: place.reviews,
                hasRealReviews: reviews.length > 0,
                thumbnail: place.thumbnail,
                distance: place.distance,
                distanceFormatted: place.distanceFormatted,
              };
            })
          );
          
          console.log('SerpAPI results:', matchedKedai.length);
        } else if (parsed.recommendations?.length > 0) {
          // Use database matches
          const recommendedNames = parsed.recommendations;
          
          const dbMatches = kedaiList?.filter((k: any) => 
            recommendedNames.some((name: string) => 
              k.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(k.name.toLowerCase())
            )
          ) || [];
          
          // Fetch real reviews for database matches
          matchedKedai = await Promise.all(dbMatches.map(async (kedai: any) => {
            const serpApiKey = Deno.env.get('SERPAPI_KEY');
            if (!serpApiKey) {
              return { ...kedai, hasRealReviews: false };
            }
            
            // Search for place to get data_id
            const searchQuery = encodeURIComponent(`${kedai.name} ${kedai.area} Malaysia`);
            const searchUrl = `https://serpapi.com/search.json?engine=google_maps&q=${searchQuery}&api_key=${serpApiKey}`;
            
            try {
              const searchRes = await fetch(searchUrl);
              if (searchRes.ok) {
                const searchData = await searchRes.json();
                const place = searchData.local_results?.[0];
                if (place?.data_id) {
                  const reviews = await fetchPlaceReviews(place.data_id);
                  
                  // Calculate distance if user location available
                  let distance, distanceFormatted;
                  if (location?.lat && location?.lon && place.gps_coordinates) {
                    distance = calculateDistance(
                      location.lat, location.lon,
                      place.gps_coordinates.latitude, place.gps_coordinates.longitude
                    );
                    distanceFormatted = formatDistance(distance);
                  }
                  
                  return {
                    ...kedai,
                    reviews: reviews.length > 0 ? reviews : kedai.reviews,
                    hasRealReviews: reviews.length > 0,
                    rating: place.rating,
                    totalReviews: place.reviews,
                    distance,
                    distanceFormatted,
                  };
                }
              }
            } catch (e) {
              console.error('Error fetching place:', e);
            }
            
            return { ...kedai, hasRealReviews: false };
          }));
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }

    // Clean response (remove JSON block for display)
    const cleanResponse = aiResponse.replace(/```json[\s\S]*?```/g, '').trim();

    return new Response(JSON.stringify({ 
      message: cleanResponse,
      kedai: matchedKedai
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in chat:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      message: "Alamak, ada masalah teknikal. Cuba lagi ya! 🙏",
      kedai: [],
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
