// filename : app/api/test/route.jsx

export async function GET() {
  return new Response('Test endpoint works!', { status: 200 })
}
