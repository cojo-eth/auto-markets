import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPageContent(url: string): Promise<{ title: string; content: string; ogImage: string | null }> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Extract og:image
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                        html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
    const ogImage = ogImageMatch ? ogImageMatch[1] : null;
    
    // For Twitter/X links, extract the tweet text
    let content = '';
    if (url.includes('twitter.com') || url.includes('x.com')) {
      // Try to extract tweet text from meta description
      const descMatch = html.match(/<meta\s+(?:name|property)="(?:description|og:description)"\s+content="([^"]+)"/i) ||
                       html.match(/<meta\s+content="([^"]+)"\s+(?:name|property)="(?:description|og:description)"/i);
      if (descMatch) {
        content = descMatch[1];
      }
      
      // Also try to get the tweet text from the page
      const tweetMatch = html.match(/<div[^>]*data-testid="tweetText"[^>]*>([^<]+)<\/div>/i);
      if (tweetMatch) {
        content = tweetMatch[1] + (content ? ' | ' + content : '');
      }
    } else {
      // For other pages, try to extract meta description
      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
                       html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
      if (descMatch) {
        content = descMatch[1];
      }
    }
    
    console.log('Extracted content:', { title, content, ogImage });
    return { title, content, ogImage };
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw new Error('Failed to fetch page content');
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

    console.log('Generating market for URL:', url);

    // First, fetch the actual page content
    const pageData = await fetchPageContent(url);
    console.log('Page data:', pageData);

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
            content: `Based on this content, create a prediction market:

Title: ${pageData.title}
Content: ${pageData.content}
Source URL: ${url}

Generate a binary prediction market with:
1. A clear YES/NO question based on the actual content
2. A detailed description explaining what the market is about
3. How it will be resolved
4. Any relevant context from the source`
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
    
    // Use the OG image we already fetched
    const ogImage = pageData.ogImage;
    
    // If no OG image found, generate one with AI
    let finalImage = ogImage;
    if (!finalImage) {
      console.log('No OG image found, generating with AI...');
      try {
        finalImage = await generateMarketImage(marketData.question, LOVABLE_API_KEY);
        console.log('Generated image URL:', finalImage);
      } catch (error) {
        console.error('Failed to generate image, will use placeholder:', error);
      }
    }
    
    // Return the generated market data
    return new Response(
      JSON.stringify({
        success: true,
        market: {
          ...marketData,
          sourceUrl: url,
          ogImage: finalImage || undefined,
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
