import { NextRequest, NextResponse } from 'next/server';
import { getImage } from '@/lib/getPosts';
import { getImageMimeType } from '@/lib/mime-getter';

export async function GET(req: NextRequest) {
  const targetPath = new URL(req.url).searchParams.get('path');
  if (!targetPath) return NextResponse.json({ message: 'Fatal Error: no "path" query' }, { status: 400 });

  // 任意のディレクトリ内かチェック
  if (!targetPath.startsWith(`/${process.env.GIT_IMAGES_DIR}/`)) {
    return NextResponse.json({ message: 'Fatal Error: don\'t match "path" query' }, { status: 400 });
  }

  try {
    // Base64で取得
    const base64Image = await getImage(targetPath);

    const mimeType = getImageMimeType(targetPath);
    const imageBuffer = Buffer.from(base64Image, 'base64');

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching image' }, { status: 500 });
  }
}
