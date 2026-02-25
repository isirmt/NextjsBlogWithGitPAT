export type FetchOptions = RequestInit & {
  next?: { revalidate: number; tags?: string[] };
};

export function getHeaders() {
  return {
    headers: {
      Authorization: `token ${process.env.GIT_TOKEN!}`,
      'Content-Type': 'application/json',
    },
  };
}

export function getNext(revalidate: number, tags?: string[]): FetchOptions {
  if (revalidate === 0) {
    return { cache: 'no-store' };
  } else {
    return tags && tags.length > 0 ? { next: { revalidate, tags } } : { next: { revalidate } };
  }
}

export async function fetchAllData(url: string, revalidate: number, tags?: string[]): Promise<any[]> {
  let results: any[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const response: Response = await fetch(nextUrl, {
      ...getHeaders(),
      ...getNext(revalidate, tags),
    });

    const data = await response.json();
    results = results.concat(data);

    const linkHeader = response.headers.get('Link');
    if (linkHeader) {
      const nextLinkMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      nextUrl = nextLinkMatch ? nextLinkMatch[1] : null;
    } else {
      nextUrl = null;
    }
  }

  return results;
}
