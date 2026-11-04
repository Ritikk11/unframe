import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const mime = file.type || 'image/jpeg';
    const ext = mime.split('/')[1]?.replace('+xml', '') || 'jpg';
    const filename = `unframe-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const base64 = arrayBufferToBase64(bytes);

    let publicUrl = '';

    // Primary: Upload to FreeImage CDN via standard URL-encoded POST payload
    try {
      const params = new URLSearchParams();
      params.append('key', '6d207e02198a847aa98d0a2a901485a5');
      params.append('action', 'upload');
      params.append('source', base64);
      params.append('format', 'json');

      const cdnRes = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (cdnRes.ok) {
        const cdnData: any = await cdnRes.json();
        if (cdnData?.image?.url && typeof cdnData.image.url === 'string') {
          publicUrl = cdnData.image.url;
        }
      }
    } catch (e) {
      console.warn('FreeImage CDN upload error:', e);
    }

    if (!publicUrl || !publicUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Could not upload photo to public CDN. Instagram requires a publicly accessible HTTPS image URL to publish.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
