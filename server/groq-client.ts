import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not set - NLP features will be disabled');
    return null;
  }
  
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  
  return groqClient;
}

export async function analyzeMessageSentiment(message: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  intent?: string;
} | null> {
  const client = getGroqClient();
  if (!client) return null;

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis assistant. Analyze the message and respond ONLY with a JSON object containing: sentiment (positive/negative/neutral), confidence (0-1), and intent (brief description). No other text.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 150
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const parsed = JSON.parse(response);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return null;
  }
}
