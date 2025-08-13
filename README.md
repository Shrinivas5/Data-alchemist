# 🚀 Data Alchemist: AI-Enabled Resource Allocation Configurator

> **Transform messy spreadsheets into intelligent resource allocation systems with AI-powered validation and natural language processing.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![AI-Powered](https://img.shields.io/badge/AI--Powered-Groq%2FOpenAI-green?style=for-the-badge)](https://groq.com/)

## 🎯 Overview

Data Alchemist is a sophisticated web application that solves the chaos of managing resource allocation through spreadsheets. It provides an AI-first approach to data ingestion, validation, rule creation, and export - all designed for non-technical users.

### ✨ Key Features

- **📁 Smart Data Ingestion**: Upload CSV/XLSX files for clients, workers, and tasks with automatic type detection
- **🔍 AI-Powered Search**: Natural language queries like "high priority clients" or "workers with React skills"
- **⚡ Real-time Validation**: 10+ core validation constraints with instant feedback and error highlighting
- **🧠 Natural Language Rules**: Convert plain English to allocation rules ("Assign experienced workers to urgent tasks")
- **⚖️ Priority Configuration**: Visual sliders and templates for resource allocation weights
- **📊 Interactive Data Grid**: Inline editing with live validation and error correction
- **📤 Smart Export**: Generate cleaned data and rules.json files ready for downstream systems

## 🏗️ Architecture

```
Data Alchemist/
├── 📁 app/                    # Next.js App Router pages
│   ├── ingestion/            # Data upload and parsing
│   ├── data/                 # Interactive data grid
│   ├── search/               # AI-powered search
│   ├── validation/           # Validation dashboard
│   ├── rules/                # Rule builder and management
│   ├── priorities/           # Priority configuration
│   └── export/               # Data export interface
├── 📁 components/            # Reusable UI components
│   ├── ui/                   # Shadcn/UI components
│   ├── data-grid.tsx         # Interactive data table
│   ├── file-upload.tsx       # File upload with validation
│   ├── rule-builder.tsx      # Visual rule builder
│   └── ai-search.tsx         # Natural language search
├── 📁 lib/                   # Core business logic
│   ├── validation-engine.ts  # 10+ validation constraints
│   ├── search-engine.ts      # AI-powered search
│   ├── rule-engine.ts        # Rule management
│   ├── export-utils.ts       # Data export utilities
│   └── ai-utils.ts           # AI integration
└── 📁 types/                 # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Groq API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/data-alchemist.git
   cd data-alchemist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env.local file
   GROQ_API_KEY=your_groq_api_key_here
   # OR
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎮 Demo Walkthrough

### 1. Data Ingestion
- Navigate to **Ingestion** tab
- Upload CSV files for clients, workers, and tasks
- Watch real-time validation and error detection
- Edit data inline with instant feedback

### 2. Data Management
- Go to **Data** tab to view all uploaded data
- Use inline editing to fix validation errors
- See color-coded validation status for each record

### 3. AI-Powered Search
- Visit **Search** tab
- Try natural language queries:
  - "high priority clients"
  - "workers with React skills"
  - "tasks due this month"
  - "clients with budget over 10000"

### 4. Rule Creation
- Navigate to **Rules** tab
- Use natural language: "Assign experienced workers to urgent tasks"
- Or use visual builder for complex rules
- Test rules against your data

### 5. Priority Configuration
- Go to **Priorities** tab
- Adjust sliders for different allocation factors
- Choose from preset templates (Cost-focused, Quality-focused, etc.)
- See real-time allocation previews

### 6. Export
- Visit **Export** tab
- Select data types to export
- Download cleaned CSV files and rules.json
- Get complete dataset with validation reports

## 🔧 Core Validation Constraints

The system implements 10+ validation constraints:

1. **Missing Required Columns** - Ensures essential fields are present
2. **Duplicate IDs** - Detects duplicate ClientID/WorkerID/TaskID
3. **Malformed Lists** - Validates AvailableSlots and other array fields
4. **Out-of-Range Values** - Checks PriorityLevel (1-5) and Duration (≥1)
5. **Broken JSON** - Validates AttributesJSON format
6. **Unknown References** - Ensures RequestedTaskIDs exist in tasks
7. **Skill Coverage** - Every RequiredSkill maps to ≥1 worker
8. **Max Concurrency** - MaxConcurrent ≤ qualified available workers
9. **Phase Slot Saturation** - Task durations fit within worker capacity
10. **Overloaded Workers** - AvailableSlots vs MaxLoadPerPhase validation

## 🤖 AI Features

### Natural Language Processing
- **Search**: "Show me high priority clients with budget over 50000"
- **Rule Creation**: "Assign workers with 4+ star ratings to urgent tasks"
- **Data Validation**: AI-powered error detection and suggestions
- **Rule Recommendations**: Pattern-based rule suggestions

### Smart Data Parsing
- Automatic header detection and mapping
- Flexible column naming (ClientName, client_name, etc.)
- Cross-entity relationship validation
- Intelligent error correction suggestions

## 📊 Sample Data Structure

### Clients.csv
```csv
ClientID,ClientName,PriorityLevel,RequestedTaskIDs,GroupTag,AttributesJSON
C1,TechCorp Solutions,3,"T1,T2,T3",GroupA,"{\"location\":\"San Francisco\",\"budget\":50000}"
C2,Design Studio Pro,2,"T4,T5",GroupB,"{\"location\":\"New York\",\"budget\":25000}"
```

### Workers.csv
```csv
WorkerID,WorkerName,Skills,AvailableSlots,MaxLoadPerPhase,WorkerGroup,QualificationLevel
W1,Sarah Chen,"React,TypeScript,Node.js","[1,2,3,4,5]",3,Developers,Senior
W2,Marcus Johnson,"UI/UX,Figma,Adobe Creative Suite","[1,3,5]",2,Designers,Senior
```

### Tasks.csv
```csv
TaskID,TaskName,Category,Duration,RequiredSkills,PreferredPhases,MaxConcurrent
T1,E-commerce Platform Development,Development,3,"React,Node.js,PostgreSQL","[1,2,3]",2
T2,Brand Identity Design,Design,2,"Branding,Figma,Illustration","[1,2]",1
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + Shadcn/UI
- **AI Integration**: Groq/OpenAI for natural language processing
- **File Processing**: XLSX library for CSV/Excel support
- **Validation**: Custom validation engine with 10+ constraints
- **State Management**: React hooks with local state
- **Export**: Multi-format export (CSV, JSON, XLSX)

## 🎯 Use Cases

### For Project Managers
- Upload team and project data
- Set allocation priorities
- Create business rules in plain English
- Export clean data for resource planning tools

### For HR Teams
- Manage worker skills and availability
- Validate data quality before allocation
- Generate reports on resource utilization
- Ensure fair workload distribution

### For Technical Teams
- API-ready data export
- Structured rules for automation
- Validation reports for data quality
- Integration with existing systems

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- AI powered by [Groq](https://groq.com/) and [OpenAI](https://openai.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Ready to transform your resource allocation chaos into intelligent, AI-powered efficiency?** 🚀

*Built with ❤️ for the Digitalyz team and beyond.*
