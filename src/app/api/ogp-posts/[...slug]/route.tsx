import { promises as fs } from 'fs';
import path from 'path';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getPost } from '@/lib/getPosts';

export async function GET(req: NextRequest, context: { params: { slug: string[] } }) {
  const slug = decodeURIComponent(context.params.slug.join('/'));
  const { data } = await getPost(`${process.env.GIT_POSTS_DIR!}/${slug}.md`);
  const font = await fs.readFile(path.join(process.cwd(), 'assets', 'NotoSansJP-ExtraBold-Sub.ttf'));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          color: '#222',
          backgroundImage: `url(${process.env.NEXT_PUBLIC_URL}/ogp_back.png)`,
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          fontSize: '50px',
          fontFamily: 'NotoSansJP',
        }}
      >
        <div
          style={{
            width: '70%',
            lineHeight: '1.2',
            fontWeight: 'bold',
          }}
        >
          {data.title}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      status: 200,
      fonts: [
        {
          name: 'NotoSansJP',
          data: font,
          style: 'normal',
        },
      ],
    },
  );
}
