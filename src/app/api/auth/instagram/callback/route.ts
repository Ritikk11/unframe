import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeInstagramCodeForToken,
  getLongLivedInstagramToken,
  fetchInstagramProfile,
} from '@/lib/meta';
import { InstagramAccount } from '@/types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_description');

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/instagram/callback`;
  const state = searchParams.get('state') || '/editor';
  const returnTo = state.startsWith('/') ? state : '/editor';

  if (error || !code) {
    const errorMsg = encodeURIComponent(errorReason || error || 'Instagram authorization was cancelled or failed.');
    return NextResponse.redirect(`${origin}${returnTo}?auth_error=${errorMsg}`);
  }

  try {
    // 1. Swap authorization code for short-lived token
    const { accessToken: shortLivedToken, userId } = await exchangeInstagramCodeForToken(code, redirectUri);

    // 2. Upgrade to 60-day long-lived token
    const longLivedToken = await getLongLivedInstagramToken(shortLivedToken);

    // 3. Fetch Instagram user profile
    const newAccount = await fetchInstagramProfile(longLivedToken, userId);

    // 4. Merge with existing connected accounts (multi-account support)
    const sessionCookie = req.cookies.get('ig_accounts_session');
    let existingAccounts: InstagramAccount[] = [];
    if (sessionCookie?.value) {
      try {
        existingAccounts = JSON.parse(sessionCookie.value);
      } catch {
        existingAccounts = [];
      }
    }

    // Filter out if this account was already in list, then append the newly authenticated one
    const mergedAccounts = [
      ...existingAccounts.filter((a) => a.id !== newAccount.id),
      newAccount,
    ];

    // 5. Store in secure cookie
    const response = NextResponse.redirect(`${origin}${returnTo}?auth=success`);
    response.cookies.set('ig_accounts_session', JSON.stringify(mergedAccounts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Instagram authentication error';
    return NextResponse.redirect(`${origin}${returnTo}?auth_error=${encodeURIComponent(message)}`);
  }
}

