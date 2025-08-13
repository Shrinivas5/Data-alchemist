import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import {
  Upload,
  Database,
  Settings,
  Download,
  Brain,
  CheckSquare,
  ArrowRight,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react"

const features = [
  {
    name: "AI-Powered Data Ingestion",
    description: "Upload CSV/XLSX files with intelligent parsing and validation",
    icon: Upload,
    href: "/ingestion",
  },
  {
    name: "Smart Data Management",
    description: "Real-time validation with inline editing and AI error detection",
    icon: Database,
    href: "/data",
  },
  {
    name: "Natural Language Search",
    description: "Query your data using plain English with AI understanding",
    icon: Brain,
    href: "/search",
  },
  {
    name: "Intelligent Rules Engine",
    description: "Create allocation rules with natural language conversion",
    icon: Settings,
    href: "/rules",
  },
  {
    name: "Priority Management",
    description: "Set allocation weights and priorities with smart recommendations",
    icon: CheckSquare,
    href: "/priorities",
  },
  {
    name: "Clean Data Export",
    description: "Export validated data and rules in multiple formats",
    icon: Download,
    href: "/export",
  },
]

const highlights = [
  {
    icon: Zap,
    title: "AI-First Approach",
    description: "Every feature enhanced with artificial intelligence for smarter resource allocation",
  },
  {
    icon: Shield,
    title: "Real-time Validation",
    description: "Instant error detection and correction with AI-powered suggestions",
  },
  {
    icon: Sparkles,
    title: "Natural Language Interface",
    description: "Interact with your data using plain English queries and commands",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Enabled Resource
            <span className="text-blue-600"> Allocation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Intelligent configurator for managing clients, workers, and tasks with AI-powered validation, natural
            language queries, and smart rule creation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/ingestion" className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Start with Data Upload</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/data">View Sample Data</Link>
            </Button>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {highlights.map((highlight) => {
            const Icon = highlight.icon
            return (
              <Card key={highlight.title} className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{highlight.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Complete Workflow</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{feature.description}</CardDescription>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={feature.href} className="flex items-center space-x-2">
                        <span>Get Started</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Resource Allocation?</h2>
          <p className="text-xl mb-8 opacity-90">Start by uploading your data files and let AI handle the rest</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/ingestion" className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Your Data</span>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
