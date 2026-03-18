import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { Pricing } from '@/components/pricing'
import { FAQ } from '@/components/faq'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'SmartCard - Digital Business Cards with NFC & QR',
  description: 'Create beautiful digital business cards shared via NFC, QR codes, and links. Track engagement with real-time analytics.',
  openGraph: {
    title: 'SmartCard - Digital Business Cards with NFC & QR',
    description: 'Create beautiful digital business cards shared via NFC, QR codes, and links. Track engagement with real-time analytics.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  )
}
