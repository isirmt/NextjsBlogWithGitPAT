import Rss from 'rss';
import { getPostsProps } from '@/lib/getPosts';
import { siteName } from '@/static/constant';
import { lastModified } from '@/static/constant';

const baseURL = process.env.NEXT_PUBLIC_URL!;
export const dynamic = 'force-static';
export const revalidate = false;

async function getFeedXml() {
  const feed = new Rss({
    title: `${siteName}の新着投稿`,
    description: `「${siteName}」の投稿フィード`,
    feed_url: `${baseURL}/feed`,
    site_url: baseURL,
    language: 'ja',
  });

  const posts = await getPostsProps();

  posts.forEach((post) =>
    feed.item({
      title: post.data.title,
      description: post.excerpt,
      url: `${baseURL}/post/${encodeURIComponent(post.slug)}`,
      date: post.data.date ? new Date(post.data.date).toISOString() : new Date(lastModified).toISOString(),
    }),
  );

  return feed.xml();
}

export async function GET() {
  const feedXml = await getFeedXml();

  return new Response(feedXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
