import { generateText } from "ai"
import { groqModel } from "@/lib/ai-model"
import type { ValidationError, ValidationResult } from "@/types"

export interface ValidationRule {
  id: string
  name: string
  field: string
  type: "required" | "format" | "range" | "custom" | "ai"
  condition: string
  message: string
  severity: "error" | "warning" | "info"
  autoFix?: boolean
  fixSuggestion?: string
}



export class ValidationEngine {
  private rules: Map<string, ValidationRule[]> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  private initializeDefaultRules() {
    // Client validation rules
    this.addRule("clients", {
      id: "client-name-required",
      name: "Client Name Required",
      field: "ClientName",
      type: "required",
      condition: 'value != null && value.trim() != ""',
      message: "Client name is required",
      severity: "error",
      autoFix: false,
    })

    this.addRule("clients", {
      id: "client-id-required",
      name: "Client ID Required",
      field: "ClientID",
      type: "required",
      condition: 'value != null && value.trim() != ""',
      message: "Client ID is required",
      severity: "error",
      autoFix: false,
    })

    // Priority level validation (1-5)
    this.addRule("clients", {
      id: "client-priority-level-range",
      name: "Priority Level Range",
      field: "PriorityLevel",
      type: "range",
      condition: "value >= 1 && value <= 5",
      message: "Priority level must be between 1 and 5",
      severity: "error",
      autoFix: false,
    })

    // Budget range as soft check (warning)
    this.addRule("clients", {
      id: "client-budget-range",
      name: "Budget Range Check",
      field: "budget",
      type: "range",
      condition: "value === undefined || (Number(value) >= 1000 && Number(value) <= 1000000)",
      message: "Budget should be between $1,000 and $1,000,000",
      severity: "warning",
      autoFix: false,
    })
    // Note: GroupTag is optional in the interactive grid

    // Worker validation rules
    this.addRule("workers", {
      id: "worker-name-required",
      name: "Worker Name Required",
      field: "name",
      type: "required",
      condition: 'value != null && value.trim() != ""',
      message: "Worker name is required",
      severity: "error",
      autoFix: false,
    })

    this.addRule("workers", {
      id: "worker-email-format",
      name: "Valid Email Format",
      field: "email",
      type: "format",
      condition: "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)",
      message: "Please provide a valid email address",
      severity: "error",
      autoFix: true,
      fixSuggestion: "Check email format (example@domain.com)",
    })

    this.addRule("workers", {
      id: "worker-rate-range",
      name: "Hourly Rate Range",
      field: "hourlyRate",
      type: "range",
      condition: "value >= 15 && value <= 500",
      message: "Hourly rate should be between $15 and $500",
      severity: "warning",
      autoFix: false,
    })

    this.addRule("workers", {
      id: "worker-skills-required",
      name: "Skills Required",
      field: "skills",
      type: "custom",
      condition: "Array.isArray(value) && value.length > 0",
      message: "At least one skill is required",
      severity: "error",
      autoFix: false,
    })

    this.addRule("workers", {
      id: "worker-availability-valid",
      name: "Valid Availability Status",
      field: "availability",
      type: "custom",
      condition: '["available", "busy", "unavailable"].includes(value)',
      message: "Availability must be available, busy, or unavailable",
      severity: "error",
      autoFix: true,
      fixSuggestion: "Use: available, busy, or unavailable",
    })

    // Task validation rules
    this.addRule("tasks", {
      id: "task-title-required",
      name: "Task Title Required",
      field: "title",
      type: "required",
      condition: 'value != null && value.trim() != ""',
      message: "Task title is required",
      severity: "error",
      autoFix: false,
    })

    this.addRule("tasks", {
      id: "task-deadline-future",
      name: "Future Deadline",
      field: "deadline",
      type: "custom",
      condition: "new Date(value) > new Date()",
      message: "Deadline should be in the future",
      severity: "warning",
      autoFix: false,
    })

    this.addRule("tasks", {
      id: "task-hours-range",
      name: "Estimated Hours Range",
      field: "estimatedHours",
      type: "range",
      condition: "value >= 1 && value <= 1000",
      message: "Estimated hours should be between 1 and 1000",
      severity: "warning",
      autoFix: false,
    })

    this.addRule("tasks", {
      id: "task-priority-valid",
      name: "Valid Priority Level",
      field: "priority",
      type: "custom",
      condition: '["urgent", "high", "medium", "low"].includes(value)',
      message: "Priority must be urgent, high, medium, or low",
      severity: "error",
      autoFix: true,
      fixSuggestion: "Use: urgent, high, medium, or low",
    })
  }

  addRule(dataType: string, rule: ValidationRule) {
    if (!this.rules.has(dataType)) {
      this.rules.set(dataType, [])
    }
    this.rules.get(dataType)!.push(rule)
  }

  removeRule(dataType: string, ruleId: string) {
    const rules = this.rules.get(dataType)
    if (rules) {
      const index = rules.findIndex((rule) => rule.id === ruleId)
      if (index > -1) {
        rules.splice(index, 1)
      }
    }
  }

  async validateRecord(record: any, dataType: "clients" | "workers" | "tasks"): Promise<ValidationResult> {
    const rules = this.rules.get(dataType) || []
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    const suggestions: ValidationError[] = []

    // Apply standard validation rules
    for (const rule of rules) {
      const fieldValue = this.getFieldValue(record, rule.field)
      const isValid = this.evaluateCondition(rule.condition, fieldValue, record)

      if (!isValid) {
        const error: ValidationError = {
          field: rule.field,
          message: rule.message,
          severity: rule.severity,
          suggestions: rule.fixSuggestion ? [rule.fixSuggestion] : undefined,
        }

        if (rule.severity === "error") {
          errors.push(error)
        } else if (rule.severity === "warning") {
          warnings.push(error)
        } else {
          suggestions.push(error)
        }
      }
    }

    // AI-enhanced validation
    const aiValidation = await this.performAIValidation(record, dataType)
    errors.push(...aiValidation.errors)
    warnings.push(...aiValidation.warnings)
    suggestions.push(...aiValidation.suggestions)

    // Calculate data quality score
    const score = this.calculateQualityScore(record, errors, warnings, suggestions)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score,
      recordId: record.id || record._rowIndex?.toString(),
      recordType: dataType,
      qualityScore: score,
      validatedAt: new Date().toISOString(),
    }
  }

  async validateBatch(records: any[], dataType: "clients" | "workers" | "tasks"): Promise<ValidationResult[]> {
    const results = await Promise.all(records.map((record) => this.validateRecord(record, dataType)))

    // Cross-record validation
    const crossValidation = await this.performCrossRecordValidation(records, dataType)

    // Merge cross-validation results
    crossValidation.forEach((crossResult, index) => {
      if (results[index]) {
        results[index].errors.push(...crossResult.errors)
        results[index].warnings.push(...crossResult.warnings)
        results[index].suggestions.push(...crossResult.suggestions)
        results[index].isValid = results[index].isValid && crossResult.isValid
      }
    })

    return results
  }

  private async performAIValidation(
    record: any,
    dataType: string,
  ): Promise<{
    errors: ValidationError[]
    warnings: ValidationError[]
    suggestions: ValidationError[]
  }> {
    try {
      // Check if AI API key is available
      if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
        console.warn("No AI API key found. Skipping AI validation.")
        return { errors: [], warnings: [], suggestions: [] }
      }

      const { text } = await generateText({
        model: groqModel(),
        prompt: `Analyze this ${dataType} record for validation issues:

${JSON.stringify(record, null, 2)}

Check for:
1. Data consistency and logical errors
2. Missing or incomplete information
3. Format inconsistencies
4. Business logic violations
5. Potential data quality improvements

Return a JSON object with three arrays:
{
  "errors": [{"field": "fieldName", "message": "error description", "severity": "error"}],
  "warnings": [{"field": "fieldName", "message": "warning description", "severity": "warning"}],
  "suggestions": [{"field": "fieldName", "message": "suggestion description", "severity": "info", "suggestions": ["specific suggestion"]}]
}

Only return the JSON object, no explanation.`,
      })

      const result = JSON.parse(text)
      return {
        errors: result.errors || [],
        warnings: result.warnings || [],
        suggestions: result.suggestions || [],
      }
    } catch (error) {
      console.error("AI validation error:", error)
      return { errors: [], warnings: [], suggestions: [] }
    }
  }

  private async performCrossRecordValidation(records: any[], dataType: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = records.map((record, index) => ({
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      score: 100,
      recordId: record.id || record._rowIndex?.toString() || index.toString(),
      recordType: dataType,
      qualityScore: 100,
      validatedAt: new Date().toISOString(),
    }))

    // Check for duplicates
    const duplicateChecks = this.findDuplicates(records, dataType)
    duplicateChecks.forEach(({ indices, field, message }) => {
      indices.forEach((index) => {
        results[index].warnings.push({
          field,
          message,
          severity: "warning",
          suggestions: ["Review for potential duplicate entries"],
        })
      })
    })

    // Data type specific cross-validation
    if (dataType === "tasks") {
      // Check for client references
      records.forEach((record, index) => {
        const candidates = [record.clientId, record.ClientID, record.client_id]
        const ref = candidates.find((v) => v)
        if (ref && !this.isValidClientReference(ref)) {
          results[index].errors.push({
            field: "clientId",
            message: "Referenced client does not exist",
            severity: "error",
            suggestions: ["Verify client ID exists in clients data"],
          })
        }
      })

      // Duration must be >= 1
      records.forEach((record, index) => {
        const duration = Number(record.Duration ?? record.duration ?? record.estimatedHours ?? record.estimated_hours)
        if (!Number.isFinite(duration) || duration < 1) {
          results[index].errors.push({
            field: "Duration",
            message: "Duration must be a positive number (>= 1)",
            severity: "error",
            suggestions: ["Set Duration to an integer >= 1"],
          })
        }
      })
      // PreferredPhases parsing validation
      records.forEach((record, index) => {
        const raw = record.PreferredPhases ?? record.preferredPhases
        if (raw === undefined) return
        const phases = this.parseNumberList(raw)
        if (!phases.length) {
          results[index].errors.push({
            field: "PreferredPhases",
            message: "PreferredPhases must be a list/range like '1-3' or [2,4,5]",
            severity: "error",
          })
        }
      })
    }

    if (dataType === "workers") {
      // AvailableSlots must be an array of numbers like [1,3,5]
      records.forEach((record, index) => {
        const raw = record.AvailableSlots ?? record.availableSlots
        if (raw === undefined) return
        const slots = this.parseNumberList(raw)
        if (!slots || !slots.length || slots.some((n) => !Number.isFinite(n))) {
          results[index].errors.push({
            field: "AvailableSlots",
            message: "AvailableSlots must be an array of numbers (e.g., [1,3,5])",
            severity: "error",
          })
        }
      })
    }

    // ---------- Cross-dataset checks requiring registry ----------
    try {
      const { getData } = require("./data-context")
      const workers = getData("workers")
      const tasks = getData("tasks")

      // Skill coverage matrix: each task required skill covered by ≥1 worker
      if (tasks.length && workers.length && dataType === "tasks") {
        const workerSkills: string[] = workers
          .flatMap((w: any) => this.parseStringList(w.Skills ?? w.skills))
          .map((skill: string) => skill.toLowerCase())
        records.forEach((t: any, idx: number) => {
          const skills = this.parseStringList(t.RequiredSkills ?? t.requiredSkills)
          const missing = skills.filter((s) => !workerSkills.includes(s.toLowerCase()))
          if (missing.length) {
            results[idx].errors.push({
              field: "RequiredSkills",
              message: `Missing worker coverage for skills: ${missing.join(", ")}`,
              severity: "error",
              suggestions: ["Add workers with these skills or adjust task requirements"],
            })
          }
        })
      }

      // Max-concurrency feasibility: MaxConcurrent ≤ qualified available workers
      if (tasks.length && workers.length && dataType === "tasks") {
        records.forEach((t: any, idx: number) => {
          const skills = this.parseStringList(t.RequiredSkills ?? t.requiredSkills).map((s) => s.toLowerCase())
          const maxConc = Number(t.MaxConcurrent ?? t.maxConcurrent ?? 1)
          const qualified = workers.filter((w: any) => {
            const ws = this.parseStringList(w.Skills ?? w.skills).map((s) => s.toLowerCase())
            return skills.every((s) => ws.includes(s))
          }).length
          if (Number.isFinite(maxConc) && maxConc > qualified) {
            results[idx].errors.push({
              field: "MaxConcurrent",
              message: `MaxConcurrent (${maxConc}) exceeds number of qualified workers (${qualified})`,
              severity: "error",
              suggestions: ["Lower MaxConcurrent or add more qualified workers"],
            })
          }
        })
      }

      // Phase-slot saturation: sum of task durations per phase ≤ total worker slots (warning)
      if (tasks.length && workers.length && dataType === "tasks") {
        const capacity: Record<number, number> = {}
        workers.forEach((w: any) => {
          const slots = this.parseNumberList(w.AvailableSlots ?? w.availableSlots)
          const maxPerPhase = Number(w.MaxLoadPerPhase ?? w.maxLoadPerPhase ?? 1)
          slots.forEach((p) => {
            capacity[p] = (capacity[p] || 0) + (Number.isFinite(maxPerPhase) ? maxPerPhase : 1)
          })
        })
        records.forEach((t: any, idx: number) => {
          const duration = Number(t.Duration ?? t.duration ?? 1)
          const phases = this.parseNumberList(t.PreferredPhases ?? t.preferredPhases)
          if (!duration || !phases.length) return
          phases.forEach((p) => {
            const cap = capacity[p] || 0
            if (duration > cap) {
              results[idx].warnings.push({
                field: "PreferredPhases",
                message: `Phase ${p} demand (${duration}) may exceed worker capacity (${cap})`,
                severity: "warning",
                suggestions: ["Adjust phases, increase capacity or reduce duration"],
              })
            }
          })
        })
      }

      // RequestedTaskIDs unknown references (clients → tasks)
      const clients = getData("clients")
      if (clients.length && tasks.length && dataType === "clients") {
        const taskIds = new Set(
          tasks.map((t: any) => String(t.TaskID ?? t.id ?? t.title ?? "").toLowerCase()).filter(Boolean),
        )
        records.forEach((c: any, cIdx: number) => {
          const raw = c.RequestedTaskIDs ?? c.requestedTasks ?? c.tasks
          const ids = this.parseStringList(raw)
          const unknown = ids.filter((id) => !taskIds.has(String(id).toLowerCase()))
          if (unknown.length) {
            results[cIdx].errors.push({
              field: "RequestedTaskIDs",
              message: `Unknown TaskIDs: ${unknown.join(", ")}`,
              severity: "error",
              suggestions: ["Correct TaskIDs or add missing tasks"],
            })
          }
        })
      }
    } catch {}

    return results
  }

  private findDuplicates(
    records: any[],
    dataType: string,
  ): Array<{
    indices: number[]
    field: string
    message: string
  }> {
    const duplicates: Array<{ indices: number[]; field: string; message: string }> = []
    const keyFields = this.getKeyFields(dataType)

    keyFields.forEach((field) => {
      const valueMap = new Map<string, number[]>()

      records.forEach((record, index) => {
        const value = this.getFieldValue(record, field)
        if (value) {
          const key = String(value).toLowerCase().trim()
          if (!valueMap.has(key)) {
            valueMap.set(key, [])
          }
          valueMap.get(key)!.push(index)
        }
      })

      valueMap.forEach((indices, value) => {
        if (indices.length > 1) {
          duplicates.push({
            indices,
            field,
            message: `Duplicate ${field}: "${value}" found in multiple records`,
          })
        }
      })
    })

    return duplicates
  }

  private getKeyFields(dataType: string): string[] {
    switch (dataType) {
      case "clients":
        // Prefer stable IDs; fallback to name/email
        return ["id", "ClientID", "email", "name", "ClientName"]
      case "workers":
        return ["id", "email", "name"]
      case "tasks":
        return ["id", "TaskID", "TaskName"]
      default:
        return []
    }
  }

  private isValidClientReference(clientId: string): boolean {
    try {
      const { getData } = require("./data-context")
      const clients = getData("clients")
      if (!Array.isArray(clients)) return false
      const idFieldCandidates = ["id", "ClientID", "clientId"]
      return clients.some((c: any) => idFieldCandidates.some((k) => String(c?.[k] || "").toLowerCase() === String(clientId).toLowerCase()))
    } catch {
    return true
    }
  }

  private getFieldValue(record: any, field: string): any {
    // Handle nested field access (e.g., 'address.city')
    return field.split(".").reduce((obj, key) => obj?.[key], record)
  }

  private evaluateCondition(condition: string, value: any, record: any): boolean {
    try {
      // Create a safe evaluation context
      const context = { value, record, Array, Date }
      const func = new Function(...Object.keys(context), `return ${condition}`)
      return func(...Object.values(context))
    } catch (error) {
      console.error("Condition evaluation error:", error)
      return true // Default to valid if evaluation fails
    }
  }

  private calculateQualityScore(
    record: any,
    errors: ValidationError[],
    warnings: ValidationError[],
    suggestions: ValidationError[],
  ): number {
    let score = 100

    // Deduct points for errors and warnings
    score -= errors.length * 20
    score -= warnings.length * 10
    score -= suggestions.length * 5

    // Bonus points for completeness
    const fields = Object.keys(record)
    const nonEmptyFields = fields.filter((field) => {
      const value = record[field]
      return value !== null && value !== undefined && value !== ""
    })

    const completenessBonus = (nonEmptyFields.length / fields.length) * 10
    score += completenessBonus

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  // ---------- Helpers for cross-entity parsing ----------
  private parseNumberList(input: any): number[] {
    if (Array.isArray(input)) {
      return input.map((n) => Number(n)).filter((n) => Number.isFinite(n))
    }
    if (typeof input === "string") {
      const trimmed = input.trim()
      // JSON array?
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const arr = JSON.parse(trimmed)
          return this.parseNumberList(arr)
        } catch {
          // fallthrough
        }
      }
      // range like "1-3"
      const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
      if (rangeMatch) {
        const a = Number(rangeMatch[1])
        const b = Number(rangeMatch[2])
        if (Number.isFinite(a) && Number.isFinite(b) && a <= b) {
          return Array.from({ length: b - a + 1 }, (_, i) => a + i)
        }
      }
      // comma separated
      return trimmed
        .replace(/\[|\]/g, "")
        .split(/\s*,\s*/)
        .filter(Boolean)
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n))
    }
    return []
  }

  private parseStringList(input: any): string[] {
    if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean)
    if (typeof input === "string")
      return input
        .split(/\s*,\s*/)
        .map((s) => s.replace(/^\"|\"$/g, "").trim())
        .filter(Boolean)
    return []
  }

  async generateValidationReport(results: ValidationResult[]): Promise<{
    summary: {
      totalRecords: number
      validRecords: number
      errorCount: number
      warningCount: number
      averageScore: number
    }
    topIssues: Array<{ message: string; count: number; severity: string }>
    recommendations: string[]
  }> {
    const summary = {
      totalRecords: results.length,
      validRecords: results.filter((r) => r.isValid).length,
      errorCount: results.reduce((sum, r) => sum + r.errors.length, 0),
      warningCount: results.reduce((sum, r) => sum + r.warnings.length, 0),
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
    }

    // Aggregate issues
    const issueMap = new Map<string, { count: number; severity: string }>()
    results.forEach((result) => {
      ;[...result.errors, ...result.warnings].forEach((issue) => {
        const key = issue.message
        if (issueMap.has(key)) {
          issueMap.get(key)!.count++
        } else {
          issueMap.set(key, { count: 1, severity: issue.severity })
        }
      })
    })

    const topIssues = Array.from(issueMap.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Generate AI recommendations
    const recommendations = await this.generateRecommendations(summary, topIssues)

    return { summary, topIssues, recommendations }
  }

  private async generateRecommendations(
    summary: any,
    topIssues: Array<{ message: string; count: number; severity: string }>,
  ): Promise<string[]> {
    try {
      // Check if AI API key is available
      if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
        console.warn("No AI API key found. Using default recommendations.")
        return [
          "Review and fix validation errors before proceeding",
          "Standardize data formats across all records",
          "Implement data entry guidelines for consistency",
          "Regular data quality audits are recommended",
          "Consider automated data cleaning processes",
        ]
      }

      const { text } = await generateText({
        model: groqModel(),
        prompt: `Based on this data validation summary, provide 5 actionable recommendations:

Summary:
- Total Records: ${summary.totalRecords}
- Valid Records: ${summary.validRecords}
- Error Count: ${summary.errorCount}
- Warning Count: ${summary.warningCount}
- Average Quality Score: ${summary.averageScore.toFixed(1)}

Top Issues:
${topIssues.map((issue) => `- ${issue.message} (${issue.count} occurrences)`).join("\n")}

Provide specific, actionable recommendations to improve data quality.
Return as a JSON array of strings.

Only return the JSON array, no explanation.`,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Error generating recommendations:", error)
      return [
        "Review and fix validation errors before proceeding",
        "Standardize data formats across all records",
        "Implement data entry guidelines for consistency",
        "Regular data quality audits are recommended",
        "Consider automated data cleaning processes",
      ]
    }
  }

  getRules(dataType: string): ValidationRule[] {
    return this.rules.get(dataType) || []
  }

  updateRule(dataType: string, ruleId: string, updates: Partial<ValidationRule>) {
    const rules = this.rules.get(dataType)
    if (rules) {
      const rule = rules.find((r) => r.id === ruleId)
      if (rule) {
        Object.assign(rule, updates)
      }
    }
  }
}

// Global validation engine instance
export const validationEngine = new ValidationEngine()
