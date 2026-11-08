import { InstagramAccount, InstagramPost } from '@/types';
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export function getMetaConfig() {
  let cfEnv: Record<string, any> = {};
  try {
    const ctx = getOptionalRequestContext();
    if (ctx && ctx.env) {
      cfEnv = ctx.env as Record<string, any>;
    }
  } catch {
    // fallback outside cloudflare context
  }

  const appId = (cfEnv.META_APP_ID || process.env.META_APP_ID || cfEnv.NEXT_PUBLIC_META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || '2340318736800215') as string;
  const configId = (cfEnv.META_CONFIG_ID || process.env.META_CONFIG_ID || '1852360689097177') as string;
  const appSecret = (cfEnv.META_APP_SECRET || process.env.META_APP_SECRET || '') as string;
  const appUrl = (cfEnv.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://unframe-7hl.pages.dev') as string;

  return {
    appId,
    configId,
    appSecret,
    appUrl,
    isConfigured: Boolean(appId && (appSecret || configId)),
  };
}

export function generateMetaOAuthUrl(redirectUri: string, state: string = '/editor'): string {
  const { appId, configId } = getMetaConfig();

  const params = new URLSearchParams({
    client_id: appId,
    config_id: configId,
    display: 'popup',
    override_default_response_type: 'true',
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    prompt: 'login',
  });

  return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
}

export function generateInstagramOAuthUrl(redirectUri: string, state: string = '/editor'): string {
  // Uses Meta's Instagram-compatible Unified Login configuration
  return generateMetaOAuthUrl(redirectUri, state);
}

export async function exchangeInstagramCodeForToken(code: string, redirectUri: string): Promise<{ accessToken: string; userId: string }> {
  const { appId, appSecret } = getMetaConfig();
  const cleanCode = code.replace(/#_$/, '');

  const formData = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code: cleanCode,
  });

  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  const data = await res.json();

  if (data.error_message || data.error) {
    throw new Error(data.error_message || data.error?.message || 'Failed to exchange Instagram authorization code');
  }

  return {
    accessToken: data.access_token as string,
    userId: String(data.user_id),
  };
}

export async function getLongLivedInstagramToken(shortLivedToken: string): Promise<string> {
  const { appSecret } = getMetaConfig();
  const res = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to obtain long-lived Instagram token');
  }

  return data.access_token as string;
}

export async function fetchInstagramProfile(accessToken: string, userId: string): Promise<InstagramAccount> {
  const res = await fetch(
    `https://graph.instagram.com/v21.0/${userId}?fields=id,username,name,profile_picture_url&access_token=${accessToken}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch Instagram profile');
  }

  return {
    id: data.id,
    username: data.username || data.id,
    name: data.name || data.username || 'Instagram User',
    profilePictureUrl: data.profile_picture_url,
    pageId: data.id,
    pageName: 'Direct Instagram',
    pageAccessToken: accessToken,
    followersCount: 0,
  };
}

export async function exchangeCodeForUserToken(code: string, redirectUri: string) {
  const { appId, appSecret } = getMetaConfig();

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to exchange authorization code');
  }

  return data.access_token as string;
}

export async function getLongLivedUserToken(shortLivedToken: string): Promise<string> {
  const { appId, appSecret } = getMetaConfig();

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to obtain long-lived token');
  }

  return data.access_token as string;
}

export async function fetchInstagramAccounts(userAccessToken: string): Promise<{ accounts: InstagramAccount[]; pagesFound: string[] }> {
  const accountsMap = new Map<string, InstagramAccount>();
  const pagesFound: string[] = [];

  // 1. Unified Login / FLfB assigned Instagram accounts (/me/assigned_instagram_accounts)
  try {
    const res = await fetch(`${GRAPH_BASE}/me/assigned_instagram_accounts?fields=id,username&access_token=${userAccessToken}`);
    const data = await res.json();
    if (Array.isArray(data.data)) {
      for (const ig of data.data) {
        let name = ig.username || 'Instagram';
        let profilePic: string | undefined = undefined;
        try {
          const pRes = await fetch(`${GRAPH_BASE}/${ig.id}?fields=id,username,name,profile_picture_url&access_token=${userAccessToken}`);
          const pData = await pRes.json();
          if (pData.name) name = pData.name;
          if (pData.profile_picture_url) profilePic = pData.profile_picture_url;
        } catch {
          // fallback to basic username
        }

        accountsMap.set(ig.id, {
          id: ig.id,
          username: ig.username || ig.id,
          name,
          profilePictureUrl: profilePic,
          followersCount: 0,
          pageId: ig.id,
          pageName: 'Instagram (Unified)',
          pageAccessToken: userAccessToken,
        });
      }
    }
  } catch (err) {
    console.error('Error fetching /me/assigned_instagram_accounts:', err);
  }

  // 2. Client Business Portfolio assets (/me?fields=client_business_id)
  try {
    const meRes = await fetch(`${GRAPH_BASE}/me?fields=client_business_id&access_token=${userAccessToken}`);
    const meData = await meRes.json();
    const bizId = meData?.client_business_id;
    if (bizId) {
      const bizRes = await fetch(`${GRAPH_BASE}/${bizId}/instagram_accounts?fields=id,username,name,profile_picture_url&access_token=${userAccessToken}`);
      const bizData = await bizRes.json();
      if (Array.isArray(bizData.data)) {
        for (const ig of bizData.data) {
          if (!accountsMap.has(ig.id)) {
            accountsMap.set(ig.id, {
              id: ig.id,
              username: ig.username || ig.id,
              name: ig.name || ig.username || 'Instagram Business',
              profilePictureUrl: ig.profile_picture_url,
              followersCount: 0,
              pageId: ig.id,
              pageName: 'Business Portfolio',
              pageAccessToken: userAccessToken,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching client_business_id:', err);
  }

  // 3. Standard Facebook Pages (/me/accounts)
  const fields = 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url,followers_count},connected_instagram_account{id,username,name,profile_picture_url}';
  let pages: any[] = [];
  try {
    const res = await fetch(`${GRAPH_BASE}/me/accounts?fields=${fields}&access_token=${userAccessToken}`);
    const data = await res.json();
    if (Array.isArray(data.data)) {
      pages = pages.concat(data.data);
    }
  } catch (err) {
    console.error('Error fetching /me/accounts:', err);
  }

  // 4. Fallback: check Meta Business Suite Portfolios (/me/businesses)
  try {
    const bRes = await fetch(`${GRAPH_BASE}/me/businesses?fields=owned_pages{${fields}},client_pages{${fields}}&access_token=${userAccessToken}`);
    const bData = await bRes.json();
    if (Array.isArray(bData.data)) {
      for (const biz of bData.data) {
        if (biz.owned_pages?.data) pages = pages.concat(biz.owned_pages.data);
        if (biz.client_pages?.data) pages = pages.concat(biz.client_pages.data);
      }
    }
  } catch (err) {
    console.error('Error fetching /me/businesses:', err);
  }

  // Deduplicate pages and extract linked Instagram accounts
  const uniquePages = Array.from(new Map(pages.map((p: any) => [p.id, p])).values());
  for (const page of uniquePages) {
    if (page.name) pagesFound.push(page.name);
    const ig = page.instagram_business_account || page.connected_instagram_account;
    if (ig && !accountsMap.has(ig.id)) {
      accountsMap.set(ig.id, {
        id: ig.id,
        username: ig.username || page.name,
        name: ig.name || page.name,
        profilePictureUrl: ig.profile_picture_url,
        followersCount: ig.followers_count || 0,
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token || userAccessToken,
      });
    }
  }

  return { accounts: Array.from(accountsMap.values()), pagesFound };
}

export async function createSingleMediaContainer(
  igUserId: string,
  imageUrl: string,
  caption: string,
  accessToken: string
): Promise<string> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    caption: caption || '',
    access_token: accessToken,
  });

  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to create media container');
  }

  return data.id;
}

export async function createCarouselItemContainer(
  igUserId: string,
  imageUrl: string,
  accessToken: string
): Promise<string> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    is_carousel_item: 'true',
    access_token: accessToken,
  });

  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to create carousel item container');
  }

  return data.id;
}

export async function createCarouselParentContainer(
  igUserId: string,
  childrenContainerIds: string[],
  caption: string,
  accessToken: string
): Promise<string> {
  const params = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childrenContainerIds.join(','),
    caption: caption || '',
    access_token: accessToken,
  });

  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to create carousel parent container');
  }

  return data.id;
}

export async function checkMediaContainerStatus(
  containerId: string,
  accessToken: string
): Promise<{ status_code: 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' }> {
  const res = await fetch(`${GRAPH_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`);
  const data = await res.json();
  return data;
}

export async function publishContainer(
  igUserId: string,
  creationId: string,
  accessToken: string
): Promise<{ id: string }> {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to publish post to Instagram');
  }

  return data;
}

export async function fetchCarouselChildren(
  mediaId: string,
  accessToken: string
): Promise<{ id: string; mediaType: string; mediaUrl: string }[]> {
  const res = await fetch(
    `${GRAPH_BASE}/${mediaId}/children?fields=id,media_type,media_url,thumbnail_url&access_token=${accessToken}`
  );
  const data = await res.json();
  if (Array.isArray(data.data)) {
    return data.data.map((c: any) => ({
      id: c.id,
      mediaType: c.media_type || 'IMAGE',
      mediaUrl: c.media_url || c.thumbnail_url || '',
    }));
  }
  return [];
}

export async function fetchAccountPosts(igUserId: string, accessToken: string): Promise<InstagramPost[]> {
  const fields =
    'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count,children{id,media_type,media_url,thumbnail_url}';
  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media?fields=${fields}&access_token=${accessToken}&limit=30`);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch Instagram posts');
  }

  const items = data.data || [];
  const posts: InstagramPost[] = [];

  for (const item of items) {
    let children =
      item.children?.data?.map((c: any) => ({
        id: c.id,
        mediaType: c.media_type || 'IMAGE',
        mediaUrl: c.media_url || c.thumbnail_url || '',
      })) || [];

    // Fallback if carousel album children weren't included in batch
    if (item.media_type === 'CAROUSEL_ALBUM' && children.length === 0) {
      try {
        children = await fetchCarouselChildren(item.id, accessToken);
      } catch {
        // fallback
      }
    }

    const coverUrl = item.media_url || children[0]?.mediaUrl || item.thumbnail_url || '';

    posts.push({
      id: item.id,
      caption: item.caption || '',
      mediaType: item.media_type,
      mediaUrl: coverUrl,
      thumbnailUrl: item.thumbnail_url || coverUrl,
      permalink: item.permalink || '',
      timestamp: item.timestamp || '',
      likeCount: item.like_count || 0,
      commentsCount: item.comments_count || 0,
      children,
    });
  }

  return posts;
}

