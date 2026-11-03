import { InstagramAccount } from '@/types';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export function getMetaConfig() {
  const appId = process.env.META_APP_ID || '';
  const appSecret = process.env.META_APP_SECRET || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    appId,
    appSecret,
    appUrl,
    isConfigured: Boolean(appId && appSecret),
  };
}

export function generateMetaOAuthUrl(redirectUri: string, state: string = 'auth_init'): string {
  const { appId } = getMetaConfig();
  const scopes = [
    'public_profile',
    'pages_show_list',
    'pages_read_engagement',
    'instagram_basic',
    'instagram_content_publish',
    'business_management'
  ].join(',');

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: scopes,
    response_type: 'code',
  });

  return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
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

export async function fetchInstagramAccounts(userAccessToken: string): Promise<InstagramAccount[]> {
  const fields = 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url,followers_count}';
  const res = await fetch(`${GRAPH_BASE}/me/accounts?fields=${fields}&access_token=${userAccessToken}`);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch Facebook Pages and Instagram accounts');
  }

  const pages = data.data || [];
  const accounts: InstagramAccount[] = [];

  for (const page of pages) {
    if (page.instagram_business_account) {
      const ig = page.instagram_business_account;
      accounts.push({
        id: ig.id,
        username: ig.username,
        name: ig.name || page.name,
        profilePictureUrl: ig.profile_picture_url,
        followersCount: ig.followers_count,
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
      });
    }
  }

  return accounts;
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

  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media?${params.toString()}`, {
    method: 'POST',
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

  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media?${params.toString()}`, {
    method: 'POST',
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

  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media?${params.toString()}`, {
    method: 'POST',
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

  const res = await fetch(`${GRAPH_BASE}/${igUserId}/media_publish?${params.toString()}`, {
    method: 'POST',
  });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to publish carousel to Instagram');
  }

  return data;
}

