export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  industry?: string
  status: "active" | "inactive" | "pending"
  budget?: number
  location?: string
  createdAt: string
  updatedAt: string
}

export interface Worker {
  id: string
  name: string
  email: string
  phone?: string
  skills: string[]
  hourlyRate?: number
  availability: "available" | "busy" | "unavailable"
  status: "active" | "inactive" | "on-leave"
  location?: string
  experience?: number
  rating?: number
  completedProjects?: Array<{
    id: string
    title: string
    skills?: string[]
    rating?: number
  }>
  currentProjects?: string[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  clientId: string
  requiredSkills?: string[]
  estimatedHours?: number
  budget?: number
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  deadline?: string
  location?: string
  assignedWorkerId?: string
  createdAt: string
  updatedAt: string
}

export interface AllocationRule {
  id: string
  name: string
  description: string
  category: "assignment" | "prioritization" | "validation" | "notification"
  priority: number
  active: boolean
  conditions: RuleCondition[]
  actions: RuleAction[]
  createdAt: string
  updatedAt: string
}

export interface RuleCondition {
  field: string
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "in" | "not_in"
  value: any
  logicalOperator?: "AND" | "OR"
}

export interface RuleAction {
  type: "assign" | "prioritize" | "notify" | "validate" | "block"
  target: string
  value: any
  priority?: number
}

export interface ValidationError {
  field: string
  message: string
  severity: "error" | "warning" | "suggestion"
  code?: string
}

export interface DataUpload {
  id: string
  filename: string
  type: "clients" | "workers" | "tasks"
  status: "uploading" | "processing" | "completed" | "error"
  recordCount?: number
  validRecords?: number
  errors?: ValidationError[]
  uploadedAt: string
}
