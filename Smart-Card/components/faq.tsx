'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How do NFC cards work?',
    answer:
      'NFC (Near Field Communication) cards contain a small chip that stores a link to your digital profile. When someone taps the card with their smartphone, it automatically opens your profile page. No app installation needed!',
  },
  {
    question: 'Can I use SmartCard without ordering physical cards?',
    answer:
      'Absolutely! You can share your digital card via QR code, direct link, or email immediately. Physical NFC cards are optional and available through our fulfillment partners.',
  },
  {
    question: 'What information is tracked in analytics?',
    answer:
      'We track profile views, QR scans, tap events, visitor location (city-level), device type, and timestamps. You maintain full control over your data privacy.',
  },
  {
    question: 'Can I have multiple business cards?',
    answer:
      'Yes! Depending on your plan, you can create multiple cards for different roles, projects, or business ventures. Pro and Premium plans offer unlimited cards.',
  },
  {
    question: 'How do people save my contact?',
    answer:
      'When visitors view your digital card, they see a "Save Contact" button that automatically creates a vCard (.vcf) file compatible with Apple Contacts, Google Contacts, and Outlook.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we use industry-standard encryption and secure databases. We never share your personal data without permission. Detailed privacy policy available on our website.',
  },
  {
    question: 'Can I integrate with other tools?',
    answer:
      'Pro and Premium plans include API access to integrate SmartCard with CRM systems, email marketing tools, and other business applications.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'Your data remains on our servers for 90 days after cancellation. You can export all your card data anytime as JSON or CSV before deletion.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about SmartCard
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="p-6 bg-muted/30 border-t border-border">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground">
            Can't find the answer you're looking for? Please{' '}
            <a href="mailto:support@smartcard.app" className="text-primary hover:underline font-semibold">
              contact our support team
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
