import { NextRequest, NextResponse } from 'next/server';
import { fetchAccountPosts, fetchCarouselChildren } from '@/lib/meta';
import { InstagramAccount } from '@/types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('ig_accounts_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({
      success: true,
      posts: [],
      accounts: [],
      message: 'No Instagram account connected',
    });
  }

  let accounts: InstagramAccount[] = [];
  try {
    accounts = JSON.parse(sessionCookie.value);
  } catch {
    return NextResponse.json({
      success: true,
      posts: [],
      accounts: [],
      message: 'Invalid session',
    });
  }

  if (accounts.length === 0) {
    return NextResponse.json({
      success: true,
      posts: [],
      accounts: [],
      message: 'No accounts in session',
    });
  }

  const accountId = req.nextUrl.searchParams.get('accountId');
  const targetAccount = accountId
    ? accounts.find((a) => a.id === accountId) || accounts[0]
    : accounts[0];

  const mediaId = req.nextUrl.searchParams.get('mediaId');
  if (mediaId) {
    try {
      const children = await fetchCarouselChildren(mediaId, targetAccount.pageAccessToken);
      return NextResponse.json({ success: true, children });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch carousel slides';
      return NextResponse.json({ success: false, error: message, children: [] });
    }
  }

  try {
    const posts = await fetchAccountPosts(targetAccount.id, targetAccount.pageAccessToken);
    return NextResponse.json({
      success: true,
      currentAccount: {
        id: targetAccount.id,
        username: targetAccount.username,
        name: targetAccount.name,
        profilePictureUrl: targetAccount.profilePictureUrl,
        pageName: targetAccount.pageName,
      },
      accounts: accounts.map((a) => ({
        id: a.id,
        username: a.username,
        name: a.name,
        profilePictureUrl: a.profilePictureUrl,
        pageName: a.pageName,
      })),
      posts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch posts';
    return NextResponse.json({
      success: false,
      error: message,
      currentAccount: {
        id: targetAccount.id,
        username: targetAccount.username,
        name: targetAccount.name,
      },
      accounts: accounts.map((a) => ({
        id: a.id,
        username: a.username,
        name: a.name,
      })),
      posts: [],
    });
  }
}

