// Simple in-memory data registry to enable cross-entity validations
// Not persisted; only for current session in browser/server process

export type DataTypeKey = "clients" | "workers" | "tasks"

type Registry = {
  clients: any[]
  workers: any[]
  tasks: any[]
}

const registry: Registry = {
  clients: [],
  workers: [],
  tasks: [],
}

export function setData(type: DataTypeKey, data: any[]) {
  registry[type] = Array.isArray(data) ? data : []
}

export function getData(type: DataTypeKey): any[] {
  return registry[type] || []
}

export function getAll() {
  return { ...registry }
}


