import { QrCode, Zap, BarChart3, Share2, Shield, Smartphone } from 'lucide-react'

const features = [
  {
    icon: QrCode,
    title: 'QR Code Sharing',
    description: 'Instantly generate unique QR codes for each card. Share them anywhere and track every scan.',
  },
  {
    icon: Zap,
    title: 'NFC Integration Ready',
    description: 'Tap-enabled cards. Order physical NFC cards that link directly to your digital profile.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track profile views, QR scans, and location data. See who and where people are checking out your card.',
  },
  {
    icon: Share2,
    title: 'Multiple Share Options',
    description: 'Share via link, QR code, or NFC. Visitors can save your contact to Apple/Google automatically.',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Your data is secure. Control what information is visible to the public on your profile.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Beautiful responsive design works perfectly on phones, tablets, and desktops.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, share, and track your smart business cards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
