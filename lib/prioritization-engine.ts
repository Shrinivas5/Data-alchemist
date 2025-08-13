import { generateObject } from "ai"
import { groqModel } from "@/lib/ai-model"
import { z } from "zod"
import type { Client, Worker, Task } from "@/types"

export interface PriorityWeight {
  id: string
  name: string
  description: string
  weight: number // 0-100
  category: "skills" | "availability" | "cost" | "experience" | "location" | "performance" | "workload"
  enabled: boolean
}

export interface PriorityTemplate {
  id: string
  name: string
  description: string
  weights: PriorityWeight[]
  useCase: string
}

export interface AllocationPreview {
  taskId: string
  workerId: string
  score: number
  reasoning: string
  confidence: number
}

export const defaultPriorityWeights: PriorityWeight[] = [
  {
    id: "skills-match",
    name: "Skills Match",
    description: "How well worker skills match task requirements",
    weight: 30,
    category: "skills",
    enabled: true,
  },
  {
    id: "availability",
    name: "Availability",
    description: "Worker availability during task timeframe",
    weight: 25,
    category: "availability",
    enabled: true,
  },
  {
    id: "cost-efficiency",
    name: "Cost Efficiency",
    description: "Cost-effectiveness of the allocation",
    weight: 20,
    category: "cost",
    enabled: true,
  },
  {
    id: "experience-level",
    name: "Experience Level",
    description: "Worker experience with similar tasks",
    weight: 15,
    category: "experience",
    enabled: true,
  },
  {
    id: "location-proximity",
    name: "Location Proximity",
    description: "Geographic proximity to task location",
    weight: 10,
    category: "location",
    enabled: false,
  },
]

export const priorityTemplates: PriorityTemplate[] = [
  {
    id: "cost-focused",
    name: "Cost-Focused",
    description: "Prioritize cost efficiency and budget optimization",
    useCase: "Budget-constrained projects",
    weights: [
      { ...defaultPriorityWeights[0], weight: 20 },
      { ...defaultPriorityWeights[1], weight: 25 },
      { ...defaultPriorityWeights[2], weight: 40 },
      { ...defaultPriorityWeights[3], weight: 10 },
      { ...defaultPriorityWeights[4], weight: 5 },
    ],
  },
  {
    id: "quality-focused",
    name: "Quality-Focused",
    description: "Prioritize skills and experience for high-quality outcomes",
    useCase: "High-stakes or complex projects",
    weights: [
      { ...defaultPriorityWeights[0], weight: 40 },
      { ...defaultPriorityWeights[1], weight: 20 },
      { ...defaultPriorityWeights[2], weight: 10 },
      { ...defaultPriorityWeights[3], weight: 25 },
      { ...defaultPriorityWeights[4], weight: 5 },
    ],
  },
  {
    id: "speed-focused",
    name: "Speed-Focused",
    description: "Prioritize availability and quick turnaround",
    useCase: "Urgent or time-sensitive projects",
    weights: [
      { ...defaultPriorityWeights[0], weight: 25 },
      { ...defaultPriorityWeights[1], weight: 45 },
      { ...defaultPriorityWeights[2], weight: 15 },
      { ...defaultPriorityWeights[3], weight: 10 },
      { ...defaultPriorityWeights[4], weight: 5 },
    ],
  },
  {
    id: "balanced",
    name: "Balanced",
    description: "Equal consideration of all factors",
    useCase: "General-purpose allocation",
    weights: defaultPriorityWeights,
  },
]

export class PrioritizationEngine {
  private weights: PriorityWeight[] = [...defaultPriorityWeights]

  setWeights(weights: PriorityWeight[]) {
    this.weights = weights
  }

  getWeights(): PriorityWeight[] {
    return [...this.weights]
  }

  calculateAllocationScore(worker: Worker, task: Task, client: Client): number {
    let totalScore = 0
    let totalWeight = 0

    for (const weight of this.weights) {
      if (!weight.enabled) continue

      let score = 0
      switch (weight.id) {
        case "skills-match":
          score = this.calculateSkillsMatch(worker, task)
          break
        case "availability":
          score = this.calculateAvailability(worker, task)
          break
        case "cost-efficiency":
          score = this.calculateCostEfficiency(worker, task, client)
          break
        case "experience-level":
          score = this.calculateExperience(worker, task)
          break
        case "location-proximity":
          score = this.calculateLocationProximity(worker, task)
          break
      }

      totalScore += score * (weight.weight / 100)
      totalWeight += weight.weight
    }

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0
  }

  private calculateSkillsMatch(worker: Worker, task: Task): number {
    if (!task.requiredSkills || task.requiredSkills.length === 0) return 100

    const matchedSkills = task.requiredSkills.filter((skill) => worker.skills.includes(skill))

    return (matchedSkills.length / task.requiredSkills.length) * 100
  }

  private calculateAvailability(worker: Worker, task: Task): number {
    if (worker.availability !== "available") return 0

    // Simple availability calculation - can be enhanced with actual scheduling
    const currentWorkload = (worker as any).currentProjects?.length || 0
    const maxWorkload = 5 // Assume max 5 concurrent projects

    return Math.max(0, ((maxWorkload - currentWorkload) / maxWorkload) * 100)
  }

  private calculateCostEfficiency(worker: Worker, task: Task, client: Client): number {
    if (!task.budget || !worker.hourlyRate) return 50

    const estimatedCost = worker.hourlyRate * (task.estimatedHours || 1)
    const efficiency = Math.min(task.budget / estimatedCost, 2) // Cap at 2x efficiency

    return Math.min(efficiency * 50, 100)
  }

  private calculateExperience(worker: Worker, task: Task): number {
    const relevantProjects =
      (worker as any).completedProjects?.filter((project: any) =>
        task.requiredSkills?.some((skill) => project.skills?.includes(skill)),
      ) || []

    return Math.min((relevantProjects.length / 10) * 100, 100)
  }

  private calculateLocationProximity(worker: Worker, task: Task): number {
    if (!worker.location) return 50

    // For now, return a default score since tasks don't have location
    // In a real implementation, you would get the client's location from the task's clientId
    return 50
  }

  async generateAllocationPreview(workers: Worker[], tasks: Task[], clients: Client[]): Promise<AllocationPreview[]> {
    const previews: AllocationPreview[] = []

    for (const task of tasks.slice(0, 5)) {
      // Limit to first 5 tasks for preview
      const scores = workers.map((worker) => ({
        worker,
        score: this.calculateAllocationScore(worker, task, clients.find((c) => c.id === task.clientId)!),
      }))

      scores.sort((a, b) => b.score - a.score)
      const bestMatch = scores[0]

      if (bestMatch) {
        previews.push({
          taskId: task.id,
          workerId: bestMatch.worker.id,
          score: bestMatch.score,
          reasoning: `Best match based on current priority weights`,
          confidence: bestMatch.score > 70 ? 0.9 : bestMatch.score > 50 ? 0.7 : 0.5,
        })
      }
    }

    return previews
  }

  async generatePriorityRecommendations(
    workers: Worker[],
    tasks: Task[],
    clients: Client[],
  ): Promise<{ template: PriorityTemplate; reasoning: string; confidence: number }[]> {
    try {
      // Check if AI API key is available
      if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
        console.warn("No AI API key found. Using default priority recommendations.")
        return [
          {
            template: priorityTemplates.find((t) => t.id === "balanced")!,
            reasoning: "Default balanced approach recommended (AI service unavailable)",
            confidence: 0.5,
          },
        ]
      }

      const context = {
        workerCount: workers.length,
        taskCount: tasks.length,
        avgBudget: tasks.reduce((sum, t) => sum + (t.budget || 0), 0) / tasks.length,
        urgentTasks: tasks.filter((t) => t.priority === "high").length,
        skillDiversity: new Set(workers.flatMap((w) => w.skills)).size,
      }

      const { object: recommendations } = await generateObject({
        model: groqModel(),
        schema: z.object({
          recommendations: z.array(
            z.object({
              templateId: z.string(),
              reasoning: z.string(),
              confidence: z.number().min(0).max(1),
            }),
          ),
        }),
        prompt: `Based on this resource allocation context, recommend priority templates:
        
Context:
- ${context.workerCount} workers available
- ${context.taskCount} tasks to allocate
- Average budget: $${context.avgBudget.toFixed(2)}
- ${context.urgentTasks} urgent tasks
- ${context.skillDiversity} unique skills available

Available templates: ${priorityTemplates.map((t) => `${t.id}: ${t.description}`).join(", ")}

Provide up to 3 template recommendations with reasoning and confidence scores.`,
      })

      return recommendations.recommendations
        .map((rec) => ({
          template: priorityTemplates.find((t) => t.id === rec.templateId)!,
          reasoning: rec.reasoning,
          confidence: rec.confidence,
        }))
        .filter((rec) => rec.template)
    } catch (error) {
      console.error("Error generating priority recommendations:", error)
      return [
        {
          template: priorityTemplates.find((t) => t.id === "balanced")!,
          reasoning: "Default balanced approach recommended due to analysis error",
          confidence: 0.5,
        },
      ]
    }
  }
}
