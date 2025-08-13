import { generateText } from "ai"
import { groqModel } from "@/lib/ai-model"

export async function parseNaturalLanguageQuery(query: string, dataType: "clients" | "workers" | "tasks") {
  try {
    // Check if AI API key is available
    if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
      console.warn("No AI API key found. Skipping AI query parsing.")
      return {}
    }

    const { text } = await generateText({
      model: groqModel(),
      prompt: `Convert this natural language query into a structured filter for ${dataType} data:
      
Query: "${query}"

Return a JSON object with filter criteria. For example:
- "show me high priority clients" -> {"priority": "high"}
- "workers with React skills" -> {"skills": ["React"]}
- "tasks due this week" -> {"deadline": "this_week"}

Only return the JSON object, no explanation.`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error parsing natural language query:", error)
    return {}
  }
}

export async function validateDataWithAI(data: any[], dataType: "clients" | "workers" | "tasks" | "unknown") {
  try {
    // Check if AI API key is available
    if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
      console.warn("No AI API key found. Skipping AI validation.")
      return []
    }

    const { text } = await generateText({
      model: groqModel(),
      prompt: `Analyze this ${dataType} data for validation errors and inconsistencies:

${JSON.stringify(data.slice(0, 5), null, 2)}

Check for:
- Missing required fields
- Invalid email formats
- Inconsistent data types
- Logical inconsistencies
- Potential duplicates

Return a JSON array of validation errors with format:
[{"field": "email", "message": "Invalid email format", "severity": "error", "suggestions": ["Check email format"]}]

Only return the JSON array, no explanation.`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error validating data with AI:", error)
    return []
  }
}

export async function generateRuleSuggestions(context: string) {
  try {
    // Check if AI API key is available
    if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
      console.warn("No AI API key found. Skipping AI rule suggestions.")
      return []
    }

    const { text } = await generateText({
      model: groqModel(),
      prompt: `Based on this context, suggest 3-5 allocation rules for resource management:

Context: "${context}"

Generate practical rules like:
- "Assign high-priority tasks to workers with 4+ star ratings"
- "Match workers within 50 miles of client location when possible"
- "Prioritize workers with exact skill matches over partial matches"

Return a JSON array of rule objects:
[{"name": "Rule Name", "description": "Rule description", "condition": "when condition", "action": "then action"}]

Only return the JSON array, no explanation.`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating rule suggestions:", error)
    return []
  }
}

export async function convertNaturalLanguageToRule(naturalLanguage: string) {
  try {
    // Check if AI API key is available
    if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
      console.warn("No AI API key found. Skipping AI rule conversion.")
      return null
    }

    const { text } = await generateText({
      model: groqModel(),
      prompt: `Convert this natural language rule into a structured format:

"${naturalLanguage}"

Return a JSON object with:
{
  "name": "Short rule name",
  "description": "Detailed description",
  "condition": "When condition (e.g., 'task.priority === high')",
  "action": "Then action (e.g., 'assign to worker with rating >= 4')"
}

Only return the JSON object, no explanation.`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error converting natural language to rule:", error)
    return null
  }
}
