"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { DataGrid } from "@/components/data-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Edit3, Shield, Info, ArrowRight } from "lucide-react"
import { sampleClients, sampleWorkers, sampleTasks } from "@/lib/sample-data"
import type { ValidationResult } from "@/types"

const clientColumns = [
  { key: "name", label: "Name", type: "text" as const, required: true, width: "200px" },
  { key: "email", label: "Email", type: "email" as const, required: true, width: "200px" },
  {
    key: "priority",
    label: "Priority",
    type: "select" as const,
    options: ["high", "medium", "low"],
    required: true,
    width: "120px",
  },
  { key: "budget", label: "Budget", type: "number" as const, width: "120px" },
  { key: "location", label: "Location", type: "text" as const, width: "150px" },
  { key: "industry", label: "Industry", type: "text" as const, width: "120px" },
  {
    key: "requirements",
    label: "Requirements",
    type: "multiselect" as const,
    options: ["React", "Node.js", "AWS", "Python", "UI/UX", "Figma", "Data Analysis"],
    width: "200px",
  },
]

const workerColumns = [
  { key: "name", label: "Name", type: "text" as const, required: true, width: "200px" },
  { key: "email", label: "Email", type: "email" as const, required: true, width: "200px" },
  {
    key: "skills",
    label: "Skills",
    type: "multiselect" as const,
    options: ["React", "TypeScript", "Node.js", "AWS", "Python", "UI/UX", "Figma", "Data Science"],
    width: "200px",
  },
  { key: "hourlyRate", label: "Hourly Rate", type: "number" as const, width: "120px" },
  {
    key: "availability",
    label: "Availability",
    type: "select" as const,
    options: ["available", "busy", "unavailable"],
    width: "120px",
  },
  { key: "location", label: "Location", type: "text" as const, width: "150px" },
  { key: "experience", label: "Experience", type: "number" as const, width: "100px" },
  { key: "rating", label: "Rating", type: "number" as const, width: "80px" },
  { key: "maxHoursPerWeek", label: "Max Hours/Week", type: "number" as const, width: "120px" },
]

const taskColumns = [
  { key: "title", label: "Title", type: "text" as const, required: true, width: "200px" },
  { key: "description", label: "Description", type: "textarea" as const, width: "250px" },
  { key: "clientId", label: "Client ID", type: "text" as const, width: "120px" },
  {
    key: "requiredSkills",
    label: "Required Skills",
    type: "multiselect" as const,
    options: ["React", "Node.js", "Python", "UI/UX", "Data Analysis", "AWS"],
    width: "200px",
  },
  { key: "estimatedHours", label: "Est. Hours", type: "number" as const, width: "100px" },
  { key: "deadline", label: "Deadline", type: "date" as const, width: "150px" },
  {
    key: "priority",
    label: "Priority",
    type: "select" as const,
    options: ["urgent", "high", "medium", "low"],
    width: "100px",
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: ["pending", "in-progress", "completed", "cancelled"],
    width: "120px",
  },
  { key: "budget", label: "Budget", type: "number" as const, width: "100px" },
  {
    key: "complexity",
    label: "Complexity",
    type: "select" as const,
    options: ["simple", "medium", "complex"],
    width: "100px",
  },
]

export default function DataPage() {
  const [activeTab, setActiveTab] = useState<"clients" | "workers" | "tasks">("clients")
  const [clientsData, setClientsData] = useState(sampleClients)
  const [workersData, setWorkersData] = useState(sampleWorkers)
  const [tasksData, setTasksData] = useState(sampleTasks)
  const [validationResults, setValidationResults] = useState<{
    clients: ValidationResult[]
    workers: ValidationResult[]
    tasks: ValidationResult[]
  }>({
    clients: [],
    workers: [],
    tasks: [],
  })

  const handleDataChange = (type: "clients" | "workers" | "tasks", newData: any[]) => {
    switch (type) {
      case "clients":
        setClientsData(newData)
        break
      case "workers":
        setWorkersData(newData)
        break
      case "tasks":
        setTasksData(newData)
        break
    }
  }

  const handleValidationChange = (type: "clients" | "workers" | "tasks", results: ValidationResult[]) => {
    setValidationResults((prev) => ({ ...prev, [type]: results }))
  }

  const getDataByType = (type: "clients" | "workers" | "tasks") => {
    switch (type) {
      case "clients":
        return clientsData
      case "workers":
        return workersData
      case "tasks":
        return tasksData
    }
  }

  const getColumnsByType = (type: "clients" | "workers" | "tasks") => {
    switch (type) {
      case "clients":
        return clientColumns
      case "workers":
        return workerColumns
      case "tasks":
        return taskColumns
    }
  }

  const getValidationSummary = (type: "clients" | "workers" | "tasks") => {
    const results = validationResults[type]
    return {
      total: results.length,
      valid: results.filter((r) => r.isValid).length,
      errors: results.reduce((sum, r) => sum + r.errors.length, 0),
      warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Management</h1>
          <p className="text-gray-600">
            View, edit, and validate your resource allocation data with real-time inline editing and AI-powered
            validation.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Inline Editing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Click any cell to edit data directly in the table with validation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Real-time Validation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Instant validation feedback with error highlighting and suggestions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Bulk Operations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Select multiple rows for bulk editing, deletion, and validation.</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Grid</span>
            </CardTitle>
            <CardDescription>Interactive data table with inline editing and validation</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="clients" className="flex items-center space-x-2">
                    <span>Clients</span>
                    <Badge variant="secondary">{clientsData.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="workers" className="flex items-center space-x-2">
                    <span>Workers</span>
                    <Badge variant="secondary">{workersData.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center space-x-2">
                    <span>Tasks</span>
                    <Badge variant="secondary">{tasksData.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center space-x-4 text-sm">
                  {(() => {
                    const summary = getValidationSummary(activeTab)
                    return (
                      <>
                        <span className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{summary.valid} valid</span>
                        </span>
                        {summary.errors > 0 && (
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>{summary.errors} errors</span>
                          </span>
                        )}
                        {summary.warnings > 0 && (
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>{summary.warnings} warnings</span>
                          </span>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>

              <TabsContent value="clients">
                <DataGrid
                  data={clientsData}
                  columns={clientColumns}
                  dataType="clients"
                  onDataChange={(data) => handleDataChange("clients", data)}
                  onValidationChange={(results) => handleValidationChange("clients", results)}
                />
              </TabsContent>

              <TabsContent value="workers">
                <DataGrid
                  data={workersData}
                  columns={workerColumns}
                  dataType="workers"
                  onDataChange={(data) => handleDataChange("workers", data)}
                  onValidationChange={(results) => handleValidationChange("workers", results)}
                />
              </TabsContent>

              <TabsContent value="tasks">
                <DataGrid
                  data={tasksData}
                  columns={taskColumns}
                  dataType="tasks"
                  onDataChange={(data) => handleDataChange("tasks", data)}
                  onValidationChange={(results) => handleValidationChange("tasks", results)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  After editing your data, use the AI search feature to query your records with natural language.
                </AlertDescription>
              </Alert>

              <Button className="w-full" asChild>
                <a href="/search" className="flex items-center justify-center space-x-2">
                  <span>Try AI Search</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  View detailed validation reports and AI recommendations for improving data quality.
                </AlertDescription>
              </Alert>

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href="/validation" className="flex items-center justify-center space-x-2">
                  <span>View Validation Report</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
