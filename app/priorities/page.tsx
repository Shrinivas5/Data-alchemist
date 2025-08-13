"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { PriorityInterface } from "@/components/priority-interface"
import { sampleClients, sampleWorkers, sampleTasks } from "@/lib/sample-data"
import type { PriorityWeight } from "@/lib/prioritization-engine"
import type { Client, Worker, Task } from "@/types"

export default function PrioritiesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentWeights, setCurrentWeights] = useState<PriorityWeight[]>([])

  useEffect(() => {
    // Load sample data - in a real app, this would come from your data store
    setClients(sampleClients)
    setWorkers(sampleWorkers)
    setTasks(sampleTasks)
  }, [])

  const handleWeightsChange = (weights: PriorityWeight[]) => {
    setCurrentWeights(weights)
    // In a real app, you might want to save these weights to a backend
    console.log("Priority weights updated:", weights)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Priority Configuration</h1>
          <p className="text-gray-600">
            Configure allocation priorities and weights to optimize resource assignments.
          </p>
        </div>
        <PriorityInterface workers={workers} tasks={tasks} clients={clients} onWeightsChange={handleWeightsChange} />
      </main>
    </div>
  )
}
