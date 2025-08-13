import { generateText } from "ai"
import { groqModel } from "@/lib/ai-model"

export interface RuleCondition {
  id: string
  field: string
  operator: "equals" | "not_equals" | "greater" | "less" | "contains" | "in" | "not_in" | "exists" | "not_exists"
  value: any
  dataType: "clients" | "workers" | "tasks"
}

export interface RuleAction {
  id: string
  type: "assign" | "prioritize" | "exclude" | "notify" | "set_field"
  target?: string
  value?: any
  parameters?: Record<string, any>
}

export interface Rule {
  id: string
  name: string
  description: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category: "assignment" | "prioritization" | "validation" | "notification"
}

export interface RuleTemplate {
  id: string
  name: string
  description: string
  category: string
  conditions: Omit<RuleCondition, "id">[]
  actions: Omit<RuleAction, "id">[]
  tags: string[]
}

export class RuleEngine {
  private rules: Map<string, Rule> = new Map()
  private templates: RuleTemplate[] = []

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: "high-priority-clients",
        name: "High Priority Client Assignment",
        description: "Assign best workers to high priority clients",
        category: "assignment",
        conditions: [{ field: "priority", operator: "equals", value: "high", dataType: "clients" }],
        actions: [{ type: "assign", target: "worker", parameters: { criteria: "rating >= 4.5" } }],
        tags: ["priority", "assignment", "quality"],
      },
      {
        id: "skill-matching",
        name: "Skill-Based Assignment",
        description: "Match workers with required skills to tasks",
        category: "assignment",
        conditions: [{ field: "requiredSkills", operator: "exists", value: true, dataType: "tasks" }],
        actions: [{ type: "assign", target: "worker", parameters: { criteria: "skills_match >= 80%" } }],
        tags: ["skills", "matching", "assignment"],
      },
      {
        id: "location-preference",
        name: "Location-Based Assignment",
        description: "Prefer workers in the same location as clients",
        category: "assignment",
        conditions: [{ field: "location", operator: "exists", value: true, dataType: "clients" }],
        actions: [{ type: "prioritize", target: "worker", parameters: { criteria: "same_location", weight: 1.5 } }],
        tags: ["location", "preference", "prioritization"],
      },
      {
        id: "budget-constraint",
        name: "Budget Constraint Rule",
        description: "Ensure worker rates don't exceed task budgets",
        category: "validation",
        conditions: [{ field: "budget", operator: "greater", value: 0, dataType: "tasks" }],
        actions: [
          { type: "exclude", target: "worker", parameters: { criteria: "hourlyRate * estimatedHours > budget" } },
        ],
        tags: ["budget", "constraint", "validation"],
      },
      {
        id: "availability-check",
        name: "Worker Availability Check",
        description: "Only assign available workers to new tasks",
        category: "assignment",
        conditions: [{ field: "status", operator: "equals", value: "pending", dataType: "tasks" }],
        actions: [{ type: "exclude", target: "worker", parameters: { criteria: "availability != 'available'" } }],
        tags: ["availability", "assignment", "constraint"],
      },
      {
        id: "urgent-notification",
        name: "Urgent Task Notification",
        description: "Notify managers when urgent tasks are created",
        category: "notification",
        conditions: [{ field: "priority", operator: "equals", value: "urgent", dataType: "tasks" }],
        actions: [
          { type: "notify", target: "manager", parameters: { message: "Urgent task requires immediate attention" } },
        ],
        tags: ["urgent", "notification", "management"],
      },
    ]
  }

  async convertNaturalLanguageToRule(naturalLanguage: string): Promise<Partial<Rule>> {
    try {
      // Check if Groq API key is available
      if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
        console.warn("No AI API key found. Cannot convert natural language to rule.")
        throw new Error("AI service unavailable. Please set up your OpenAI or Groq API key.")
      }

      const { text } = await generateText({
        model: groqModel(),
        prompt: `Convert this natural language rule into a structured allocation rule:

"${naturalLanguage}"

Available fields by data type:
Clients: name, email, priority (high/medium/low), budget, location, industry, requirements
Workers: name, email, skills, hourlyRate, availability (available/busy/unavailable), location, experience, rating, specializations
Tasks: title, description, clientId, requiredSkills, estimatedHours, deadline, priority (urgent/high/medium/low), status, budget, complexity

Available operators: equals, not_equals, greater, less, contains, in, not_in, exists, not_exists
Available actions: assign, prioritize, exclude, notify, set_field

Return a JSON object with this structure:
{
  "name": "Rule Name",
  "description": "Detailed description",
  "category": "assignment" | "prioritization" | "validation" | "notification",
  "conditions": [
    {
      "field": "fieldName",
      "operator": "equals",
      "value": "value",
      "dataType": "clients" | "workers" | "tasks"
    }
  ],
  "actions": [
    {
      "type": "assign" | "prioritize" | "exclude" | "notify" | "set_field",
      "target": "worker" | "client" | "task" | "manager",
      "parameters": {
        "criteria": "assignment criteria or condition"
      }
    }
  ]
}

Examples:
- "Assign high-rated workers to urgent tasks" → conditions check for urgent tasks, actions assign workers with rating >= 4
- "Don't assign workers who cost more than the task budget" → conditions check task budget, actions exclude expensive workers
- "Prioritize local workers for client projects" → conditions check client location, actions prioritize same-location workers

Only return the JSON object, no explanation.`,
      })

      const parsedRule = JSON.parse(text)

      return {
        ...parsedRule,
        id: `rule-${Date.now()}`,
        priority: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        conditions: parsedRule.conditions.map((c: any, index: number) => ({
          ...c,
          id: `condition-${Date.now()}-${index}`,
        })),
        actions: parsedRule.actions.map((a: any, index: number) => ({
          ...a,
          id: `action-${Date.now()}-${index}`,
        })),
      }
    } catch (error) {
      console.error("Error converting natural language to rule:", error)
      throw new Error("Failed to parse natural language rule")
    }
  }

  async generateRuleSuggestions(context: {
    clientCount: number
    workerCount: number
    taskCount: number
    commonIssues?: string[]
  }): Promise<string[]> {
    try {
      // Check if AI API key is available
      if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
        console.warn("No AI API key found. Using default rule suggestions.")
        return [
          "Assign workers with matching skills to tasks",
          "Prioritize high-rated workers for high-priority clients",
          "Don't assign workers whose rates exceed task budgets",
          "Notify managers when urgent tasks are created",
          "Prefer workers in the same location as clients",
        ]
      }

      const { text } = await generateText({
        model: groqModel(),
        prompt: `Based on this resource allocation context, suggest 5-7 practical allocation rules:

Context:
- ${context.clientCount} clients
- ${context.workerCount} workers  
- ${context.taskCount} tasks
${context.commonIssues ? `- Common issues: ${context.commonIssues.join(", ")}` : ""}

Generate practical, actionable rules that would help with:
1. Efficient resource allocation
2. Quality assurance
3. Budget management
4. Timeline management
5. Skill matching

Return as a JSON array of natural language rule descriptions.
Only return the JSON array, no explanation.`,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Error generating rule suggestions:", error)
      return [
        "Assign workers with matching skills to tasks",
        "Prioritize high-rated workers for high-priority clients",
        "Don't assign workers whose rates exceed task budgets",
        "Notify managers when urgent tasks are created",
        "Prefer workers in the same location as clients",
      ]
    }
  }

  createRule(rule: Omit<Rule, "id" | "createdAt" | "updatedAt">): Rule {
    const newRule: Rule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.rules.set(newRule.id, newRule)
    return newRule
  }

  updateRule(id: string, updates: Partial<Rule>): Rule | null {
    const rule = this.rules.get(id)
    if (!rule) return null

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    }

    this.rules.set(id, updatedRule)
    return updatedRule
  }

  deleteRule(id: string): boolean {
    return this.rules.delete(id)
  }

  getRule(id: string): Rule | null {
    return this.rules.get(id) || null
  }

  getAllRules(): Rule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority)
  }

  getActiveRules(): Rule[] {
    return this.getAllRules().filter((rule) => rule.isActive)
  }

  getRulesByCategory(category: Rule["category"]): Rule[] {
    return this.getAllRules().filter((rule) => rule.category === category)
  }

  getTemplates(): RuleTemplate[] {
    return this.templates
  }

  createRuleFromTemplate(templateId: string, customizations?: Partial<Rule>): Rule | null {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) return null

    const rule: Omit<Rule, "id" | "createdAt" | "updatedAt"> = {
      name: template.name,
      description: template.description,
      category: template.category as Rule["category"],
      conditions: template.conditions.map((c, index) => ({
        ...c,
        id: `condition-${Date.now()}-${index}`,
      })),
      actions: template.actions.map((a, index) => ({
        ...a,
        id: `action-${Date.now()}-${index}`,
      })),
      priority: 1,
      isActive: true,
      ...customizations,
    }

    return this.createRule(rule)
  }

  async testRule(
    rule: Rule,
    testData: {
      clients: any[]
      workers: any[]
      tasks: any[]
    },
  ): Promise<{
    matches: any[]
    actions: any[]
    summary: string
  }> {
    // Simulate rule execution
    const matches: any[] = []
    const actions: any[] = []

    // Find matching data based on conditions
    rule.conditions.forEach((condition) => {
      const dataSet = testData[condition.dataType]
      const matching = dataSet.filter((item) => this.evaluateCondition(item, condition))
      matches.push(...matching)
    })

    // Simulate actions
    rule.actions.forEach((action) => {
      actions.push({
        type: action.type,
        target: action.target,
        affectedItems: matches.length,
        parameters: action.parameters,
      })
    })

    const summary = `Rule would match ${matches.length} items and execute ${actions.length} actions`

    return { matches, actions, summary }
  }

  private evaluateCondition(item: any, condition: RuleCondition): boolean {
    const fieldValue = item[condition.field]

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value
      case "not_equals":
        return fieldValue !== condition.value
      case "greater":
        return Number(fieldValue) > Number(condition.value)
      case "less":
        return Number(fieldValue) < Number(condition.value)
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      case "exists":
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== ""
      case "not_exists":
        return fieldValue === null || fieldValue === undefined || fieldValue === ""
      default:
        return false
    }
  }
}

// Global rule engine instance
export const ruleEngine = new RuleEngine()
