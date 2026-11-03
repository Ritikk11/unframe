import { NextRequest, NextResponse } from 'next/server';
import { getMetaConfig } from '@/lib/meta';
import { InstagramAccount } from '@/types';
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { isConfigured, appId } = getMetaConfig();
  const sessionCookie = req.cookies.get('ig_accounts_session');

  let cfKeys: string[] = [];
  try {
    const ctx = getOptionalRequestContext();
    if (ctx?.env) {
      cfKeys = Object.keys(ctx.env);
    }
  } catch {
    // ignore
  }

  let accounts: InstagramAccount[] = [];
  let isLive = false;

  if (sessionCookie?.value) {
    try {
      accounts = JSON.parse(sessionCookie.value);
      isLive = true;
    } catch {
      accounts = [];
      isLive = false;
    }
  }

  return NextResponse.json({
    isConfigured,
    appId: appId ? `${appId.slice(0, 4)}...${appId.slice(-4)}` : null,
    isLive,
    accounts,
    debug: {
      cfKeys,
      hasProcessAppId: Boolean(process.env.META_APP_ID),
      hasProcessNextAppId: Boolean(process.env.NEXT_PUBLIC_META_APP_ID),
    }
  });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Disconnected' });
  res.cookies.delete('ig_accounts_session');
  return res;
}

