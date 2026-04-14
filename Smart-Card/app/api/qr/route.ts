import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

    const qrCode = await QRCode.toDataURL(fullUrl)
    
    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error('[v0] QR code generation error:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
