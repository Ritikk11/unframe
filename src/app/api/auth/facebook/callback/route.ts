import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForUserToken, fetchInstagramAccounts, getLongLivedUserToken } from '@/lib/meta';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_description');

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/facebook/callback`;
  const state = searchParams.get('state') || '/editor';
  const returnTo = state.startsWith('/') ? state : '/editor';

  if (error || !code) {
    const errorMsg = encodeURIComponent(errorReason || error || 'OAuth authorization was cancelled or failed.');
    return NextResponse.redirect(`${origin}${returnTo}?auth_error=${errorMsg}`);
  }

  try {
    // 1. Swap authorization code for user token
    const shortLivedToken = await exchangeCodeForUserToken(code, redirectUri);

    // 2. Swap short-lived token for long-lived 60-day token
    const longLivedToken = await getLongLivedUserToken(shortLivedToken);

    // 3. Fetch all Facebook Pages and linked Instagram Professional accounts
    const { accounts, pagesFound } = await fetchInstagramAccounts(longLivedToken);

    if (accounts.length === 0) {
      let errorMsg = '';
      if (pagesFound.length === 0) {
        errorMsg = 'No Facebook Pages granted. When connecting, click "Edit Settings" and check all your Facebook Pages.';
      } else {
        errorMsg = `Found Facebook Page(s) "${pagesFound.join(', ')}", but no linked Instagram Professional account was detected. In Facebook, go to Page Settings -> Linked Accounts -> Instagram and ensure it is connected and set to Creator or Business.`;
      }
      return NextResponse.redirect(`${origin}${returnTo}?auth_error=${encodeURIComponent(errorMsg)}`);
    }

    // 4. Save accounts in a secure cookie
    const response = NextResponse.redirect(`${origin}${returnTo}?auth=success`);
    response.cookies.set('ig_accounts_session', JSON.stringify(accounts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown authentication error';
    return NextResponse.redirect(`${origin}${returnTo}?auth_error=${encodeURIComponent(message)}`);
  }
}

