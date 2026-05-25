import type { ProgramArea } from '@domain/entities/ProgramArea'
import type { IProgramAreaRepository } from '@domain/repositories/IProgramAreaRepository'

const SDG_META: Record<number, { title: string; color: string }> = {
  1:  { title: 'No Poverty',              color: '#E5243B' },
  2:  { title: 'Zero Hunger',             color: '#DDA63A' },
  3:  { title: 'Good Health',             color: '#4C9F38' },
  4:  { title: 'Quality Education',       color: '#C5192D' },
  5:  { title: 'Gender Equality',         color: '#FF3A21' },
  6:  { title: 'Clean Water',             color: '#26BDE2' },
  7:  { title: 'Affordable Energy',       color: '#FCC30B' },
  8:  { title: 'Decent Work',             color: '#A21942' },
  9:  { title: 'Industry & Innovation',   color: '#FD6925' },
  10: { title: 'Reduced Inequalities',    color: '#DD1367' },
  11: { title: 'Sustainable Cities',      color: '#FD9D24' },
  12: { title: 'Responsible Consumption', color: '#BF8B2E' },
  13: { title: 'Climate Action',          color: '#3F7E44' },
  14: { title: 'Life Below Water',        color: '#0A97D9' },
  15: { title: 'Life on Land',            color: '#56C02B' },
  16: { title: 'Peace & Justice',         color: '#00689D' },
  17: { title: 'Partnerships for Goals',  color: '#19486A' },
}

type PayloadProgram = {
  id: string
  code: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  color: string
  sdgs?: { goal: number }[]
  initiatives?: { title: string; description: string }[]
  keyActivities?: { activity: string }[]
}

type PayloadList<T> = { docs: T[]; totalDocs: number }

function adapt(p: PayloadProgram): ProgramArea {
  return {
    id: p.id,
    code: p.code,
    slug: p.slug,
    title: p.title,
    description: p.description,
    shortDescription: p.shortDescription,
    icon: '',
    colorTheme: p.color,
    sdgs: (p.sdgs ?? []).map(s => ({
      code: `SDG${s.goal}`,
      title: SDG_META[s.goal]?.title ?? `Goal ${s.goal}`,
      color: SDG_META[s.goal]?.color ?? '#555',
    })),
    initiatives: (p.initiatives ?? []).map(i => ({
      title: i.title,
      desc: i.description,
    })),
    keyActivities: (p.keyActivities ?? []).map(k => k.activity),
  }
}

export class HttpProgramAreaRepository implements IProgramAreaRepository {
  constructor(private readonly baseUrl: string) {}

  async getAll(): Promise<ProgramArea[]> {
    const res = await $fetch<PayloadList<PayloadProgram>>(
      `${this.baseUrl}/api/programs?limit=100&depth=1&sort=code`,
    )
    return res.docs.map(adapt)
  }

  async getById(id: string): Promise<ProgramArea | null> {
    try {
      const res = await $fetch<PayloadProgram>(`${this.baseUrl}/api/programs/${id}?depth=1`)
      return adapt(res)
    } catch {
      return null
    }
  }
}
