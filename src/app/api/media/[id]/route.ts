import { NextRequest, NextResponse } from 'next/server';
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

async function resolveMedia(id: string) {
  let kv: any = null;
  try {
    const ctx = getOptionalRequestContext();
    const env = ctx?.env as any;
    if (env?.UNFRAME_IMAGES) {
      kv = env.UNFRAME_IMAGES;
    }
  } catch {}

  if (!kv) {
    return { error: 'Storage binding unavailable', status: 503 };
  }

  const { value, metadata } = await kv.getWithMetadata(id, { type: 'arrayBuffer' });
  if (!value) {
    return { error: 'Image not found or expired', status: 404 };
  }

  let contentType = (metadata as any)?.contentType || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    contentType = 'image/jpeg';
  }

  return { value, contentType, length: value.byteLength };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) return new NextResponse('Missing image ID', { status: 400 });

    const result = await resolveMedia(id);
    if ('error' in result) {
      return new NextResponse(result.error, { status: result.status });
    }

    return new Response(result.value, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Length': result.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Media error';
    return new NextResponse(message, { status: 500 });
  }
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) return new Response(null, { status: 400 });

    const result = await resolveMedia(id);
    if ('error' in result) {
      return new Response(null, { status: result.status });
    }

    return new Response(null, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Length': result.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
