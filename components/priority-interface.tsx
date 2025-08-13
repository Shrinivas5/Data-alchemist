"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  type PriorityWeight,
  type PriorityTemplate,
  type AllocationPreview,
  PrioritizationEngine,
  defaultPriorityWeights,
  priorityTemplates,
} from "@/lib/prioritization-engine"
import type { Client, Worker, Task } from "@/types"
import { Lightbulb, Target, TrendingUp, Users, Clock, DollarSign, MapPin, Award } from "lucide-react"

interface PriorityInterfaceProps {
  workers: Worker[]
  tasks: Task[]
  clients: Client[]
  onWeightsChange?: (weights: PriorityWeight[]) => void
}

const categoryIcons = {
  skills: Award,
  availability: Clock,
  cost: DollarSign,
  experience: TrendingUp,
  location: MapPin,
  performance: Target,
  workload: Users,
}

const categoryColors = {
  skills: "bg-blue-100 text-blue-800",
  availability: "bg-green-100 text-green-800",
  cost: "bg-yellow-100 text-yellow-800",
  experience: "bg-purple-100 text-purple-800",
  location: "bg-orange-100 text-orange-800",
  performance: "bg-red-100 text-red-800",
  workload: "bg-gray-100 text-gray-800",
}

export function PriorityInterface({ workers, tasks, clients, onWeightsChange }: PriorityInterfaceProps) {
  const [weights, setWeights] = useState<PriorityWeight[]>(defaultPriorityWeights)
  const [engine] = useState(new PrioritizationEngine())
  const [preview, setPreview] = useState<AllocationPreview[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  useEffect(() => {
    engine.setWeights(weights)
    onWeightsChange?.(weights)
    generatePreview()
  }, [weights])

  useEffect(() => {
    generateRecommendations()
  }, [workers, tasks, clients])

  const generatePreview = async () => {
    if (workers.length === 0 || tasks.length === 0) return

    setIsGeneratingPreview(true)
    try {
      const newPreview = await engine.generateAllocationPreview(workers, tasks, clients)
      setPreview(newPreview)
    } catch (error) {
      console.error("Error generating preview:", error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const generateRecommendations = async () => {
    if (workers.length === 0 || tasks.length === 0) return

    setIsGeneratingRecommendations(true)
    try {
      const newRecommendations = await engine.generatePriorityRecommendations(workers, tasks, clients)
      setRecommendations(newRecommendations)
    } catch (error) {
      console.error("Error generating recommendations:", error)
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const updateWeight = (id: string, newWeight: number) => {
    setWeights((prev) => prev.map((w) => (w.id === id ? { ...w, weight: newWeight } : w)))
  }

  const toggleWeight = (id: string, enabled: boolean) => {
    setWeights((prev) => prev.map((w) => (w.id === id ? { ...w, enabled } : w)))
  }

  const applyTemplate = (template: PriorityTemplate) => {
    setWeights(template.weights)
  }

  const resetToDefaults = () => {
    setWeights([...defaultPriorityWeights])
  }

  const totalWeight = weights.filter((w) => w.enabled).reduce((sum, w) => sum + w.weight, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Priority Configuration</h2>
          <p className="text-muted-foreground">
            Configure allocation priorities and weights to optimize resource assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={generatePreview} disabled={isGeneratingPreview}>
            {isGeneratingPreview ? "Generating..." : "Update Preview"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="weights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weights">Priority Weights</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Allocation Preview</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="weights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Priority Weights Configuration
              </CardTitle>
              <CardDescription>
                Adjust the importance of different factors in resource allocation decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {totalWeight !== 100 && (
                <Alert>
                  <AlertDescription>
                    Total weight is {totalWeight}%. Consider adjusting weights to total 100% for optimal results.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6">
                {weights.map((weight) => {
                  const Icon = categoryIcons[weight.category]
                  return (
                    <div key={weight.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{weight.name}</span>
                              <Badge className={categoryColors[weight.category]}>{weight.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{weight.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium w-12 text-right">{weight.weight}%</span>
                          <Switch
                            checked={weight.enabled}
                            onCheckedChange={(enabled) => toggleWeight(weight.id, enabled)}
                          />
                        </div>
                      </div>

                      {weight.enabled && (
                        <div className="ml-8">
                          <Slider
                            value={[weight.weight]}
                            onValueChange={([value]) => updateWeight(weight.id, value)}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Weight:</span>
                  <span className={`font-medium ${totalWeight === 100 ? "text-green-600" : "text-orange-600"}`}>
                    {totalWeight}%
                  </span>
                </div>
                <Progress value={totalWeight} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {priorityTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Use Case:</strong> {template.useCase}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Weight Distribution:</div>
                      {template.weights
                        .filter((w) => w.enabled)
                        .map((weight) => (
                          <div key={weight.id} className="flex items-center justify-between text-sm">
                            <span>{weight.name}</span>
                            <span className="font-medium">{weight.weight}%</span>
                          </div>
                        ))}
                    </div>

                    <Button className="w-full bg-transparent" variant="outline" onClick={() => applyTemplate(template)}>
                      Apply Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Allocation Preview
              </CardTitle>
              <CardDescription>Preview of how current priority weights would affect task assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {isGeneratingPreview ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Generating allocation preview...</p>
                </div>
              ) : preview.length > 0 ? (
                <div className="space-y-4">
                  {preview.map((allocation) => {
                    const task = tasks.find((t) => t.id === allocation.taskId)
                    const worker = workers.find((w) => w.id === allocation.workerId)

                    return (
                      <div
                        key={`${allocation.taskId}-${allocation.workerId}`}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{task?.title || "Unknown Task"}</div>
                            <div className="text-sm text-muted-foreground">
                              Assigned to: {worker?.name || "Unknown Worker"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">Score: {allocation.score.toFixed(1)}</div>
                            <div className="text-sm text-muted-foreground">
                              Confidence: {(allocation.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{allocation.reasoning}</div>
                        <Progress value={allocation.score} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No allocation preview available. Add workers and tasks to see predictions.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Priority Recommendations
              </CardTitle>
              <CardDescription>AI-generated recommendations based on your current data and context</CardDescription>
            </CardHeader>
            <CardContent>
              {isGeneratingRecommendations ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Analyzing data and generating recommendations...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{rec.template.name}</div>
                        <Badge variant="secondary">{(rec.confidence * 100).toFixed(0)}% confidence</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{rec.reasoning}</div>
                      <Button variant="outline" size="sm" onClick={() => applyTemplate(rec.template)}>
                        Apply Recommendation
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recommendations available. Add workers and tasks to get AI suggestions.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
