import { NextRequest, NextResponse } from 'next/server';
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';
import { getMetaConfig } from '@/lib/meta';

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
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filename = `unframe-${Date.now()}.${ext}`;

    const { appUrl } = getMetaConfig();
    const baseUrl = appUrl || 'https://unframe-7hl.pages.dev';

    let kv: any = null;
    try {
      const ctx = getOptionalRequestContext();
      const env = ctx?.env as any;
      if (env?.UNFRAME_IMAGES) {
        kv = env.UNFRAME_IMAGES;
      }
    } catch {}

    let publicUrl = '';

    // 1. Primary: Store directly in private Cloudflare KV (auto-deleted in 1 hour)
    if (kv) {
      try {
        await kv.put(mediaId, bytes, {
          metadata: {
            contentType: mime,
            filename,
            createdAt: Date.now(),
          },
          expirationTtl: 3600, // Self-deletes automatically after 1 hour
        });
        publicUrl = `${baseUrl}/api/media/${mediaId}`;
      } catch (kvErr) {
        console.warn('Cloudflare KV store error:', kvErr);
      }
    }

    // 2. Fallback: If KV is not present (e.g. during local offline dev)
    if (!publicUrl) {
      // In local development, provide a fallback
      publicUrl = `${baseUrl}/api/media/${mediaId}`;
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
