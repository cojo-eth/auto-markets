import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPageMetadata(url: string): Promise<{ title: string; description: string; image: string | null }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await response.text();
    
    console.log('HTML length:', html.length);
    
    // Extract all meta tags for debugging
    const allMetaTags = html.match(/<meta[^>]+>/gi) || [];
    console.log('Found meta tags:', allMetaTags.length);
    
    // More flexible meta tag extraction
    const getMeta = (property: string): string | null => {
      // Try property attribute first (OG tags)
      let match = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'));
      if (!match) {
        match = html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'));
      }
      
      // Try name attribute (Twitter cards, standard meta)
      if (!match) {
        match = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'));
      }
      if (!match) {
        match = html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'));
      }
      
      if (match && match[1]) {
        const decoded = match[1]
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        console.log(`Found ${property}:`, decoded.substring(0, 100));
        return decoded;
      }
      return null;
    };
    
    // Extract various meta tags
    const ogTitle = getMeta('og:title');
    const ogDescription = getMeta('og:description');
    const ogImage = getMeta('og:image');
    
    const twitterTitle = getMeta('twitter:title');
    const twitterDescription = getMeta('twitter:description');
    const twitterImage = getMeta('twitter:image');
    const twitterImageSrc = getMeta('twitter:image:src');
    
    const metaDescription = getMeta('description');
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const htmlTitle = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"') : '';
    
    console.log('Extraction results:', {
      ogTitle: ogTitle ? 'Found' : 'None',
      twitterTitle: twitterTitle ? 'Found' : 'None',
      htmlTitle: htmlTitle ? 'Found' : 'None',
      ogDescription: ogDescription ? 'Found' : 'None',
      twitterDescription: twitterDescription ? 'Found' : 'None'
    });
    
    // Prefer OG/Twitter tags, fall back to standard
    const title = ogTitle || twitterTitle || htmlTitle || '';
    const description = ogDescription || twitterDescription || metaDescription || '';
    const image = ogImage || twitterImage || twitterImageSrc || null;
    
    console.log('Final metadata:', { 
      title: title ? title.substring(0, 100) : 'EMPTY', 
      description: description ? description.substring(0, 100) : 'EMPTY',
      image: image ? 'Found' : 'None' 
    });
    
    return { title, description, image };
  } catch (error) {
    console.error('Error fetching page metadata:', error);
    throw new Error(`Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateMarketImage(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: `Generate a prediction market hero image for: ${prompt}. Make it professional, engaging, and suitable for a betting/prediction market platform. 16:9 aspect ratio.`
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      return imageUrl;
    }
    
    throw new Error('No image generated');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

async function generateTopicIcon(topic: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: `Generate a simple, clean icon representing: ${topic}. The icon should be:
- A single clear symbol or object (like a soccer ball for soccer, a chart for stocks, etc.)
- Clean and minimalist design
- Square aspect ratio (1:1)
- Professional looking
- Suitable as a small icon
- On a transparent or white background`
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      return imageUrl;
    }
    
    throw new Error('No icon generated');
  } catch (error) {
    console.error('Error generating icon:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Fetching metadata for URL:', url);

    // Fetch the page metadata (OG tags, Twitter cards, etc.)
    const metadata = await fetchPageMetadata(url);
    console.log('Fetched metadata:', metadata);

    // Call Gemini to analyze the content and generate a prediction market
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating prediction markets. Given content from a webpage, you will create a compelling binary (YES/NO) prediction market question. The market should be:
- Clear and unambiguous
- Resolvable within 7 days
- Interesting and likely to attract bets
- Based strictly on the actual content provided`
          },
          {
            role: 'user',
            content: `Create a binary prediction market based on this webpage:

**URL:** ${url}
**Title:** ${metadata.title || 'N/A'}
**Description:** ${metadata.description || 'N/A'}

Your task: Create a YES/NO prediction market that:
1. Is directly based on the content/claims in the title and description above
2. Can be objectively resolved within 7 days  
3. Is interesting and likely to attract bets
4. Has clear resolution criteria

CRITICAL: The market MUST be about the actual subject matter in the title/description, NOT about metadata or technical aspects. Focus on the content itself.`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_prediction_market',
              description: 'Create a binary prediction market based on analyzed content',
              parameters: {
                type: 'object',
                properties: {
                  question: {
                    type: 'string',
                    description: 'Clear YES/NO question for the prediction market'
                  },
                  description: {
                    type: 'string',
                    description: 'Detailed description of the market, resolution criteria, and context'
                  },
                  ogTitle: {
                    type: 'string',
                    description: 'Title extracted from the webpage or generated'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score 0-100 for how good this market is'
                  }
                },
                required: ['question', 'description', 'ogTitle', 'confidence'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_prediction_market' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const marketData = JSON.parse(toolCall.function.arguments);
    
    // Use the metadata image if available
    let finalImage = metadata.image;
    
    // If no image found in metadata, generate one with AI
    if (!finalImage) {
      console.log('No image in metadata, generating with AI...');
      try {
        finalImage = await generateMarketImage(marketData.question, LOVABLE_API_KEY);
        console.log('Generated image URL:', finalImage ? 'Success' : 'Failed');
      } catch (error) {
        console.error('Failed to generate image:', error);
      }
    }
    
    // Generate topic-specific icon
    let topicIcon: string | undefined;
    try {
      console.log('Generating topic icon...');
      topicIcon = await generateTopicIcon(marketData.question, LOVABLE_API_KEY);
      console.log('Generated icon URL:', topicIcon ? 'Success' : 'Failed');
    } catch (error) {
      console.error('Failed to generate icon:', error);
    }
    
    // Return the generated market data
    return new Response(
      JSON.stringify({
        success: true,
        market: {
          ...marketData,
          sourceUrl: url,
          ogImage: finalImage || undefined,
          iconUrl: topicIcon || undefined,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-market function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate market'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
