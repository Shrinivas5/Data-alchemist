"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ExportInterface } from "@/components/export-interface"
import { sampleClients, sampleWorkers, sampleTasks } from "@/lib/sample-data"
import type { Client, Worker, Task, AllocationRule } from "@/types"
import type { PriorityWeight } from "@/lib/prioritization-engine"
import type { ValidationResult } from "@/types"

export default function ExportPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [rules, setRules] = useState<AllocationRule[]>([])
  const [priorityWeights, setPriorityWeights] = useState<PriorityWeight[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])

  useEffect(() => {
    // Load sample data - in a real app, this would come from your data store
    setClients(sampleClients)
    setWorkers(sampleWorkers)
    setTasks(sampleTasks)

    // Load sample rules and validation results
    setRules([
      {
        id: "rule-1",
        name: "Skills Priority Rule",
        description: "Prioritize workers with matching skills",
        category: "assignment",
        priority: 1,
        active: true,
        conditions: [
          {
            field: "worker.skills",
            operator: "contains",
            value: "task.requiredSkills",
            logicalOperator: "AND",
          },
        ],
        actions: [
          {
            type: "assign",
            target: "worker",
            value: "task",
            priority: 10,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])

    setPriorityWeights([
      {
        id: "skills-match",
        name: "Skills Match",
        description: "How well worker skills match task requirements",
        weight: 30,
        category: "skills",
        enabled: true,
      },
    ])

    setValidationResults([
      {
        recordId: "client-1",
        recordType: "client",
        isValid: true,
        qualityScore: 95,
        score: 95,
        errors: [],
        warnings: [],
        suggestions: [],
        validatedAt: new Date().toISOString(),
      },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Export</h1>
          <p className="text-gray-600">
            Export your data, rules, and configurations in various formats.
          </p>
        </div>
        <ExportInterface
          clients={clients}
          workers={workers}
          tasks={tasks}
          rules={rules}
          priorityWeights={priorityWeights}
          validationResults={validationResults}
        />
      </main>
    </div>
  )
}
