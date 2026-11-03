import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const ext = path.extname(file.name) || '.jpg';
    const filename = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const localUrl = `/uploads/${filename}`;
    let publicUrl = localUrl;

    // Upload to public CDN so Meta Instagram crawler can reach it from localhost
    try {
      const base64 = buffer.toString('base64');
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
      console.warn('CDN upload fallback to local URL:', e);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      localUrl,
      filename,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

