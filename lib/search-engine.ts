import { generateText } from "ai"
import { groqModel } from "@/lib/ai-model"

export interface SearchQuery {
  originalQuery: string
  structuredQuery: {
    filters: Record<string, any>
    sort?: { field: string; direction: "asc" | "desc" }
    limit?: number
  }
  confidence: number
  suggestions: string[]
}

export interface SearchResult {
  item: any
  score: number
  matchedFields: string[]
  highlights: Record<string, string>
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  query: SearchQuery
  executionTime: number
  suggestions: string[]
}

export class SearchEngine {
  private searchHistory: string[] = []
  private savedSearches: Map<string, SearchQuery> = new Map()

  async search(
    query: string,
    data: any[],
    dataType: "clients" | "workers" | "tasks",
    options: {
      limit?: number
      includeHistory?: boolean
    } = {},
  ): Promise<SearchResponse> {
    const startTime = Date.now()

    // Add to search history
    if (options.includeHistory !== false) {
      this.addToHistory(query)
    }

    // Convert natural language to structured query
    const searchQuery = await this.parseNaturalLanguageQuery(query, dataType)

    // Execute search
    const results = this.executeSearch(data, searchQuery, options.limit)

    // Generate suggestions
    const suggestions = await this.generateSearchSuggestions(query, dataType, results.length)

    const executionTime = Date.now() - startTime

    return {
      results,
      totalCount: results.length,
      query: searchQuery,
      executionTime,
      suggestions,
    }
  }

  private async parseNaturalLanguageQuery(query: string, dataType: string): Promise<SearchQuery> {
    try {
      // Check if AI API key is available
      if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
        console.warn("No AI API key found. Using fallback text search.")
        // Fallback to simple text search
        return {
          originalQuery: query,
          structuredQuery: {
            filters: { _text: `contains:${query}` },
          },
          confidence: 0.3,
          suggestions: [],
        }
      }

      const { text } = await generateText({
        model: groqModel(),
        prompt: `Convert this natural language search query into a structured search for ${dataType} data:

Query: "${query}"

Available fields for ${dataType}:
${this.getFieldDescriptions(dataType)}

Convert to a JSON object with this structure:
{
  "filters": {
    // Field-based filters, e.g.:
    // "name": "contains:john" (for text search)
    // "priority": "equals:high" (for exact match)
    // "budget": "range:1000-5000" (for number ranges)
    // "skills": "includes:React" (for array fields)
    // "deadline": "before:2024-12-31" (for dates)
  },
  "sort": {
    "field": "fieldName",
    "direction": "asc" | "desc"
  },
  "limit": 50
}

Examples:
- "high priority clients" → {"filters": {"priority": "equals:high"}}
- "workers with React skills" → {"filters": {"skills": "includes:React"}}
- "tasks due this month" → {"filters": {"deadline": "month:current"}}
- "clients with budget over 10000" → {"filters": {"budget": "greater:10000"}}
- "show me available workers sorted by rating" → {"filters": {"availability": "equals:available"}, "sort": {"field": "rating", "direction": "desc"}}

Only return the JSON object, no explanation.`,
      })

      const structuredQuery = JSON.parse(text)

      return {
        originalQuery: query,
        structuredQuery,
        confidence: this.calculateQueryConfidence(query, structuredQuery),
        suggestions: [],
      }
    } catch (error) {
      console.error("Error parsing natural language query:", error)
      // Fallback to simple text search
      return {
        originalQuery: query,
        structuredQuery: {
          filters: { _text: `contains:${query}` },
        },
        confidence: 0.3,
        suggestions: [],
      }
    }
  }

  private executeSearch(data: any[], searchQuery: SearchQuery, limit = 50): SearchResult[] {
    let filteredData = [...data]

    // Apply filters
    Object.entries(searchQuery.structuredQuery.filters).forEach(([field, filterValue]) => {
      filteredData = this.applyFilter(filteredData, field, filterValue)
    })

    // Calculate relevance scores and highlights
    const scoredResults = filteredData.map((item) => {
      const { score, matchedFields, highlights } = this.calculateRelevance(item, searchQuery)
      return {
        item,
        score,
        matchedFields,
        highlights,
      }
    })

    // Sort by relevance score (and secondary sort if specified)
    scoredResults.sort((a, b) => {
      if (searchQuery.structuredQuery.sort) {
        const { field, direction } = searchQuery.structuredQuery.sort
        const aValue = a.item[field]
        const bValue = b.item[field]
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return direction === "asc" ? comparison : -comparison
      }
      return b.score - a.score // Default to relevance score
    })

    return scoredResults.slice(0, limit)
  }

  private applyFilter(data: any[], field: string, filterValue: string): any[] {
    if (field === "_text") {
      // Global text search across all fields
      const searchTerm = filterValue.replace("contains:", "").toLowerCase()
      return data.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm)),
      )
    }

    const [operator, value] = filterValue.split(":")

    return data.filter((item) => {
      const fieldValue = item[field]

      switch (operator) {
        case "equals":
          return String(fieldValue).toLowerCase() === value.toLowerCase()

        case "contains":
          return String(fieldValue).toLowerCase().includes(value.toLowerCase())

        case "includes":
          return (
            Array.isArray(fieldValue) && fieldValue.some((v) => String(v).toLowerCase().includes(value.toLowerCase()))
          )

        case "greater":
          return Number(fieldValue) > Number(value)

        case "less":
          return Number(fieldValue) < Number(value)

        case "range":
          const [min, max] = value.split("-").map(Number)
          return Number(fieldValue) >= min && Number(fieldValue) <= max

        case "before":
          return new Date(fieldValue) < new Date(value)

        case "after":
          return new Date(fieldValue) > new Date(value)

        case "month":
          if (value === "current") {
            const now = new Date()
            const itemDate = new Date(fieldValue)
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
          }
          return false

        default:
          return String(fieldValue).toLowerCase().includes(value.toLowerCase())
      }
    })
  }

  private calculateRelevance(
    item: any,
    searchQuery: SearchQuery,
  ): {
    score: number
    matchedFields: string[]
    highlights: Record<string, string>
  } {
    let score = 0
    const matchedFields: string[] = []
    const highlights: Record<string, string> = {}

    const queryTerms = searchQuery.originalQuery.toLowerCase().split(/\s+/)

    Object.entries(item).forEach(([field, value]) => {
      const fieldValue = String(value).toLowerCase()
      let fieldScore = 0

      queryTerms.forEach((term) => {
        if (fieldValue.includes(term)) {
          fieldScore += term.length / fieldValue.length
          matchedFields.push(field)

          // Create highlight
          const regex = new RegExp(`(${term})`, "gi")
          highlights[field] = String(value).replace(regex, "<mark>$1</mark>")
        }
      })

      // Weight certain fields higher
      const fieldWeights: Record<string, number> = {
        name: 3,
        title: 3,
        email: 2,
        description: 1.5,
        skills: 2,
        requirements: 2,
      }

      score += fieldScore * (fieldWeights[field] || 1)
    })

    return {
      score: Math.round(score * 100) / 100,
      matchedFields: [...new Set(matchedFields)],
      highlights,
    }
  }

  private calculateQueryConfidence(query: string, structuredQuery: any): number {
    // Simple confidence calculation based on query complexity and structure
    let confidence = 0.5

    if (Object.keys(structuredQuery.filters).length > 0) confidence += 0.3
    if (structuredQuery.sort) confidence += 0.1
    if (query.length > 10) confidence += 0.1

    return Math.min(confidence, 1.0)
  }

  private async generateSearchSuggestions(query: string, dataType: string, resultCount: number): Promise<string[]> {
    try {
      // Check if AI API key is available
      if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
        console.warn("No AI API key found. Skipping AI search suggestions.")
        return []
      }

      const { text } = await generateText({
        model: groqModel(),
        prompt: `Based on this search query for ${dataType} data, suggest 3-5 related search queries:

Original query: "${query}"
Result count: ${resultCount}

Generate helpful variations and related searches that users might want to try.
Consider:
- More specific searches if results are too broad
- Broader searches if results are too narrow
- Related fields and attributes
- Common search patterns for ${dataType}

Return as a JSON array of strings.
Only return the JSON array, no explanation.`,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Error generating search suggestions:", error)
      return []
    }
  }

  private getFieldDescriptions(dataType: string): string {
    const descriptions = {
      clients: `
- name: Client company name (text)
- email: Contact email (text)
- priority: high, medium, low (select)
- budget: Budget amount (number)
- location: Geographic location (text)
- industry: Business industry (text)
- requirements: Required skills/technologies (array)`,

      workers: `
- name: Worker full name (text)
- email: Contact email (text)
- skills: Technical skills (array)
- hourlyRate: Hourly rate in dollars (number)
- availability: available, busy, unavailable (select)
- location: Geographic location (text)
- experience: Years of experience (number)
- rating: Rating 1-5 (number)
- specializations: Areas of expertise (array)`,

      tasks: `
- title: Task title (text)
- description: Detailed description (text)
- clientId: Associated client ID (text)
- requiredSkills: Required skills (array)
- estimatedHours: Estimated hours (number)
- deadline: Due date (date)
- priority: urgent, high, medium, low (select)
- status: pending, in-progress, completed, cancelled (select)
- budget: Task budget (number)
- complexity: simple, medium, complex (select)`,
    }

    return descriptions[dataType as keyof typeof descriptions] || ""
  }

  addToHistory(query: string) {
    this.searchHistory = [query, ...this.searchHistory.filter((q) => q !== query)].slice(0, 20)
  }

  getSearchHistory(): string[] {
    return this.searchHistory
  }

  saveSearch(name: string, query: SearchQuery) {
    this.savedSearches.set(name, query)
  }

  getSavedSearches(): Map<string, SearchQuery> {
    return this.savedSearches
  }

  deleteSavedSearch(name: string) {
    this.savedSearches.delete(name)
  }
}

// Global search engine instance
export const searchEngine = new SearchEngine()
