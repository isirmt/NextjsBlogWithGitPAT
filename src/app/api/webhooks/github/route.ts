import crypto from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import {
  BLOG_FALLBACK_CACHE_TAG,
  BLOG_INDEX_CACHE_TAG,
  BLOG_PROFILE_CACHE_TAG,
  getBlogPostCacheTag,
  getBlogSeriesCacheTag,
} from '@/lib/blogCache';

type GitHubCommit = { added?: string[]; modified?: string[]; removed?: string[] };
type GitHubPushPayload = {
  ref?: string;
  repository?: { full_name?: string };
  head_commit?: { id?: string };
  commits?: GitHubCommit[];
};

const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
const expectedRepository =
  process.env.GIT_USERNAME && process.env.GIT_REPO ? `${process.env.GIT_USERNAME}/${process.env.GIT_REPO}` : null;
const postRootDir = process.env.GIT_POSTS_DIR;
const profilePath = process.env.GIT_PROFILE_PATH ? normalizePath(process.env.GIT_PROFILE_PATH) : null;

function normalizePath(path: string) {
  return path.replace(/\\/g, '/');
}

function getPostSlugFromPath(path: string): string | null {
  if (!postRootDir) return null;

  const normalizedPath = normalizePath(path);
  const postDirPrefix = `${postRootDir}/`;

  if (!normalizedPath.startsWith(postDirPrefix) || !normalizedPath.endsWith('.md')) {
    return null;
  }

  return normalizedPath.slice(postDirPrefix.length, -3);
}

function getSeriesNameFromPostPath(path: string): string | null {
  const postSlug = getPostSlugFromPath(path);
  if (!postSlug || !postSlug.includes('/')) {
    return null;
  }

  const [seriesName] = postSlug.split('/');
  return seriesName || null;
}

function getSeriesNameFromMetaPath(path: string): string | null {
  if (!postRootDir) return null;

  const normalizedPath = normalizePath(path);
  const metaPathPrefix = `${postRootDir}/`;

  if (!normalizedPath.startsWith(metaPathPrefix) || !normalizedPath.endsWith('/meta.json')) {
    return null;
  }

  const relativePath = normalizedPath.slice(metaPathPrefix.length);
  const [seriesName] = relativePath.split('/');
  return seriesName || null;
}

function collectChangedFiles(payload: GitHubPushPayload): {
  added: Set<string>;
  modified: Set<string>;
  removed: Set<string>;
} {
  const added = new Set<string>();
  const modified = new Set<string>();
  const removed = new Set<string>();

  for (const commit of payload.commits ?? []) {
    for (const path of commit.added ?? []) {
      added.add(normalizePath(path));
    }
    for (const path of commit.modified ?? []) {
      modified.add(normalizePath(path));
    }
    for (const path of commit.removed ?? []) {
      removed.add(normalizePath(path));
    }
  }

  return { added, modified, removed };
}

function isValidSignature(body: string, signature: string | null, secret: string) {
  if (!signature?.startsWith('sha256=')) return false;

  const expected = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
  const actualBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function POST(req: NextRequest) {
  if (!webhookSecret || !expectedRepository) {
    return NextResponse.json(
      { message: 'GITHUB_WEBHOOK_SECRET, GIT_USERNAME, and GIT_REPO are required environment variables.' },
      { status: 500 },
    );
  }

  const event = req.headers.get('X-GitHub-Event');
  if (event === 'ping') return NextResponse.json({ ok: true, message: 'pong' });

  if (event !== 'push') {
    return NextResponse.json({ ok: true, ignored: true, reason: `Unsupported event: ${event ?? 'unknown'}` });
  }

  const rawBody = await req.text();
  if (!isValidSignature(rawBody, req.headers.get('X-Hub-Signature-256'), webhookSecret)) {
    return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
  }

  let payload: GitHubPushPayload = {};
  try {
    payload = JSON.parse(rawBody) as GitHubPushPayload;
  } catch {
    return NextResponse.json({ message: 'Invalid payload.' }, { status: 400 });
  }

  const repository = payload.repository?.full_name;
  if (repository !== expectedRepository) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: `Repository mismatch: ${repository ?? 'unknown'}`,
    });
  }

  const changedFiles = collectChangedFiles(payload);
  const tagsToRevalidate = new Set<string>();
  const allChangedFiles = [...changedFiles.added, ...changedFiles.modified, ...changedFiles.removed];
  let hasFallbackContentChange = false;

  for (const changedPath of allChangedFiles) {
    const postSlug = getPostSlugFromPath(changedPath);
    if (postSlug) {
      tagsToRevalidate.add(getBlogPostCacheTag(postSlug));
    }

    const seriesName = getSeriesNameFromPostPath(changedPath) ?? getSeriesNameFromMetaPath(changedPath);
    if (seriesName) {
      tagsToRevalidate.add(getBlogSeriesCacheTag(seriesName));
    }

    if (profilePath && changedPath === profilePath) {
      tagsToRevalidate.add(BLOG_PROFILE_CACHE_TAG);
    }

    if (!postSlug && !seriesName && (!profilePath || changedPath !== profilePath)) {
      hasFallbackContentChange = true;
    }
  }

  if (changedFiles.added.size > 0 || changedFiles.removed.size > 0) {
    tagsToRevalidate.add(BLOG_INDEX_CACHE_TAG);
  }

  if (hasFallbackContentChange) {
    tagsToRevalidate.add(BLOG_FALLBACK_CACHE_TAG);
  }

  if (tagsToRevalidate.size === 0) {
    tagsToRevalidate.add(BLOG_INDEX_CACHE_TAG);
  }

  for (const tag of tagsToRevalidate) {
    revalidateTag(tag, 'max');
  }

  return NextResponse.json({
    ok: true,
    revalidatedTags: Array.from(tagsToRevalidate),
    changedFiles: allChangedFiles,
    branch: payload.ref ?? null,
    repository: repository ?? null,
    headCommit: payload.head_commit?.id ?? null,
  });
}
