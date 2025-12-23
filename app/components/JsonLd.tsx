export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': 'https://thefortjiujitsu.com/#organization',
    name: 'The Fort Jiu-Jitsu',
    alternateName: 'The Fort BJJ',
    description: 'Northeast Indiana\'s premier Brazilian Jiu-Jitsu academy with 100+ technique library. Expert instruction for kids and adults in BJJ and wrestling. Serving Fort Wayne, Allen County, and surrounding communities.',
    url: 'https://thefortjiujitsu.com',
    logo: 'https://thefortjiujitsu.com/icon-512.png',
    image: 'https://thefortjiujitsu.com/og-image.png',
    telephone: '+1-260-452-7615',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1519 Goshen Road',
      addressLocality: 'Fort Wayne',
      addressRegion: 'IN',
      postalCode: '46808',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.0996,
      longitude: -85.1605,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Wednesday', 'Friday'],
        opens: '05:00',
        closes: '06:00',
        description: 'Morning Rolls',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday'],
        opens: '17:30',
        closes: '20:00',
        description: 'Kids & Adult Classes',
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Credit Card, Debit Card',
    areaServed: [
      {
        '@type': 'City',
        name: 'Fort Wayne',
        '@id': 'https://www.wikidata.org/wiki/Q49255',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Allen County',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Northeast Indiana',
      },
      {
        '@type': 'City',
        name: 'New Haven',
      },
      {
        '@type': 'City',
        name: 'Columbia City',
      },
      {
        '@type': 'City',
        name: 'Huntington',
      },
      {
        '@type': 'City',
        name: 'Auburn',
      },
      {
        '@type': 'City',
        name: 'Bluffton',
      },
      {
        '@type': 'City',
        name: 'Decatur',
      },
      {
        '@type': 'City',
        name: 'Angola',
      },
    ],
    sameAs: [
      // Add social media URLs when available
      // 'https://www.facebook.com/thefortjiujitsu',
      // 'https://www.instagram.com/thefortjiujitsu',
    ],
    knowsAbout: [
      'Brazilian Jiu-Jitsu',
      'BJJ Techniques',
      'Wrestling',
      'Grappling',
      'Self Defense',
      'Martial Arts',
      'Submissions',
      'Guard Passes',
      'Sweeps',
      'Escapes',
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
    description: 'Comprehensive Brazilian Jiu-Jitsu training program with 100+ technique library covering submissions, guard passes, sweeps, and escapes. Serving Northeast Indiana from Fort Wayne.',
    provider: {
      '@type': 'Organization',
      name: 'The Fort Jiu-Jitsu',
      sameAs: 'https://thefortjiujitsu.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1519 Goshen Road',
        addressLocality: 'Fort Wayne',
        addressRegion: 'IN',
        postalCode: '46808',
        addressCountry: 'US',
      },
    },
    educationalLevel: 'Beginner to Advanced',
    courseCode: 'BJJ-101',
    teaches: [
      'Submissions (Arm Locks, Chokes, Leg Locks)',
      'Guard Passes',
      'Sweeps',
      'Escapes',
      'Takedowns',
      'Self Defense',
    ],
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        name: 'Kids BJJ Classes',
        description: 'Tuesday & Wednesday 5:30-6:30 PM - Perfect for ages 5-15',
        courseMode: 'onsite',
        courseWorkload: 'PT2H',
        instructor: {
          '@type': 'Person',
          name: 'The Fort Instructors',
        },
      },
      {
        '@type': 'CourseInstance',
        name: 'Adult BJJ Classes',
        description: 'Tuesday & Wednesday 6:30-8:00 PM - All levels welcome',
        courseMode: 'onsite',
        courseWorkload: 'PT3H',
        instructor: {
          '@type': 'Person',
          name: 'The Fort Instructors',
        },
      },
      {
        '@type': 'CourseInstance',
        name: 'Morning Rolls',
        description: 'Monday, Wednesday, Friday 5:00-6:00 AM - Free with membership',
        courseMode: 'onsite',
        courseWorkload: 'PT3H',
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
