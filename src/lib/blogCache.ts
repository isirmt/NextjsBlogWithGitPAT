export const BLOG_INDEX_CACHE_TAG = 'blog-posts-index';
export const BLOG_PROFILE_CACHE_TAG = 'blog-profile';
export const BLOG_FALLBACK_CACHE_TAG = 'blog-content';
export const BLOG_SERIES_CACHE_TAG_PREFIX = 'blog-series:';
export const BLOG_POST_CACHE_TAG_PREFIX = 'blog-post:';
export const BLOG_FALLBACK_REVALIDATE_SECONDS = 60 * 60 * 24 * 30;

export function getBlogPostCacheTag(slug: string) {
  return `${BLOG_POST_CACHE_TAG_PREFIX}${slug}`;
}

export function getBlogSeriesCacheTag(series: string) {
  return `${BLOG_SERIES_CACHE_TAG_PREFIX}${series}`;
}
