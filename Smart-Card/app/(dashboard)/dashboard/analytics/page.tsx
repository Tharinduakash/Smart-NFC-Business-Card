'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, QrCode, Zap, MapPin, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsData {
  stats: {
    totalViews: number
    totalScans: number
    totalTaps: number
  }
  timeseries: Array<{
    date: string
    profile_view: number
    qr_scan: number
    nfc_tap: number
  }>
  locations: Array<{ location: string; count: number }>
  recentEvents: Array<{
    id: number
    event_type: string
    location?: string
    device_type?: string
    created_at: string
  }>
}

export default function AnalyticsDashboard() {
  const searchParams = useSearchParams()
  const cardId = searchParams.get('card') || ''
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Array<{ id: number; title: string }>>([])

  useEffect(() => {
    fetchCards()
  }, [])

  useEffect(() => {
    if (cardId) {
      fetchAnalytics(cardId)
    }
  }, [cardId])

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards')
      const data = await response.json()
      setCards(data)
      if (data.length > 0 && !cardId) {
        // Redirect to first card's analytics
        window.history.replaceState(
          null,
          '',
          `/dashboard/analytics?card=${data[0].id}`
        )
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch cards',
        variant: 'destructive',
      })
    }
  }

  const fetchAnalytics = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/${id}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCardChange = (newCardId: string) => {
    window.history.replaceState(
      null,
      '',
      `/dashboard/analytics?card=${newCardId}`
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Cards Yet</h3>
        <p className="text-muted-foreground">Create a card first to view analytics</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track profile views, QR scans, and engagement</p>
      </div>

      {/* Card Selector */}
      <div className="mb-8">
        <label className="text-sm font-semibold text-foreground block mb-3">
          Select Card
        </label>
        <select
          value={cardId}
          onChange={(e) => {
            handleCardChange(e.target.value)
            fetchAnalytics(e.target.value)
          }}
          className="w-full md:w-64 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="mr-2" />
          <span>Loading analytics...</span>
        </div>
      ) : analytics ? (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Profile Views</h3>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics.stats.totalViews}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Last 30 days</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">QR Scans</h3>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics.stats.totalScans}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Last 30 days</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">NFC Taps</h3>
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics.stats.totalTaps}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Last 30 days</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Timeseries Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Activity (30 days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.timeseries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profile_view"
                    stroke="#3b82f6"
                    name="Profile Views"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="qr_scan"
                    stroke="#10b981"
                    name="QR Scans"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="nfc_tap"
                    stroke="#f59e0b"
                    name="NFC Taps"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Locations */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Top Locations</h3>
              {analytics.locations.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.locations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="location"
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Bar dataKey="count" fill="#3366cc" name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No location data available yet
                </p>
              )}
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            {analytics.recentEvents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Event
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Device
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentEvents.map((event) => (
                      <tr key={event.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-2">
                            {event.event_type === 'profile_view' && (
                              <Eye className="w-4 h-4 text-blue-500" />
                            )}
                            {event.event_type === 'qr_scan' && (
                              <QrCode className="w-4 h-4 text-green-500" />
                            )}
                            {event.event_type === 'nfc_tap' && (
                              <Zap className="w-4 h-4 text-amber-500" />
                            )}
                            <span className="capitalize">
                              {event.event_type.replace('_', ' ')}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {event.location || '-'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {event.device_type || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(event.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No recent activity yet
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
