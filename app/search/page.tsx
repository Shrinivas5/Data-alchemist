"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AISearch } from "@/components/ai-search"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, Zap, MessageSquare, ArrowRight, Info } from "lucide-react"
import { sampleClients, sampleWorkers, sampleTasks } from "@/lib/sample-data"
import type { SearchResult } from "@/lib/search-engine"

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [activeDataType, setActiveDataType] = useState<string>("clients")
  const [aiDisabled, setAiDisabled] = useState<boolean | null>(null)

  const data = {
    clients: sampleClients,
    workers: sampleWorkers,
    tasks: sampleTasks,
  }

  useEffect(() => {
    fetch("/api/ai-status")
      .then((r) => r.json())
      .then((j) => setAiDisabled(!j.enabled))
      .catch(() => setAiDisabled(true))
  }, [])

  const handleResultsChange = (results: SearchResult[], dataType: string) => {
    setSearchResults(results)
    setActiveDataType(dataType)
  }

  const exampleQueries = {
    clients: [
      "high priority clients",
      "clients in New York",
      "clients needing React",
      "finance industry clients",
    ],
    workers: [
      "available React developers",
      "designers with high ratings",
      "Python developers",
      "workers with low rates",
    ],
    tasks: [
      "urgent tasks",
      "high budget projects",
      "tasks needing React",
      "e-commerce projects",
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Natural Language Search</h1>
          <p className="text-gray-600">
            Search your resource allocation data using plain English. Ask questions naturally and get intelligent
            results.
          </p>
          {aiDisabled && (
            <Alert className="mt-3">
              <AlertDescription>
                AI features are disabled. Add your GROQ_API_KEY to .env.local and restart the server.
              </AlertDescription>
            </Alert>
          )}
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
                Search using everyday language - no need to learn complex query syntax.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Smart Understanding</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                AI understands context, relationships, and intent to deliver relevant results.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">Instant Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Get fast, accurate results with relevance scoring and highlighting.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Search Component */}
        <AISearch data={data} onResultsChange={handleResultsChange} />

        {/* Example Queries */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Example Queries</span>
              </CardTitle>
              <CardDescription>Try these example searches to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                  <Badge variant="outline">Clients</Badge>
                </h4>
                <div className="space-y-1">
                  {exampleQueries.clients.map((query, index) => (
                    <p key={index} className="text-sm text-gray-600 italic">
                      "{query}"
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                  <Badge variant="outline">Workers</Badge>
                </h4>
                <div className="space-y-1">
                  {exampleQueries.workers.map((query, index) => (
                    <p key={index} className="text-sm text-gray-600 italic">
                      "{query}"
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                  <Badge variant="outline">Tasks</Badge>
                </h4>
                <div className="space-y-1">
                  {exampleQueries.tasks.map((query, index) => (
                    <p key={index} className="text-sm text-gray-600 italic">
                      "{query}"
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Tips</CardTitle>
              <CardDescription>Get better results with these tips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Be Specific</h4>
                <p className="text-sm text-gray-600">
                  Use specific terms like "React developers" instead of just "developers"
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Use Comparisons</h4>
                <p className="text-sm text-gray-600">
                  Try queries like "workers with rates under $100" or "tasks with budgets over $10,000"
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Combine Criteria</h4>
                <p className="text-sm text-gray-600">
                  Search for multiple criteria: "available React developers in California with high ratings"
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Use Time References</h4>
                <p className="text-sm text-gray-600">
                  Include time-based searches: "tasks due this month" or "clients added this year"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  After finding the right data, create allocation rules to automate your resource management process.
                </AlertDescription>
              </Alert>

              <Button className="w-full" asChild>
                <a href="/rules" className="flex items-center justify-center space-x-2">
                  <span>Create Allocation Rules</span>
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
