import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

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
    const blob = new Blob([bytes], { type: mime });

    let publicUrl = '';

    // 1. Primary: Upload directly to FreeImage CDN (returns direct https://iili.io/... URL)
    try {
      const cdnFormData = new FormData();
      cdnFormData.append('key', '6d207e02198a847aa98d0a2a901485a5');
      cdnFormData.append('action', 'upload');
      cdnFormData.append('source', blob, filename);
      cdnFormData.append('format', 'json');

      const cdnRes = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: cdnFormData,
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

    // 2. Secondary fallback: tmpfiles.org
    if (!publicUrl || !publicUrl.startsWith('http')) {
      try {
        const tmpFormData = new FormData();
        tmpFormData.append('file', blob, filename);

        const tmpRes = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: tmpFormData,
        });

        if (tmpRes.ok) {
          const tmpData: any = await tmpRes.json();
          if (tmpData?.data?.url) {
            publicUrl = tmpData.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
          }
        }
      } catch (e) {
        console.warn('Tmpfiles upload fallback error:', e);
      }
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
