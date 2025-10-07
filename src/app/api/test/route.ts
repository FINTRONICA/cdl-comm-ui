import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🧪 Test API: Route hit successfully!')
  
  return NextResponse.json({
    message: 'Test API route is working!',
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url
  })
}
