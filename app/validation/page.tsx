"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { ValidationDashboard } from "@/components/validation-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, CheckCircle, Settings } from "lucide-react"
import { sampleClients, sampleWorkers, sampleTasks } from "@/lib/sample-data"

export default function ValidationPage() {
  const [activeTab, setActiveTab] = useState<"clients" | "workers" | "tasks">("clients")

  const getDataByType = (type: "clients" | "workers" | "tasks") => {
    switch (type) {
      case "clients":
        return sampleClients
      case "workers":
        return sampleWorkers
      case "tasks":
        return sampleTasks
      default:
        return []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Validation Engine</h1>
          <p className="text-gray-600">
            AI-powered data validation with real-time error detection and quality scoring.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Real-time Validation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Instant validation with comprehensive rule checking and error detection.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">AI Enhancement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                AI-powered analysis for smart error correction and quality improvements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Quality Scoring</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Comprehensive quality scores with actionable recommendations.</p>
            </CardContent>
          </Card>
        </div>

        {/* Validation Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Data Validation Dashboard</span>
            </CardTitle>
            <CardDescription>Comprehensive validation analysis for your resource allocation data</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="clients" className="flex items-center space-x-2">
                  <span>Clients</span>
                  <Badge variant="secondary">{sampleClients.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="workers" className="flex items-center space-x-2">
                  <span>Workers</span>
                  <Badge variant="secondary">{sampleWorkers.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center space-x-2">
                  <span>Tasks</span>
                  <Badge variant="secondary">{sampleTasks.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clients">
                <ValidationDashboard
                  data={sampleClients}
                  dataType="clients"
                  onValidationComplete={(results) => console.log("Clients validation:", results)}
                />
              </TabsContent>

              <TabsContent value="workers">
                <ValidationDashboard
                  data={sampleWorkers}
                  dataType="workers"
                  onValidationComplete={(results) => console.log("Workers validation:", results)}
                />
              </TabsContent>

              <TabsContent value="tasks">
                <ValidationDashboard
                  data={sampleTasks}
                  dataType="tasks"
                  onValidationComplete={(results) => console.log("Tasks validation:", results)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
