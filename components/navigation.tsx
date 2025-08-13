"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Upload, Database, Settings, Download, Brain, Briefcase, CheckSquare } from "lucide-react"

const navigationItems = [
  {
    name: "Data Ingestion",
    href: "/ingestion",
    icon: Upload,
    description: "Upload and parse CSV/XLSX files",
  },
  {
    name: "Data Management",
    href: "/data",
    icon: Database,
    description: "View and edit your data",
  },
  {
    name: "AI Search",
    href: "/search",
    icon: Brain,
    description: "Natural language data queries",
  },
  {
    name: "Rules Engine",
    href: "/rules",
    icon: Settings,
    description: "Create allocation rules",
  },
  {
    name: "Prioritization",
    href: "/priorities",
    icon: CheckSquare,
    description: "Set allocation weights",
  },
  {
    name: "Export",
    href: "/export",
    icon: Download,
    description: "Export clean data and rules",
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6" />
            <span className="font-bold text-xl">ResourceAI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button key={item.href} variant={pathname === item.href ? "default" : "ghost"} size="sm" asChild>
                  <Link href={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
