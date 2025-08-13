import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { naturalLanguage } = await req.json()
    if (!naturalLanguage || typeof naturalLanguage !== "string") {
      return NextResponse.json({ error: "Missing naturalLanguage" }, { status: 400 })
    }

    // Simple mock rule converter - no API keys needed
    const rule = convertToMockRule(naturalLanguage)
    
    return NextResponse.json({ rule })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Conversion failed" }, { status: 500 })
  }
}

function convertToMockRule(naturalLanguage: string) {
  const lowerQuery = naturalLanguage.toLowerCase()
  
  // Simple keyword-based rule generation
  if (lowerQuery.includes("high priority") || lowerQuery.includes("urgent")) {
    return {
      name: "High Priority Assignment",
      description: "Assign high priority tasks to qualified workers",
      category: "prioritization",
      conditions: [
        { field: "priority", operator: "equals", value: "high", dataType: "tasks" }
      ],
      actions: [
        { type: "assign", target: "worker", parameters: { priority: "high" } }
      ]
    }
  }
  
  if (lowerQuery.includes("skill") || lowerQuery.includes("expertise")) {
    return {
      name: "Skill Matching",
      description: "Match workers with required skills for tasks",
      category: "assignment",
      conditions: [
        { field: "requiredSkills", operator: "includes", value: "skills", dataType: "tasks" }
      ],
      actions: [
        { type: "match", target: "worker", parameters: { skillMatch: true } }
      ]
    }
  }
  
  if (lowerQuery.includes("budget") || lowerQuery.includes("cost")) {
    return {
      name: "Budget Management",
      description: "Ensure worker rates fit within task budget",
      category: "validation",
      conditions: [
        { field: "hourlyRate", operator: "lessThan", value: "budget", dataType: "workers" }
      ],
      actions: [
        { type: "validate", target: "budget", parameters: { checkBudget: true } }
      ]
    }
  }
  
  if (lowerQuery.includes("location") || lowerQuery.includes("near")) {
    return {
      name: "Location Proximity",
      description: "Prefer workers near client locations",
      category: "assignment",
      conditions: [
        { field: "location", operator: "near", value: "clientLocation", dataType: "workers" }
      ],
      actions: [
        { type: "prefer", target: "worker", parameters: { locationMatch: true } }
      ]
    }
  }
  
  if (lowerQuery.includes("rating") || lowerQuery.includes("experience")) {
    return {
      name: "Quality Assurance",
      description: "Assign experienced workers to important tasks",
      category: "prioritization",
      conditions: [
        { field: "rating", operator: "greaterThan", value: 4, dataType: "workers" }
      ],
      actions: [
        { type: "prioritize", target: "worker", parameters: { minRating: 4 } }
      ]
    }
  }
  
  // Default rule for any other input
  return {
    name: "General Assignment",
    description: "General resource allocation rule",
    category: "assignment",
    conditions: [
      { field: "availability", operator: "equals", value: "available", dataType: "workers" }
    ],
    actions: [
      { type: "assign", target: "worker", parameters: { available: true } }
    ]
  }
}


