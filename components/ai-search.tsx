"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search, Sparkles, Clock, Loader2, CheckCircle, AlertCircle, Star, History, Zap } from "lucide-react"
import { searchEngine, type SearchResponse, type SearchResult } from "@/lib/search-engine"

interface AISearchProps {
  data: {
    clients: any[]
    workers: any[]
    tasks: any[]
  }
  onResultsChange?: (results: SearchResult[], dataType: string) => void
}

export function AISearch({ data, onResultsChange }: AISearchProps) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"clients" | "workers" | "tasks">("clients")
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    setSearchHistory(searchEngine.getSearchHistory())
  }, [])

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query
    if (!queryToSearch.trim()) return

    setIsSearching(true)
    try {
      const response = await searchEngine.search(queryToSearch, data[activeTab], activeTab)
      setSearchResults(response)
      setSearchHistory(searchEngine.getSearchHistory())
      onResultsChange?.(response.results, activeTab)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    handleSearch(suggestion)
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    handleSearch(historyQuery)
  }

  const renderSearchResult = (result: SearchResult, index: number) => {
    const { item, score, matchedFields, highlights } = result

    return (
      <Card key={index} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <span
                dangerouslySetInnerHTML={{ __html: highlights.name || highlights.title || item.name || item.title }}
              />
              <Badge variant="outline" className="ml-2">
                {Math.round(score * 100)}% match
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(score * 5) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>
          {item.email && (
            <CardDescription>
              <span dangerouslySetInnerHTML={{ __html: highlights.email || item.email }} />
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {activeTab === "clients" && (
              <>
                <div>
                  <span className="font-medium">Priority:</span>{" "}
                  <Badge variant={item.priority === "high" ? "destructive" : "secondary"}>{item.priority}</Badge>
                </div>
                <div>
                  <span className="font-medium">Budget:</span> ${item.budget?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Industry:</span>{" "}
                  <span dangerouslySetInnerHTML={{ __html: highlights.industry || item.industry }} />
                </div>
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  <span dangerouslySetInnerHTML={{ __html: highlights.location || item.location }} />
                </div>
              </>
            )}

            {activeTab === "workers" && (
              <>
                <div>
                  <span className="font-medium">Rate:</span> ${item.hourlyRate}/hr
                </div>
                <div>
                  <span className="font-medium">Availability:</span>{" "}
                  <Badge variant={item.availability === "available" ? "default" : "secondary"}>
                    {item.availability}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Experience:</span> {item.experience} years
                </div>
                <div>
                  <span className="font-medium">Rating:</span> {item.rating}/5
                </div>
              </>
            )}

            {activeTab === "tasks" && (
              <>
                <div>
                  <span className="font-medium">Priority:</span>{" "}
                  <Badge variant={item.priority === "urgent" ? "destructive" : "secondary"}>{item.priority}</Badge>
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge variant={item.status === "completed" ? "default" : "outline"}>{item.status}</Badge>
                </div>
                <div>
                  <span className="font-medium">Hours:</span> {item.estimatedHours}h
                </div>
                <div>
                  <span className="font-medium">Budget:</span> ${item.budget?.toLocaleString()}
                </div>
              </>
            )}
          </div>

          {/* Skills/Requirements */}
          {(item.skills || item.requirements || item.requiredSkills) && (
            <div>
              <span className="font-medium text-sm">
                {activeTab === "clients" ? "Requirements:" : activeTab === "workers" ? "Skills:" : "Required Skills:"}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(item.skills || item.requirements || item.requiredSkills)?.map((skill: string, skillIndex: number) => (
                  <Badge key={skillIndex} variant="outline" className="text-xs">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlights.skills?.includes(skill) ? `<mark>${skill}</mark>` : skill,
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div>
              <span className="font-medium text-sm">Description:</span>
              <p
                className="text-sm text-gray-600 mt-1 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: highlights.description || item.description }}
              />
            </div>
          )}

          {/* Matched Fields */}
          {matchedFields.length > 0 && (
            <div className="pt-2 border-t">
              <span className="text-xs text-gray-500">Matched fields: </span>
              {matchedFields.map((field, fieldIndex) => (
                <Badge key={fieldIndex} variant="outline" className="text-xs mr-1">
                  {field}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>AI-Powered Search</span>
          </CardTitle>
          <CardDescription>
            Search your data using simple phrases like "high priority clients" or "available developers"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ask anything about your data..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={isSearching || !query.trim()}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Data Type Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clients" className="flex items-center space-x-2">
                <span>Clients</span>
                <Badge variant="secondary">{data.clients.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="workers" className="flex items-center space-x-2">
                <span>Workers</span>
                <Badge variant="secondary">{data.workers.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center space-x-2">
                <span>Tasks</span>
                <Badge variant="secondary">{data.tasks.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Zap className="h-3 w-3 mr-2" />
                  Suggestions
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <Command>
                  <CommandInput placeholder="Search suggestions..." />
                  <CommandList>
                    <CommandEmpty>No suggestions found.</CommandEmpty>
                    <CommandGroup heading="Example Queries">
                      {activeTab === "clients" && (
                        <>
                          <CommandItem
                            onSelect={() => handleSuggestionClick("high priority clients with large budgets")}
                          >
                            High priority clients with large budgets
                          </CommandItem>
                          <CommandItem onSelect={() => handleSuggestionClick("technology companies in California")}>
                            Technology companies in California
                          </CommandItem>
                          <CommandItem onSelect={() => handleSuggestionClick("clients requiring React development")}>
                            Clients requiring React development
                          </CommandItem>
                        </>
                      )}
                      {activeTab === "workers" && (
                        <>
                          <CommandItem onSelect={() => handleSuggestionClick("available workers with React skills")}>
                            Available workers with React skills
                          </CommandItem>
                          <CommandItem onSelect={() => handleSuggestionClick("senior developers with high ratings")}>
                            Senior developers with high ratings
                          </CommandItem>
                          <CommandItem onSelect={() => handleSuggestionClick("designers in New York")}>
                            Designers in New York
                          </CommandItem>
                        </>
                      )}
                      {activeTab === "tasks" && (
                        <>
                          <CommandItem onSelect={() => handleSuggestionClick("urgent tasks due this month")}>
                            Urgent tasks due this month
                          </CommandItem>
                          <CommandItem onSelect={() => handleSuggestionClick("complex projects with large budgets")}>
                            Complex projects with large budgets
                          </CommandItem>
                          <CommandItem onSelect={() => handleSuggestionClick("pending tasks requiring Python")}>
                            Pending tasks requiring Python
                          </CommandItem>
                        </>
                      )}
                    </CommandGroup>
                    {activeTab === "clients" && (
                      <>
                        <CommandItem
                          onSelect={() => handleSuggestionClick("high priority clients")}
                        >
                          High priority clients
                        </CommandItem>
                        <CommandItem onSelect={() => handleSuggestionClick("clients in New York")}>
                          Clients in New York
                        </CommandItem>
                        <CommandItem onSelect={() => handleSuggestionClick("clients needing React")}>
                          Clients needing React
                        </CommandItem>
                      </>
                    )}
                    {activeTab === "workers" && (
                      <>
                        <CommandItem onSelect={() => handleSuggestionClick("available React developers")}>
                          Available React developers
                        </CommandItem>
                        <CommandItem onSelect={() => handleSuggestionClick("designers with high ratings")}>
                          Designers with high ratings
                        </CommandItem>
                        <CommandItem onSelect={() => handleSuggestionClick("workers in New York")}>
                          Workers in New York
                        </CommandItem>
                      </>
                    )}
                    {activeTab === "tasks" && (
                      <>
                        <CommandItem onSelect={() => handleSuggestionClick("urgent tasks")}>
                          Urgent tasks
                        </CommandItem>
                        <CommandItem onSelect={() => handleSuggestionClick("high budget projects")}>
                          High budget projects
                        </CommandItem>
                        <CommandItem onSelect={() => handleSuggestionClick("tasks needing Python")}>
                          Tasks needing Python
                        </CommandItem>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-3 w-3 mr-2" />
                  History
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Searches</h4>
                  {searchHistory.length > 0 ? (
                    searchHistory.slice(0, 10).map((historyQuery, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleHistoryClick(historyQuery)}
                      >
                        <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{historyQuery}</span>
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No search history yet</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Search Results</span>
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{searchResults.totalCount} results</span>
                <span>{searchResults.executionTime}ms</span>
                <Badge variant="outline">{Math.round(searchResults.query.confidence * 100)}% confidence</Badge>
              </div>
            </div>
            <CardDescription>
              Found {searchResults.totalCount} {activeTab} matching "{searchResults.query.originalQuery}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Query Analysis */}
            {searchResults.query.confidence < 0.7 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The search query might be ambiguous. Try being more specific or use the suggestions below.
                </AlertDescription>
              </Alert>
            )}

            {/* AI Suggestions */}
            {searchResults.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">You might also want to search for:</h4>
                <div className="flex flex-wrap gap-2">
                  {searchResults.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <div className="space-y-4">
              {searchResults.results.length > 0 ? (
                searchResults.results.map((result, index) => renderSearchResult(result, index))
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search query or use different keywords.</p>
                  <Button variant="outline" onClick={() => setShowSuggestions(true)}>
                    View Suggestions
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
