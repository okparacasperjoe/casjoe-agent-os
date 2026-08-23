const OLLAMA_BASE_URL = 'http://localhost:11434';

/**
 * Checks if the local Ollama instance is running and accessible
 * @returns {Promise<{connected: boolean, error: string|null}>}
 */
export async function checkOllamaConnection() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      mode: 'cors',
    });
    
    if (response.ok) {
      return { connected: true, error: null };
    }
    
    return { connected: false, error: `Server responded with status: ${response.status}` };
  } catch (error) {
    return { connected: false, error: 'Ollama is not running or not accessible. Please ensure Ollama is started.' };
  }
}

/**
 * Lists all downloaded models from the local Ollama instance
 * @returns {Promise<Array>} Array of model objects
 */
export async function listModels() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}

/**
 * Streams a chat response from Ollama
 * @param {string} model - The model name to use
 * @param {Array} messages - Array of message objects {role, content}
 * @param {Function} onToken - Callback for each streamed token
 * @param {Function} onDone - Callback when stream completes with full text
 * @param {Function} onError - Callback for errors
 */
export async function streamChat(model, messages, onToken, onDone, onError) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            fullResponse += parsed.message.content;
            if (onToken) onToken(parsed.message.content);
          }
          if (parsed.done) {
            if (onDone) onDone(fullResponse);
            return;
          }
        } catch (e) {
          console.error('Error parsing stream chunk:', e, line);
        }
      }
    }
    
    // In case stream ends without a done flag
    if (onDone) onDone(fullResponse);
  } catch (error) {
    console.error('Error in streamChat:', error);
    if (onError) onError(error.message || 'Unknown error during stream');
  }
}

/**
 * Sends a chat request without streaming
 * @param {string} model - The model name to use
 * @param {Array} messages - Array of message objects {role, content}
 * @returns {Promise<string>} The complete AI response
 */
export async function chat(model, messages) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to chat: ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  } catch (error) {
    console.error('Error in chat:', error);
    return 'Sorry, I encountered an error communicating with the local AI. Please check if Ollama is running.';
  }
}

/**
 * Sends a chat request supporting tool calls (Agentic AI)
 * @param {string} model - The model name to use
 * @param {Array} messages - Array of message objects {role, content}
 * @param {Array} tools - Array of tool definitions
 * @returns {Promise<Object>} The message object which may contain tool_calls
 */
export async function agentChat(model, messages, tools) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        tools: tools
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to agentChat: ${response.status}`);
    }

    const data = await response.json();
    return data.message || { content: '' };
  } catch (error) {
    console.error('Error in agentChat:', error);
    return { content: 'Agent failed to connect to Ollama.' };
  }
}

/**
 * Generates embeddings for a given text
 * @param {string} model - The embedding model to use
 * @param {string} text - The input text
 * @returns {Promise<Array<number>>} The embedding vector
 */
export async function generateEmbedding(model, text) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embedding: ${response.status}`);
    }

    const data = await response.json();
    // API returns { embeddings: [[...]] }
    return data.embeddings && data.embeddings.length > 0 ? data.embeddings[0] : [];
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}

/**
 * Pulls a model from the Ollama registry with progress streaming
 * @param {string} modelName - The name of the model to pull
 * @param {Function} onProgress - Callback for progress updates
 */
export async function pullModel(modelName, onProgress) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        name: modelName,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (onProgress) {
            onProgress({
              status: parsed.status,
              completed: parsed.completed || 0,
              total: parsed.total || 0,
            });
          }
        } catch (e) {
          console.error('Error parsing pull stream chunk:', e, line);
        }
      }
    }
  } catch (error) {
    console.error('Error pulling model:', error);
    if (onProgress) {
      onProgress({ status: `Error: ${error.message}`, completed: 0, total: 1 });
    }
  }
}

export const RECOMMENDED_MODELS = [
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 3B',
    size: '2.0 GB',
    minRam: '4 GB',
    speed: 'Fast',
    description: 'Best for 4-8GB laptops. Quick responses, good quality.'
  },
  {
    name: 'phi3:mini',
    displayName: 'Phi-3 Mini',
    size: '2.3 GB',
    minRam: '4 GB',
    speed: 'Fast',
    description: 'Microsoft\'s compact model. Great reasoning on low-end hardware.'
  },
  {
    name: 'mistral:7b',
    displayName: 'Mistral 7B',
    size: '4.1 GB',
    minRam: '8 GB',
    speed: 'Medium',
    description: 'Premium quality for 8GB+ laptops. Best for complex business tasks.'
  },
  {
    name: 'gemma2:2b',
    displayName: 'Gemma 2 2B',
    size: '1.6 GB',
    minRam: '4 GB',
    speed: 'Very Fast',
    description: 'Google\'s ultra-light model. Minimal RAM, maximum battery life.'
  },
  {
    name: 'qwen2.5:7b',
    displayName: 'Qwen 2.5 7B',
    size: '4.4 GB',
    minRam: '8 GB',
    speed: 'Medium',
    description: 'Strong multilingual model. Excellent for African language support.'
  }
];
