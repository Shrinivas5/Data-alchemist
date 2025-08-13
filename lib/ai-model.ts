import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"

export function aiModel() {
  // Check if OpenAI API key is available
  if (process.env.OPENAI_API_KEY) {
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo"
    return openai(model)
  }
  
  // Fallback to Groq if OpenAI key is not available
  if (process.env.GROQ_API_KEY) {
    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant"
    return groq(model)
  }
  
  // If no API keys are available, throw an error
  throw new Error("No AI API key found. Please set either OPENAI_API_KEY or GROQ_API_KEY")
}

// Function to get Groq model directly (for fallback scenarios)
export function getGroqModel() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not available")
  }
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant"
  return groq(model)
}

// Legacy function for backward compatibility
export function groqModel() {
  return aiModel()
}


