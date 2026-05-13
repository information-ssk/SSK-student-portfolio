export function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 9
): {
  page: number
  pageSize: number
  total: number
  pages: number
  items: T[]
} {
  const total = items.length
  const start = (page - 1) * pageSize
  return {
    page,
    pageSize,
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    items: items.slice(start, start + pageSize),
  }
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
