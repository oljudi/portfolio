import { useEffect } from 'react'
import portfolioData from '../data/portfolio.json'

export function SchemaMarkup() {
  useEffect(() => {
    // Person schema — describes who you are
    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: portfolioData.name,
      jobTitle: portfolioData.title,
      description: portfolioData.bio,
      url: 'https://oljudi.dev',
      email: portfolioData.email,
      image: 'https://oljudi.dev/avatar.png',
      sameAs: portfolioData.social.map((link) => link.url),
      skills: portfolioData.skills.flatMap((group) => group.items),
    }

    // Work experience / Projects
    const projectSchemas = portfolioData.projects.map((project) => ({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.name,
      description: project.description,
      keywords: project.tech.join(', '),
      author: {
        '@type': 'Person',
        name: portfolioData.name,
      },
    }))

    // Educational credentials
    const certSchemas = portfolioData.certifications.map((cert) => ({
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalCredential',
      name: cert.name,
      issuingOrganization: {
        '@type': 'Organization',
        name: cert.issuer,
      },
      credentialCategory: cert.credential,
      url: cert.url,
    }))

    // Inject all schemas into head
    const schemas = [personSchema, ...projectSchemas, ...certSchemas]

    schemas.forEach((schema) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(schema)
      script.async = true
      document.head.appendChild(script)
    })

    return () => {
      // Cleanup (optional — scripts stay for SEO)
    }
  }, [])

  return null
}
