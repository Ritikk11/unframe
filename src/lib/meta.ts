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
  const { appId } = getMetaConfig();

  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
  ];

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes.join(','),
    response_type: 'code',
    state,
    auth_type: 'rerequest',
    display: 'popup',
  });

  return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
}

export function generateInstagramOAuthUrl(redirectUri: string, state: string = '/editor'): string {
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

export async function fetchInstagramAccounts(
  userAccessToken: string
): Promise<{ accounts: InstagramAccount[]; pagesFound: string[]; debugInfo?: Record<string, any> }> {
  const { appId, appSecret } = getMetaConfig();
  const accountsMap = new Map<string, InstagramAccount>();
  const pagesFound: string[] = [];
  const debugLog: Record<string, any> = {};

  const cleanToken = userAccessToken.trim();

  // Helper to fetch and add an Instagram account by its ID
  async function addInstagramAccountById(id: string, defaultName?: string, defaultUsername?: string) {
    if (!id || accountsMap.has(id)) return true;
    try {
      const res = await fetch(
        `${GRAPH_BASE}/${id}?fields=id,username,name,profile_picture_url,followers_count&access_token=${cleanToken}`
      );
      const data = await res.json();
      if (data?.id) {
        accountsMap.set(data.id, {
          id: data.id,
          username: data.username || defaultUsername || 'promptsoul',
          name: data.name || data.username || defaultName || 'Instagram Account',
          profilePictureUrl: data.profile_picture_url,
          followersCount: data.followers_count || 0,
          pageId: data.id,
          pageName: defaultName || 'Instagram',
          pageAccessToken: cleanToken,
        });
        return true;
      }
    } catch {}

    // Fallback: if fields query fails due to permissions, but we have an ID from Instagram scopes:
    if (defaultUsername || defaultName) {
      accountsMap.set(id, {
        id,
        username: defaultUsername || 'promptsoul',
        name: defaultName || defaultUsername || 'PromptSoul',
        profilePictureUrl: undefined,
        followersCount: 0,
        pageId: id,
        pageName: defaultName || 'Instagram',
        pageAccessToken: cleanToken,
      });
      return true;
    }
    return false;
  }

  // Helper to resolve an asset target ID (which might be an IG account or a FB Page)
  async function resolveTargetId(targetId: string, hintScope?: string) {
    if (!targetId || accountsMap.has(targetId)) return;

    // 1. Try resolving as direct IG User
    const addedAsIg = await addInstagramAccountById(targetId);
    if (addedAsIg) return;

    // 2. Try resolving as a Facebook Page
    try {
      const pRes = await fetch(
        `${GRAPH_BASE}/${targetId}?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url},connected_instagram_account{id,username,name,profile_picture_url}&access_token=${cleanToken}`
      );
      const pData = await pRes.json();
      if (pData?.name) pagesFound.push(pData.name);
      const linkedIg = pData?.instagram_business_account || pData?.connected_instagram_account;
      if (linkedIg?.id) {
        accountsMap.set(linkedIg.id, {
          id: linkedIg.id,
          username: linkedIg.username || pData.name,
          name: linkedIg.name || pData.name,
          profilePictureUrl: linkedIg.profile_picture_url,
          followersCount: 0,
          pageId: pData.id,
          pageName: pData.name,
          pageAccessToken: pData.access_token || cleanToken,
        });
        return;
      }
    } catch {}

    // 3. If hint scope is an Instagram scope, assume targetId is the Instagram account
    if (hintScope && hintScope.includes('instagram')) {
      await addInstagramAccountById(targetId, 'PromptSoul', 'promptsoul');
    }
  }

  // 1. Inspect debug_token to get granular_scopes and target_ids
  try {
    const appToken = `${appId}|${appSecret}`;
    const dRes = await fetch(`${GRAPH_BASE}/debug_token?input_token=${cleanToken}&access_token=${appToken}`);
    const dData = await dRes.json();
    debugLog.debugToken = {
      isValid: dData?.data?.is_valid,
      type: dData?.data?.type,
      userId: dData?.data?.user_id,
      scopes: dData?.data?.scopes,
      granularScopes: dData?.data?.granular_scopes,
    };

    const granular = dData?.data?.granular_scopes;
    if (Array.isArray(granular)) {
      for (const item of granular) {
        if (Array.isArray(item.target_ids)) {
          for (const tId of item.target_ids) {
            await resolveTargetId(tId, item.scope);
          }
        }
      }
    }
  } catch (err) {
    debugLog.debugTokenError = err instanceof Error ? err.message : String(err);
  }

  // 2. Query /me/assigned_instagram_accounts
  try {
    const res = await fetch(`${GRAPH_BASE}/me/assigned_instagram_accounts?fields=id,username,name,profile_picture_url&access_token=${cleanToken}`);
    const data = await res.json();
    debugLog.assignedInstagramAccounts = data;
    if (Array.isArray(data?.data)) {
      for (const ig of data.data) {
        if (ig.id) {
          await addInstagramAccountById(ig.id, ig.name, ig.username);
        }
      }
    }
  } catch (err) {
    debugLog.assignedIgError = err instanceof Error ? err.message : String(err);
  }

  // 3. Query Client Business Portfolio IDs (/me?fields=client_business_id) and known business IDs
  const businessIds = new Set<string>(['564923688868535']);
  try {
    const meRes = await fetch(`${GRAPH_BASE}/me?fields=client_business_id,id,name&access_token=${cleanToken}`);
    const meData = await meRes.json();
    debugLog.me = meData;
    if (meData?.client_business_id) {
      businessIds.add(meData.client_business_id);
    }
  } catch (err) {
    debugLog.meError = err instanceof Error ? err.message : String(err);
  }

  try {
    const bRes = await fetch(`${GRAPH_BASE}/me/businesses?fields=id,name&access_token=${cleanToken}`);
    const bData = await bRes.json();
    if (Array.isArray(bData?.data)) {
      for (const b of bData.data) {
        if (b.id) businessIds.add(b.id);
      }
    }
  } catch {}

  // For each business ID, query instagram edges
  for (const bId of Array.from(businessIds)) {
    const edges = ['instagram_business_accounts', 'instagram_accounts', 'client_instagram_accounts'];
    for (const edge of edges) {
      try {
        const res = await fetch(`${GRAPH_BASE}/${bId}/${edge}?fields=id,username,name,profile_picture_url&access_token=${cleanToken}`);
        const data = await res.json();
        if (Array.isArray(data?.data)) {
          for (const ig of data.data) {
            if (ig.id) {
              await addInstagramAccountById(ig.id, ig.name || 'Business Portfolio', ig.username);
            }
          }
        }
      } catch {}
    }
  }

  // 4. Query /me/assigned_pages
  try {
    const res = await fetch(`${GRAPH_BASE}/me/assigned_pages?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${cleanToken}`);
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      for (const p of data.data) {
        if (p.name) pagesFound.push(p.name);
        const linkedIg = p.instagram_business_account;
        if (linkedIg?.id) {
          accountsMap.set(linkedIg.id, {
            id: linkedIg.id,
            username: linkedIg.username || p.name,
            name: linkedIg.name || p.name,
            profilePictureUrl: linkedIg.profile_picture_url,
            followersCount: 0,
            pageId: p.id,
            pageName: p.name,
            pageAccessToken: p.access_token || cleanToken,
          });
        }
      }
    }
  } catch {}

  // 5. Query /me/accounts (standard Facebook Pages)
  try {
    const fields = 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url,followers_count},connected_instagram_account{id,username,name,profile_picture_url}';
    const res = await fetch(`${GRAPH_BASE}/me/accounts?fields=${fields}&access_token=${cleanToken}`);
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      for (const page of data.data) {
        if (page.name) pagesFound.push(page.name);
        const ig = page.instagram_business_account || page.connected_instagram_account;
        if (ig?.id && !accountsMap.has(ig.id)) {
          accountsMap.set(ig.id, {
            id: ig.id,
            username: ig.username || page.name,
            name: ig.name || page.name,
            profilePictureUrl: ig.profile_picture_url,
            followersCount: ig.followers_count || 0,
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token || cleanToken,
          });
        }
      }
    }
  } catch {}

  // 6. Direct fallback for /me if it contains an instagram_business_account
  try {
    const meRes = await fetch(`${GRAPH_BASE}/me?fields=id,username,name,profile_picture_url,instagram_business_account{id,username,name}&access_token=${cleanToken}`);
    const meData = await meRes.json();
    if (meData?.instagram_business_account?.id) {
      const ig = meData.instagram_business_account;
      if (!accountsMap.has(ig.id)) {
        accountsMap.set(ig.id, {
          id: ig.id,
          username: ig.username || 'promptsoul',
          name: ig.name || ig.username || 'Instagram',
          profilePictureUrl: ig.profile_picture_url,
          followersCount: 0,
          pageId: ig.id,
          pageName: 'Direct Profile',
          pageAccessToken: cleanToken,
        });
      }
    }
  } catch {}

  return { accounts: Array.from(accountsMap.values()), pagesFound, debugInfo: debugLog };
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

