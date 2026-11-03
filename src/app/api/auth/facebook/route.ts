import { NextRequest, NextResponse } from 'next/server';
import { generateMetaOAuthUrl, getMetaConfig } from '@/lib/meta';

export async function GET(req: NextRequest) {
  const { isConfigured, appUrl } = getMetaConfig();

  if (!isConfigured) {
    return NextResponse.json(
      {
        error: 'Meta App is not configured. Please set META_APP_ID and META_APP_SECRET in .env.local',
        isConfigured: false
      },
      { status: 400 }
    );
  }

  const origin = req.nextUrl.origin || appUrl;
  const redirectUri = `${origin}/api/auth/facebook/callback`;
  const returnTo = req.nextUrl.searchParams.get('return_to') || '/editor';
  const oauthUrl = generateMetaOAuthUrl(redirectUri, returnTo);

  return NextResponse.redirect(oauthUrl);
}

