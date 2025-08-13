"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Download, CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react"
import { parseFile, generateSampleCSV, type ParsedData } from "@/lib/file-utils"
import type { DataUpload } from "@/types"

interface FileUploadProps {
  onDataParsed: (data: ParsedData) => void
  acceptedTypes?: "clients" | "workers" | "tasks"
}

export function FileUpload({ onDataParsed, acceptedTypes }: FileUploadProps) {
  const [uploads, setUploads] = useState<DataUpload[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newUploads: DataUpload[] = acceptedFiles.map((file) => ({
        file,
        type: acceptedTypes || "clients",
        status: "pending",
        errors: [],
        preview: [],
      }))

      setUploads((prev) => [...prev, ...newUploads])
      setIsProcessing(true)

      for (const upload of newUploads) {
        try {
          setUploads((prev) => prev.map((u) => (u.file === upload.file ? { ...u, status: "processing" } : u)))

          const parsedData = await parseFile(upload.file)

          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file
                ? {
                    ...u,
                    status: parsedData.errors.some((e) => e.severity === "error") ? "error" : "completed",
                    errors: parsedData.errors,
                    preview: parsedData.data.slice(0, 5),
                    type: parsedData.type,
                  }
                : u,
            ),
          )

          onDataParsed(parsedData)
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file
                ? {
                    ...u,
                    status: "error",
                    errors: [{ field: "file", message: "Failed to process file", severity: "error" }],
                  }
                : u,
            ),
          )
        }
      }

      setIsProcessing(false)
    },
    [onDataParsed, acceptedTypes],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: true,
  })

  const downloadSample = (type: "clients" | "workers" | "tasks") => {
    const csv = generateSampleCSV(type)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sample-${type}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: DataUpload["status"]) => {
    switch (status) {
      case "pending":
        return <FileText className="h-4 w-4 text-gray-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: DataUpload["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "processing":
        return "default"
      case "completed":
        return "default"
      case "error":
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Data Files</span>
          </CardTitle>
          <CardDescription>
            Upload CSV or XLSX files containing your {acceptedTypes || "client, worker, or task"} data. Files will be
            automatically parsed and validated using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop files here, or click to select files</p>
                <p className="text-sm text-gray-500">Supports CSV, XLSX, and XLS files</p>
              </div>
            )}
          </div>

          {/* Sample Downloads */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Download Sample Files:</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadSample("clients")}
                className="flex items-center space-x-2"
              >
                <Download className="h-3 w-3" />
                <span>Clients Sample</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadSample("workers")}
                className="flex items-center space-x-2"
              >
                <Download className="h-3 w-3" />
                <span>Workers Sample</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadSample("tasks")}
                className="flex items-center space-x-2"
              >
                <Download className="h-3 w-3" />
                <span>Tasks Sample</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Status */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Status</CardTitle>
            <CardDescription>Track the progress of your file uploads and validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploads.map((upload, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(upload.status)}
                    <div>
                      <p className="font-medium">{upload.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(upload.file.size / 1024).toFixed(1)} KB • {upload.type}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(upload.status)}>{upload.status}</Badge>
                </div>

                {upload.status === "processing" && <Progress value={50} className="mb-2" />}

                {upload.errors.length > 0 && (
                  <div className="space-y-2">
                    {upload.errors.map((error, errorIndex) => (
                      <Alert key={errorIndex} variant={error.severity === "error" ? "destructive" : "default"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{error.field}:</strong> {error.message}
                          {error.suggestions && (
                            <div className="mt-1 text-sm">Suggestions: {error.suggestions.join(", ")}</div>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {upload.status === "completed" && upload.preview.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview ({upload.preview.length} of {upload.preview.length} rows):
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-xs font-mono overflow-x-auto">
                      <pre>{JSON.stringify(upload.preview[0], null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
