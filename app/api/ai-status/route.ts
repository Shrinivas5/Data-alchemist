import { NextResponse } from "next/server"

export async function GET() {
  const enabled = !!(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY)
  const provider = process.env.OPENAI_API_KEY ? "OpenAI" : process.env.GROQ_API_KEY ? "Groq" : "None"
  
  return NextResponse.json({ 
    enabled,
    provider,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGroq: !!process.env.GROQ_API_KEY
  })
}


