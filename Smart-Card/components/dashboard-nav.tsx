'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { LayoutGrid, AnalyticsIcon, Settings, LogOut } from 'lucide-react'

interface DashboardNavProps {
  user: {
    id?: number | string
    email?: string
    name?: string
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Cards',
      icon: LayoutGrid,
      active: pathname === '/dashboard',
    },
    {
      href: '/dashboard/analytics',
      label: 'Analytics',
      icon: AnalyticsIcon,
      active: pathname === '/dashboard/analytics',
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname === '/dashboard/settings',
    },
  ]

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
            SC
          </div>
          <span className="text-foreground hidden sm:inline">SmartCard</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-sm">
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </header>
  )
}
