import Rss from 'rss';
import { getSeries, getSeriesProps } from '@/lib/getPosts';
import { siteName } from '@/static/constant';
import { lastModified } from '@/static/constant';

const baseURL = process.env.NEXT_PUBLIC_URL!;
export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await getSeriesProps()).map((slug) => ({ slug }));
}

async function getFeedXml(slug: string, encodedSlug: string) {
  const seriesPosts = await getSeries(slug);

  const feed = new Rss({
    title: `${siteName}のシリーズ「${seriesPosts.meta.name}」の新着投稿`,
    description: `「${siteName}」のシリーズ${seriesPosts.meta.description ? ': ' + seriesPosts.meta.description : ''}`,
    feed_url: `${baseURL}/series/${encodedSlug}/feed`,
    site_url: baseURL,
    language: 'ja',
  });

  seriesPosts.posts.forEach((post) =>
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
