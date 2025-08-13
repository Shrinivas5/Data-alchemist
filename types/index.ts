// Core data types for the resource allocation system
export interface Client {
  id: string
  name: string
  email: string
  priority: "high" | "medium" | "low"
  budget: number
  location: string
  industry: string
  requirements: string[]
  createdAt: Date
  status?: string
}

export interface Worker {
  id: string
  name: string
  email: string
  skills: string[]
  hourlyRate: number
  availability: "available" | "busy" | "unavailable"
  location: string
  experience: number // years
  rating: number // 1-5
  specializations: string[]
  maxHoursPerWeek: number
  currentProjects?: any[]
  completedProjects?: any[]
  status?: string
}

export interface Task {
  id: string
  title: string
  description: string
  clientId: string
  requiredSkills: string[]
  estimatedHours: number
  deadline: Date
  priority: "urgent" | "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  budget: number
  complexity: "simple" | "medium" | "complex"
  location?: string
}

export interface AllocationRule {
  id: string
  name: string
  description: string
  category: "assignment" | "prioritization" | "validation" | "notification"
  priority: number
  active: boolean
  conditions: Array<{
    field: string
    operator: string
    value: any
    logicalOperator?: string
  }>
  actions: Array<{
    type: string
    target: string
    value?: any
    priority?: number
  }>
  createdAt: string
  updatedAt: string
}

export interface ValidationError {
  field: string
  message: string
  severity: "error" | "warning" | "info"
  suggestions?: string[]
}

export interface DataUpload {
  file: File
  type: "clients" | "workers" | "tasks" | "unknown"
  status: "pending" | "processing" | "completed" | "error"
  errors: ValidationError[]
  preview: any[]
}

export interface AllocationWeights {
  skillMatch: number
  availability: number
  cost: number
  location: number
  experience: number
  rating: number
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  suggestions: ValidationError[]
  score: number // 0-100 data quality score
  recordId?: string
  recordType?: string
  qualityScore?: number
  validatedAt?: string
}
