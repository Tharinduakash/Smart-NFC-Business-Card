'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'
import {
  ChevronLeft, Save, RotateCcw, Wifi, QrCode,
  MousePointer, Info,
} from 'lucide-react'
import { gradientPresets } from '@/lib/gradients'
import BusinessCard, { DEFAULT_POSITIONS } from '@/components/BusinessCard'
import type { ElementPositions, ElementPosition } from '@/lib/cards'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CardDetail {
  id: number
  name?: string
  title: string
  company?: string
  email?: string
  phone?: string
  website?: string
  about?: string
  profile_image?: string
  card_color?: string
  front_gradient_start?: string
  front_gradient_end?: string
  front_gradient_angle?: string
  back_gradient_start?: string
  back_gradient_end?: string
  back_gradient_angle?: string
  nfc_url?: string
  element_positions?: ElementPositions
  social_links?: Array<{ platform: string; url: string }>
}

type FrontElement = 'name' | 'title' | 'company' | 'contact'
type BackElement  = 'info' | 'qrCode' | 'about' | 'social'
type AnyElement  = FrontElement | BackElement

interface DragState {
  element:   AnyElement
  side:      'front' | 'back'
  startMouseX: number
  startMouseY: number
  startPosX:   number
  startPosY:   number
}

const ELEMENT_LABELS: Record<AnyElement, string> = {
  name:    'Full Name',
  title:   'Job Title',
  company: 'Company',
  contact: 'Email & Phone',
  info:    'Company Info',
  qrCode:  'QR Code',
  about:   'About Text',
  social:  'Social Icons',
}

async function writeNFCTag(url: string) {
  if (!('NDEFReader' in window)) return false
  try {
    // @ts-ignore
    const ndef = new NDEFReader()
    await ndef.write({ records: [{ recordType: 'url', data: url }] })
    return true
  } catch { return false }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CardEditorPage() {
  const params           = useParams()
  const router           = useRouter()
  const { toast }        = useToast()
  const { data: session} = useSession()
  const cardId           = Number(params.cardId)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  // Server data
  const [card, setCard]           = useState<CardDetail | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  // Editor state
  const [editingSide, setEditingSide]         = useState<'front' | 'back'>('front')
  const [selectedElement, setSelectedElement] = useState<AnyElement | null>(null)
  const [positions, setPositions]             = useState<ElementPositions>(DEFAULT_POSITIONS)
  const [dragState, setDragState]             = useState<DragState | null>(null)

  // Gradient state (local edits before save)
  const [frontStart,  setFrontStart]  = useState('#0066cc')
  const [frontEnd,    setFrontEnd]    = useState('#00b386')
  const [frontAngle,  setFrontAngle]  = useState('135deg')
  const [backStart,   setBackStart]   = useState('#0052a3')
  const [backEnd,     setBackEnd]     = useState('#00c853')
  const [backAngle,   setBackAngle]   = useState('135deg')

  // ── Load card ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cardId) return
    fetch(`/api/cards/${cardId}`)
      .then(r => r.json())
      .then((data: CardDetail) => {
        setCard(data)
        setPositions(data.element_positions ?? DEFAULT_POSITIONS)
        setFrontStart(data.front_gradient_start ?? '#0066cc')
        setFrontEnd(data.front_gradient_end     ?? '#00b386')
        setFrontAngle(data.front_gradient_angle ?? '135deg')
        setBackStart(data.back_gradient_start   ?? '#0052a3')
        setBackEnd(data.back_gradient_end       ?? '#00c853')
        setBackAngle(data.back_gradient_angle   ?? '135deg')
      })
      .catch(() => toast({ title: 'Error', description: 'Could not load card', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [cardId])

  // ── Drag logic ────────────────────────────────────────────────────────────
  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, side: 'front' | 'back', element: string) => {
      e.preventDefault()
      e.stopPropagation()

      if (!cardContainerRef.current) return

      const currentPos: ElementPosition =
        side === 'front'
          ? (positions.front?.[element as FrontElement] ?? DEFAULT_POSITIONS.front![element as FrontElement]!)
          : (positions.back?.[element as BackElement]   ?? DEFAULT_POSITIONS.back![element as BackElement]!)

      setSelectedElement(element as AnyElement)
      setDragState({
        element: element as AnyElement,
        side,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPosX:   currentPos.x,
        startPosY:   currentPos.y,
      })
    },
    [positions]
  )

  useEffect(() => {
    if (!dragState) return

    const onMove = (e: MouseEvent) => {
      if (!cardContainerRef.current) return
      const rect   = cardContainerRef.current.getBoundingClientRect()
      const dx     = ((e.clientX - dragState.startMouseX) / rect.width)  * 100
      const dy     = ((e.clientY - dragState.startMouseY) / rect.height) * 100
      const newX   = Math.max(0, Math.min(88, dragState.startPosX + dx))
      const newY   = Math.max(0, Math.min(88, dragState.startPosY + dy))

      setPositions(prev => {
        const side = dragState.side
        const existing =
          side === 'front'
            ? (prev.front?.[dragState.element as FrontElement] ?? DEFAULT_POSITIONS.front![dragState.element as FrontElement]!)
            : (prev.back?.[dragState.element as BackElement]   ?? DEFAULT_POSITIONS.back![dragState.element as BackElement]!)
        return {
          ...prev,
          [side]: {
            ...prev[side],
            [dragState.element]: { ...existing, x: newX, y: newY },
          },
        }
      })
    }

    const onUp = () => setDragState(null)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',  onUp)
    }
  }, [dragState])

  // ── Reset positions ───────────────────────────────────────────────────────
  const resetPositions = () => {
    setPositions(DEFAULT_POSITIONS)
    setSelectedElement(null)
    toast({ title: 'Positions reset', description: 'All elements moved back to defaults.' })
  }

  // ── Scale selected element ────────────────────────────────────────────────
  const setElementScale = (scale: number) => {
    if (!selectedElement) return
    const side = editingSide
    setPositions(prev => {
      const existing =
        side === 'front'
          ? (prev.front?.[selectedElement as FrontElement] ?? DEFAULT_POSITIONS.front![selectedElement as FrontElement]!)
          : (prev.back?.[selectedElement as BackElement]   ?? DEFAULT_POSITIONS.back![selectedElement as BackElement]!)
      return {
        ...prev,
        [side]: {
          ...prev[side],
          [selectedElement]: { ...existing, scale },
        },
      }
    })
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!card) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontGradientStart: frontStart,
          frontGradientEnd:   frontEnd,
          frontGradientAngle: frontAngle,
          backGradientStart:  backStart,
          backGradientEnd:    backEnd,
          backGradientAngle:  backAngle,
          elementPositions:   positions,
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Saved!', description: 'Your card design has been saved.' })
      router.push('/dashboard')
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ── NFC write ─────────────────────────────────────────────────────────────
  const handleNFC = async () => {
    const url = card?.nfc_url ?? `${window.location.origin}/u/${session?.user?.id}`
    const ok  = await writeNFCTag(url)
    toast({
      title:       ok ? 'NFC Written' : 'NFC Not Available',
      description: ok
        ? 'Hold your phone near the NFC tag — done!'
        : 'Web NFC works on Chrome for Android only. Use the QR code on other devices.',
      variant: ok ? 'default' : 'destructive',
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="mr-2" />
        <span className="text-muted-foreground">Loading editor…</span>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Card not found.</p>
        <Link href="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
      </div>
    )
  }

  const cardName = card.name || session?.user?.name || 'Your Name'

  return (
    <div className="min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Edit Card Design</h1>
            <p className="text-xs text-muted-foreground">{cardName} · {card.title}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetPositions}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Layout
          </Button>
          <Button variant="outline" size="sm" onClick={handleNFC}>
            <Wifi className="w-3.5 h-3.5 mr-1.5" />
            Write NFC
          </Button>
          <Link href={`/cards/${cardId}/qr`}>
            <Button variant="outline" size="sm">
              <QrCode className="w-3.5 h-3.5 mr-1.5" />
              Share
            </Button>
          </Link>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner className="mr-1.5 w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">

        {/* ── Left panel — design tools ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Flip control */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Editing Side
            </p>
            <div className="flex gap-2">
              {(['front', 'back'] as const).map(side => (
                <button
                  key={side}
                  onClick={() => { setEditingSide(side); setSelectedElement(null) }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    editingSide === side
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:bg-muted/70'
                  }`}
                >
                  {side === 'front' ? '⬜ Front' : '⬜ Back'}
                </button>
              ))}
            </div>
          </div>

          {/* Gradient picker */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {editingSide === 'front' ? 'Front' : 'Back'} Gradient
            </p>

            {/* Preset swatches */}
            <div className="grid grid-cols-4 gap-1.5">
              {gradientPresets.map(p => (
                <button
                  key={p.name}
                  title={p.name}
                  onClick={() => {
                    if (editingSide === 'front') {
                      setFrontStart(p.start); setFrontEnd(p.end); setFrontAngle(p.angle)
                    } else {
                      setBackStart(p.start); setBackEnd(p.end); setBackAngle(p.angle)
                    }
                  }}
                  className="h-8 rounded-md border-2 border-transparent hover:border-primary transition-colors"
                  style={{ background: `linear-gradient(${p.angle}, ${p.start}, ${p.end})` }}
                />
              ))}
            </div>

            {/* Custom pickers */}
            <div className="grid grid-cols-3 gap-2">
              {editingSide === 'front' ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start</p>
                    <input type="color" value={frontStart}
                      onChange={e => setFrontStart(e.target.value)}
                      className="w-full h-9 rounded cursor-pointer border border-border" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">End</p>
                    <input type="color" value={frontEnd}
                      onChange={e => setFrontEnd(e.target.value)}
                      className="w-full h-9 rounded cursor-pointer border border-border" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Angle</p>
                    <Input value={frontAngle} onChange={e => setFrontAngle(e.target.value)}
                      placeholder="135deg" className="h-9 text-sm" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start</p>
                    <input type="color" value={backStart}
                      onChange={e => setBackStart(e.target.value)}
                      className="w-full h-9 rounded cursor-pointer border border-border" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">End</p>
                    <input type="color" value={backEnd}
                      onChange={e => setBackEnd(e.target.value)}
                      className="w-full h-9 rounded cursor-pointer border border-border" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Angle</p>
                    <Input value={backAngle} onChange={e => setBackAngle(e.target.value)}
                      placeholder="135deg" className="h-9 text-sm" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Selected element info */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Selected Element
            </p>
            {selectedElement ? (() => {
              const currentScale =
                editingSide === 'front'
                  ? (positions.front?.[selectedElement as FrontElement]?.scale ?? 1.0)
                  : (positions.back?.[selectedElement as BackElement]?.scale   ?? 1.0)
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-sm font-medium text-foreground">
                      {ELEMENT_LABELS[selectedElement]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Position: x={Math.round(
                      editingSide === 'front'
                        ? (positions.front?.[selectedElement as FrontElement]?.x ?? DEFAULT_POSITIONS.front![selectedElement as FrontElement]!.x)
                        : (positions.back?.[selectedElement as BackElement]?.x   ?? DEFAULT_POSITIONS.back![selectedElement as BackElement]!.x)
                    )}%,{' '}
                    y={Math.round(
                      editingSide === 'front'
                        ? (positions.front?.[selectedElement as FrontElement]?.y ?? DEFAULT_POSITIONS.front![selectedElement as FrontElement]!.y)
                        : (positions.back?.[selectedElement as BackElement]?.y   ?? DEFAULT_POSITIONS.back![selectedElement as BackElement]!.y)
                    )}%
                  </p>

                  {/* Text / icon size control */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Size</p>
                    <div className="flex gap-1">
                      {([['XS', 0.65], ['S', 0.8], ['M', 1.0], ['L', 1.3], ['XL', 1.6]] as [string, number][]).map(([label, value]) => (
                        <button
                          key={label}
                          onClick={() => setElementScale(value)}
                          className={`flex-1 py-1.5 text-xs rounded border font-medium transition-colors ${
                            Math.abs(currentScale - value) < 0.05
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted text-muted-foreground border-border hover:bg-muted/70'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })() : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MousePointer className="w-4 h-4" />
                <span className="text-sm">Click an element on the card to select it</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-semibold">How to use the editor</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
                  <li>Switch between Front / Back using the buttons above</li>
                  <li>Click &amp; drag any highlighted element to reposition it</li>
                  <li>Pick a gradient preset or custom colours</li>
                  <li>Hit <strong>Save</strong> when done</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel — card canvas ───────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
            Card Canvas — drag elements to reposition
          </p>

          {/* Card wrapper — this div is the drag reference */}
          <div
            ref={cardContainerRef}
            className="relative select-none"
            style={{ userSelect: 'none' }}
            onMouseDown={() => setSelectedElement(null)}
          >
            <BusinessCard
              name={cardName}
              title={card.title}
              company={card.company}
              email={card.email}
              phone={card.phone}
              website={card.website}
              about={card.about}
              profileImage={card.profile_image}
              cardColor={card.card_color}
              frontGradientStart={frontStart}
              frontGradientEnd={frontEnd}
              frontGradientAngle={frontAngle}
              backGradientStart={backStart}
              backGradientEnd={backEnd}
              backGradientAngle={backAngle}
              nfcUrl={card.nfc_url}
              socialLinks={card.social_links}
              elementPositions={positions}
              isEditing={true}
              editingSide={editingSide}
              selectedElement={selectedElement}
              onElementMouseDown={handleElementMouseDown}
            />
          </div>

          {/* Draggable element legend */}
          <div className="flex flex-wrap gap-2 justify-center">
            {(editingSide === 'front'
              ? (['name', 'title', 'company', 'contact'] as FrontElement[])
              : (['info', 'qrCode', 'about', 'social']  as BackElement[])
            ).map(el => (
              <span
                key={el}
                className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                  selectedElement === el
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-muted border-border text-muted-foreground hover:bg-muted/70'
                }`}
                onClick={() => setSelectedElement(el)}
              >
                {ELEMENT_LABELS[el]}
              </span>
            ))}
          </div>

          {/* Profile URL row */}
          <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">NFC / QR profile URL</p>
              <p className="text-sm font-mono text-foreground truncate">
                {card.nfc_url ?? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${session?.user?.id}`}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => {
              const url = card.nfc_url ?? `${window.location.origin}/u/${session?.user?.id}`
              navigator.clipboard.writeText(url)
              toast({ title: 'Copied!', description: 'Profile URL copied to clipboard.' })
            }}>
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
