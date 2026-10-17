import Rss from 'rss';
import { getPostsProps } from '@/lib/getPosts';
import { getTags } from '@/lib/postSorter';
import { siteName } from '@/static/constant';
import { lastModified } from '@/static/constant';

const baseURL = process.env.NEXT_PUBLIC_URL!;
export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getTags(await getPostsProps()).map((slug) => ({ slug }));
}

async function getFeedXml(slug: string, encodedSlug: string) {
  const feed = new Rss({
    title: `${siteName}のタグ「#${slug}」の新着投稿`,
    description: `「${siteName}」のタグ「#${slug}」の投稿フィード`,
    feed_url: `${baseURL}/tags/${encodedSlug}/feed`,
    site_url: baseURL,
    language: 'ja',
  });

  const posts = await getPostsProps();
  const filteredPosts = posts.filter((post) => (post.data.tags ? post.data.tags.some((tag) => tag === slug) : false));

  filteredPosts.forEach((post) =>
    feed.item({
      title: post.data.title,
      description: post.excerpt,
      url: `${baseURL}/post/${encodeURIComponent(post.slug)}`,
      date: post.data.date ? new Date(post.data.date).toISOString() : new Date(lastModified).toISOString(),
    }),
  );

  return feed.xml();
}

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug: encodedSlug } = await context.params;
  const slug = decodeURIComponent(encodedSlug);
  const feedXml = await getFeedXml(slug, encodedSlug);

  return new Response(feedXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
