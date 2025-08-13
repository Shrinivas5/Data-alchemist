"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit3,
  Save,
  X,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  CalendarIcon,
} from "lucide-react"
import { format } from "date-fns"
import { validationEngine } from "@/lib/validation-engine"
import type { ValidationResult } from "@/types"

interface Column {
  key: string
  label: string
  type: "text" | "number" | "email" | "date" | "select" | "multiselect" | "textarea"
  options?: string[]
  required?: boolean
  editable?: boolean
  width?: string
}

interface DataGridProps {
  data: any[]
  columns: Column[]
  dataType: "clients" | "workers" | "tasks"
  onDataChange?: (data: any[]) => void
  onValidationChange?: (results: ValidationResult[]) => void
}

export function DataGrid({ data, columns, dataType, onDataChange, onValidationChange }: DataGridProps) {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(null)
  const [editingValue, setEditingValue] = useState<any>("")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [filterConfig, setFilterConfig] = useState<Record<string, string>>({})
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [localData, setLocalData] = useState(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  useEffect(() => {
    validateData()
  }, [localData])

  const validateData = async () => {
    if (localData.length > 0) {
      const results = await validationEngine.validateBatch(localData, dataType)
      setValidationResults(results)
      onValidationChange?.(results)
    }
  }

  const handleCellEdit = (rowIndex: number, columnKey: string, currentValue: any) => {
    setEditingCell({ rowIndex, columnKey })
    setEditingValue(currentValue)
  }

  const handleCellSave = async () => {
    if (!editingCell) return

    const { rowIndex, columnKey } = editingCell
    const newData = [...localData]
    newData[rowIndex] = { ...newData[rowIndex], [columnKey]: editingValue }

    setLocalData(newData)
    setEditingCell(null)
    setEditingValue("")
    onDataChange?.(newData)
  }

  const handleCellCancel = () => {
    setEditingCell(null)
    setEditingValue("")
  }

  const handleRowDelete = (rowIndex: number) => {
    const newData = localData.filter((_, index) => index !== rowIndex)
    setLocalData(newData)
    onDataChange?.(newData)
  }

  const handleBulkDelete = () => {
    const newData = localData.filter((_, index) => !selectedRows.has(index))
    setLocalData(newData)
    setSelectedRows(new Set())
    onDataChange?.(newData)
  }

  const handleAddRow = () => {
    const newRow = columns.reduce((acc, col) => {
      acc[col.key] = col.type === "number" ? 0 : col.type === "multiselect" ? [] : ""
      return acc
    }, {} as any)

    newRow.id = `new-${Date.now()}`
    const newData = [...localData, newRow]
    setLocalData(newData)
    onDataChange?.(newData)
  }

  const handleSort = (columnKey: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key: columnKey, direction })
  }

  const handleFilter = (columnKey: string, value: string) => {
    setFilterConfig((prev) => ({ ...prev, [columnKey]: value }))
  }

  const getSortedAndFilteredData = () => {
    let filteredData = [...localData]

    // Apply filters
    Object.entries(filterConfig).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter((row) => String(row[key]).toLowerCase().includes(value.toLowerCase()))
      }
    })

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return filteredData
  }

  const renderCell = (row: any, column: Column, rowIndex: number) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key
    const cellValue = row[column.key]
    const validationResult = validationResults[rowIndex]
    const fieldErrors = validationResult?.errors.filter((e) => e.field === column.key) || []
    const fieldWarnings = validationResult?.warnings.filter((e) => e.field === column.key) || []

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {renderEditingInput(column, editingValue, setEditingValue)}
          <Button size="sm" variant="ghost" onClick={handleCellSave}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCellCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    return (
      <div className="group relative">
        <div
          className={`cursor-pointer p-1 rounded ${
            fieldErrors.length > 0
              ? "bg-red-50 border border-red-200"
              : fieldWarnings.length > 0
                ? "bg-yellow-50 border border-yellow-200"
                : "hover:bg-gray-50"
          }`}
          onClick={() => column.editable !== false && handleCellEdit(rowIndex, column.key, cellValue)}
        >
          {renderCellValue(cellValue, column)}
        </div>

        {(fieldErrors.length > 0 || fieldWarnings.length > 0) && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
              >
                {fieldErrors.length > 0 ? (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                {fieldErrors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error.message}</AlertDescription>
                  </Alert>
                ))}
                {fieldWarnings.map((warning, index) => (
                  <Alert key={index}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{warning.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {column.editable !== false && (
          <Edit3 className="h-3 w-3 absolute top-1 right-1 opacity-0 group-hover:opacity-50" />
        )}
      </div>
    )
  }

  const renderEditingInput = (column: Column, value: any, onChange: (value: any) => void) => {
    switch (column.type) {
      case "textarea":
        return (
          <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="min-w-[200px]" rows={3} />
        )

      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "multiselect":
        return (
          <div className="min-w-[200px] space-y-2">
            {column.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentArray = Array.isArray(value) ? value : []
                    if (checked) {
                      onChange([...currentArray, option])
                    } else {
                      onChange(currentArray.filter((item) => item !== option))
                    }
                  }}
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[150px] justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="min-w-[100px]"
          />
        )

      default:
        return (
          <Input
            type={column.type === "email" ? "email" : "text"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="min-w-[150px]"
          />
        )
    }
  }

  const renderCellValue = (value: any, column: Column) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400 italic">Empty</span>
    }

    switch (column.type) {
      case "date":
        return format(new Date(value), "MMM dd, yyyy")

      case "multiselect":
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">No items</span>
        )

      case "number":
        return typeof value === "number" ? value.toLocaleString() : value

      case "email":
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        )

      default:
        return String(value)
    }
  }

  const sortedAndFilteredData = getSortedAndFilteredData()

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddRow} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          {selectedRows.size > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedRows.size})
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {columns.slice(0, 4).map((column) => (
          <div key={column.key} className="relative">
            <Input
              placeholder={`Filter ${column.label}...`}
              value={filterConfig[column.key] || ""}
              onChange={(e) => handleFilter(column.key, e.target.value)}
              className="pr-8"
            />
            <Filter className="h-3 w-3 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === sortedAndFilteredData.length && sortedAndFilteredData.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(new Set(sortedAndFilteredData.map((_, index) => index)))
                    } else {
                      setSelectedRows(new Set())
                    }
                  }}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="cursor-pointer hover:bg-gray-50"
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.required && <span className="text-red-500">*</span>}
                    {sortConfig?.key === column.key && (
                      <div className="ml-auto">
                        {sortConfig.direction === "asc" ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredData.map((row, rowIndex) => {
              const validationResult = validationResults[rowIndex]
              const hasErrors = validationResult?.errors.length > 0
              const hasWarnings = validationResult?.warnings.length > 0

              return (
                <TableRow
                  key={row.id || rowIndex}
                  className={`${
                    hasErrors
                      ? "bg-red-50 hover:bg-red-100"
                      : hasWarnings
                        ? "bg-yellow-50 hover:bg-yellow-100"
                        : "hover:bg-gray-50"
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(rowIndex)}
                      onCheckedChange={(checked) => {
                        const newSelected = new Set(selectedRows)
                        if (checked) {
                          newSelected.add(rowIndex)
                        } else {
                          newSelected.delete(rowIndex)
                        }
                        setSelectedRows(newSelected)
                      }}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key}>{renderCell(row, column, rowIndex)}</TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleRowDelete(rowIndex)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Row
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Validate Row
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {sortedAndFilteredData.length} of {localData.length} records
        </span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{validationResults.filter((r) => r.isValid).length} valid</span>
          </span>
          <span className="flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>{validationResults.filter((r) => !r.isValid).length} with errors</span>
          </span>
        </div>
      </div>
    </div>
  )
}
