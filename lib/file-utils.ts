import * as XLSX from "xlsx"
import type { ValidationError } from "@/types"
import { validateDataWithAI } from "./ai-utils"
import { setData } from "./data-context"

export interface ParsedData {
  data: any[]
  headers: string[]
  errors: ValidationError[]
  type: "clients" | "workers" | "tasks" | "unknown"
}

export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split(".").pop()?.toLowerCase()

  if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
    return {
      data: [],
      headers: [],
      errors: [{ field: "file", message: "Unsupported file format. Please use CSV or XLSX files.", severity: "error" }],
      type: "unknown",
    }
  }

  try {
    let workbook: XLSX.WorkBook

    if (extension === "csv") {
      const text = await file.text()
      workbook = XLSX.read(text, { type: "string" })
    } else {
      const buffer = await file.arrayBuffer()
      workbook = XLSX.read(buffer, { type: "array" })
    }

    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (jsonData.length === 0) {
      return {
        data: [],
        headers: [],
        errors: [{ field: "file", message: "File appears to be empty", severity: "error" }],
        type: "unknown",
      }
    }

    const headers = jsonData[0] as string[]
    const rows = jsonData
      .slice(1)
      .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ""))

    // Convert rows to objects
    const data = rows.map((row, index) => {
      const obj: any = { _rowIndex: index + 2 } // +2 because we skip header and start from 1
      headers.forEach((header, colIndex) => {
        obj[header] = row[colIndex] || ""
      })
      return obj
    })

    // Determine data type based on headers
    const type = detectDataType(headers)

    // AI-powered validation
    const aiErrors = await validateDataWithAI(data.slice(0, 10), type) // Validate first 10 rows for performance

    // Basic validation
    const basicErrors = validateBasicStructure(data, type, headers)

    // Store dataset for cross-entity validations
    if (type !== "unknown") {
      setData(type, data)
    }

    return {
      data,
      headers,
      errors: [...basicErrors, ...aiErrors],
      type,
    }
  } catch (error) {
    return {
      data: [],
      headers: [],
      errors: [
        {
          field: "file",
          message: `Error parsing file: ${error instanceof Error ? error.message : "Unknown error"}`,
          severity: "error",
        },
      ],
      type: "unknown",
    }
  }
}

function detectDataType(headers: string[]): "clients" | "workers" | "tasks" | "unknown" {
  const headerStr = headers.join(" ").toLowerCase();

  // Check for explicit client indicators FIRST (highest priority)
  if (
    headerStr.includes("clientid") ||
    headerStr.includes("clientname") ||
    headerStr.includes("prioritylevel") ||
    headerStr.includes("grouptag") ||
    headerStr.includes("attributesjson")
  ) {
    return "clients";
  }

  // Check for explicit task indicators
  if (
    headerStr.includes("taskid") &&
    (headerStr.includes("taskname") ||
     headerStr.includes("duration") ||
     headerStr.includes("category"))
  ) {
    return "tasks";
  }

  // Check for explicit worker indicators
  if (
    headerStr.includes("workerid") ||
    headerStr.includes("workername") ||
    headerStr.includes("availableslots") ||
    headerStr.includes("maxloadperphase") ||
    headerStr.includes("workergroup") ||
    headerStr.includes("hourly_rate") ||
    headerStr.includes("max_hours_per_week")
  ) {
    return "workers";
  }

  // Fallback to broader indicators
  if (
    headerStr.includes("client") ||
    headerStr.includes("company") ||
    headerStr.includes("budget") ||
    headerStr.includes("industry")
  ) {
    return "clients"
  }

  if (
    headerStr.includes("worker") ||
    headerStr.includes("employee") ||
    headerStr.includes("rate") ||
    headerStr.includes("availability")
  ) {
    return "workers"
  }

  if (
    headerStr.includes("task") ||
    headerStr.includes("project") ||
    headerStr.includes("deadline") ||
    headerStr.includes("estimated") ||
    headerStr.includes("complexity")
  ) {
    return "tasks"
  }

  return "unknown"
}

function validateBasicStructure(
  data: any[],
  type: "clients" | "workers" | "tasks" | "unknown",
  headers: string[],
): ValidationError[] {
  const errors: ValidationError[] = []

  if (data.length === 0) {
    errors.push({ field: "data", message: "No data rows found", severity: "error" })
    return errors
  }

  // Check for required fields based on type
  const requiredFields = getRequiredFields(type)
  const missingFields = requiredFields.filter(
    (field) => !headers.some((header) => header.toLowerCase().includes(field.toLowerCase())),
  )

  if (missingFields.length > 0) {
    errors.push({
      field: "headers",
      message: `Missing recommended fields: ${missingFields.join(", ")}`,
      severity: "warning",
      suggestions: [`Consider adding columns for: ${missingFields.join(", ")}`],
    })
  }

  // Check for empty required fields
  data.forEach((row, index) => {
    if (type === "clients") {
      if (!row.ClientName && !row.name && !row.Name && !row.client_name && !row["Client Name"]) {
        errors.push({
          field: `row_${index + 2}`,
          message: "Client name is required",
          severity: "error",
        })
      }
    } else if (type === "workers") {
      if (!row.name && !row.Name && !row.WorkerName && !row.worker_name && !row["Worker Name"]) {
        errors.push({
          field: `row_${index + 2}`,
          message: "Worker name is required",
          severity: "error",
        })
      }
    } else if (type === "tasks") {
      if (!row.TaskName && !row.TaskID && !row.title && !row.Title && !row.task_title && !row["Task Title"]) {
        errors.push({
          field: `row_${index + 2}`,
          message: "Task name is required",
          severity: "error",
        })
      }
    }
  })

  return errors
}

function getRequiredFields(type: "clients" | "workers" | "tasks" | "unknown"): string[] {
  switch (type) {
    case "clients":
      return ["ClientID", "ClientName", "PriorityLevel", "GroupTag"]
    case "workers":
      return ["name", "email", "skills", "hourly_rate", "availability"]
    case "tasks":
      return ["TaskID", "TaskName", "Category", "Duration"]
    default:
      return []
  }
}

export function generateSampleCSV(type: "clients" | "workers" | "tasks"): string {
  switch (type) {
    case "clients":
      return `name,email,priority,budget,location,industry,requirements
TechCorp Solutions,contact@techcorp.com,high,50000,San Francisco CA,Technology,"React,Node.js,AWS"
Design Studio Pro,hello@designstudio.com,medium,25000,New York NY,Design,"UI/UX,Figma,Branding"
FinanceFlow Inc,info@financeflow.com,high,75000,Chicago IL,Finance,"Python,Data Analysis,Security"`

    case "workers":
      return `name,email,skills,hourly_rate,availability,location,experience,rating,specializations,max_hours_per_week
Sarah Chen,sarah.chen@email.com,"React,TypeScript,Node.js,AWS",85,available,San Francisco CA,5,4.8,"Frontend Development,Cloud Architecture",40
Marcus Johnson,marcus.j@email.com,"UI/UX,Figma,Adobe Creative Suite,Prototyping",75,available,New York NY,7,4.9,"User Experience,Visual Design",35
Elena Rodriguez,elena.r@email.com,"Python,Data Science,Machine Learning,SQL",95,busy,Austin TX,8,4.7,"Data Analysis,AI/ML",30`

    case "tasks":
      return `TaskID,TaskName,Category,Duration,RequiredSkills,PreferredPhases,MaxConcurrent
T1,E-commerce Platform Development,Development,3,"React,Node.js,PostgreSQL","[1,2,3]",2
T2,Brand Identity Design,Design,2,"Branding,Figma,Illustration","[1,2]",1
T3,Financial Data Analysis,Analytics,4,"Python,Data Visualization,SQL","[2,3,4]",1`

    default:
      return ""
  }
}
