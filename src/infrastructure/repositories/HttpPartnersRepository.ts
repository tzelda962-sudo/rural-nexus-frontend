export type Partner = {
  id: string
  name: string
  abbreviation?: string
  type: 'University' | 'Research Institute' | 'NGO' | 'Funding Agency'
  continent: 'Europe' | 'Africa' | 'Global'
  country: string
  show?: boolean
  website?: string
  description?: string
  logo?: { url?: string } | null
}

export type TeamMemberApi = {
  id: string
  name: string
  role: string
  memberType: 'ceo' | 'pa-manager' | 'advisory' | 'staff'
  order?: number | null
  bio?: string
  location?: string
  link?: { linkLabel?: string; linkUrl?: string } | null
  expertise?: { skill: string }[]
  avatar?: { url?: string } | null
  show?: boolean
  programAreas?: { id: string; code: string; title: string; slug: string }[] | null
}

export type InterventionCountry = {
  name: string
  isoCode: string
  programs?: string
}

type PayloadList<T> = { docs: T[] }

export class HttpPartnersRepository {
  constructor(private readonly baseUrl: string) {}

  async getAll(): Promise<Partner[]> {
    const res = await $fetch<PayloadList<Partner>>(
      `${this.baseUrl}/api/partners?limit=100&sort=continent,name&depth=1`,
    )
    return res.docs.filter((partner) => partner.show !== false)
  }

  async getByContinent(continent: 'Europe' | 'Africa' | 'Global'): Promise<Partner[]> {
    const res = await $fetch<PayloadList<Partner>>(
      `${this.baseUrl}/api/partners?where[continent][equals]=${continent}&limit=100&sort=name&depth=1`,
    )
    return res.docs.filter((partner) => partner.show !== false)
  }

  async getTeamByType(
    memberType: 'ceo' | 'pa-manager' | 'advisory',
  ): Promise<TeamMemberApi[]> {
    const res = await $fetch<PayloadList<TeamMemberApi>>(
      `${this.baseUrl}/api/team?where[memberType][equals]=${memberType}&limit=100&depth=1&sort=order`,
    )
    return res.docs.filter((member) => member.show !== false)
  }

  async getInterventionCountries(): Promise<InterventionCountry[]> {
    const res = await $fetch<{ interventionCountries?: InterventionCountry[] }>(
      `${this.baseUrl}/api/globals/site-settings`,
    )
    return res.interventionCountries ?? []
  }
}
