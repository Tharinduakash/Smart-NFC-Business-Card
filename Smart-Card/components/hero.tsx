import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Smart Business Cards at Your Fingertips
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Create digital business cards that work with NFC, QR codes, and links. Share your professional profile effortlessly and track engagement with powerful analytics.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Create Free Card
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required. Free tier includes 1 card and basic analytics.
            </p>
          </div>

          {/* Right side - Visual demo card */}
          <div className="relative h-80 md:h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-2xl shadow-2xl overflow-hidden">
              {/* Card content */}
              <div className="p-8 h-full flex flex-col justify-between text-primary-foreground">
                <div>
                  <div className="w-16 h-16 bg-white/20 rounded-full mb-4" />
                  <h3 className="text-2xl font-bold mb-2">John Doe</h3>
                  <p className="text-primary-foreground/80">Founder & CEO</p>
                  <p className="text-sm text-primary-foreground/70 mt-1">Tech Innovation Inc.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 bg-white/30 rounded" />
                    john@example.com
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 bg-white/30 rounded" />
                    +1 (555) 123-4567
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="w-5 h-5 bg-white/30 rounded" />
                    <div className="w-5 h-5 bg-white/30 rounded" />
                    <div className="w-5 h-5 bg-white/30 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code element */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white rounded-lg shadow-xl p-3 border-4 border-background">
              <div className="w-full h-full bg-muted grid grid-cols-4 gap-1 p-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${i % 3 === 0 ? 'bg-foreground' : 'bg-muted'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
