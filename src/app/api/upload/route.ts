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
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mime = file.type || 'image/jpeg';
    const fallbackDataUrl = `data:${mime};base64,${base64}`;

    let publicUrl = fallbackDataUrl;
    const filename = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${mime.split('/')[1] || 'jpg'}`;

    // Upload to public CDN so Meta Instagram crawler can reach it
    try {
      const cdnFormData = new FormData();
      cdnFormData.append('key', '6d207e02198a847aa98d0a2a901485a5');
      cdnFormData.append('action', 'upload');
      cdnFormData.append('source', base64);
      cdnFormData.append('format', 'json');

      const cdnRes = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: cdnFormData,
      });

      if (cdnRes.ok) {
        const cdnData = await cdnRes.json();
        if (cdnData?.image?.url) {
          publicUrl = cdnData.image.url;
        }
      }
    } catch (e) {
      console.warn('CDN upload fallback to data URL:', e);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      localUrl: publicUrl,
      filename,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
