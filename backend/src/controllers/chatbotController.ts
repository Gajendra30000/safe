import { Request, Response } from 'express';
import axios from 'axios';

export const handleChatbotQuery = async (req: Request, res: Response) => {
  const { message, latitude, longitude } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const GROQ_KEY = process.env.GROQ_API_KEY;
  const ORS_KEY = process.env.OPENROUTE_API_KEY; // Optional - free 2000 requests/day

  if (!GROQ_KEY) {
    return res.status(500).json({ error: "GROQ API key is not configured on the server." });
  }

  try {
    const text = String(message).toLowerCase().trim();

    const isGreeting = /\b(hi|hello|hey|yo|hola|namaste)\b/.test(text);
    const isHelp = /\b(help|what can you do|how (do|can) you help)\b/.test(text);

    const categoryMap: { [key: string]: string } = {
      hospital: 'hospital',
      doctor: 'hospital',
      medical: 'hospital',
      emergency: 'hospital',
      police: 'police',
      cop: 'police',
      station: 'police',
      security: 'police',
      pharmacy: 'pharmacy',
      medicine: 'pharmacy',
      drug: 'pharmacy',
      chemist: 'pharmacy'
    };

    let category: string | null = null;
    for (const [keyword, cat] of Object.entries(categoryMap)) {
      if (text.includes(keyword)) {
        category = cat;
        break;
      }
    }

    if (isGreeting || isHelp || !category) {
      const prompt = `You are a concise, friendly safety assistant. Greet the user briefly and explain you can find nearby hospitals, police stations, or pharmacies using their location. If they didn't specify what they need, ask a short clarifying question. Keep it under 2 short sentences.

User message: "${message}"`;

      const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
      const groqResponse = await axios.post(
        groqUrl,
        {
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          model: "llama-3.1-8b-instant"
        },
        { headers: { Authorization: `Bearer ${GROQ_KEY}` } }
      );

      const aiReply = groqResponse.data?.choices?.[0]?.message?.content?.trim()
        || "Hi! I can find nearby hospitals, police stations, or pharmacies. What do you need?";

      return res.status(200).json({ reply: aiReply });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: "Location (latitude and longitude) is required to find nearby places." });
    }

    // Use Overpass API (OpenStreetMap) - completely free and accurate for nearby places
    const amenityMap: any = {
      'hospital': 'hospital',
      'police': 'police',
      'pharmacy': 'pharmacy'
    };
    const amenity = amenityMap[category] || category;
    const radius = 5000; // 5km radius
    
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="${amenity}"](around:${radius},${latitude},${longitude});
        way["amenity"="${amenity}"](around:${radius},${latitude},${longitude});
        relation["amenity"="${amenity}"](around:${radius},${latitude},${longitude});
      );
      out center 1;
    `;
    
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const searchResponse = await axios.post(overpassUrl, overpassQuery, {
      headers: { 'Content-Type': 'text/plain' }
    });

    if (searchResponse.data?.elements && searchResponse.data.elements.length > 0) {
      const element = searchResponse.data.elements[0];
      const destLat = element.lat || element.center?.lat;
      const destLon = element.lon || element.center?.lon;
      
      const destinationName = element.tags?.name || `Nearby ${category}`;
      const street = element.tags?.['addr:street'] || '';
      const houseNumber = element.tags?.['addr:housenumber'] || '';
      const city = element.tags?.['addr:city'] || '';
      const destinationAddress = [houseNumber, street, city].filter(Boolean).join(', ') || "Address unavailable";
      const destinationCoords = [destLon, destLat];

      let steps: string[] = [];
      let durationMins: number | null = null;
      if (destinationCoords && destinationCoords.length === 2 && destLon && destLat) {
        if (ORS_KEY) {
          // Use OpenRouteService if API key provided (free tier: 2000 requests/day)
          const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_KEY}&start=${longitude},${latitude}&end=${destLon},${destLat}`;
          try {
            const directionsResponse = await axios.get(directionsUrl);
            const routes = directionsResponse.data?.features;
            if (routes && routes.length > 0) {
              const route = routes[0];
              durationMins = route.properties?.summary?.duration ? Math.round(route.properties.summary.duration / 60) : null;
              const segments = route.properties?.segments || [];
              for (const segment of segments) {
                if (segment.steps && Array.isArray(segment.steps)) {
                  for (const step of segment.steps) {
                    if (step.instruction) {
                      steps.push(step.instruction);
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error("Directions API error:", err);
          }
        } else {
          // Simple distance calculation without API
          const distance = Math.sqrt(
            Math.pow(destLon - longitude, 2) +
            Math.pow(destLat - latitude, 2)
          ) * 111; // Approximate km
          durationMins = Math.round((distance / 40) * 60); // Rough estimate assuming 40 km/h
          steps = [`Head towards ${destinationName} (approximately ${distance.toFixed(1)} km away)`];
        }
      }

      const prompt = `You are a helpful safety assistant. A user asked for the nearest "${category}".
The best result found is:
- Name: ${destinationName}
- Address: ${destinationAddress}
${durationMins ? `- Estimated travel time: ${durationMins} minutes.` : ''}

${steps.length ? `The step-by-step directions are: ${steps.join('. ')}.` : 'Directions are currently unavailable.'}

Present this information clearly and concisely. Start with the name and address, then travel time (if available), then the directions or a brief note if directions are unavailable.`;

      const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
      const groqResponse = await axios.post(
        groqUrl,
        {
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          model: "llama-3.1-8b-instant"
        },
        { headers: { Authorization: `Bearer ${GROQ_KEY}` } }
      );

      const aiReply = groqResponse.data?.choices?.[0]?.message?.content?.trim() || `The nearest ${category} is ${destinationName} at ${destinationAddress}.`;

      return res.status(200).json({ reply: aiReply });
    } else {
      return res.status(200).json({
        reply: `I couldn't find any ${category} nearby. Please try searching for something else or check your location.`
      });
    }

  } catch (error: any) {
    console.error("Chatbot Query Error:", error.message);
    return res.status(500).json({ error: "An error occurred while processing your request." });
  }
};
