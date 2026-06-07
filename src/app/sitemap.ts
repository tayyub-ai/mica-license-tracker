import type { MetadataRoute } from 'next'
import { getAllFirms } from '@/lib/queries/firms'
import { getStateCounts } from '@/lib/queries/states'
import { SITE_URL } from '@/lib/constants/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [firms, states] = await Promise.all([getAllFirms(), getStateCounts()])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/firms`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/countries`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/timeline`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/learn`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/changelog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/methodology`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/team`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/embed`, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const countryPages: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${SITE_URL}/countries/${s.code.toLowerCase()}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const firmPages: MetadataRoute.Sitemap = firms.map((f) => ({
    url: `${SITE_URL}/firms/${f.slug}`,
    lastModified: f.updated_at,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...staticPages, ...countryPages, ...firmPages]
}
