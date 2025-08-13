"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { RuleBuilder } from "@/components/rule-builder"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Settings,
  Plus,
  Edit3,
  Trash2,
  Play,
  MoreHorizontal,
  Brain,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react"
import { ruleEngine, type Rule } from "@/lib/rule-engine"
import { sampleClients, sampleWorkers, sampleTasks } from "@/lib/sample-data"

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "assignment" | "prioritization" | "validation" | "notification">(
    "all",
  )

  useEffect(() => {
    loadRules()
    loadSuggestions()
  }, [])

  const loadRules = () => {
    setRules(ruleEngine.getAllRules())
  }

  const loadSuggestions = async () => {
    const context = {
      clientCount: sampleClients.length,
      workerCount: sampleWorkers.length,
      taskCount: sampleTasks.length,
    }
    const ruleSuggestions = await ruleEngine.generateRuleSuggestions(context)
    setSuggestions(ruleSuggestions)
  }

  const handleRuleCreated = (rule: Rule) => {
    setRules((prev) => [...prev, rule])
    setShowBuilder(false)
  }

  const handleRuleUpdated = (rule: Rule) => {
    setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)))
    setEditingRule(null)
    setShowBuilder(false)
  }

  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    const updatedRule = ruleEngine.updateRule(ruleId, { isActive })
    if (updatedRule) {
      setRules((prev) => prev.map((r) => (r.id === ruleId ? updatedRule : r)))
    }
  }

  const handleDeleteRule = (ruleId: string) => {
    if (ruleEngine.deleteRule(ruleId)) {
      setRules((prev) => prev.filter((r) => r.id !== ruleId))
    }
  }

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule)
    setShowBuilder(true)
  }

  const getFilteredRules = () => {
    if (activeTab === "all") return rules
    return rules.filter((rule) => rule.category === activeTab)
  }

  const getCategoryIcon = (category: Rule["category"]) => {
    switch (category) {
      case "assignment":
        return <Settings className="h-4 w-4" />
      case "prioritization":
        return <Zap className="h-4 w-4" />
      case "validation":
        return <CheckCircle className="h-4 w-4" />
      case "notification":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: Rule["category"]) => {
    switch (category) {
      case "assignment":
        return "bg-blue-100 text-blue-800"
      case "prioritization":
        return "bg-yellow-100 text-yellow-800"
      case "validation":
        return "bg-green-100 text-green-800"
      case "notification":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rule Builder</h1>
          <p className="text-gray-600">
            Create intelligent allocation rules using natural language, visual builder, or pre-built templates.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Natural Language</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Describe rules in plain English and let AI convert them to structured logic.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Visual Builder</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Build complex rules with drag-and-drop conditions and actions.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Smart Templates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Start with proven templates and customize them for your needs.</p>
            </CardContent>
          </Card>
        </div>

        {/* Rule Builder */}
        {showBuilder && (
          <div className="mb-8">
            <RuleBuilder
              onRuleCreated={handleRuleCreated}
              onRuleUpdated={handleRuleUpdated}
              editingRule={editingRule}
            />
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBuilder(false)
                  setEditingRule(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Rules Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Allocation Rules</span>
                </CardTitle>
                <CardDescription>Manage your resource allocation rules and priorities</CardDescription>
              </div>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="all">All ({rules.length})</TabsTrigger>
                <TabsTrigger value="assignment">Assignment</TabsTrigger>
                <TabsTrigger value="prioritization">Priority</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="notification">Notify</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {getFilteredRules().length > 0 ? (
                  getFilteredRules().map((rule) => (
                    <Card key={rule.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getCategoryColor(rule.category)}`}>
                              {getCategoryIcon(rule.category)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{rule.name}</CardTitle>
                              <CardDescription>{rule.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Priority {rule.priority}</Badge>
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit Rule
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Play className="h-4 w-4 mr-2" />
                                  Test Rule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteRule(rule.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Rule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Conditions ({rule.conditions.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {rule.conditions.map((condition, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {condition.dataType}.{condition.field} {condition.operator} {condition.value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2">Actions ({rule.actions.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {rule.actions.map((action, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {action.type} {action.target}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
                    <p className="text-gray-600 mb-4">Create your first allocation rule to get started.</p>
                    <Button onClick={() => setShowBuilder(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Rule Suggestions</span>
              </CardTitle>
              <CardDescription>Based on your data, here are some recommended rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <Alert key={index}>
                  <Zap className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>"{suggestion}"</span>
                    <Button size="sm" variant="outline">
                      Create Rule
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  After creating your rules, set up prioritization weights to fine-tune your allocation algorithm.
                </AlertDescription>
              </Alert>

              <Button className="w-full" asChild>
                <a href="/priorities" className="flex items-center justify-center space-x-2">
                  <span>Configure Prioritization</span>
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
