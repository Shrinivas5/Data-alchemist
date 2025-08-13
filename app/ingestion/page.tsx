"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Database, CheckCircle, Info, ArrowRight } from "lucide-react"
import type { ParsedData } from "@/lib/file-utils"

export default function IngestionPage() {
  const [parsedData, setParsedData] = useState<ParsedData[]>([])
  const [activeTab, setActiveTab] = useState<"clients" | "workers" | "tasks">("clients")
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false)
  const [aiProvider, setAiProvider] = useState<string>("")

  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch('/api/ai-status')
        const data = await response.json()
        setShowApiKeyAlert(!data.enabled)
        setAiProvider(data.provider)
      } catch (error) {
        console.error('Failed to check AI status:', error)
        setShowApiKeyAlert(true)
      }
    }
    checkAIStatus()
  }, [])

  const handleDataParsed = (data: ParsedData) => {
    setParsedData((prev) => [...prev, data])
  }

  const getDataByType = (type: "clients" | "workers" | "tasks") => {
    return parsedData.filter((data) => data.type === type)
  }

  const getTotalErrors = (type: "clients" | "workers" | "tasks") => {
    return getDataByType(type).reduce(
      (total, data) => total + data.errors.filter((e) => e.severity === "error").length,
      0,
    )
  }

  const getTotalWarnings = (type: "clients" | "workers" | "tasks") => {
    return getDataByType(type).reduce(
      (total, data) => total + data.errors.filter((e) => e.severity === "warning").length,
      0,
    )
  }

  const getTotalRecords = (type: "clients" | "workers" | "tasks") => {
    return getDataByType(type).reduce((total, data) => total + data.data.length, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Ingestion</h1>
          <p className="text-gray-600">
            Upload and validate your CSV/XLSX files with AI-powered parsing and error detection.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="clients" className="flex items-center space-x-2">
                  <span>Clients</span>
                  {getTotalRecords("clients") > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getTotalRecords("clients")}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="workers" className="flex items-center space-x-2">
                  <span>Workers</span>
                  {getTotalRecords("workers") > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getTotalRecords("workers")}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center space-x-2">
                  <span>Tasks</span>
                  {getTotalRecords("tasks") > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getTotalRecords("tasks")}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clients" className="mt-6">
                <FileUpload onDataParsed={handleDataParsed} acceptedTypes="clients" />
              </TabsContent>

              <TabsContent value="workers" className="mt-6">
                <FileUpload onDataParsed={handleDataParsed} acceptedTypes="workers" />
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <FileUpload onDataParsed={handleDataParsed} acceptedTypes="tasks" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Upload Summary</span>
                </CardTitle>
                <CardDescription>Overview of your uploaded data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["clients", "workers", "tasks"].map((type) => {
                  const records = getTotalRecords(type as any)
                  const errors = getTotalErrors(type as any)
                  const warnings = getTotalWarnings(type as any)

                  return (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{type}</p>
                        <p className="text-sm text-gray-500">{records} records</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {errors > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {errors} errors
                          </Badge>
                        )}
                        {warnings > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {warnings} warnings
                          </Badge>
                        )}
                        {records > 0 && errors === 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    After uploading your data, proceed to the Data Management section to review and edit your records.
                  </AlertDescription>
                </Alert>

                <Button className="w-full" asChild>
                  <a href="/data" className="flex items-center justify-center space-x-2">
                    <span>Review Data</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card>
              <CardHeader>
                <CardTitle>AI Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {showApiKeyAlert && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      AI features are disabled. Add your OpenAI API key or Groq API key to enable advanced validation and suggestions.
                    </AlertDescription>
                  </Alert>
                )}
                {!showApiKeyAlert && aiProvider && (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      AI features enabled using {aiProvider}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Automatic data type detection</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Smart validation and error detection</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Intelligent suggestions for fixes</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Missing field recommendations</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
