import { getPostsProps, getSeries, getSeriesProps } from '@/lib/getPosts';
import { getTagsWithLatestDate } from '@/lib/postSorter';
import { lastModified } from '@/static/constant';
import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const staticPaths = ['/post', '/profile', '/series', '/tags'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostsProps();
  const seriesNames = await getSeriesProps();
  const tagsWithDate = getTagsWithLatestDate(posts);

  const baseURL = process.env.NEXT_PUBLIC_URL!;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseURL,
      priority: 1.0,
    },
  ];

  staticPaths.forEach((page) => {
    staticPages.push({
      url: baseURL + page,
      priority: 0.9,
    });
  });

  const dynamicPages: MetadataRoute.Sitemap = [];

  for (const series of seriesNames) {
    const { posts } = await getSeries(series);
    dynamicPages.push({
      url: baseURL + '/series/' + series,
      lastModified: posts[0].data.date ? new Date(posts[0].data.date) : lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  posts.forEach((post) => {
    dynamicPages.push({
      url: baseURL + '/post/' + post.slug,
      lastModified: post.data.date ? new Date(post.data.date) : lastModified,
      changeFrequency: 'yearly',
      priority: 0.8,
    });
  });

  tagsWithDate.forEach((tagWithDate) => {
    dynamicPages.push({
      url: baseURL + '/tags/' + encodeURIComponent(tagWithDate.tag),
      lastModified: tagWithDate.latestDate ? new Date(tagWithDate.latestDate) : lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  });

  return [...staticPages, ...dynamicPages];
}
