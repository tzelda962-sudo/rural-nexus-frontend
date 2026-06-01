import type { NewsEvent, INewsEventRepository } from '@domain/repositories/INewsEventRepository'

type PayloadNewsEvent = {
  id: string
  title: string
  slug: string
  date: string
  author?: string
  summary: string
  category: string
  isHighlight: boolean
  image?: { url?: string } | null
}

type PayloadList<T> = { docs: T[] }

function toDisplayDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

function adapt(item: PayloadNewsEvent): NewsEvent {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    date: toDisplayDate(item.date),
    summary: item.summary,
    isHighlight: item.isHighlight,
    highlightCategory: item.category,
    category: item.category as NewsEvent['category'],
    imageUrl: item.image?.url,
  }
}

export class HttpNewsEventRepository implements INewsEventRepository {
  constructor(private readonly baseUrl: string) {}

  async getLatestEvents(limit: number): Promise<NewsEvent[]> {
    const res = await $fetch<PayloadList<PayloadNewsEvent>>(
      `${this.baseUrl}/api/news-events?where[isHighlight][equals]=false&limit=${limit}&depth=1&sort=-date`,
    )
    return res.docs.map(adapt)
  }

  async getHighlights(): Promise<NewsEvent[]> {
    const res = await $fetch<PayloadList<PayloadNewsEvent>>(
      `${this.baseUrl}/api/news-events?where[isHighlight][equals]=true&limit=10&depth=1&sort=-date`,
    )
    return res.docs.map(adapt)
  }

  async getById(id: string): Promise<NewsEvent | null> {
    try {
      const res = await $fetch<PayloadNewsEvent>(`${this.baseUrl}/api/news-events/${id}?depth=1`)
      return adapt(res)
    } catch {
      return null
    }
  }

  async getAllByCategory(category: string): Promise<NewsEvent[]> {
    const res = await $fetch<PayloadList<PayloadNewsEvent>>(
      `${this.baseUrl}/api/news-events?where[category][equals]=${encodeURIComponent(category)}&limit=100&depth=1&sort=-date`,
    )
    return res.docs.map(adapt)
  }
}
