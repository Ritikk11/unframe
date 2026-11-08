import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForUserToken,
  fetchInstagramAccounts,
  getLongLivedUserToken,
  getMetaConfig,
} from '@/lib/meta';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawCode = searchParams.get('code');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_description');

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/facebook/callback`;
  const state = searchParams.get('state') || '/editor';
  const returnTo = state.startsWith('/') ? state : '/editor';

  if (error || !rawCode) {
    const errorMsg = encodeURIComponent(errorReason || error || 'OAuth authorization was cancelled or failed.');
    return NextResponse.redirect(`${origin}${returnTo}?auth_error=${errorMsg}`);
  }

  // Strip trailing hash/fragment artifacts added by Meta
  const code = rawCode.replace(/#.*$/, '');

  try {
    // 1. Swap authorization code for user/system-user access token
    const rawToken = await exchangeCodeForUserToken(code, redirectUri);

    // 2. Inspect token:
    // If it is a System User Access Token (SUAT) from Facebook Login for Business,
    // its expiration is "Never" (expires_at === 0, type === 'SYSTEM_USER').
    // Exchanging a SUAT via fb_exchange_token strips its business system user assets!
    // So ONLY standard user tokens should be exchanged for 60-day long-lived tokens.
    let activeToken = rawToken;
    let isSystemUser = false;
    const { appId, appSecret } = getMetaConfig();

    try {
      const debugRes = await fetch(
        `https://graph.facebook.com/v21.0/debug_token?input_token=${rawToken}&access_token=${appId}|${appSecret}`
      );
      const debugData = await debugRes.json();
      isSystemUser = debugData?.data?.type === 'SYSTEM_USER' || debugData?.data?.expires_at === 0;
    } catch (e) {
      console.warn('debug_token check failed:', e);
    }

    if (!isSystemUser) {
      try {
        const longLived = await getLongLivedUserToken(rawToken);
        if (longLived) activeToken = longLived;
      } catch (e) {
        console.warn('getLongLivedUserToken failed, continuing with raw token:', e);
      }
    }

    // 3. Fetch all Facebook Pages and linked Instagram Professional accounts
    let { accounts, pagesFound, debugInfo } = await fetchInstagramAccounts(activeToken);

    // If 0 accounts found and activeToken was modified, retry with rawToken
    if (accounts.length === 0 && activeToken !== rawToken) {
      const retry = await fetchInstagramAccounts(rawToken);
      if (retry.accounts.length > 0) {
        accounts = retry.accounts;
        if (retry.debugInfo) debugInfo = retry.debugInfo;
      }
    }

    if (accounts.length === 0) {
      let errorMsg = '';
      if (pagesFound.length === 0) {
        const scopes = debugInfo?.debugToken?.scopes?.join(', ') || 'none';
        const targetIds = debugInfo?.debugToken?.granularScopes
          ?.map((g: any) => `${g.scope}:[${(g.target_ids || []).join(',')}]`)
          .join('; ') || 'none';
        errorMsg = `No Instagram account granted. When connecting, ensure you select your Instagram account and click Allow. (Scopes: ${scopes}; Targets: ${targetIds})`;
      } else {
        errorMsg = `Found Facebook Page(s) "${pagesFound.join(', ')}", but no linked Instagram account was detected. Ensure your Instagram account is set to Creator or Business in Instagram app settings.`;
      }
      return NextResponse.redirect(`${origin}${returnTo}?auth_error=${encodeURIComponent(errorMsg)}`);
    }

    // 4. Merge with existing connected accounts (multi-account support)
    const sessionCookie = req.cookies.get('ig_accounts_session');
    let existingAccounts: typeof accounts = [];
    if (sessionCookie?.value) {
      try {
        existingAccounts = JSON.parse(sessionCookie.value);
      } catch {
        existingAccounts = [];
      }
    }

    const newIds = new Set(accounts.map((a) => a.id));
    const mergedAccounts = [
      ...existingAccounts.filter((a) => !newIds.has(a.id)),
      ...accounts,
    ];

    // 5. Save accounts in a secure cookie
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
    const message = err instanceof Error ? err.message : 'Unknown authentication error';
    return NextResponse.redirect(`${origin}${returnTo}?auth_error=${encodeURIComponent(message)}`);
  }
}

