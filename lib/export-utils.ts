import type { Client, Worker, Task, AllocationRule, ValidationResult } from "@/types"
import type { PriorityWeight } from "@/lib/prioritization-engine"

export interface ExportOptions {
  format: "csv" | "xlsx" | "json"
  includeHeaders: boolean
  dateFormat: "iso" | "us" | "eu"
  encoding: "utf-8" | "utf-16"
  compression: boolean
}

export interface ExportFilter {
  clients?: {
    status?: string[]
    industry?: string[]
    dateRange?: { start: Date; end: Date }
  }
  workers?: {
    status?: string[]
    skills?: string[]
    location?: string[]
  }
  tasks?: {
    status?: string[]
    priority?: string[]
    clientId?: string[]
  }
}

export class ExportEngine {
  private formatDate(date: Date | string, format: "iso" | "us" | "eu"): string {
    const d = typeof date === "string" ? new Date(date) : date

    switch (format) {
      case "us":
        return d.toLocaleDateString("en-US")
      case "eu":
        return d.toLocaleDateString("en-GB")
      case "iso":
      default:
        return d.toISOString().split("T")[0]
    }
  }

  private applyFilters<T extends { id: string }>(data: T[], filters: any): T[] {
    if (!filters) return data

    return data.filter((item: any) => {
      // Apply status filter
      if (filters.status && !filters.status.includes(item.status)) return false

      // Apply date range filter
      if (filters.dateRange && item.createdAt) {
        const itemDate = new Date(item.createdAt)
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) return false
      }

      // Apply array-based filters (skills, industry, etc.)
      for (const [key, values] of Object.entries(filters)) {
        if (Array.isArray(values) && Array.isArray(item[key])) {
          if (!values.some((v) => item[key].includes(v))) return false
        }
      }

      return true
    })
  }

  exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    options: ExportOptions = {
      format: "csv",
      includeHeaders: true,
      dateFormat: "iso",
      encoding: "utf-8",
      compression: false,
    },
  ): void {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      ...(options.includeHeaders ? [headers.join(",")] : []),
      ...data.map((row) =>
        headers
          .map((header) => {
            let value = row[header]

            // Format dates
            if (value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)))) {
              value = this.formatDate(value, options.dateFormat)
            }

            // Handle arrays
            if (Array.isArray(value)) {
              value = value.join("; ")
            }

            // Escape CSV values
            if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
              value = `"${value.replace(/"/g, '""')}"`
            }

            return value ?? ""
          })
          .join(","),
      ),
    ].join("\n")

    this.downloadFile(csvContent, `${filename}.csv`, "text/csv")
  }

  exportToJSON<T>(
    data: T,
    filename: string,
    options: ExportOptions = {
      format: "json",
      includeHeaders: true,
      dateFormat: "iso",
      encoding: "utf-8",
      compression: false,
    },
  ): void {
    const jsonContent = JSON.stringify(data, null, 2)
    this.downloadFile(jsonContent, `${filename}.json`, "application/json")
  }

  exportClients(clients: Client[], filters?: ExportFilter["clients"], options?: ExportOptions): void {
    const filteredClients = this.applyFilters(clients, filters)

    if (options?.format === "json") {
      this.exportToJSON(filteredClients, "clients", options)
    } else {
      this.exportToCSV(filteredClients, "clients", options)
    }
  }

  exportWorkers(workers: Worker[], filters?: ExportFilter["workers"], options?: ExportOptions): void {
    const filteredWorkers = this.applyFilters(workers, filters)

    if (options?.format === "json") {
      this.exportToJSON(filteredWorkers, "workers", options)
    } else {
      this.exportToCSV(filteredWorkers, "workers", options)
    }
  }

  exportTasks(tasks: Task[], filters?: ExportFilter["tasks"], options?: ExportOptions): void {
    const filteredTasks = this.applyFilters(tasks, filters)

    if (options?.format === "json") {
      this.exportToJSON(filteredTasks, "tasks", options)
    } else {
      this.exportToCSV(filteredTasks, "tasks", options)
    }
  }

  exportRules(rules: AllocationRule[], filename = "allocation-rules"): void {
    const rulesExport = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      rules: rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        priority: rule.priority,
        active: rule.active,
        conditions: rule.conditions,
        actions: rule.actions,
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
      })),
    }

    this.exportToJSON(rulesExport, filename)
  }

  exportPriorityWeights(weights: PriorityWeight[], filename = "priority-weights"): void {
    const weightsExport = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      weights: weights.map((weight) => ({
        id: weight.id,
        name: weight.name,
        description: weight.description,
        weight: weight.weight,
        category: weight.category,
        enabled: weight.enabled,
      })),
    }

    this.exportToJSON(weightsExport, filename)
  }

  exportValidationReport(results: ValidationResult[], filename = "validation-report"): void {
    const report = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      summary: {
        totalRecords: results.length,
        validRecords: results.filter((r) => r.isValid).length,
        invalidRecords: results.filter((r) => !r.isValid).length,
        averageQualityScore: results.reduce((sum, r) => sum + (r.qualityScore || r.score), 0) / results.length,
      },
      results: results.map((result) => ({
        recordId: result.recordId,
        recordType: result.recordType,
        isValid: result.isValid,
        qualityScore: result.qualityScore,
        errors: result.errors,
        warnings: result.warnings,
        suggestions: result.suggestions,
        validatedAt: result.validatedAt,
      })),
    }

    this.exportToJSON(report, filename)
  }

  exportCompleteDataset(
    clients: Client[],
    workers: Worker[],
    tasks: Task[],
    rules: AllocationRule[],
    weights: PriorityWeight[],
    validationResults: ValidationResult[],
    filename = "complete-dataset",
  ): void {
    const completeExport = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      metadata: {
        clientCount: clients.length,
        workerCount: workers.length,
        taskCount: tasks.length,
        ruleCount: rules.length,
        activeRules: rules.filter((r) => r.active).length,
      },
      data: {
        clients,
        workers,
        tasks,
      },
      configuration: {
        rules,
        priorityWeights: weights,
      },
      validation: {
        summary: {
          totalRecords: validationResults.length,
          validRecords: validationResults.filter((r) => r.isValid).length,
          averageQualityScore: validationResults.reduce((sum, r) => sum + (r.qualityScore || r.score), 0) / validationResults.length,
        },
        results: validationResults,
      },
    }

    this.exportToJSON(completeExport, filename)
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }
}
