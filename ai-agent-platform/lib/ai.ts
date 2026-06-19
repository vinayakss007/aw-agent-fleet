// AI Provider Integration — connects to Groq, OpenRouter, etc.
import Groq from "groq-sdk";

const PROVIDER_CONFIGS: Record<string, { baseURL: string; apiKeyEnv: string }> = {
  groq: {
    baseURL: "https://api.groq.com",
    apiKeyEnv: "GROQ_API_KEY",
  },
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
  },
  openai: {
    baseURL: "https://api.openai.com/v1",
    apiKeyEnv: "OPENAI_API_KEY",
  },
};

const DEFAULT_PROVIDER = "groq";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export interface ChatRequest {
  message: string;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  apiKey?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  model: string;
  provider: string;
  error?: string;
}

function getClient(provider: string, apiKey?: string) {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  const key = apiKey || process.env[config.apiKeyEnv] || process.env.GROQ_API_KEY;
  if (!key) throw new Error(`No API key for ${provider}. Set ${config.apiKeyEnv} in .env.local`);

  return new Groq({
    apiKey: key,
    baseURL: config.baseURL,
  });
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const provider = request.provider || DEFAULT_PROVIDER;
  const model = request.model || DEFAULT_MODEL;
  const systemPrompt = request.systemPrompt || "You are a helpful AI assistant.";

  try {
    const client = getClient(provider, request.apiKey);

    const messages: any[] = [{ role: "system", content: systemPrompt }];

    // Add conversation history
    if (request.conversationHistory) {
      for (const msg of request.conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: request.message });

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return {
      success: true,
      response,
      model: completion.model,
      provider,
    };
  } catch (error: any) {
    console.error("AI chat error:", error.message);
    return {
      success: false,
      response: "",
      model,
      provider,
      error: error.message,
    };
  }
}
