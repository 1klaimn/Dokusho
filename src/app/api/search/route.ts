import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]); // Return empty array if no query
  }

  try {
    const response = await fetch(`https://api.jikan.moe/v4/manga?q=${query}&limit=8&order_by=members&sort=desc`);
    if (!response.ok) {
      throw new Error('Failed to fetch from Jikan API');
    }
    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}