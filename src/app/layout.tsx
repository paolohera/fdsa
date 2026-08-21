import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://www.fdsa.site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Flight Dynamics School of Aeronautics, Inc. | Aviation School in Cebu",
    template: "%s | Flight Dynamics School of Aeronautics",
  },
  description:
    "Flight Dynamics School of Aeronautics (FDSA) offers CHED-, CAAP-, and DepEd-recognized aviation programs at Mactan-Cebu International Airport, Lapu-Lapu City. Aircraft maintenance, avionics, and Senior High School tracks.",
  keywords: [
    "aviation school Cebu",
    "aircraft maintenance technology",
    "FDSA",
    "Flight Dynamics School of Aeronautics",
    "Mactan Cebu aviation school",
    "aviation electronics technology Philippines",
    "CAAP accredited aviation school",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Flight Dynamics School of Aeronautics, Inc.",
    title: "Flight Dynamics School of Aeronautics, Inc.",
    description:
      "CHED-, CAAP-, and DepEd-recognized aviation programs at Mactan-Cebu International Airport, Lapu-Lapu City.",
    images: [{ url: "/fdsa-logo.png" }],
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flight Dynamics School of Aeronautics, Inc.",
    description:
      "CHED-, CAAP-, and DepEd-recognized aviation programs at Mactan-Cebu International Airport, Lapu-Lapu City.",
    images: ["/fdsa-logo.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// EducationalOrganization structured data — helps Google understand this is
// a school (not a generic business) and can surface logo/address/phone/
// socials as rich results in search.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Flight Dynamics School of Aeronautics, Inc.",
  alternateName: "FDSA",
  url: SITE_URL,
  logo: `${SITE_URL}/fdsa-logo.png`,
  description:
    "Flight Dynamics School of Aeronautics offers CHED-, CAAP-, and DepEd-recognized aviation programs at Mactan-Cebu International Airport.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "The Runway Building, Pak-Pakan Rd",
    addressLocality: "Lapu-Lapu City",
    addressRegion: "Cebu",
    addressCountry: "PH",
  },
  telephone: "+63-32-607-92",
  email: "flightdynamicsjdc@gmail.com",
  sameAs: ["https://www.facebook.com/fdsa.edu"],
  foundingDate: "1988",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}