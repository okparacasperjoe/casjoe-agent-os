import { chat, agentChat, listModels } from './ollama';

/**
 * Model Manager for Casjoe Agent OS
 * Provides model-agnostic routing across local Ollama models and optional cloud APIs.
 */

const STORAGE_KEY_API_KEYS = 'casjoe_agent_api_keys';
const STORAGE_KEY_SELECTED_MODEL = 'casjoe_agent_selected_model';

export const PROVIDER_TYPES = {
  LOCAL_OLLAMA: 'local_ollama',
  GROQ: 'groq',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini'
};

export function getStoredApiKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_API_KEYS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveApiKeys(keys) {
  localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(keys));
}

export function getSelectedModelConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SELECTED_MODEL);
    if (raw) return JSON.parse(raw);
  } catch {}
  
  return { provider: PROVIDER_TYPES.LOCAL_OLLAMA, modelName: 'llama3.2' };
}

export function saveSelectedModelConfig(config) {
  localStorage.setItem(STORAGE_KEY_SELECTED_MODEL, JSON.stringify(config));
}

/**
 * Executes a model call, routing to Ollama local or Cloud provider based on configuration.
 */
export async function executeModelRequest({ systemPrompt, messages, tools = [], modelConfig }) {
  const config = modelConfig || getSelectedModelConfig();
  const fullMessages = systemPrompt 
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  // 1. Local Ollama Provider (100% Offline / Free)
  if (config.provider === PROVIDER_TYPES.LOCAL_OLLAMA) {
    if (tools && tools.length > 0) {
      return await agentChat(config.modelName || 'llama3.2', fullMessages, tools);
    } else {
      const text = await chat(config.modelName || 'llama3.2', fullMessages);
      return { content: text };
    }
  }

  // 2. Cloud API Providers (Fallback if user configures API key)
  const apiKeys = getStoredApiKeys();

  try {
    if (config.provider === PROVIDER_TYPES.OPENAI && apiKeys.openai) {
      return await callOpenAICompatibleAPI('https://api.openai.com/v1/chat/completions', apiKeys.openai, config.modelName || 'gpt-4o-mini', fullMessages, tools);
    } else if (config.provider === PROVIDER_TYPES.GROQ && apiKeys.groq) {
      return await callOpenAICompatibleAPI('https://api.groq.com/openai/v1/chat/completions', apiKeys.groq, config.modelName || 'llama-3.3-70b-versatile', fullMessages, tools);
    } else if (config.provider === PROVIDER_TYPES.GEMINI && apiKeys.gemini) {
      return await callGeminiAPI(apiKeys.gemini, config.modelName || 'gemini-1.5-flash', fullMessages);
    }
  } catch (err) {
    console.warn(`Cloud API provider ${config.provider} failed:`, err, '. Falling back to local Ollama.');
  }

  // Fallback to local Ollama if cloud call fails
  if (tools && tools.length > 0) {
    return await agentChat('llama3.2', fullMessages, tools);
  }
  const fallbackText = await chat('llama3.2', fullMessages);
  return { content: fallbackText };
}

async function callOpenAICompatibleAPI(url, apiKey, model, messages, tools) {
  const payload = {
    model,
    messages,
    temperature: 0.2
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0]?.message || {};
  return choice;
}

async function callGeminiAPI(apiKey, model, messages) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || '' }]
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { content: text };
}
