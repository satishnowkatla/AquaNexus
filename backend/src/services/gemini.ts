import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const geminiService = {
  // Disease diagnosis
  diagnoseDisease: async (imageBase64: string, description: string, species: string) => {
    const prompt = `You are an expert aquaculture veterinarian. A farmer has reported a disease issue.

Analyze the following information and provide a diagnosis:

Voice description: ${description}
Species: ${species}

Provide your response in this exact JSON format:
{
  "diagnosis": "Name of the disease",
  "severity": "low/medium/high/critical",
  "treatment": "Detailed treatment steps",
  "medicine_name": "Name of medicine",
  "medicine_dosage": "Dosage instructions",
  "follow_up_date": "YYYY-MM-DD date to follow up"
}

Be accurate and provide practical advice for Indian aquaculture conditions.`;

    if (imageBase64) {
      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      ]);
      return parseJSON(result.response.text());
    }

    const result = await model.generateContent(prompt);
    return parseJSON(result.response.text());
  },

  // Advisor chat
  chat: async (message: string, language: string = 'en') => {
    const langMap: Record<string, string> = {
      en: 'English',
      te: 'Telugu',
      hi: 'Hindi',
    };

    const prompt = `You are AquaAdvisor, an expert AI assistant for Indian aquaculture farmers.

You help farmers with:
- Disease identification and treatment
- Water quality management
- Feed optimization
- Profit calculation
- Government schemes
- Best practices for shrimp/fish farming

Language: ${langMap[language] || 'English'}

Farmer's question: ${message}

Provide a helpful, practical answer. Be concise but thorough.
If the question is in Telugu or Hindi, respond in the same language.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return { response: text, suggestions: [] };
  },

  // Voice transaction parsing
  parseVoice: async (text: string, language: string = 'en') => {
    const prompt = `Parse the following voice text from an aquaculture farmer into a structured transaction.

Voice text: "${text}"
Language: ${language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English'}

The farmer is describing either an income or expense related to their aquaculture business.

Provide response in this exact JSON format:
{
  "type": "income/expense",
  "category": "feed/seed/medicine/labor/harvest/equipment/other",
  "amount": 0,
  "description": "Clean description of the transaction"
}

Extract the amount in INR (Indian Rupees). If no amount mentioned, set amount to 0.
Understand Telugu/Hindi colloquialisms for numbers and money.`;

    const result = await model.generateContent(prompt);
    return parseJSON(result.response.text());
  },

  // Feed calculation
  calculateFeed: async (species: string, areaAcres: number, stockingDensity: number, stockingDays: number) => {
    const prompt = `You are an aquaculture feed optimization expert.

Calculate the optimal daily feed schedule for a shrimp/fish pond.

Species: ${species}
Pond area: ${areaAcres} acres
Stocking density: ${stockingDensity} per acre
Days since stocking: ${stockingDays} days

Provide response in this exact JSON format:
{
  "morning_kg": 0.00,
  "evening_kg": 0.00,
  "total_daily_kg": 0.00,
  "feed_type": "Type of feed (e.g., Sinking pellets)",
  "feed_grade": "Protein percentage (e.g., 32% protein)",
  "daily_cost": 0,
  "notes": "Any important feeding tips"
}

Use standard Indian aquaculture feed conversion ratios (FCR) and pricing.
Feed cost approximately Rs 70-80 per kg for commercial feed.`;

    const result = await model.generateContent(prompt);
    return parseJSON(result.response.text());
  },
};

// Helper to parse JSON from Gemini response
function parseJSON(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { raw: text };
  } catch {
    return { raw: text };
  }
}

export default geminiService;
