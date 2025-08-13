"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, XCircle, Info, TrendingUp, FileText, Settings, Zap } from "lucide-react"
import { validationEngine } from "@/lib/validation-engine"
import type { ValidationResult } from "@/types"

interface ValidationDashboardProps {
  data: any[]
  dataType: "clients" | "workers" | "tasks"
  onValidationComplete?: (results: ValidationResult[]) => void
}

export function ValidationDashboard({ data, dataType, onValidationComplete }: ValidationDashboardProps) {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    if (data.length > 0) {
      performValidation()
    }
  }, [data, dataType])

  const performValidation = async () => {
    setIsValidating(true)
    try {
      const results = await validationEngine.validateBatch(data, dataType)
      setValidationResults(results)

      const validationReport = await validationEngine.generateValidationReport(results)
      setReport(validationReport)

      onValidationComplete?.(results)
    } catch (error) {
      console.error("Validation error:", error)
    } finally {
      setIsValidating(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
      default:
        return "default"
    }
  }

  if (isValidating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 animate-pulse" />
            <span>AI Validation in Progress</span>
          </CardTitle>
          <CardDescription>
            Analyzing {data.length} {dataType} records with AI-powered validation...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={50} className="mb-4" />
          <p className="text-sm text-gray-600">Running comprehensive validation checks including AI analysis...</p>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Dashboard</CardTitle>
          <CardDescription>No validation data available</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={performValidation}>Run Validation</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{report.summary.totalRecords}</p>
                <p className="text-xs text-gray-500">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{report.summary.validRecords}</p>
                <p className="text-xs text-gray-500">Valid Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{report.summary.errorCount}</p>
                <p className="text-xs text-gray-500">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{report.summary.averageScore.toFixed(0)}%</p>
                <p className="text-xs text-gray-500">Quality Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Score Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Score</CardTitle>
          <CardDescription>Overall assessment of your data quality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quality Score</span>
              <span>{report.summary.averageScore.toFixed(1)}%</span>
            </div>
            <Progress value={report.summary.averageScore} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Top Issues</TabsTrigger>
          <TabsTrigger value="records">Record Details</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Common Issues</CardTitle>
              <CardDescription>Issues found across your {dataType} data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.topIssues.map((issue: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(issue.severity)}
                    <div>
                      <p className="font-medium">{issue.message}</p>
                      <p className="text-sm text-gray-500">{issue.count} occurrences</p>
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(issue.severity) as any}>{issue.severity}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Record Validation Details</CardTitle>
              <CardDescription>Individual record validation results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {validationResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Record {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.isValid ? "default" : "destructive"}>
                          {result.isValid ? "Valid" : "Invalid"}
                        </Badge>
                        <span className="text-sm text-gray-500">{result.score}% quality</span>
                      </div>
                    </div>

                    {result.errors.length > 0 && (
                      <div className="space-y-1">
                        {result.errors.map((error, errorIndex) => (
                          <Alert key={errorIndex} variant="destructive" className="py-2">
                            <XCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              <strong>{error.field}:</strong> {error.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {result.warnings.map((warning, warningIndex) => (
                          <Alert key={warningIndex} className="py-2">
                            <AlertTriangle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              <strong>{warning.field}:</strong> {warning.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>AI Recommendations</span>
              </CardTitle>
              <CardDescription>AI-generated suggestions to improve your data quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.recommendations.map((recommendation: string, index: number) => (
                <Alert key={index}>
                  <Info className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button onClick={performValidation} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Re-run Validation
        </Button>
        <Button>Export Report</Button>
      </div>
    </div>
  )
}
