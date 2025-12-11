export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': 'https://thefortjiujitsu.com/#organization',
    name: 'The Fort Jiu-Jitsu',
    alternateName: 'The Fort BJJ',
    description: 'Fort Wayne\'s premier Brazilian Jiu-Jitsu academy offering expert instruction for kids and adults in BJJ and wrestling.',
    url: 'https://thefortjiujitsu.com',
    logo: 'https://thefortjiujitsu.com/jiu-jitsu.png',
    image: 'https://thefortjiujitsu.com/jiu-jitsu.png',
    telephone: '+1-260-XXX-XXXX', // Update with actual phone
    email: 'info@thefortjiujitsu.com', // Update with actual email
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street', // Update with actual address
      addressLocality: 'Fort Wayne',
      addressRegion: 'IN',
      postalCode: '46802', // Update with actual zip
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.0793, // Update with actual coordinates
      longitude: -85.1394, // Update with actual coordinates
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday'],
        opens: '17:30',
        closes: '20:00',
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Credit Card, Debit Card',
    areaServed: {
      '@type': 'City',
      name: 'Fort Wayne',
      '@id': 'https://www.wikidata.org/wiki/Q49255',
    },
    sameAs: [
      // Add social media URLs when available
      // 'https://www.facebook.com/thefortjiujitsu',
      // 'https://www.instagram.com/thefortjiujitsu',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Jiu-Jitsu Classes',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Kids Gi Classes',
            description: 'Brazilian Jiu-Jitsu for kids - Tuesday & Wednesday 5:30-6:30 PM',
          },
          price: '75.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '75.00',
            priceCurrency: 'USD',
            unitText: 'month',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Adult Gi Classes',
            description: 'Brazilian Jiu-Jitsu for adults - Tuesday & Wednesday 6:30-8:00 PM + Morning Rolls',
          },
          price: '100.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '100.00',
            priceCurrency: 'USD',
            unitText: 'month',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Drop-in Class',
            description: 'Single class visit for all skill levels',
          },
          price: '20.00',
          priceCurrency: 'USD',
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '10', // Update with actual review count
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function CourseJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Brazilian Jiu-Jitsu Training',
    description: 'Comprehensive Brazilian Jiu-Jitsu training program for all skill levels, from beginners to advanced practitioners.',
    provider: {
      '@type': 'Organization',
      name: 'The Fort Jiu-Jitsu',
      sameAs: 'https://thefortjiujitsu.com',
    },
    educationalLevel: 'Beginner to Advanced',
    courseCode: 'BJJ-101',
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        name: 'Kids BJJ Classes',
        courseMode: 'onsite',
        courseWorkload: 'PT2H', // 2 hours per week
        instructor: {
          '@type': 'Person',
          name: 'The Fort Instructors',
        },
      },
      {
        '@type': 'CourseInstance',
        name: 'Adult BJJ Classes',
        courseMode: 'onsite',
        courseWorkload: 'PT3H', // 3 hours per week
        instructor: {
          '@type': 'Person',
          name: 'The Fort Instructors',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
