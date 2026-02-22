import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/settings/', '/api/', '/library/', '/author/', '/support/'],
      },
    ],
    sitemap: 'https://fictionry.com/sitemap.xml',
  }
}
