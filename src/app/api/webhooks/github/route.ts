import crypto from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { BLOG_CACHE_TAG } from '@/lib/blogCache';

type GitHubPushPayload = { ref?: string; repository?: { full_name?: string }; head_commit?: { id?: string } };

const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
const expectedRepository =
  process.env.GIT_USERNAME && process.env.GIT_REPO ? `${process.env.GIT_USERNAME}/${process.env.GIT_REPO}` : null;

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

  revalidateTag(BLOG_CACHE_TAG, 'max');

  return NextResponse.json({
    ok: true,
    revalidatedTag: BLOG_CACHE_TAG,
    branch: payload.ref ?? null,
    repository: repository ?? null,
    headCommit: payload.head_commit?.id ?? null,
  });
}
