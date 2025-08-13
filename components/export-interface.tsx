"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExportEngine, type ExportOptions, type ExportFilter } from "@/lib/export-utils"
import type { Client, Worker, Task, AllocationRule } from "@/types"
import type { PriorityWeight } from "@/lib/prioritization-engine"
import type { ValidationResult } from "@/types"
import { Download, FileText, Database, Settings, CheckCircle } from "lucide-react"

interface ExportInterfaceProps {
  clients: Client[]
  workers: Worker[]
  tasks: Task[]
  rules: AllocationRule[]
  priorityWeights: PriorityWeight[]
  validationResults: ValidationResult[]
}

export function ExportInterface({
  clients,
  workers,
  tasks,
  rules,
  priorityWeights,
  validationResults,
}: ExportInterfaceProps) {
  const [exportEngine] = useState(new ExportEngine())
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(["clients", "workers", "tasks"])
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    includeHeaders: true,
    dateFormat: "iso",
    encoding: "utf-8",
    compression: false,
  })
  const [filters, setFilters] = useState<ExportFilter>({})
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const dataTypeOptions = [
    { id: "clients", label: "Clients", count: clients.length, icon: FileText },
    { id: "workers", label: "Workers", count: workers.length, icon: FileText },
    { id: "tasks", label: "Tasks", count: tasks.length, icon: FileText },
    { id: "rules", label: "Allocation Rules", count: rules.length, icon: Settings },
    { id: "priorities", label: "Priority Weights", count: priorityWeights.length, icon: Settings },
    { id: "validation", label: "Validation Report", count: validationResults.length, icon: CheckCircle },
  ]

  const handleDataTypeToggle = (dataType: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes((prev) => [...prev, dataType])
    } else {
      setSelectedDataTypes((prev) => prev.filter((type) => type !== dataType))
    }
  }

  const handleExportSingle = async (dataType: string) => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 20, 90))
      }, 100)

      switch (dataType) {
        case "clients":
          exportEngine.exportClients(clients, filters.clients, exportOptions)
          break
        case "workers":
          exportEngine.exportWorkers(workers, filters.workers, exportOptions)
          break
        case "tasks":
          exportEngine.exportTasks(tasks, filters.tasks, exportOptions)
          break
        case "rules":
          exportEngine.exportRules(rules)
          break
        case "priorities":
          exportEngine.exportPriorityWeights(priorityWeights)
          break
        case "validation":
          exportEngine.exportValidationReport(validationResults)
          break
      }

      clearInterval(progressInterval)
      setExportProgress(100)

      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Export error:", error)
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleExportBatch = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      for (const dataType of selectedDataTypes) {
        await handleExportSingle(dataType)
      }

      clearInterval(progressInterval)
      setExportProgress(100)

      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Batch export error:", error)
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleExportComplete = () => {
    setIsExporting(true)
    setExportProgress(0)

    const progressInterval = setInterval(() => {
      setExportProgress((prev) => Math.min(prev + 15, 90))
    }, 150)

    exportEngine.exportCompleteDataset(clients, workers, tasks, rules, priorityWeights, validationResults)

    clearInterval(progressInterval)
    setExportProgress(100)

    setTimeout(() => {
      setIsExporting(false)
      setExportProgress(0)
    }, 1000)
  }

  const totalRecords = clients.length + workers.length + tasks.length
  const selectedRecords = selectedDataTypes.reduce((sum, type) => {
    switch (type) {
      case "clients":
        return sum + clients.length
      case "workers":
        return sum + workers.length
      case "tasks":
        return sum + tasks.length
      default:
        return sum
    }
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export Data</h2>
          <p className="text-muted-foreground">Export your data, rules, and configurations in various formats</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportBatch}
            disabled={isExporting || selectedDataTypes.length === 0}
          >
            {isExporting ? "Exporting..." : "Export Selected"}
          </Button>
          <Button onClick={handleExportComplete} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export Complete Dataset"}
          </Button>
        </div>
      </div>

      {isExporting && (
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div>Exporting data... {exportProgress}%</div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Data Export</TabsTrigger>
          <TabsTrigger value="configuration">Configuration Export</TabsTrigger>
          <TabsTrigger value="reports">Reports Export</TabsTrigger>
          <TabsTrigger value="options">Export Options</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Export
              </CardTitle>
              <CardDescription>Export your core data (clients, workers, tasks) with filtering options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dataTypeOptions.slice(0, 3).map((option) => {
                  const Icon = option.icon
                  const isSelected = selectedDataTypes.includes(option.id)

                  return (
                    <div
                      key={option.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleDataTypeToggle(option.id, !isSelected)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isSelected} disabled />
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{option.label}</span>
                        </div>
                        <Badge variant="secondary">{option.count}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportSingle(option.id)
                          }}
                          disabled={isExporting}
                        >
                          Export
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Selected Records:</span>
                  <span className="font-medium">
                    {selectedRecords} of {totalRecords}
                  </span>
                </div>
                <Progress value={(selectedRecords / totalRecords) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Export
              </CardTitle>
              <CardDescription>Export your allocation rules and priority configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {dataTypeOptions.slice(3, 5).map((option) => {
                  const Icon = option.icon

                  return (
                    <div key={option.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{option.label}</span>
                        </div>
                        <Badge variant="secondary">{option.count}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {option.id === "rules"
                          ? "Export all allocation rules with conditions and actions"
                          : "Export priority weights and configuration settings"}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportSingle(option.id)}
                        disabled={isExporting}
                        className="w-full"
                      >
                        Export {option.label}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Reports Export
              </CardTitle>
              <CardDescription>Export validation reports and analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Validation Report</span>
                  </div>
                  <Badge variant="secondary">{validationResults.length}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  Comprehensive validation report with errors, warnings, and quality scores
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSingle("validation")}
                    disabled={isExporting}
                  >
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Configure export format and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: "csv" | "xlsx" | "json") =>
                      setExportOptions((prev) => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Select
                    value={exportOptions.dateFormat}
                    onValueChange={(value: "iso" | "us" | "eu") =>
                      setExportOptions((prev) => ({ ...prev, dateFormat: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso">ISO (YYYY-MM-DD)</SelectItem>
                      <SelectItem value="us">US (MM/DD/YYYY)</SelectItem>
                      <SelectItem value="eu">EU (DD/MM/YYYY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHeaders"
                  checked={exportOptions.includeHeaders}
                  onCheckedChange={(checked) =>
                    setExportOptions((prev) => ({ ...prev, includeHeaders: checked as boolean }))
                  }
                />
                <label htmlFor="includeHeaders" className="text-sm font-medium">
                  Include column headers
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
