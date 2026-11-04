import { NextRequest, NextResponse } from 'next/server';
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return new NextResponse('Missing image ID', { status: 400 });
    }

    let kv: any = null;
    try {
      const ctx = getOptionalRequestContext();
      const env = ctx?.env as any;
      if (env?.UNFRAME_IMAGES) {
        kv = env.UNFRAME_IMAGES;
      }
    } catch {}

    if (!kv) {
      // In local dev fallback or if KV is unattached
      return new NextResponse('Storage binding unavailable', { status: 503 });
    }

    const { value, metadata } = await kv.getWithMetadata(id, { type: 'arrayBuffer' });

    if (!value) {
      return new NextResponse('Image not found or expired', { status: 404 });
    }

    const contentType = (metadata as any)?.contentType || 'image/jpeg';

    return new NextResponse(value, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Media error';
    return new NextResponse(message, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    },
  });
}
