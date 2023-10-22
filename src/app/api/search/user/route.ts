import { searchMentionUser } from '@/lib/query';

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const q = url.searchParams.get('q');
    if (!q) return new Response('Invalid', { status: 422 });

    const results = await searchMentionUser({ searchPhrase: q, take: 10 });

    return new Response(JSON.stringify(results));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
