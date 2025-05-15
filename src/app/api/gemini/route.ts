// src/app/api/gemini/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const message = body.message

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  try {
    const apiResponse = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    const data = await apiResponse.json()

    return NextResponse.json({ reply: data.response })
  } catch (error) {
    return NextResponse.json({ error: 'Error calling Gemini API' }, { status: 500 })
  }
}
