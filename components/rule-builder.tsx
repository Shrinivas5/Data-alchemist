"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Trash2,
  Save,
  Play,
  Sparkles,
  Settings,
  Copy,
  Edit3,
  AlertCircle,
  CheckCircle,
  Zap,
  Brain,
} from "lucide-react"
import { ruleEngine, type Rule, type RuleCondition, type RuleAction, type RuleTemplate } from "@/lib/rule-engine"

interface RuleBuilderProps {
  onRuleCreated?: (rule: Rule) => void
  onRuleUpdated?: (rule: Rule) => void
  editingRule?: Rule | null
}

export function RuleBuilder({ onRuleCreated, onRuleUpdated, editingRule }: RuleBuilderProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "natural" | "template">("natural")
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")
  const [isConverting, setIsConverting] = useState(false)
  const [rule, setRule] = useState<Partial<Rule>>({
    name: "",
    description: "",
    category: "assignment",
    conditions: [],
    actions: [],
    priority: 1,
    isActive: true,
  })
  const [templates, setTemplates] = useState<RuleTemplate[]>([])
  const [testResults, setTestResults] = useState<any>(null)

  useEffect(() => {
    setTemplates(ruleEngine.getTemplates())
  }, [])

  useEffect(() => {
    if (editingRule) {
      setRule(editingRule)
      setActiveTab("visual")
    }
  }, [editingRule])

  const handleNaturalLanguageConvert = async () => {
    if (!naturalLanguageInput.trim()) return

    setIsConverting(true)
    try {
      // Call server API route so server-side GROQ_API_KEY is used
      const res = await fetch("/api/rules/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naturalLanguage: naturalLanguageInput }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const convertedRule = {
        ...data.rule,
        id: `rule-${Date.now()}`,
        priority: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        conditions: (data.rule.conditions || []).map((c: any, index: number) => ({ ...c, id: `condition-${Date.now()}-${index}` })),
        actions: (data.rule.actions || []).map((a: any, index: number) => ({ ...a, id: `action-${Date.now()}-${index}` })),
      }
      setRule(convertedRule)
      setActiveTab("visual")
    } catch (error) {
      console.error("Error converting rule:", error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleAddCondition = () => {
    const newCondition: RuleCondition = {
      id: `condition-${Date.now()}`,
      field: "",
      operator: "equals",
      value: "",
      dataType: "clients",
    }
    setRule((prev) => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition],
    }))
  }

  const handleUpdateCondition = (index: number, updates: Partial<RuleCondition>) => {
    setRule((prev) => ({
      ...prev,
      conditions:
        prev.conditions?.map((condition, i) => (i === index ? { ...condition, ...updates } : condition)) || [],
    }))
  }

  const handleRemoveCondition = (index: number) => {
    setRule((prev) => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleAddAction = () => {
    const newAction: RuleAction = {
      id: `action-${Date.now()}`,
      type: "assign",
      target: "worker",
      parameters: {},
    }
    setRule((prev) => ({
      ...prev,
      actions: [...(prev.actions || []), newAction],
    }))
  }

  const handleUpdateAction = (index: number, updates: Partial<RuleAction>) => {
    setRule((prev) => ({
      ...prev,
      actions: prev.actions?.map((action, i) => (i === index ? { ...action, ...updates } : action)) || [],
    }))
  }

  const handleRemoveAction = (index: number) => {
    setRule((prev) => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSaveRule = () => {
    if (!rule.name || !rule.conditions?.length || !rule.actions?.length) {
      return
    }

    if (editingRule) {
      const updatedRule = ruleEngine.updateRule(editingRule.id, rule)
      if (updatedRule) {
        onRuleUpdated?.(updatedRule)
      }
    } else {
      const newRule = ruleEngine.createRule(rule as Omit<Rule, "id" | "createdAt" | "updatedAt">)
      onRuleCreated?.(newRule)
    }

    // Reset form
    setRule({
      name: "",
      description: "",
      category: "assignment",
      conditions: [],
      actions: [],
      priority: 1,
      isActive: true,
    })
    setNaturalLanguageInput("")
  }

  const handleTestRule = async () => {
    if (!rule.conditions?.length || !rule.actions?.length) return

    // Mock test data - in a real app, this would come from the actual data
    const testData = {
      clients: [{ name: "Test Client", priority: "high", budget: 50000 }],
      workers: [{ name: "Test Worker", skills: ["React"], rating: 4.5, availability: "available" }],
      tasks: [{ title: "Test Task", priority: "urgent", requiredSkills: ["React"], budget: 10000 }],
    }

    const results = await ruleEngine.testRule(rule as Rule, testData)
    setTestResults(results)
  }

  const handleUseTemplate = (template: RuleTemplate) => {
    setRule({
      name: template.name,
      description: template.description,
      category: template.category as Rule["category"],
      conditions: template.conditions.map((c, index) => ({
        ...c,
        id: `condition-${Date.now()}-${index}`,
      })),
      actions: template.actions.map((a, index) => ({
        ...a,
        id: `action-${Date.now()}-${index}`,
      })),
      priority: 1,
      isActive: true,
    })
    setActiveTab("visual")
  }

  const getFieldOptions = (dataType: string) => {
    const fieldMap = {
      clients: ["name", "email", "priority", "budget", "location", "industry", "requirements"],
      workers: ["name", "email", "skills", "hourlyRate", "availability", "location", "experience", "rating"],
      tasks: [
        "title",
        "description",
        "clientId",
        "requiredSkills",
        "estimatedHours",
        "deadline",
        "priority",
        "status",
        "budget",
        "complexity",
      ],
    }
    return fieldMap[dataType as keyof typeof fieldMap] || []
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{editingRule ? "Edit Rule" : "Create New Rule"}</span>
          </CardTitle>
          <CardDescription>Build allocation rules using natural language, visual builder, or templates</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="natural" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Natural Language</span>
              </TabsTrigger>
              <TabsTrigger value="visual" className="flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Visual Builder</span>
              </TabsTrigger>
              <TabsTrigger value="template" className="flex items-center space-x-2">
                <Copy className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="natural" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="natural-input">Describe your rule in plain English</Label>
                  <Textarea
                    id="natural-input"
                    placeholder="Example: Assign workers with React skills to high priority tasks that require React development"
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleNaturalLanguageConvert}
                  disabled={isConverting || !naturalLanguageInput.trim()}
                  className="w-full"
                >
                  {isConverting ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Converting with AI...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Convert to Rule
                    </>
                  )}
                </Button>

                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Try examples like: "Don't assign workers whose hourly rate exceeds the task budget" or "Prioritize
                    workers in the same location as the client"
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-6">
              {/* Rule Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="Enter rule name"
                    value={rule.name || ""}
                    onChange={(e) => setRule((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-category">Category</Label>
                  <Select
                    value={rule.category || "assignment"}
                    onValueChange={(value) => setRule((prev) => ({ ...prev, category: value as Rule["category"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="prioritization">Prioritization</SelectItem>
                      <SelectItem value="validation">Validation</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  placeholder="Describe what this rule does"
                  value={rule.description || ""}
                  onChange={(e) => setRule((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-priority">Priority (1-10)</Label>
                  <Input
                    id="rule-priority"
                    type="number"
                    min="1"
                    max="10"
                    value={rule.priority || 1}
                    onChange={(e) => setRule((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rule-active"
                    checked={rule.isActive || false}
                    onCheckedChange={(checked) => setRule((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="rule-active">Active</Label>
                </div>
              </div>

              <Separator />

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Conditions</h3>
                  <Button onClick={handleAddCondition} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>

                <div className="space-y-3">
                  {rule.conditions?.map((condition, index) => (
                    <Card key={condition.id} className="p-4">
                      <div className="grid grid-cols-5 gap-3 items-end">
                        <div>
                          <Label>Data Type</Label>
                          <Select
                            value={condition.dataType}
                            onValueChange={(value) => handleUpdateCondition(index, { dataType: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clients">Clients</SelectItem>
                              <SelectItem value="workers">Workers</SelectItem>
                              <SelectItem value="tasks">Tasks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Field</Label>
                          <Select
                            value={condition.field}
                            onValueChange={(value) => handleUpdateCondition(index, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getFieldOptions(condition.dataType).map((field) => (
                                <SelectItem key={field} value={field}>
                                  {field}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Operator</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => handleUpdateCondition(index, { operator: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                              <SelectItem value="greater">Greater Than</SelectItem>
                              <SelectItem value="less">Less Than</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="exists">Exists</SelectItem>
                              <SelectItem value="not_exists">Not Exists</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Value</Label>
                          <Input
                            value={condition.value}
                            onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                            placeholder="Enter value"
                          />
                        </div>

                        <Button onClick={() => handleRemoveCondition(index)} variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {rule.conditions?.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Add at least one condition to define when this rule should apply.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Actions</h3>
                  <Button onClick={handleAddAction} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>

                <div className="space-y-3">
                  {rule.actions?.map((action, index) => (
                    <Card key={action.id} className="p-4">
                      <div className="grid grid-cols-4 gap-3 items-end">
                        <div>
                          <Label>Action Type</Label>
                          <Select
                            value={action.type}
                            onValueChange={(value) => handleUpdateAction(index, { type: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assign">Assign</SelectItem>
                              <SelectItem value="prioritize">Prioritize</SelectItem>
                              <SelectItem value="exclude">Exclude</SelectItem>
                              <SelectItem value="notify">Notify</SelectItem>
                              <SelectItem value="set_field">Set Field</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Target</Label>
                          <Select
                            value={action.target || ""}
                            onValueChange={(value) => handleUpdateAction(index, { target: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="worker">Worker</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="task">Task</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Criteria/Value</Label>
                          <Input
                            value={action.parameters?.criteria || action.value || ""}
                            onChange={(e) =>
                              handleUpdateAction(index, {
                                parameters: { ...action.parameters, criteria: e.target.value },
                                value: e.target.value,
                              })
                            }
                            placeholder="Enter criteria"
                          />
                        </div>

                        <Button onClick={() => handleRemoveAction(index)} variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {rule.actions?.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Add at least one action to define what should happen when conditions are met.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button onClick={() => handleUseTemplate(template)} className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              <Button onClick={handleTestRule} variant="outline" disabled={!rule.conditions?.length}>
                <Play className="h-4 w-4 mr-2" />
                Test Rule
              </Button>
              {testResults && (
                <Badge variant="outline" className="ml-2">
                  {testResults.summary}
                </Badge>
              )}
            </div>

            <Button onClick={handleSaveRule} disabled={!rule.name || !rule.conditions?.length || !rule.actions?.length}>
              <Save className="h-4 w-4 mr-2" />
              {editingRule ? "Update Rule" : "Save Rule"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Test Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{testResults.summary}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
